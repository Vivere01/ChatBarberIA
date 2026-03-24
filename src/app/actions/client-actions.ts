"use server";

import { prisma } from "@/lib/db";
import { getEffectiveOwnerId } from "./shared";

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
                clientType: data.clientType as any,
                totalSpent: 0,
            }
        });

        return { success: true, client };
    } catch (err: any) {
        console.error("Action Error [createClient]:", err);
        return { success: false, error: err.message || "Erro ao salvar cliente." };
    }
}
