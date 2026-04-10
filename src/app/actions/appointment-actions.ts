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
    serviceIds: string[]; // Upgrade to support combos/multiple services
    scheduledAt: Date;
}) {
    try {
        const { getAuthSession } = await import("@/lib/auth");
        const session = await getAuthSession();
        if (!session?.user || (session.user as any).role !== "CLIENT") {
            return { error: "Você precisa estar logado como cliente." };
        }
        const clientId = (session.user as any).id;

        // --- CHECK SIMULTANEOUS APPOINTMENT LIMIT ---
        // Get client with their active subscription and its plan
        const client = await prisma.client.findUnique({
            where: { id: clientId },
            include: { subscription: { include: { plan: true } } }
        });

        if (!client) return { error: "Cliente não encontrado." };

        // Default limit for guest/walk-in is 1, otherwise use the plan's limit
        const limit = client.subscription?.status === "ACTIVE" 
            ? (client.subscription.plan.maxSimultaneousAppointments || 1) 
            : 1;

        // Count active appointments (not cancelled, not completed)
        // const activeAppointmentsCount = await prisma.appointment.count({
        //     where: {
        //         clientId,
        //         storeId: data.storeId,
        //         status: { in: ["SCHEDULED", "CONFIRMED", "IN_PROGRESS"] }
        //     }
        // });

        // Count active waitlist entries as well
        // const activeWaitlistCount = await prisma.waitlistEntry.count({
        //     where: {
        //         clientId,
        //         storeId: data.storeId,
        //         status: "PENDING"
        //     }
        // });

        // if ((activeAppointmentsCount + activeWaitlistCount) >= limit) {
        //     return { error: `Você já possui ${limit} agendamento(s) pendente(s). Conclua ou cancele o atual para agendar novamente.` };
        // }
        // ---------------------------------------------

        const services = await prisma.service.findMany({
            where: { id: { in: data.serviceIds } }
        });

        if (services.length === 0) return { error: "Nenhum serviço selecionado." };

        const totalDuration = services.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
        const totalAmount = services.reduce((acc, s) => acc + s.price, 0);

        // Garantir que a data seja salva em UTC para evitar drift de fuso horário
        const baseDate = new Date(data.scheduledAt);
        const scheduledAtUTC = new Date(Date.UTC(
            baseDate.getFullYear(),
            baseDate.getMonth(),
            baseDate.getDate(),
            baseDate.getHours(),
            baseDate.getMinutes(),
            0, 0
        ));

        const appointment = await prisma.appointment.create({
            data: {
                storeId: data.storeId,
                clientId,
                staffId: data.staffId,
                scheduledAt: scheduledAtUTC,
                durationMinutes: totalDuration,
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

        revalidatePath("/booking/[storeId]/agendamentos", "page");
        revalidatePath("/admin/appointments");

        return { success: true, appointment };
    } catch (error: any) {
        console.error("Error creating appointment:", error);
        return { error: "Erro ao realizar agendamento." };
    }
}

export async function cancelClientAppointment(appointmentId: string) {
    try {
        const { getAuthSession } = await import("@/lib/auth");
        const session = await getAuthSession();
        if (!session?.user || (session.user as any).role !== "CLIENT") {
            return { error: "Acesso negado." };
        }
        const clientId = (session.user as any).id;

        // Verificar se o agendamento pertence a este cliente antes de cancelar
        const apt = await prisma.appointment.findUnique({
            where: { id: appointmentId }
        });

        if (!apt || apt.clientId !== clientId) {
            return { error: "Agendamento não encontrado ou permissão negada." };
        }

        await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status: "CANCELLED" }
        });

        revalidatePath("/booking/[storeId]/agendamentos", "page");
        revalidatePath("/admin/appointments");
        return { success: true };
    } catch (error) {
        console.error("Error cancelling appointment:", error);
        return { error: "Erro ao cancelar agendamento." };
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
        const staff = await prisma.staff.findUnique({ where: { id: data.staffId } });
        if (!staff) throw new Error("Profissional não encontrado.");
        const storeId = staff.storeId;

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

        const client = await prisma.client.findUnique({ where: { id: data.clientId } });
        if (!client) return { success: false, error: "Cliente selecionado não foi encontrado no banco de dados." };

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

export async function getAppointments(date: Date, filterStoreId?: string) {
    try {
        const ownerId = await getEffectiveOwnerId();

        const start = new Date(date);
        start.setUTCHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setUTCHours(23, 59, 59, 999);

        const appointments = await prisma.appointment.findMany({
            where: {
                store: { ownerId },
                ...(filterStoreId && filterStoreId !== 'all' && { storeId: filterStoreId }),
                scheduledAt: {
                    gte: start,
                    lte: end,
                },
                status: { not: 'CANCELLED' }
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

        const result = appointments.map((apt: any) => ({
            ...apt,
            durationMinutes: apt.items.reduce((acc: number, item: any) => acc + (item.service?.durationMinutes || 0), 0)
        }));

        return result;
    } catch (error) {
        console.error("Error fetching appointments:", error);
        return [];
    }
}

export async function updateAppointmentStatus(id: string, status: string) {
    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            select: { status: true }
        });

        const isCompleting = status === "COMPLETED" && appointment?.status !== "COMPLETED";

        await prisma.appointment.update({
            where: { id },
            data: { status: status as any }
        });

        if (isCompleting) {
            try {
                await handleAppointmentCompletion(id);
            } catch (error) {
                console.error("Side effects (cashier/commission) failed but continuing status update:", error);
            }
        }

        revalidatePath("/admin/appointments");
        revalidatePath("/admin/cashier");
        revalidatePath("/admin/commissions");
        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error updating appointment status:", error);
        return { success: false, error: (error as Error).message };
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

export async function getClientHistory(clientId: string) {
    try {
        const history = await prisma.appointment.findMany({
            where: { clientId, status: 'COMPLETED' },
            take: 5,
            orderBy: { scheduledAt: 'desc' },
            include: {
                staff: { select: { name: true } },
                items: { include: { service: { select: { name: true } } } }
            }
        });
        return history;
    } catch (error) {
        return [];
    }
}

export async function updateAdminAppointment(id: string, data: {
    staffId?: string;
    scheduledAt?: Date;
    time?: string;
    date?: Date;
    serviceIds?: string[];
    status?: string;
}) {
    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            select: { status: true }
        });

        const updateData: any = {};
        if (data.status) updateData.status = data.status;
        if (data.staffId) updateData.staffId = data.staffId;
        if (data.scheduledAt) updateData.scheduledAt = data.scheduledAt;

        if (data.time && data.date) {
            const [hours, minutes] = data.time.split(':').map(Number);
            const baseDate = new Date(data.date);
            updateData.scheduledAt = new Date(Date.UTC(
                baseDate.getUTCFullYear(),
                baseDate.getUTCMonth(),
                baseDate.getUTCDate(),
                hours,
                minutes,
                0, 0
            ));
        }

        await prisma.appointment.update({
            where: { id },
            data: updateData
        });

        if (data.status === "COMPLETED" && appointment?.status !== "COMPLETED") {
            try {
                await handleAppointmentCompletion(id);
            } catch (error) {
                console.error("Side effects (cashier/commission) failed but continuing status update:", error);
            }
        }

        revalidatePath("/admin/appointments");
        revalidatePath("/admin/cashier");
        revalidatePath("/admin/commissions");
        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error updating admin appointment:", error);
        return { success: false, error: (error as Error).message };
    }
}

async function handleAppointmentCompletion(appointmentId: string) {
    console.log(`[handleAppointmentCompletion] Starting for ID: ${appointmentId}`);
    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: { client: true, staff: true }
        });

        if (!appointment) {
            console.warn(`[handleAppointmentCompletion] Appointment ${appointmentId} not found`);
            return;
        }

        const totalAmount = appointment.totalAmount || 0;
        const commissionPercent = appointment.staff?.commissionPercent || 0;

        // Se é cliente avulso, registra entrada no caixa
        if (appointment.client?.clientType !== "SUBSCRIBER") {
            console.log(`[handleAppointmentCompletion] Creating CashEntry for walk-in client`);
            await prisma.cashEntry.create({
                data: {
                    storeId: appointment.storeId,
                    type: "INCOME",
                    amount: totalAmount,
                    description: `Agendamento finalizado - Cliente: ${appointment.client?.name || 'Sem nome'}`,
                    paymentMethod: "CASH",
                    entryDate: new Date(),
                }
            });
        }

        // Calcula e gera comissão (para assinantes e avulsos)
        const commissionAmount = (totalAmount * commissionPercent) / 100;
        console.log(`[handleAppointmentCompletion] Upserting commission: ${commissionAmount}`);
        
        await prisma.commission.upsert({
            where: { appointmentId: appointment.id },
            update: {
                grossAmount: totalAmount,
                commissionRate: commissionPercent,
                commissionAmount: commissionAmount,
            },
            create: {
                staffId: appointment.staffId,
                appointmentId: appointment.id,
                grossAmount: totalAmount,
                commissionRate: commissionPercent,
                commissionAmount: commissionAmount,
                status: "PENDING",
            }
        });
        
        console.log(`[handleAppointmentCompletion] Successfully processed all side effects`);
    } catch (error) {
        console.error(`[handleAppointmentCompletion] FATAL ERROR for appointment ${appointmentId}:`, error);
        throw error; // Re-throw to be caught by the parent action
    }
}
