"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getEffectiveOwnerId } from "./shared";

export async function createStore(data: {
    name: string;
    description?: string;
    address?: string;
    phone?: string;
    slug: string;
    primaryColor?: string;
    loginBackgroundUrl?: string;
    brandingFaviconUrl?: string;
}) {
    try {
        const ownerId = await getEffectiveOwnerId();

        const store = await prisma.store.create({
            data: {
                ...data,
                ownerId,
            },
        });

        revalidatePath("/admin/stores");
        return { success: true, store };
    } catch (error: any) {
        console.error("Erro detalhado ao criar loja:", error);
        return { success: false, error: error.message || "Erro ao criar loja" };
    }
}

export async function updateStore(id: string, data: {
    name: string;
    description?: string;
    address?: string;
    phone?: string;
    slug: string;
    primaryColor?: string;
    loginBackgroundUrl?: string;
    brandingFaviconUrl?: string;
}) {
    try {
        const ownerId = await getEffectiveOwnerId();
        const store = await prisma.store.update({
            where: { id, ownerId },
            data,
        });
        revalidatePath("/admin/stores");
        return { success: true, store };
    } catch (error: any) {
        console.error("Erro ao atualizar loja:", error);
        return { success: false, error: error.message || "Erro ao atualizar loja" };
    }
}

export async function deleteStore(id: string) {
    try {
        const ownerId = await getEffectiveOwnerId();
        await prisma.store.delete({
            where: { id, ownerId },
        });
        revalidatePath("/admin/stores");
        return { success: true };
    } catch (error: any) {
        console.error("Erro ao excluir loja:", error);
        return { success: false, error: error.message || "Erro ao excluir loja" };
    }
}

export async function getOwnerStores() {
    try {
        const ownerId = await getEffectiveOwnerId();
        return await prisma.store.findMany({
            where: { ownerId },
            orderBy: { createdAt: "asc" },
        });
    } catch (error) {
        console.error("Erro ao buscar lojas:", error);
        return [];
    }
}

export async function getStoreBranches(ownerId: string) {
    try {
        return await prisma.store.findMany({
            where: { ownerId, isActive: true },
            orderBy: { name: "asc" }
        });
    } catch (error) {
        console.error("Erro ao buscar filiais:", error);
        return [];
    }
}
