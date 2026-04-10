"use server";

import { prisma } from "@/lib/db";
import { getEffectiveStoreId } from "./shared";
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";

export async function getDashboardData() {
    try {
        const storeId = await getEffectiveStoreId();
        const now = new Date();
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        const dayStart = startOfDay(now);
        const dayEnd = endOfDay(now);

        // Receita do mês (agendamentos COMPLETED + entradas de caixa INCOME)
        const [completedAppointments, cashIncomeMonth, cashExpenseMonth, appointmentsThisMonth, clientsTotal, todayAppointments, topStaff] = await Promise.all([
            // Agendamentos concluídos no mês
            prisma.appointment.findMany({
                where: { storeId, status: "COMPLETED", scheduledAt: { gte: monthStart, lte: monthEnd } },
                select: { totalAmount: true },
            }),
            // Entradas de caixa do mês
            prisma.cashEntry.aggregate({
                where: { storeId, type: "INCOME", entryDate: { gte: monthStart, lte: monthEnd } },
                _sum: { amount: true },
            }),
            // Saídas de caixa do mês
            prisma.cashEntry.aggregate({
                where: { storeId, type: "EXPENSE", entryDate: { gte: monthStart, lte: monthEnd } },
                _sum: { amount: true },
            }),
            // Total de agendamentos do mês (não cancelados)
            prisma.appointment.count({
                where: { storeId, scheduledAt: { gte: monthStart, lte: monthEnd }, status: { not: "CANCELLED" } },
            }),
            // Clientes ativos (com ao menos 1 agendamento)
            prisma.clientStore.count({ where: { storeId } }),
            // Agendamentos de hoje
            prisma.appointment.findMany({
                where: { storeId, scheduledAt: { gte: dayStart, lte: dayEnd }, status: { not: "CANCELLED" } },
                include: {
                    client: { select: { name: true } },
                    staff: { select: { name: true } },
                    items: { include: { service: { select: { name: true } } } },
                },
                orderBy: { scheduledAt: "asc" },
                take: 10,
            }),
            // Top barbeiros do mês por faturamento
            prisma.staff.findMany({
                where: { storeId, isActive: true },
                include: {
                    appointments: {
                        where: { status: "COMPLETED", scheduledAt: { gte: monthStart, lte: monthEnd } },
                        select: { totalAmount: true },
                    },
                },
                orderBy: { gamificationPoints: "desc" },
                take: 5,
            }),
        ]);

        const appointmentRevenue = completedAppointments.reduce((s, a) => s + a.totalAmount, 0);
        const cashIn = cashIncomeMonth._sum.amount ?? 0;
        const cashOut = cashExpenseMonth._sum.amount ?? 0;
        // Receita total = agendamentos concluídos + outras entradas de caixa manuais
        const monthRevenue = cashIn; // cashEntry já inclui as entradas dos agendamentos concluídos
        const avgTicket = completedAppointments.length > 0 ? appointmentRevenue / completedAppointments.length : 0;

        const formattedTopStaff = topStaff.map((s) => ({
            id: s.id,
            name: s.name,
            avatarUrl: s.avatarUrl,
            level: s.gamificationLevel,
            revenue: s.appointments.reduce((sum: number, a: any) => sum + a.totalAmount, 0),
            appointmentCount: s.appointments.length,
        })).sort((a, b) => b.revenue - a.revenue);

        const formattedToday = todayAppointments.map((a) => ({
            id: a.id,
            time: new Date(a.scheduledAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            client: a.client?.name ?? "—",
            service: a.items.map((i: any) => i.service?.name).join(", ") || "—",
            staff: a.staff?.name ?? "—",
            value: a.totalAmount,
            status: a.status.toLowerCase(),
        }));

        return {
            monthRevenue,
            cashOut,
            appointmentsCount: appointmentsThisMonth,
            clientsCount: clientsTotal,
            avgTicket,
            todayAppointments: formattedToday,
            topStaff: formattedTopStaff,
        };
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        return {
            monthRevenue: 0,
            cashOut: 0,
            appointmentsCount: 0,
            clientsCount: 0,
            avgTicket: 0,
            todayAppointments: [],
            topStaff: [],
        };
    }
}
