"use server";

import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

const getStripe = () => {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
        throw new Error("STRIPE_SECRET_KEY is not defined");
    }
    return new Stripe(key, {
        apiVersion: "2024-04-10" as any,
    });
};

export async function createCheckoutSession(priceId: string) {
    try {
        const stripe = getStripe();
        const session = await getAuthSession();
        if (!session?.user) {
            return { error: "AUTH_REQUIRED" };
        }

        const userId = (session.user as any).id;
        const owner = await prisma.owner.findUnique({
            where: { id: userId }
        });

        if (!owner) return { error: "OWNER_NOT_FOUND" };

        let customerId = owner.stripeCustomerId;
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: owner.email,
                name: owner.name,
                metadata: { ownerId: owner.id }
            });
            customerId = customer.id;
            await prisma.owner.update({
                where: { id: owner.id },
                data: { stripeCustomerId: customerId }
            });
        }

        const checkoutSession = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [{ price: priceId, quantity: 1 }],
            subscription_data: {
                trial_period_days: 14,
                metadata: { ownerId: owner.id }
            },
            success_url: `${process.env.NEXTAUTH_URL}/admin/dashboard?success=true`,
            cancel_url: `${process.env.NEXTAUTH_URL}/#plans`,
            client_reference_id: owner.id,
        });

        return { url: checkoutSession.url };
    } catch (e: any) {
        console.error("Stripe Error:", e);
        return { error: e.message };
    }
}

export async function getSubscriptionStatus() {
    try {
        const session = await getAuthSession();
        if (!session?.user) return { active: false };

        const userId = (session.user as any).id;
        const owner = await prisma.owner.findUnique({
            where: { id: userId },
            select: { stripeCurrentPeriodEnd: true, stripeSubscriptionId: true }
        });

        if (!owner?.stripeSubscriptionId) return { active: false };

        const isActive = owner.stripeCurrentPeriodEnd && owner.stripeCurrentPeriodEnd > new Date();
        return { active: !!isActive, expiry: owner.stripeCurrentPeriodEnd };
    } catch (e) {
        return { active: false };
    }
}
