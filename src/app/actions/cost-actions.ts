"use server";

import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getCosts() {
    const session = await getAuthSession();
    if (!session?.user) throw new Error("Unauthorized");

    const role = (session.user as any).role;
    if (role !== 'OWNER' && role !== 'MANAGER') {
        throw new Error("Forbidden");
    }

    const storeId = (session.user as any).storeId;
    
    // If it's an OWNER, they might want to see costs for all their stores or we default to the first one
    // For now, let's filter by the owner's stores since an owner can have many
    const stores = await prisma.store.findMany({
        where: { ownerId: (session.user as any).id },
        select: { id: true }
    });

    const storeIds = stores.map(s => s.id);

    return prisma.cost.findMany({
        where: {
            storeId: { in: storeIds },
            isActive: true
        },
        orderBy: { createdAt: 'desc' }
    });
}

export async function createCost(data: any) {
    const session = await getAuthSession();
    if (!session?.user) throw new Error("Unauthorized");

    const ownerId = (session.user as any).id;
    
    // Default to the first store of the owner for now, or use provided storeId
    const store = await prisma.store.findFirst({
        where: { ownerId }
    });

    if (!store) throw new Error("No store found for this owner");

    const cost = await prisma.cost.create({
        data: {
            name: data.name,
            type: data.type,
            amount: data.amount,
            dueDay: data.dueDay,
            notes: data.notes,
            storeId: store.id
        }
    });

    revalidatePath("/admin/costs");
    return cost;
}

export async function updateCost(id: string, data: any) {
    const session = await getAuthSession();
    if (!session?.user) throw new Error("Unauthorized");

    const cost = await prisma.cost.update({
        where: { id },
        data: {
            name: data.name,
            type: data.type,
            amount: data.amount,
            dueDay: data.dueDay,
            notes: data.notes
        }
    });

    revalidatePath("/admin/costs");
    return cost;
}

export async function deleteCost(id: string) {
    const session = await getAuthSession();
    if (!session?.user) throw new Error("Unauthorized");

    await prisma.cost.update({
        where: { id },
        data: { isActive: false }
    });

    revalidatePath("/admin/costs");
}
