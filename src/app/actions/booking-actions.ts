"use server";

import { prisma } from "@/lib/db";

export async function getStoreForBooking(storeId: string) {
    try {
        const store = await prisma.store.findUnique({
            where: { id: storeId },
            include: {
                banners: {
                    where: { isActive: true },
                    orderBy: { sortOrder: 'asc' }
                },
                services: {
                    where: { isActive: true }
                },
                staff: {
                    where: { isActive: true }
                }
            }
        });
        return store;
    } catch (error) {
        console.error("Error fetching store:", error);
        return null;
    }
}

export async function getStoreBySlug(slug: string) {
    try {
        const store = await prisma.store.findUnique({
            where: { slug, isActive: true },
            select: { id: true, name: true, ownerId: true, logoUrl: true }
        });
        return store;
    } catch (error) {
        console.error("Error fetching store by slug:", error);
        return null;
    }
}
