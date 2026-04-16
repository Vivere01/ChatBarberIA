import { prisma } from "@/lib/db";
import { authenticateApiRequest, apiResponse, apiError } from "@/lib/api-auth";
import { NextRequest } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: { ownerId: string } }
) {
    try {
        const owner = await authenticateApiRequest(req);

        if (owner.id !== params.ownerId) {
            return apiError("Unauthorized: Token does not match the requested owner ID.", 403);
        }

        const services = await prisma.service.findMany({
            where: {
                store: {
                    ownerId: owner.id
                },
                isActive: true
            },
            include: {
                store: { select: { id: true, name: true } }
            },
            orderBy: { name: 'asc' }
        });

        return apiResponse({
            count: services.length,
            services: services.map(s => ({
                id: s.id,
                storeId: s.storeId,
                storeName: s.store.name,
                name: s.name,
                description: s.description,
                price: s.price,
                durationMinutes: s.durationMinutes,
                category: s.category
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
        const owner = await authenticateApiRequest(req);

        if (owner.id !== params.ownerId) {
            return apiError("Unauthorized: Token does not match the requested owner ID.", 403);
        }

        const body = await req.json();
        const { name, storeId, price, durationMinutes, category, description } = body;

        if (!name || !storeId || price === undefined || !durationMinutes) {
            return apiError("Missing required fields: name, storeId, price, durationMinutes", 400);
        }

        const service = await prisma.service.create({
            data: {
                name,
                storeId,
                price: Number(price),
                durationMinutes: Number(durationMinutes),
                category: category || 'OUTROS',
                description,
                isActive: true
            }
        });

        return apiResponse({
            success: true,
            service: {
                id: service.id,
                name: service.name,
                price: service.price,
                durationMinutes: service.durationMinutes
            }
        }, 201);
    } catch (error: any) {
        return apiError(error.message, 500);
    }
}

