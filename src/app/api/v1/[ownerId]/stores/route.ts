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
            include: { businessHours: true },
            orderBy: { name: 'asc' }
        });

        return apiResponse({
            count: stores.length,
            stores: stores.map(s => ({
                id: s.id,
                name: s.name,
                slug: s.slug,
                address: s.address,
                phone: s.phone,
                isActive: s.isActive,
                businessHours: s.businessHours.map(bh => ({
                    dayOfWeek: bh.dayOfWeek,
                    isOpen: bh.isOpen,
                    openTime: bh.openTime,
                    closeTime: bh.closeTime,
                    breakStart: bh.breakStart,
                    breakEnd: bh.breakEnd
                }))
            }))
        });
    } catch (error: any) {
        return apiError(error.message);
    }
}
