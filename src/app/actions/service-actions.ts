"use server";

import { prisma } from "@/lib/db";
import { getEffectiveStoreId, getEffectiveOwnerId } from "./shared";

export async function getServicesList() {
    try {
        const ownerId = await getEffectiveOwnerId();
        const services = await prisma.service.findMany({
            where: { 
                store: { ownerId },
                isActive: true 
            },
            include: {
                store: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        return services;
    } catch (err) {
        console.error("Action Error [getServicesList]:", err);
        return [];
    }
}

export async function createService(data: {
    name: string;
    description?: string;
    price: number;
    durationMinutes: number;
    category?: string;
    storeId?: string;
}) {
    try {
        const storeId = data.storeId || await getEffectiveStoreId();

        const service = await prisma.service.create({
            data: {
                storeId,
                name: data.name,
                description: data.description,
                price: data.price,
                durationMinutes: data.durationMinutes,
                category: data.category,
            }
        });

        return { success: true, service };
    } catch (err: any) {
        console.error("Action Error [createService]:", err);
        return { success: false, error: err.message || "Erro ao salvar serviço." };
    }
}

export async function updateService(id: string, data: any) {
    try {
        const storeId = data.storeId || await getEffectiveStoreId();
        const service = await prisma.service.update({
            where: { id, storeId },
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                durationMinutes: data.durationMinutes,
                category: data.category,
            }
        });
        return { success: true, service };
    } catch (err: any) {
        console.error("Action Error [updateService]:", err);
        return { success: false, error: err.message || "Erro ao atualizar." };
    }
}

export async function deleteService(id: string) {
    try {
        const ownerId = await getEffectiveOwnerId();
        // Usamos deleteMany para evitar erro caso o registro já tenha sido excluido
        // e para garantir que pertence a qualquer uma das lojas do dono atual.
        await prisma.service.deleteMany({
            where: { 
                id,
                store: { ownerId }
            }
        });
        return { success: true };
    } catch (err: any) {
        console.error("Action Error [deleteService]:", err);
        return { success: false, error: err.message || "Erro ao excluir." };
    }
}
