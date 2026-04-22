"use server";

import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";

export async function getAccountSettings() {
    try {
        const session = await getAuthSession();
        if (!session?.user || (session.user as any).role !== 'OWNER') {
            return { error: "Não autorizado." };
        }

        const owner = await prisma.owner.findUnique({
            where: { id: (session.user as any).id },
            select: {
                id: true,
                name: true,
                slug: true,
                email: true
            }
        });

        return { success: true, account: owner };
    } catch (err) {
        console.error("Action Error [getAccountSettings]:", err);
        return { error: "Erro ao buscar dados da conta." };
    }
}

export async function updateAccountSettings(data: {
    name: string;
    slug: string;
}) {
    try {
        const session = await getAuthSession();
        if (!session?.user || (session.user as any).role !== 'OWNER') {
            return { error: "Não autorizado." };
        }

        const ownerId = (session.user as any).id;
        const finalSlug = slugify(data.slug);

        // Check if slug is taken by another owner
        if (finalSlug) {
            const existing = await prisma.owner.findFirst({
                where: { 
                    slug: finalSlug,
                    id: { not: ownerId }
                }
            });
            if (existing) return { error: "Este slug já está em uso por outra conta." };
        }

        await prisma.owner.update({
            where: { id: ownerId },
            data: {
                name: data.name,
                slug: finalSlug || null
            }
        });

        revalidatePath("/admin/settings");
        return { success: true };
    } catch (err) {
        console.error("Action Error [updateAccountSettings]:", err);
        return { error: "Erro ao salvar dados da conta." };
    }
}


export async function getGatewaySettings() {
    try {
        const session = await getAuthSession();
        if (!session?.user || (session.user as any).role !== 'OWNER') {
            return { error: "Não autorizado." };
        }

        const owner = await prisma.owner.findUnique({
            where: { id: (session.user as any).id },
            select: {
                id: true,
                celcashToken: true,
                celcashPublicToken: true
            }
        });

        return { success: true, settings: owner };
    } catch (err) {
        console.error("Action Error [getGatewaySettings]:", err);
        return { error: "Erro ao buscar configurações." };
    }
}

export async function updateGatewaySettings(data: {
    celcashToken: string;
    celcashPublicToken: string;
}) {
    try {
        const session = await getAuthSession();
        if (!session?.user || (session.user as any).role !== 'OWNER') {
            return { error: "Não autorizado." };
        }

        await prisma.owner.update({
            where: { id: (session.user as any).id },
            data: {
                celcashToken: data.celcashToken,
                celcashPublicToken: data.celcashPublicToken
            }
        });

        revalidatePath("/admin/settings");
        return { success: true };
    } catch (err) {
        console.error("Action Error [updateGatewaySettings]:", err);
        return { error: "Erro ao salvar configurações." };
    }
}

export async function getStoreSettings(storeId?: string) {
    try {
        const { getAuthSession } = await import("@/lib/auth");
        const session = await getAuthSession();
        if (!session?.user || (session.user as any).role !== 'OWNER') {
            return { error: "Não autorizado." };
        }

        const store = await prisma.store.findFirst({
            where: { 
                ownerId: (session.user as any).id,
                ...(storeId && storeId !== 'all' && { id: storeId })
            },
            include: { businessHours: true }
        });

        return { success: true, store };
    } catch (err) {
        console.error("Action Error [getStoreSettings]:", err);
        return { error: "Erro ao buscar configurações da loja." };
    }
}

export async function updateStoreSettings(data: {
    primaryColor?: string;
    colorSubscriber?: string;
    colorRegular?: string;
    colorDefaulter?: string;
    businessHours?: any[];
    timezone?: string;
}) {
    try {
        const { getAuthSession } = await import("@/lib/auth");
        const session = await getAuthSession();
        if (!session?.user || (session.user as any).role !== 'OWNER') {
            return { error: "Não autorizado." };
        }

        const ownerId = (session.user as any).id;
        const store = await prisma.store.findFirst({ where: { ownerId } });
        if (!store) return { error: "Loja não encontrada." };

        await prisma.store.update({
            where: { id: store.id },
            data: {
                primaryColor: data.primaryColor,
                colorSubscriber: data.colorSubscriber,
                colorRegular: data.colorRegular,
                colorDefaulter: data.colorDefaulter,
                timezone: data.timezone,
            }
        });

        // Update business hours if provided (assuming they exist)
        if (data.businessHours) {
            for (const bh of data.businessHours) {
                await prisma.businessHour.upsert({
                    where: { storeId_dayOfWeek: { storeId: store.id, dayOfWeek: bh.dayOfWeek } },
                    update: {
                        isOpen: bh.isOpen,
                        openTime: bh.openTime,
                        closeTime: bh.closeTime
                    },
                    create: {
                        storeId: store.id,
                        dayOfWeek: bh.dayOfWeek,
                        isOpen: bh.isOpen,
                        openTime: bh.openTime,
                        closeTime: bh.closeTime
                    }
                });
            }
        }

        revalidatePath("/admin/settings");
        return { success: true };
    } catch (err) {
        console.error("Action Error [updateStoreSettings]:", err);
        return { error: "Erro ao salvar configurações da loja." };
    }
}
