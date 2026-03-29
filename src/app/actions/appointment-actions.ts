"use server";

import { prisma } from "@/lib/db";
import { getEffectiveStoreId, getEffectiveOwnerId } from "./shared";
import { revalidatePath } from "next/cache";
import { startOfDay, endOfDay } from "date-fns";

// ─── ADMIN APPOINTMENT ACTIONS ───────────────────────────────────────

export async function createAdminAppointment(data: {
    clientId: string;
    staffId: string;
    serviceIds: string[];
    time: string;
    date: Date;
}) {
    try {
        const ownerId = await getEffectiveOwnerId();
        const storeId = await getEffectiveStoreId();

        // 🛡️ TIMEZONE SHIELD: Salva a hora "seca" (sem offset) para evitar o erro de sumiço.
        // O Banco salva em UTC, então mandamos a hora selecionada como se fosse UTC.
        const [hours, minutes] = data.time.split(':').map(Number);
        const baseDate = new Date(data.date);
        
        const scheduledAt = new Date(Date.UTC(
            baseDate.getUTCFullYear(),
            baseDate.getUTCMonth(),
            baseDate.getUTCDate(),
            hours, // Grava "9" horas exatamente no UTC
            minutes,
            0, 0
        ));

        // Fetch services for price & duration
        const services = await prisma.service.findMany({
            where: { id: { in: data.serviceIds } }
        });

        const totalDuration = services.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
        const totalAmount = services.reduce((acc, s) => acc + s.price, 0);

        const appointment = await prisma.appointment.create({
            data: {
                storeId,
                clientId: data.clientId,
                staffId: data.staffId,
                scheduledAt, // Agora salvo de forma absoluta (09:00Z para 09:00)
                durationMinutes: totalDuration || 30,
                totalAmount: totalAmount,
                status: "SCHEDULED",
                items: {
                    create: services.map(s => ({
                        serviceId: s.id,
                        quantity: 1,
                        unitPrice: s.price,
                        totalPrice: s.price,
                    }))
                }
            }
        });

        revalidatePath("/admin/appointments");
        return { success: true, appointment };
    } catch (error: any) {
        console.error("Error creating admin appointment:", error);
        return { success: false, error: error.message };
    }
}

export async function getAppointments(date: Date) {
    try {
        const ownerId = await getEffectiveOwnerId();
        
        // Usar UTC day boundaries para o filtro
        const start = new Date(date);
        start.setUTCHours(0,0,0,0);
        const end = new Date(date);
        end.setUTCHours(23,59,59,999);

        const appointments = await prisma.appointment.findMany({
            where: {
                store: { ownerId },
                scheduledAt: {
                    gte: start,
                    lte: end,
                }
            },
            include: {
                client: { 
                    select: { 
                        id: true, 
                        name: true, 
                        phone: true, 
                        isDefaulter: true,
                        subscription: { select: { status: true } }
                    } 
                },
                staff: { select: { id: true, name: true, avatarUrl: true } },
                items: {
                    include: {
                        service: { select: { name: true, price: true, durationMinutes: true } }
                    }
                }
            },
            orderBy: { scheduledAt: 'asc' }
        });

        return appointments;
    } catch (error) {
        console.error("Error fetching appointments:", error);
        return [];
    }
}

export async function updateAppointmentStatus(id: string, status: string) {
    try {
        await prisma.appointment.update({
            where: { id },
            data: { status: status as any }
        });
        revalidatePath("/admin/appointments");
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

export async function deleteAppointment(id: string) {
    try {
        await prisma.appointment.delete({ where: { id } });
        revalidatePath("/admin/appointments");
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}
