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
            const sub = subscription as any;
            await prisma.owner.update({
                where: { id: ownerId },
                data: {
                    stripeSubscriptionId: sub.id,
                    stripeCustomerId: sub.customer as string,
                    stripePriceId: sub.items.data[0].price.id,
                    stripeCurrentPeriodEnd: new Date(sub.current_period_end * 1000),
                },
            });
        }
    }

    if (event.type === "invoice.payment_succeeded") {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

        if (subscription) {
            const sub = subscription as any;
            await prisma.owner.update({
                where: { stripeSubscriptionId: sub.id },
                data: {
                    stripeCurrentPeriodEnd: new Date(sub.current_period_end * 1000),
                },
            });
        }
    }

    return new NextResponse(null, { status: 200 });
}
