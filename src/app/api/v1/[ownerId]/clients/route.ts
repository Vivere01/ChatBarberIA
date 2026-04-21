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
        const phone = searchParams.get("phone");

        const clients = await prisma.client.findMany({
            where: { 
                ownerId: owner.id,
                ...(phone ? { phone: { contains: phone } } : {})
            },
            include: {
                clientStores: true,
                subscription: true,
            },
            orderBy: { name: 'asc' }
        });

        return apiResponse({
            count: clients.length,
            clients: clients.map(c => ({
                id: c.id,
                name: c.name,
                email: c.email,
                phone: c.phone,
                cpf: c.cpf,
                clientType: c.clientType,
                totalSpent: c.totalSpent,
                isDefaulter: c.isDefaulter,
                isActive: c.isActive,
                subscription: c.subscription ? {
                    id: c.subscription.id,
                    status: c.subscription.status,
                    planId: c.subscription.planId
                } : null,
                createdAt: c.createdAt,
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
        const { name, email, phone, cpf } = body;

        if (!name || !phone) {
            return apiError("Missing required fields: name, phone", 400);
        }

        const client = await prisma.client.create({
            data: {
                ownerId: owner.id,
                name,
                email,
                phone,
                cpf,
                clientType: 'WALK_IN',
                isActive: true
            }
        });

        return apiResponse({
            success: true,
            client: {
                id: client.id,
                name: client.name,
                email: client.email,
                phone: client.phone
            }
        }, 201);
    } catch (error: any) {
        if ((error as any).code === 'P2002') {
            return apiError("A client with this email or phone already exists.", 400);
        }
        return apiError(error.message, 500);
    }
}

