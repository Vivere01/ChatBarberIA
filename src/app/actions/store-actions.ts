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
    logoUrl?: string;
}) {
    try {
        const ownerId = await getEffectiveOwnerId();
        
        // Check plan limits
        const { getSubscriptionInfo } = await import("@/lib/permissions");
        const info = await getSubscriptionInfo();
        
        if (info && !info.isDev) {
            const currentStores = await prisma.store.count({ where: { ownerId } });
            const limit = info.plan?.limits.stores ?? 1;
            if (limit !== -1 && currentStores >= limit) {
                return { success: false, error: `Seu plano ${info.plan?.name || "Starter"} permite no máximo ${limit} loja(s).` };
            }
        }
        
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
    name?: string;
    description?: string;
    address?: string;
    phone?: string;
    slug?: string;
    logoUrl?: string;
    primaryColor?: string;
    loginBackgroundUrl?: string;
    brandingFaviconUrl?: string;
    [key: string]: any;
}) {
    try {
        const ownerId = await getEffectiveOwnerId();
        // Extract only known Prisma fields to avoid unknown property errors
        const { name, description, address, phone, slug, logoUrl, primaryColor, loginBackgroundUrl, brandingFaviconUrl } = data;
        const updateData: Record<string, any> = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (address !== undefined) updateData.address = address;
        if (phone !== undefined) updateData.phone = phone;
        if (slug !== undefined) updateData.slug = slug;
        if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
        if (primaryColor !== undefined) updateData.primaryColor = primaryColor;
        if (loginBackgroundUrl !== undefined) updateData.loginBackgroundUrl = loginBackgroundUrl;
        if (brandingFaviconUrl !== undefined) updateData.brandingFaviconUrl = brandingFaviconUrl;

        const store = await prisma.store.update({
            where: { id, ownerId },
            data: updateData,
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
