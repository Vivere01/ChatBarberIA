import { prisma } from "@/lib/db";
import { authenticateApiRequest, apiResponse, apiError } from "@/lib/api-auth";
import { NextRequest } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: { ownerId: string } }
) {
    try {
        const owner = await authenticateApiRequest(req, params.ownerId);

        const { searchParams } = new URL(req.url);
        const dateParam = searchParams.get("date"); // Expects YYYY-MM-DD

        const where: any = {
            store: {
                ownerId: owner.id
            }
        };

        if (dateParam) {
            const startDate = new Date(dateParam);
            startDate.setUTCHours(0, 0, 0, 0);
            const endDate = new Date(dateParam);
            endDate.setUTCHours(23, 59, 59, 999);

            where.scheduledAt = {
                gte: startDate,
                lte: endDate
            };
        }

        const appointments = await prisma.appointment.findMany({
            where,
            include: {
                client: { select: { name: true, phone: true } },
                staff: { select: { id: true, name: true } },
                store: { select: { id: true, name: true } },
                items: {
                    include: {
                        service: true,
                        product: true
                    }
                }
            },
            orderBy: { scheduledAt: 'asc' },
            take: 200 // Slightly larger limit for busy days
        });

        return apiResponse({
            count: appointments.length,
            appointments: appointments.map(a => ({
                id: a.id,
                storeId: a.storeId,
                store: a.store.name,
                clientId: a.clientId,
                client: a.client.name,
                clientPhone: a.client.phone,
                staffId: a.staffId,
                staff: a.staff.name,
                status: a.status,
                scheduledAt: a.scheduledAt,
                durationMinutes: a.durationMinutes,
                totalAmount: a.totalAmount,
                notes: a.notes,
                items: a.items.map(i => ({
                    type: i.serviceId ? 'service' : 'product',
                    name: i.service?.name || i.product?.name,
                    quantity: i.quantity,
                    price: i.unitPrice
                }))
            }))
        });
    } catch (error: any) {
        return apiError(error.message);
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: { ownerId: string } }
) {
    try {
        const owner = await authenticateApiRequest(req, params.ownerId);

        const body = await req.json();
        const { clientId, staffId, storeId, serviceId, scheduledAt, notes } = body;

        // Validation
        if (!clientId || !staffId || !storeId || !serviceId || !scheduledAt) {
            return apiError("Missing required fields: clientId, staffId, storeId, serviceId, scheduledAt", 400);
        }

        // Get Service for price and duration
        const service = await prisma.service.findFirst({
            where: { id: serviceId, storeId }
        });

        if (!service) {
            return apiError("Service not found in the specified store.", 404);
        }

        // Create appointment
        const appointment = await prisma.appointment.create({
            data: {
                storeId,
                clientId,
                staffId,
                scheduledAt: new Date(scheduledAt),
                durationMinutes: service.durationMinutes,
                totalAmount: service.price,
                notes,
                status: 'SCHEDULED',
                items: {
                    create: {
                        serviceId,
                        quantity: 1,
                        unitPrice: service.price,
                        totalPrice: service.price
                    }
                }
            },
            include: {
                client: true,
                staff: true,
                store: true
            }
        });

        return apiResponse({
            success: true,
            appointment: {
                id: appointment.id,
                client: appointment.client.name,
                staff: appointment.staff.name,
                store: appointment.store.name,
                scheduledAt: appointment.scheduledAt,
                totalAmount: appointment.totalAmount
            }
        }, 201);
    } catch (error: any) {
        return apiError(error.message, 500);
    }
}
