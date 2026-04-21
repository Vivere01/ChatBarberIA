import { prisma } from "@/lib/db";
import { authenticateApiRequest, apiResponse, apiError } from "@/lib/api-auth";
import { NextRequest } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: { ownerId: string } }
) {
    try {
        const owner = await authenticateApiRequest(req, params.ownerId);

        if (!owner) {
            return apiError("Unauthorized", 401);
        }

        const plans = await prisma.subscriptionPlan.findMany({
            where: { 
                ownerId: owner.id,
                isActive: true
            },
            include: {
                services: {
                    include: { service: { select: { name: true } } }
                }
            },
            orderBy: { price: 'asc' }
        });

        return apiResponse({
            count: plans.length,
            plans: plans.map(p => ({
                id: p.id,
                name: p.name,
                description: p.description,
                price: p.price,
                periodicity: p.periodicity,
                services: p.services.map(s => ({
                    name: s.service.name,
                    usageLimit: s.usageLimit
                }))
            }))
        });
    } catch (error: any) {
        return apiError(error.message);
    }
}
