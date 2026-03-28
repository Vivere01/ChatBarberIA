"use server";

import { prisma } from "@/lib/db";
import { getEffectiveStoreId } from "./shared";
import { startOfMonth, endOfMonth } from "date-fns";

/**
 * Calcula o status do pote para o mês atual (previsão)
 */
export async function getPotStatus(month: number, year: number) {
    try {
        const storeId = await getEffectiveStoreId();
        
        // 1. Calcular o montante total do pote baseado em assinaturas ATIVAS que pertencem a esse OWNER/STORE
        // Para simplificar, pegamos todas as assinaturas ativas na STORE
        const activeSubscriptions = await prisma.clientSubscription.findMany({
            where: {
                status: 'ACTIVE',
                client: { clientStores: { some: { storeId } } }
            },
            include: { plan: true }
        });

        const totalPotAmount = activeSubscriptions.reduce((sum, sub) => sum + (sub.plan.potAmount || 0), 0);

        // 2. Contabilizar fichas geradas no período pelos profissionais
        const startDate = startOfMonth(new Date(year, month - 1));
        const endDate = endOfMonth(new Date(year, month - 1));

        const appointments = await prisma.appointment.findMany({
            where: {
                storeId,
                isSubscription: true,
                status: 'COMPLETED',
                scheduledAt: { gte: startDate, lte: endDate }
            },
            select: { staffId: true, fichasCount: true }
        });

        const totalFichas = appointments.reduce((sum, apt) => sum + apt.fichasCount, 0);
        const valuePerFicha = totalFichas > 0 ? totalPotAmount / totalFichas : 0;

        // 3. Agrupar por profissional
        const staffStats: Record<string, { name: string, fichas: number, earnings: number }> = {};
        
        // Buscar nomes dos profissionais
        const staffList = await prisma.staff.findMany({ where: { storeId } });
        staffList.forEach(s => {
            staffStats[s.id] = { name: s.name, fichas: 0, earnings: 0 };
        });

        appointments.forEach(apt => {
            if (staffStats[apt.staffId]) {
                staffStats[apt.staffId].fichas += apt.fichasCount;
            }
        });

        // Calcular ganhos
        Object.keys(staffStats).forEach(id => {
            staffStats[id].earnings = staffStats[id].fichas * valuePerFicha;
        });

        return {
            success: true,
            data: {
                totalPotAmount,
                totalFichas,
                valuePerFicha,
                staffStats: Object.values(staffStats).filter(s => s.fichas > 0)
            }
        };

    } catch (error) {
        console.error("Error calculating pot status:", error);
        return { success: false, error: "Erro ao calcular pote." };
    }
}

/**
 * Fecha o mês e registra a distribuição do pote
 */
export async function distributePot(month: number, year: number) {
    try {
        const storeId = await getEffectiveStoreId();
        const status = await getPotStatus(month, year);
        
        if (!status.success) return status;

        const { totalPotAmount, totalFichas, valuePerFicha } = status.data!;

        const distribution = await prisma.potDistribution.create({
            data: {
                storeId,
                month,
                year,
                totalPotAmount,
                totalFichas,
                valuePerFicha,
                status: 'PAID'
            }
        });

        return { success: true, distribution };
    } catch (error: any) {
        if (error.code === 'P2002') return { success: false, error: "Pote deste mês já foi distribuído." };
        console.error("Error distributing pot:", error);
        return { success: false, error: "Erro ao distribuir pote." };
    }
}
