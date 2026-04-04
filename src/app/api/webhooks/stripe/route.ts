import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { prisma } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-04-10" as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
    const body = await req.text();
    const sig = headers().get("stripe-signature")!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret!);
    } catch (err: any) {
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const session = event.data.object as any;

    if (event.type === "checkout.session.completed") {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const ownerId = session.metadata?.ownerId || session.client_reference_id;

        if (ownerId) {
            await prisma.owner.update({
                where: { id: ownerId },
                data: {
                    stripeSubscriptionId: subscription.id,
                    stripeCustomerId: subscription.customer as string,
                    stripePriceId: subscription.items.data[0].price.id,
                    stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
                },
            });
        }
    }

    if (event.type === "invoice.payment_succeeded") {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

        if (subscription) {
            await prisma.owner.update({
                where: { stripeSubscriptionId: subscription.id },
                data: {
                    stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
                },
            });
        }
    }

    return new NextResponse(null, { status: 200 });
}
