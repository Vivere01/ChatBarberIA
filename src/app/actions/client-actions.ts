"use server";

import { prisma } from "@/lib/db";
import { getEffectiveOwnerId } from "./shared";
import bcrypt from "bcryptjs";

// Map any display label to a valid ClientType enum value
function resolveClientType(type: string): "SUBSCRIBER" | "WALK_IN" {
    if (type === "SUBSCRIBER") return "SUBSCRIBER";
    return "WALK_IN"; // default for WALK_IN, REGULAR, NEW, VVIP, VIP, etc.
}

export async function getClientsList() {
    try {
        const ownerId = await getEffectiveOwnerId();
        const clients = await prisma.client.findMany({
            where: { ownerId, isActive: true },
            orderBy: { createdAt: 'desc' }
        });
        return clients;
    } catch (err) {
        console.error("Action Error [getClientsList]:", err);
        return [];
    }
}

export async function createClient(data: {
    name: string;
    email?: string;
    phone?: string;
    cpf?: string;
    clientType: string;
}) {
    try {
        const ownerId = await getEffectiveOwnerId();

        const client = await prisma.client.create({
            data: {
                ownerId,
                name: data.name,
                email: data.email,
                phone: data.phone,
                cpf: data.cpf,
                clientType: resolveClientType(data.clientType),
                totalSpent: 0,
            }
        });

        return { success: true, client };
    } catch (err: any) {
        console.error("Action Error [createClient]:", err);
        return { success: false, error: err.message || "Erro ao salvar cliente." };
    }
}

export async function registerClient(data: {
    name: string;
    email: string;
    phone?: string;
    password?: string;
    ownerId: string;
    storeId: string;
}) {
    try {
        if (!data.email || !data.password) {
            throw new Error("Email e senha obrigatórios.");
        }

        const passwordHash = await bcrypt.hash(data.password, 10);

        const client = await prisma.client.create({
            data: {
                ownerId: data.ownerId,
                name: data.name,
                email: data.email,
                phone: data.phone,
                passwordHash,
                clientType: 'WALK_IN', // Default
            }
        });

        // Vincular à loja também
        await prisma.clientStore.create({
            data: {
                clientId: client.id,
                storeId: data.storeId,
            }
        });

        return { success: true, client };
    } catch (err: any) {
        console.error("Action Error [registerClient]:", err);
        return { success: false, error: err.message || "Erro ao registrar cliente." };
    }
}

export async function updateClient(id: string, data: any) {
    try {
        const ownerId = await getEffectiveOwnerId();
        const client = await prisma.client.update({
            where: { id, ownerId },
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                cpf: data.cpf,
                clientType: resolveClientType(data.clientType),
            }
        });
        return { success: true, client };
    } catch (err: any) {
        console.error("Action Error [updateClient]:", err);
        return { success: false, error: err.message || "Erro ao atualizar." };
    }
}

export async function deleteClient(id: string) {
    try {
        const ownerId = await getEffectiveOwnerId();
        await prisma.client.delete({
            where: { id, ownerId }
        });
        return { success: true };
    } catch (err: any) {
        console.error("Action Error [deleteClient]:", err);
        return { success: false, error: err.message || "Erro ao excluir." };
    }
}
