"use server";

import { prisma } from "@/lib/db";
import { getEffectiveStoreId } from "./shared";

export async function getStaffList() {
    try {
        const storeId = await getEffectiveStoreId();
        const staff = await prisma.staff.findMany({
            where: { storeId },
            orderBy: { createdAt: 'desc' }
        });
        return staff;
    } catch (err) {
        console.error("Action Error [getStaffList]:", err);
        return [];
    }
}

export async function createStaff(data: {
    name: string;
    email?: string;
    phone?: string;
    role: string;
    commissionPercent: number;
}) {
    try {
        const storeId = await getEffectiveStoreId();

        const staff = await prisma.staff.create({
            data: {
                storeId,
                name: data.name,
                email: data.email,
                phone: data.phone,
                role: data.role as any,
                commissionPercent: data.commissionPercent,
                gamificationLevel: "BRONZE",
                gamificationPoints: 0,
            }
        });

        return { success: true, staff };
    } catch (err: any) {
        console.error("Action Error [createStaff]:", err);
        return { success: false, error: err.message || "Erro desconhecido ao salvar." };
    }
}
