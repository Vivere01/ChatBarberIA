"use server";

import { prisma } from "@/lib/db";
import { getEffectiveStoreId, getEffectiveOwnerId } from "./shared";
import { revalidatePath } from "next/cache";
import { startOfDay, endOfDay } from "date-fns";

// ─── CLIENT PORTAL ACTIONS ───────────────────────────────────────

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

export async function createAdminAppointment(data: {
    clientId: string;
    staffId: string;
    serviceId: string;
    time: string;
    date: Date;
}) {
    try {
        const ownerId = await getEffectiveOwnerId();
        const storeId = await getEffectiveStoreId();

        // Build scheduledAt from date + time string
        const [hours, minutes] = data.time.split(':').map(Number);
        const scheduledAt = new Date(data.date);
        scheduledAt.setHours(hours, minutes, 0, 0);

        // Fetch service for price & duration
        const service = data.serviceId
            ? await prisma.service.findUnique({ where: { id: data.serviceId } })
            : null;

        const appointment = await prisma.appointment.create({
            data: {
                storeId,
                clientId: data.clientId,
                staffId: data.staffId,
                scheduledAt,
                durationMinutes: service?.durationMinutes ?? 30,
                totalAmount: service?.price ?? 0,
                status: "SCHEDULED",
                ...(service ? {
                    items: {
                        create: [{
                            serviceId: service.id,
                            quantity: 1,
                            unitPrice: service.price,
                            totalPrice: service.price,
                        }]
                    }
                } : {})
            }
        });

        revalidatePath("/admin/appointments");
        return { success: true, appointment };
    } catch (error: any) {
        console.error("Error creating admin appointment:", error);
        return { success: false, error: error.message };
    }
}

export async function createAppointment(data: {
    storeId: string;
    staffId: string;
    scheduledAt: Date;
    serviceIds: string[];
}) {
    try {
        const { getAuthSession } = await import("@/lib/auth");
        const session = await getAuthSession();
        if (!session?.user || (session.user as any).role !== "CLIENT") {
             throw new Error("Apenas clientes logados podem agendar.");
        }
        const clientId = (session.user as any).id;

        // Fetch services to calculate total
        const services = await prisma.service.findMany({
            where: { id: { in: data.serviceIds } }
        });

        const totalAmount = services.reduce((sum, s) => sum + s.price, 0);
        const totalDuration = services.reduce((sum, s) => sum + s.durationMinutes, 0);

        const appointment = await prisma.appointment.create({
            data: {
                storeId: data.storeId,
                clientId,
                staffId: data.staffId,
                scheduledAt: data.scheduledAt,
                durationMinutes: totalDuration,
                totalAmount,
                status: "SCHEDULED",
                items: {
                    create: services.map(s => ({
                        serviceId: s.id,
                        quantity: 1,
                        unitPrice: s.price,
                        totalPrice: s.price
                    }))
                }
            }
        });

        revalidatePath("/admin/appointments");
        return { success: true, appointment };
    } catch (error: any) {
        console.error("Error creating client appointment:", error);
        return { success: false, error: error.message };
    }
}

export async function getAppointments(date: Date) {
    try {
        const ownerId = await getEffectiveOwnerId();

        const appointments = await prisma.appointment.findMany({
            where: {
                store: { ownerId },
                scheduledAt: {
                    gte: startOfDay(date),
                    lte: endOfDay(date),
                }
            },
            include: {
                client: { select: { id: true, name: true, phone: true } },
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
    } catch (error: any) {
        console.error("Error fetching appointments:", error);
        return [];
    }
}

export async function updateAppointmentStatus(id: string, status: string) {
    try {
        const ownerId = await getEffectiveOwnerId();
        const appointment = await prisma.appointment.update({
            where: { id },
            data: {
                status: status as any,
                ...(status === 'COMPLETED' ? { completedAt: new Date() } : {}),
                ...(status === 'CANCELLED' ? { cancelledAt: new Date() } : {}),
            }
        });
        revalidatePath("/admin/appointments");
        return { success: true, appointment };
    } catch (error: any) {
        console.error("Error updating appointment status:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteAppointment(id: string) {
    try {
        await prisma.appointment.delete({ where: { id } });
        revalidatePath("/admin/appointments");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting appointment:", error);
        return { success: false, error: error.message };
    }
}
