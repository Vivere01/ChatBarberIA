import { prisma } from "@/lib/db";
import { authenticateApiRequest, apiResponse, apiError } from "@/lib/api-auth";
import { NextRequest } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: { ownerId: string } }
) {
    try {
        const owner = await authenticateApiRequest(req, params.ownerId);

        const stores = await prisma.store.findMany({
            where: { ownerId: owner.id },
            orderBy: { name: 'asc' }
        });

        return apiResponse({
            count: stores.length,
            stores: stores.map(s => ({
                id: s.id,
                name: s.name,
                address: s.address,
                phone: s.phone,
                isActive: true // Como o modelo Store não tem isActive no schema padrão, assumimos true
            }))
        });
    } catch (error: any) {
        return apiError(error.message);
    }
}
