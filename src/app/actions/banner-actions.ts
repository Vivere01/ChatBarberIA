"use server";

import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getBanners(storeId?: string) {
    try {
        const session = await getAuthSession();
        if (!session?.user) return [];

        const where: any = {};
        if (storeId) {
            where.storeId = storeId;
        } else {
            // If admin, get all banners of the owner's stores
            where.store = { ownerId: (session.user as any).id };
        }

        return await prisma.banner.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        console.error("Error fetching banners:", error);
        return [];
    }
}

export async function createBanner(data: {
    title: string;
    imageUrl: string;
    linkUrl?: string;
    type: "INTERNAL" | "MINISITE"; // Check BannerType enum in schema
    storeId: string;
}) {
    try {
        const session = await getAuthSession();
        if (!session?.user) throw new Error("Não autorizado");

        const banner = await prisma.banner.create({
            data: {
                ...data,
                ownerId: (session.user as any).id,
            }
        });

        revalidatePath("/admin/banners");
        return { success: true, banner };
    } catch (error: any) {
        console.error("Error creating banner:", error);
        return { success: false, error: error.message };
    }
}

export async function toggleBannerStatus(id: string, isActive: boolean) {
    try {
        const session = await getAuthSession();
        if (!session?.user) throw new Error("Não autorizado");

        await prisma.banner.update({
            where: { id, ownerId: (session.user as any).id },
            data: { isActive }
        });

        revalidatePath("/admin/banners");
        return { success: true };
    } catch (error: any) {
        console.error("Error toggling banner:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteBanner(id: string) {
    try {
        const session = await getAuthSession();
        if (!session?.user) throw new Error("Não autorizado");

        await prisma.banner.delete({
            where: { id, ownerId: (session.user as any).id }
        });

        revalidatePath("/admin/banners");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting banner:", error);
        return { success: false, error: error.message };
    }
}
