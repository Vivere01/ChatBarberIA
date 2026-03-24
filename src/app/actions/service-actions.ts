"use server";

import { prisma } from "@/lib/db";
import { getEffectiveStoreId } from "./shared";

export async function getServicesList() {
    try {
        const storeId = await getEffectiveStoreId();
        const services = await prisma.service.findMany({
            where: { storeId, isActive: true },
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
}) {
    try {
        const storeId = await getEffectiveStoreId();

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
