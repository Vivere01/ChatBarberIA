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
    password?: string;
    birthDate?: string;
}) {
    try {
        const ownerId = await getEffectiveOwnerId();

        // Check plan limits
        const { getSubscriptionInfo } = await import("@/lib/permissions");
        const info = await getSubscriptionInfo();
        
        if (info && !info.isDev) {
            const currentClients = await prisma.client.count({ where: { ownerId } });
            const limit = info.plan?.limits.clients ?? 200;
            if (limit !== -1 && currentClients >= limit) {
                return { success: false, error: `Seu plano ${info.plan?.name || "Starter"} permite no máximo ${limit} clientes.` };
            }
        }

        let passwordHash = undefined;
        if (data.password) {
            passwordHash = await bcrypt.hash(data.password, 10);
        }

        const client = await prisma.client.create({
            data: {
                ownerId,
                name: data.name,
                email: data.email,
                phone: data.phone,
                cpf: data.cpf,
                passwordHash,
                birthDate: data.birthDate ? new Date(data.birthDate) : null,
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
                birthDate: data.birthDate ? new Date(data.birthDate) : null,
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
        // Usamos deleteMany para evitar erro caso o registro já tenha sido excluido
        await prisma.client.deleteMany({
            where: { id, ownerId }
        });
        return { success: true };
    } catch (err: any) {
        console.error("Action Error [deleteClient]:", err);
        return { success: false, error: err.message || "Erro ao excluir." };
    }
}

export async function getClientProfile() {
    try {
        const { getAuthSession } = await import("@/lib/auth");
        const session = await getAuthSession();
        if (!session?.user || (session.user as any).role !== "CLIENT") return null;
        const clientId = (session.user as any).id;

        return await prisma.client.findUnique({
            where: { id: clientId },
            include: { subscription: { include: { plan: true } } }
        });
    } catch (error) {
        console.error("Error fetching client profile:", error);
        return null;
    }
}

export async function updateClientProfile(data: { name: string; email?: string; phone?: string; avatarUrl?: string }) {
    try {
        const { getAuthSession } = await import("@/lib/auth");
        const session = await getAuthSession();
        if (!session?.user || (session.user as any).role !== "CLIENT") return { error: "Não autorizado" };
        const clientId = (session.user as any).id;

        await prisma.client.update({
            where: { id: clientId },
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                avatarUrl: data.avatarUrl
            }
        });

        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function updateClientPassword(data: { currentPassword?: string; newPassword: string }) {
    try {
        const { getAuthSession } = await import("@/lib/auth");
        const session = await getAuthSession();
        if (!session?.user || (session.user as any).role !== "CLIENT") return { error: "Não autorizado" };
        const clientId = (session.user as any).id;

        const client = await prisma.client.findUnique({ where: { id: clientId } });
        if (!client) return { error: "Cliente não encontrado" };

        // If client has a password, check it (some might not have if they were created by admin without one)
        if (client.passwordHash && data.currentPassword) {
            const isValid = await bcrypt.compare(data.currentPassword, client.passwordHash);
            if (!isValid) return { error: "Senha atual incorreta" };
        }

        const passwordHash = await bcrypt.hash(data.newPassword, 10);
        await prisma.client.update({
            where: { id: clientId },
            data: { passwordHash }
        });

        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}
