"use server";

import { prisma } from "@/lib/db";
import { getEffectiveStoreId, getEffectiveOwnerId } from "./shared";

export async function getProductsList() {
    try {
        const ownerId = await getEffectiveOwnerId();
        const products = await prisma.product.findMany({
            where: { 
                store: { ownerId },
                isActive: true 
            },
            include: {
                store: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        return products;
    } catch (err) {
        console.error("Action Error [getProductsList]:", err);
        return [];
    }
}

export async function createProduct(data: {
    name: string;
    description?: string;
    priceRetail: number;
    priceCost?: number;
    stockQty?: number;
    sku?: string;
    category?: string;
    commissionPercent?: number;
    storeId?: string;
}) {
    try {
        const storeId = data.storeId || await getEffectiveStoreId();

        const product = await prisma.product.create({
            data: {
                storeId,
                name: data.name,
                description: data.description,
                priceRetail: data.priceRetail,
                priceCost: data.priceCost,
                stockQty: data.stockQty || 0,
                sku: data.sku,
                category: data.category,
                commissionPercent: data.commissionPercent || 0,
            }
        });

        return { success: true, product };
    } catch (err: any) {
        console.error("Action Error [createProduct]:", err);
        return { success: false, error: err.message || "Erro ao salvar produto." };
    }
}

export async function updateProduct(id: string, data: any) {
    try {
        const storeId = data.storeId || await getEffectiveStoreId();
        const product = await prisma.product.update({
            where: { id, storeId },
            data: {
                name: data.name,
                description: data.description,
                priceRetail: data.priceRetail,
                priceCost: data.priceCost,
                stockQty: data.stockQty,
                sku: data.sku,
                category: data.category,
                commissionPercent: data.commissionPercent,
            }
        });
        return { success: true, product };
    } catch (err: any) {
        console.error("Action Error [updateProduct]:", err);
        return { success: false, error: err.message || "Erro ao atualizar." };
    }
}

export async function deleteProduct(id: string) {
    try {
        const ownerId = await getEffectiveOwnerId();
        // Usamos deleteMany para evitar erro caso o registro já tenha sido excluido
        // e para garantir que pertence a qualquer uma das lojas do dono atual.
        await prisma.product.deleteMany({
            where: { 
                id,
                store: { ownerId }
            }
        });
        return { success: true };
    } catch (err: any) {
        console.error("Action Error [deleteProduct]:", err);
        return { success: false, error: err.message || "Erro ao excluir." };
    }
}
