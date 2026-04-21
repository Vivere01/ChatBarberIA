"use server";

import { prisma } from "@/lib/db";
import { getEffectiveStoreId, getEffectiveOwnerId } from "./shared";

// Map display roles to valid UserRole enum values
function resolveRole(role: string): string {
    const map: Record<string, string> = {
        "STAFF_RECEPTIONIST": "STAFF",
        "BARBER": "STAFF",
        "RECEPTIONIST": "STAFF",
    };
    const validRoles = ["STAFF", "MANAGER", "OWNER", "CLIENT", "SUPER_ADMIN"];
    const mapped = map[role] ?? role;
    return validRoles.includes(mapped) ? mapped : "STAFF";
}

export async function getStaffList(filterStoreId?: string) {
    try {
        const ownerId = await getEffectiveOwnerId();
        const staff = await prisma.staff.findMany({
            where: {
                store: { ownerId },
                ...(filterStoreId && filterStoreId !== 'all' && { storeId: filterStoreId }),
            },
            include: {
                store: {
                    select: { name: true }
                }
            },
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
    avatarUrl?: string;
    role: string;
    commissionPercent: number;
    storeId?: string;
}) {
    try {
        const storeId = data.storeId || await getEffectiveStoreId();
        const role = resolveRole(data.role);

        const staff = await prisma.staff.create({
            data: {
                storeId,
                name: data.name,
                email: data.email,
                phone: data.phone,
                avatarUrl: data.avatarUrl,
                role: role as any,
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

export async function updateStaff(id: string, data: any) {
    try {
        const storeId = data.storeId || await getEffectiveStoreId();
        const staff = await prisma.staff.update({
            where: { id, storeId },
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                role: resolveRole(data.role) as any,
                commissionPercent: data.commissionPercent,
                avatarUrl: data.avatarUrl,
            }
        });
        return { success: true, staff };
    } catch (err: any) {
        console.error("Action Error [updateStaff]:", err);
        return { success: false, error: err.message || "Erro ao atualizar." };
    }
}

export async function deleteStaff(id: string) {
    try {
        const ownerId = await getEffectiveOwnerId();
        // Usamos deleteMany para evitar erro caso o registro já tenha sido excluido
        // e para garantir que pertence a qualquer uma das lojas do dono atual.
        await prisma.staff.deleteMany({
            where: { 
                id,
                store: { ownerId }
            }
        });
        return { success: true };
    } catch (err: any) {
        console.error("Action Error [deleteStaff]:", err);
        return { success: false, error: err.message || "Erro ao excluir." };
    }
}
