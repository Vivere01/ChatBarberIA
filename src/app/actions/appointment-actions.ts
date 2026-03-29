"use server";

import { prisma } from "@/lib/db";
import { getEffectiveStoreId, getEffectiveOwnerId } from "./shared";
import { revalidatePath } from "next/cache";
import { startOfDay, endOfDay } from "date-fns";

// ─── CLIENT PORTAL ACTIONS (RESTAURADAS) ───────────────────────────

export async function getClientAppointments(storeId: string) {
    try {
        const { getAuthSession } = await import("@/lib/auth");
        const session = await getAuthSession();
        if (!session?.user || (session.user as any).role !== "CLIENT") return [];
        const clientId = (session.user as any).id;
        return await prisma.appointment.findMany({
            where: { clientId, storeId },
            include: {
                staff: { select: { name: true, avatarUrl: true } },
                items: { include: { service: { select: { name: true, price: true } } } }
            },
            orderBy: { scheduledAt: 'desc' }
        });
    } catch (error) {
        console.error("Error fetching client appointments:", error);
        return [];
    }
}

export async function createAppointment(data: {
    storeId: string;
    staffId: string;
    serviceId: string;
    scheduledAt: Date;
}) {
    try {
        const { getAuthSession } = await import("@/lib/auth");
        const session = await getAuthSession();
        if (!session?.user || (session.user as any).role !== "CLIENT") {
            return { error: "Você precisa estar logado como cliente." };
        }
        const clientId = (session.user as any).id;

        const service = await prisma.service.findUnique({ where: { id: data.serviceId } });
        if (!service) return { error: "Serviço não encontrado." };

        const appointment = await prisma.appointment.create({
            data: {
                storeId: data.storeId,
                clientId,
                staffId: data.staffId,
                scheduledAt: data.scheduledAt,
                durationMinutes: service.durationMinutes,
                totalAmount: service.price,
                status: "SCHEDULED",
                items: {
                    create: [{
                        serviceId: service.id,
                        quantity: 1,
                        unitPrice: service.price,
                        totalPrice: service.price,
                    }]
                }
            }
        });

        revalidatePath("/booking/[storeId]/agendamentos", "page");
        return { success: true, appointment };
    } catch (error: any) {
        console.error("Error creating appointment:", error);
        return { error: "Erro ao realizar agendamento." };
    }
}

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

        const [hours, minutes] = data.time.split(':').map(Number);
        const baseDate = new Date(data.date);
        
        // Mantendo o Timezone Shield
        const scheduledAt = new Date(Date.UTC(
            baseDate.getUTCFullYear(),
            baseDate.getUTCMonth(),
            baseDate.getUTCDate(),
            hours, 
            minutes,
            0, 0
        ));

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
                scheduledAt,
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
