"use server";

import { prisma } from "@/lib/db";
import { getEffectiveStoreId, getEffectiveOwnerId } from "./shared";
import { revalidatePath } from "next/cache";
import { startOfMonth, endOfMonth } from "date-fns";

export async function getCommissions(dateRange?: { from: Date; to: Date }) {
    try {
        const ownerId = await getEffectiveOwnerId();
        const now = new Date();
        const start = dateRange?.from || startOfMonth(now);
        const end = dateRange?.to || endOfMonth(now);

        // Busca todas as lojas deste proprietário
        const stores = await prisma.store.findMany({ where: { ownerId }, select: { id: true } });
        const storeIds = stores.map(s => s.id);

        // Busca todas as comissões do mês para essas lojas agrupadas por barbeiro
        const commissions = await prisma.commission.findMany({
            where: {
                appointment: {
                    storeId: { in: storeIds },
                    scheduledAt: { gte: start, lte: end },
                },
            },
            include: {
                staff: { select: { id: true, name: true, avatarUrl: true, commissionPercent: true } },
                appointment: {
                    select: {
                        scheduledAt: true,
                        totalAmount: true,
                        client: { select: { name: true, clientType: true } },
                        items: { include: { service: { select: { name: true } } } },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Agrupar por barbeiro
        const byStaff = commissions.reduce((acc: Record<string, any>, c) => {
            const sid = c.staffId;
            if (!acc[sid]) {
                acc[sid] = {
                    staffId: sid,
                    staffName: c.staff.name,
                    avatarUrl: c.staff.avatarUrl,
                    commissionPercent: c.staff.commissionPercent,
                    grossTotal: 0,
                    commissionTotal: 0,
                    pendingAmount: 0,
                    paidAmount: 0,
                    appointmentCount: 0,
                    subscriberCount: 0,
                    walkInCount: 0,
                    entries: [],
                };
            }
            acc[sid].grossTotal += c.grossAmount;
            acc[sid].commissionTotal += c.commissionAmount;
            acc[sid].appointmentCount += 1;
            if (c.status === "PENDING") acc[sid].pendingAmount += c.commissionAmount;
            else acc[sid].paidAmount += c.commissionAmount;
            if (c.appointment.client?.clientType === "SUBSCRIBER") acc[sid].subscriberCount += 1;
            else acc[sid].walkInCount += 1;
            acc[sid].entries.push(c);
            return acc;
        }, {});

        const staffList = Object.values(byStaff);

        const totalPending = staffList.reduce((s: number, st: any) => s + st.pendingAmount, 0);
        const totalPaid = staffList.reduce((s: number, st: any) => s + st.paidAmount, 0);
        const totalCommission = staffList.reduce((s: number, st: any) => s + st.commissionTotal, 0);

        return { staffList, totalPending, totalPaid, totalCommission };
    } catch (error) {
        console.error("Error fetching commissions:", error);
        return { staffList: [], totalPending: 0, totalPaid: 0, totalCommission: 0 };
    }
}

export async function markCommissionPaid(staffId: string) {
    try {
        const storeId = await getEffectiveStoreId();
        const now = new Date();
        const start = startOfMonth(now);
        const end = endOfMonth(now);

        await prisma.commission.updateMany({
            where: {
                staffId,
                status: "PENDING",
                appointment: {
                    storeId,
                    scheduledAt: { gte: start, lte: end },
                },
            },
            data: { status: "PAID", paidAt: new Date() },
        });

        revalidatePath("/admin/commissions");
        return { success: true };
    } catch (error) {
        console.error("Error marking commission as paid:", error);
        return { success: false };
    }
}
