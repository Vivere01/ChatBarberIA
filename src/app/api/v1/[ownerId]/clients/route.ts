import { prisma } from "@/lib/db";
import { authenticateApiRequest, apiResponse, apiError } from "@/lib/api-auth";
import { NextRequest } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: { ownerId: string } }
) {
    try {
        const owner = await authenticateApiRequest(req);

        // Security check: Ensure the token belongs to the ownerId in the URL
        if (owner.id !== params.ownerId) {
            return apiError("Unauthorized: Token does not match the requested owner ID.", 403);
        }

        const clients = await prisma.client.findMany({
            where: { ownerId: owner.id },
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
                createdAt: c.createdAt,
            }))
        });
    } catch (error: any) {
        return apiError(error.message);
    }
}
