import { prisma } from "@/lib/db";
import { authenticateApiRequest, apiResponse, apiError } from "@/lib/api-auth";
import { NextRequest } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: { ownerId: string } }
) {
    try {
        const owner = await authenticateApiRequest(req, params.ownerId);

        // Buscamos todos os clientes do owner. 
        // A IA cuidará de filtrar por telefone ou nome de forma inteligente (fuzzy search)
        // para evitar problemas com formatações tipo (22) 99999-9999.
        const clients = await prisma.client.findMany({
            where: { ownerId: owner.id },
            include: {
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
                    startDate: c.subscription.startDate,
                    endDate: c.subscription.endDate,
                    plan: c.subscription.planId
                } : null
            }))
        });
    } catch (error: any) {
        console.error("GET_CLIENTS_ERROR:", error);
        return apiError(error.message || "Internal Server Error", 500);
    }
}
