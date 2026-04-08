import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PLANS, PlanFeature, getPlanByPriceId } from "@/config/plans";

export async function getSubscriptionInfo() {
    const session = await getAuthSession();
    if (!session?.user) return null;

    const userId = (session.user as any).id;

    // Developer bypass
    if ((session.user as any).isDev) {
        return {
            isDev: true,
            plan: PLANS.ENTERPRISE, // Dev has everything
            active: true,
            userId,
        };
    }

    const owner = await prisma.owner.findUnique({
        where: { id: userId },
        select: { 
            stripeSubscriptionId: true, 
            stripePriceId: true, 
            stripeCurrentPeriodEnd: true 
        }
    });

    if (!owner) return null;

    const isActive = owner.stripeCurrentPeriodEnd && owner.stripeCurrentPeriodEnd > new Date();
    const plan = owner.stripePriceId ? getPlanByPriceId(owner.stripePriceId) : null;

    return {
        isDev: false,
        plan,
        active: !!isActive && !!owner.stripeSubscriptionId,
        expiry: owner.stripeCurrentPeriodEnd,
        userId,
    };
}

export async function checkFeatureAccess(feature: PlanFeature) {
    const info = await getSubscriptionInfo();
    if (!info) return false;
    if (info.isDev) return true;
    if (!info.active || !info.plan) return false;

    return info.plan.features.includes(feature);
}

export async function getRemainingStores() {
    const info = await getSubscriptionInfo();
    if (!info) return 0;
    if (info.isDev) return 999;
    if (!info.active || !info.plan) return 0;
    if (info.plan.limits.stores === -1) return 999;

    const storeCount = await prisma.store.count({
        where: { ownerId: info.userId }
    });

    return Math.max(0, info.plan.limits.stores - storeCount);
}

export async function getRemainingClients() {
    const info = await getSubscriptionInfo();
    if (!info) return 0;
    if (info.isDev) return 999;
    if (!info.active || !info.plan) return 0;
    if (info.plan.limits.clients === -1) return 999;

    const clientCount = await prisma.client.count({
        where: { ownerId: info.userId }
    });

    return Math.max(0, info.plan.limits.clients - clientCount);
}
