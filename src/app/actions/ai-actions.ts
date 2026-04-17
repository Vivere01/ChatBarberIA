"use server";

import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";

/**
 * Gets the current owner's API key.
 */
export async function getApiKey() {
    try {
        const session = await getAuthSession();
        if (!session?.user || (session.user as any).role !== 'OWNER') {
            return { error: "Não autorizado." };
        }

        const owner = await prisma.owner.findUnique({
            where: { id: (session.user as any).id },
            select: { 
                id: true,
                apiKey: true 
            }
        });

        if (!owner) return { error: "Dono não encontrado." };

        return { success: true, apiKey: owner.apiKey, ownerId: owner.id };
    } catch (err) {
        console.error("Action Error [getApiKey]:", err);
        return { error: "Erro ao buscar chave de API." };
    }
}

/**
 * Regenerates the owner's API key.
 */
export async function regenerateApiKey() {
    try {
        const session = await getAuthSession();
        if (!session?.user || (session.user as any).role !== 'OWNER') {
            return { error: "Não autorizado." };
        }

        // Generate a new key with prefix cb_live_ for clarity
        const newKey = `cb_live_${randomBytes(24).toString('hex')}`;

        await prisma.owner.update({
            where: { id: (session.user as any).id },
            data: { apiKey: newKey }
        });

        revalidatePath("/admin/ai");
        return { success: true, apiKey: newKey };
    } catch (err) {
        console.error("Action Error [regenerateApiKey]:", err);
        return { error: "Erro ao regenerar chave de API." };
    }
}

/**
 * Updates WhatsApp integration settings.
 */
export async function updateAiSettings(data: {
    evolutionApiUrl?: string;
    whatsappToken?: string;
}) {
    try {
        const session = await getAuthSession();
        if (!session?.user || (session.user as any).role !== 'OWNER') {
            return { error: "Não autorizado." };
        }

        const ownerId = (session.user as any).id;

        await prisma.aiContext.upsert({
            where: { ownerId },
            update: {
                evolutionApiUrl: data.evolutionApiUrl,
                whatsappToken: data.whatsappToken
            },
            create: {
                ownerId,
                evolutionApiUrl: data.evolutionApiUrl,
                whatsappToken: data.whatsappToken
            }
        });

        revalidatePath("/admin/ai");
        return { success: true };
    } catch (err) {
        console.error("Action Error [updateAiSettings]:", err);
        return { error: "Erro ao atualizar configurações de IA." };
    }
}

/**
 * Gets a structured map of all IDs needed for an AI Agent.
 */
export async function getAiKnowledgeBase() {
    try {
        const session = await getAuthSession();
        if (!session?.user || (session.user as any).role !== 'OWNER') {
            return { error: "Não autorizado." };
        }

        const ownerId = (session.user as any).id;

        const [stores, services, staff, plans] = await Promise.all([
            prisma.store.findMany({ where: { ownerId }, select: { id: true, name: true, slug: true } }),
            prisma.service.findMany({ 
                where: { store: { ownerId } }, 
                select: { id: true, name: true, price: true, store: { select: { name: true } } } 
            }),
            prisma.staff.findMany({ 
                where: { store: { ownerId } }, 
                select: { id: true, name: true, store: { select: { name: true } } } 
            }),
            prisma.subscriptionPlan.findMany({ where: { ownerId }, select: { id: true, name: true, price: true } })
        ]);

        return {
            success: true,
            data: {
                filiais: stores.map(s => ({ id: s.id, nome: s.name, slug: s.slug })),
                servicos: services.map(s => ({ id: s.id, nome: s.name, preco: s.price, unidade: s.store.name })),
                barbeiros: staff.map(s => ({ id: s.id, nome: s.name, unidade: s.store.name })),
                planos: plans.map(p => ({ id: p.id, nome: p.name, preco: p.price }))
            }
        };
    } catch (err) {
        console.error("Action Error [getAiKnowledgeBase]:", err);
        return { error: "Erro ao buscar base de conhecimento." };
    }
}

