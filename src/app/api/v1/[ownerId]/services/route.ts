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
