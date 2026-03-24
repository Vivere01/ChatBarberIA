"use server";

import { prisma } from "@/lib/db";
import { getEffectiveStoreId, getEffectiveOwnerId } from "./shared";
import { startOfDay, endOfDay } from "date-fns";

export async function getAppointments(date: Date) {
    try {
        const storeId = await getEffectiveStoreId();

        const appointments = await prisma.appointment.findMany({
            where: {
                storeId,
                scheduledAt: {
                    gte: startOfDay(date),
                    lte: endOfDay(date),
                }
            },
            include: {
                client: true,
                staff: true,
                items: {
                    include: {
                        service: true
                    }
                }
            },
            orderBy: { scheduledAt: 'asc' }
        });
        return appointments;
    } catch (err) {
        console.error("Action Error [getAppointments]:", err);
        return [];
    }
}

export async function createAppointment(data: {
    client: string; // name
    serviceId: string;
    staffId: string;
    time: string; // "HH:mm"
    date: Date;
}) {
    try {
        const storeId = await getEffectiveStoreId();
        const ownerId = await getEffectiveOwnerId();

        // Find or create simplified client
        let client = await prisma.client.findFirst({
            where: { ownerId, name: data.client }
        });

        if (!client) {
            client = await prisma.client.create({
                data: {
                    ownerId,
                    name: data.client,
                }
            });
        }

        // Parse date + time
        const [hours, minutes] = data.time.split(":").map(Number);
        const scheduledAt = new Date(data.date);
        scheduledAt.setHours(hours, minutes, 0, 0);

        // Get service to get default duration and price
        const service = await prisma.service.findUnique({
            where: { id: data.serviceId }
        });

        if (!service) throw new Error("Serviço não encontrado");

        const appointment = await prisma.appointment.create({
            data: {
                storeId,
                clientId: client.id,
                staffId: data.staffId,
                scheduledAt,
                durationMinutes: service.durationMinutes,
                totalAmount: service.price,
                items: {
                    create: {
                        serviceId: service.id,
                        unitPrice: service.price,
                        totalPrice: service.price,
                        quantity: 1
                    }
                }
            },
            include: {
                client: true,
                staff: true,
                items: {
                    include: {
                        service: true
                    }
                }
            }
        });

        return { success: true, appointment };
    } catch (err: any) {
        console.error("Action Error [createAppointment]:", err);
        return { success: false, error: err.message || "Erro ao salvar agendamento." };
    }
}
