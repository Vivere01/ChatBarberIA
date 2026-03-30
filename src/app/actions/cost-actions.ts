"use server";

import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getEffectiveStoreId } from "./shared";

export async function getCosts() {
    try {
        const session = await getAuthSession();
        if (!session?.user) throw new Error("Unauthorized");

        const storeId = await getEffectiveStoreId();

        return await prisma.cost.findMany({
            where: {
                storeId,
                isActive: true
            },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        console.error("Error in getCosts:", error);
        return [];
    }
}

export async function createCost(data: any) {
    try {
        const storeId = await getEffectiveStoreId();

        const cost = await prisma.cost.create({
            data: {
                name: data.name,
                type: data.type,
                amount: parseFloat(String(data.amount).replace(',', '.')) || 0,
                dueDay: data.dueDay ? parseInt(data.dueDay) : null,
                notes: data.notes,
                storeId: storeId
            }
        });

        revalidatePath("/admin/costs");
        return { success: true, cost };
    } catch (error: any) {
        console.error("Error in createCost:", error);
        return { success: false, error: error.message || "Erro no servidor ao criar custo" };
    }
}


export async function updateCost(id: string, data: any) {
    try {
        const session = await getAuthSession();
        if (!session?.user) throw new Error("Unauthorized");

        const cost = await prisma.cost.update({
            where: { id },
            data: {
                name: data.name,
                type: data.type,
                amount: parseFloat(String(data.amount).replace(',', '.')) || 0,
                dueDay: data.dueDay ? parseInt(data.dueDay) : null,
                notes: data.notes
            }
        });

        revalidatePath("/admin/costs");
        return { success: true, cost };
    } catch (error: any) {
        console.error("Error in updateCost:", error);
        return { success: false, error: error.message || "Erro no servidor ao atualizar custo" };
    }
}


export async function deleteCost(id: string) {
    try {
        const session = await getAuthSession();
        if (!session?.user) throw new Error("Unauthorized");

        await prisma.cost.update({
            where: { id },
            data: { isActive: false }
        });

        revalidatePath("/admin/costs");
        return { success: true };
    } catch (error: any) {
        console.error("Error in deleteCost:", error);
        return { success: false, error: error.message || "Erro no servidor ao excluir custo" };
    }
}
