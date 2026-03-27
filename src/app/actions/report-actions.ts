"use server";

import { prisma } from "@/lib/db";
import { getEffectiveOwnerId } from "./shared";
import { startOfDay, endOfDay, subDays, format } from "date-fns";

export async function getAbsentClients(days: number = 30) {
    try {
        const ownerId = await getEffectiveOwnerId();
        const cutoffDate = subDays(new Date(), days);

        // Clientes que tiveram o último agendamento há mais de X dias
        // Ou que nunca agendaram nada
        const clients = await prisma.client.findMany({
            where: {
                ownerId,
                isActive: true,
                appointments: {
                    none: {
                        scheduledAt: { gte: cutoffDate }
                    }
                }
            },
            include: {
                appointments: {
                    orderBy: { scheduledAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { name: 'asc' }
        });

        return clients;
    } catch (err) {
        console.error("Action Error [getAbsentClients]:", err);
        return [];
    }
}

export async function getNewClients(startDate: Date, endDate: Date) {
    try {
        const ownerId = await getEffectiveOwnerId();
        const clients = await prisma.client.findMany({
            where: {
                ownerId,
                createdAt: {
                    gte: startOfDay(startDate),
                    lte: endOfDay(endDate)
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return clients;
    } catch (err) {
        console.error("Action Error [getNewClients]:", err);
        return [];
    }
}

export async function getCanceledSubscriptions() {
    try {
        const ownerId = await getEffectiveOwnerId();
        
        const subscriptions = await prisma.clientSubscription.findMany({
            where: {
                client: { ownerId },
                status: { not: 'ACTIVE' }
            },
            include: {
                client: true,
                plan: true
            },
            orderBy: { updatedAt: 'desc' }
        });

        return subscriptions;
    } catch (err) {
        console.error("Action Error [getCanceledSubscriptions]:", err);
        return [];
    }
}

export async function getBirthdayClients(month?: number) {
    try {
        const ownerId = await getEffectiveOwnerId();
        
        // Prisma doesn't have a native "month" filter for DateTime easily across all DBs without raw query 
        // especially in SQLite vs Postgres. We'll fetch and filter in memory or use a safe approach.
        // For production (Postgres), we could use raw. For now, let's do a reasonably safe filter.
        
        const clients = await prisma.client.findMany({
            where: {
                ownerId,
                birthDate: { not: null }
            },
            orderBy: { name: 'asc' }
        });

        if (month !== undefined) {
          return clients.filter(c => c.birthDate && new Date(c.birthDate).getUTCMonth() === month);
        }

        // Default: birthday this month
        const currentMonth = new Date().getUTCMonth();
        return clients.filter(c => c.birthDate && new Date(c.birthDate).getUTCMonth() === currentMonth);
        
    } catch (err) {
        console.error("Action Error [getBirthdayClients]:", err);
        return [];
    }
}
