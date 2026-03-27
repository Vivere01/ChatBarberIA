"use server";

import { prisma } from "@/lib/db";
import { getEffectiveOwnerId } from "./shared";
import { startOfDay, endOfDay } from "date-fns";
import { getAuthSession } from "@/lib/auth";

export async function createAdminWaitlistEntry(data: {
    storeId: string;
    clientId: string;
    requestedDate: Date | string;
    notes?: string;
}) {
    try {
        const ownerId = await getEffectiveOwnerId();
        
        const store = await prisma.store.findFirst({
            where: { id: data.storeId, ownerId }
        });

        if (!store) {
            throw new Error("Loja não encontrada ou sem permissão.");
        }

        const entry = await prisma.waitlistEntry.create({
            data: {
                storeId: data.storeId,
                clientId: data.clientId,
                requestedDate: startOfDay(new Date(data.requestedDate)),
                notes: data.notes,
                status: "PENDING"
            }
        });

        return { success: true, entry };
    } catch (err: any) {
        console.error("Action Error [createAdminWaitlistEntry]:", err);
        return { success: false, error: err.message || "Erro ao adicionar." };
    }
}

export async function getWaitlistEntries(date?: Date | string) {
    try {
        const ownerId = await getEffectiveOwnerId();

        let whereClause: any = {
            store: { ownerId },
            status: "PENDING"
        };

        if (date) {
            const dateObj = new Date(date);
            whereClause.requestedDate = {
                gte: startOfDay(dateObj),
                lte: endOfDay(dateObj)
            };
        }

        const entries = await prisma.waitlistEntry.findMany({
            where: whereClause,
            include: {
                client: { select: { id: true, name: true, phone: true } },
                store: { select: { name: true } }
            },
            orderBy: { createdAt: 'asc' }
        });

        return entries;
    } catch (err) {
        console.error("Action Error [getWaitlistEntries]:", err);
        return [];
    }
}

export async function updateWaitlistStatus(id: string, status: "PENDING" | "FULFILLED" | "CANCELLED") {
    try {
        await getEffectiveOwnerId(); // Just for auth check
        
        const entry = await prisma.waitlistEntry.update({
            where: { id },
            data: { status }
        });

        return { success: true, entry };
    } catch (err: any) {
        console.error("Action Error [updateWaitlistStatus]:", err);
        return { success: false, error: err.message || "Erro ao atualizar." };
    }
}

export async function getClientWaitlist(storeId: string) {
    try {
        const session = await getAuthSession();
        const userId = (session?.user as any)?.id;
        if (!userId) return [];

        const entries = await prisma.waitlistEntry.findMany({
            where: {
                storeId,
                clientId: userId,
                status: 'PENDING'
            },
            include: {
                store: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return entries;
    } catch (err) {
        console.error("Action Error [getClientWaitlist]:", err);
        return [];
    }
}

export async function createClientWaitlistEntry(data: {
    storeId: string;
    requestedDate: Date | string;
    notes?: string;
}) {
    try {
        const session = await getAuthSession();
        const clientId = (session?.user as any)?.id;

        if (!clientId) return { success: false, error: "Sessão expirada." };

        const entry = await prisma.waitlistEntry.create({
            data: {
                storeId: data.storeId,
                clientId: clientId,
                requestedDate: startOfDay(new Date(data.requestedDate)),
                notes: data.notes,
                status: 'PENDING'
            }
        });

        return { success: true, entry };
    } catch (err: any) {
        console.error("Action Error [createClientWaitlistEntry]:", err);
        return { success: false, error: err.message || "Erro ao entrar na lista." };
    }
}
