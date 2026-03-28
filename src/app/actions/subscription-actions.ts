"use server";

import { prisma } from "@/lib/db";
import { getEffectiveOwnerId } from "./shared";
import { revalidatePath } from "next/cache";

export async function getSubscriptionPlans() {
    try {
        const ownerId = await getEffectiveOwnerId();
        return await prisma.subscriptionPlan.findMany({
            where: { ownerId },
            include: { _count: { select: { clientSubscriptions: true } } }
        });
    } catch (e) {
        console.error(e);
        return [];
    }
}

export async function createSubscriptionPlan(data: {
    name: string;
    description?: string;
    price: number;
    potAmount: number;
    chipsPerService: number;
}) {
    try {
        const ownerId = await getEffectiveOwnerId();
        const plan = await prisma.subscriptionPlan.create({
            data: {
                ...data,
                ownerId
            }
        });
        revalidatePath("/admin/subscriptions");
        return { success: true, plan };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteSubscriptionPlan(id: string) {
    try {
        await prisma.subscriptionPlan.delete({ where: { id } });
        revalidatePath("/admin/subscriptions");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
