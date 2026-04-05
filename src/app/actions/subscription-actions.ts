"use server";

import { prisma } from "@/lib/db";
import { getEffectiveOwnerId } from "./shared";
import { revalidatePath } from "next/cache";

import { SubscriptionPeriodicity } from "@prisma/client";

export async function getSubscriptionPlans() {
    try {
        const ownerId = await getEffectiveOwnerId();
        return await prisma.subscriptionPlan.findMany({
            where: { ownerId },
            include: { 
                _count: { select: { clientSubscriptions: true } },
                services: true
            }
        });
    } catch (e) {
        console.error(e);
        return [];
    }
}

export async function getSubscriptionPlanById(id: string) {
    try {
        const ownerId = await getEffectiveOwnerId();
        return await prisma.subscriptionPlan.findFirst({
            where: { id, ownerId },
            include: {
                services: { include: { service: true } },
                allowedStaff: { include: { staff: true } },
                _count: { select: { clientSubscriptions: true } }
            }
        });
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function createSubscriptionPlan(data: {
    name: string;
    description?: string;
    price: number;
    potAmount: number;
    chipsPerService: number;
    periodicity?: SubscriptionPeriodicity;
    productDiscountPercent?: number;
    activeDays?: number[];
    maxSimultaneousAppointments?: number;
    galaxId?: string;
    checkoutUrl?: string;
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

export async function updateSubscriptionPlan(id: string, data: Partial<{
    name: string;
    description: string;
    price: number;
    potAmount: number;
    chipsPerService: number;
    periodicity: SubscriptionPeriodicity;
    productDiscountPercent: number;
    activeDays: number[];
    maxSimultaneousAppointments: number;
    galaxId: string;
    checkoutUrl: string;
    isActive: boolean;
}>) {
    try {
        const ownerId = await getEffectiveOwnerId();
        const plan = await prisma.subscriptionPlan.update({
            where: { id, ownerId },
            data
        });
        revalidatePath("/admin/subscriptions");
        revalidatePath(`/admin/subscriptions/${id}`);
        return { success: true, plan };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteSubscriptionPlan(id: string) {
    try {
        const ownerId = await getEffectiveOwnerId();
        await prisma.subscriptionPlan.delete({ where: { id, ownerId } });
        revalidatePath("/admin/subscriptions");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function syncPlanServices(planId: string, serviceIds: string[]) {
    try {
        const ownerId = await getEffectiveOwnerId();
        
        // Transaction to clear and re-add services
        await prisma.$transaction([
            prisma.subscriptionPlanService.deleteMany({ where: { planId } }),
            prisma.subscriptionPlanService.createMany({
                data: serviceIds.map(serviceId => ({
                    planId,
                    serviceId
                }))
            })
        ]);

        revalidatePath(`/admin/subscriptions/${planId}`);
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function syncPlanStaff(planId: string, staffIds: string[]) {
    try {
        const ownerId = await getEffectiveOwnerId();
        
        await prisma.$transaction([
            prisma.subscriptionPlanStaff.deleteMany({ where: { planId } }),
            prisma.subscriptionPlanStaff.createMany({
                data: staffIds.map(staffId => ({
                    planId,
                    staffId
                }))
            })
        ]);

        revalidatePath(`/admin/subscriptions/${planId}`);
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function getClientSubscriptionPlans(storeId: string) {
    try {
        const store = await prisma.store.findUnique({ where: { id: storeId } });
        if (!store) return [];
        return await prisma.subscriptionPlan.findMany({
            where: { ownerId: store.ownerId, isActive: true },
            include: { services: { include: { service: true } } }
        });
    } catch(e) {
        console.error(e);
        return [];
    }
}
