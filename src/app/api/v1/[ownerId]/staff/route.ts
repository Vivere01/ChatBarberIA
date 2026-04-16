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

        const staff = await prisma.staff.findMany({
            where: {
                store: {
                    ownerId: owner.id
                },
                isActive: true
            },
            include: {
                store: { select: { id: true, name: true } },
                staffServices: {
                    include: { service: { select: { name: true } } }
                }
            },
            orderBy: { name: 'asc' }
        });

        return apiResponse({
            count: staff.length,
            staff: staff.map(s => ({
                id: s.id,
                storeId: s.storeId,
                storeName: s.store.name,
                name: s.name,
                role: s.role,
                avatarUrl: s.avatarUrl,
                services: s.staffServices.map(ss => ss.service.name)
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
        const { name, storeId, role, avatarUrl } = body;

        if (!name || !storeId) {
            return apiError("Missing required fields: name, storeId", 400);
        }

        const staff = await prisma.staff.create({
            data: {
                name,
                storeId,
                role: role || 'BARBEIRO',
                avatarUrl,
                isActive: true
            }
        });

        return apiResponse({
            success: true,
            staff: {
                id: staff.id,
                name: staff.name,
                role: staff.role
            }
        }, 201);
    } catch (error: any) {
        return apiError(error.message, 500);
    }
}

