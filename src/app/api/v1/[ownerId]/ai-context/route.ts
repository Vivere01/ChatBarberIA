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

        const aiContext = await prisma.aiContext.findUnique({
            where: { ownerId: owner.id }
        });

        if (!aiContext) {
            return apiError("AI Context not found for this owner.", 404);
        }

        return apiResponse({
            id: aiContext.id,
            systemPrompt: aiContext.systemPrompt,
            trainingData: aiContext.trainingData,
            lastSyncedAt: aiContext.lastSyncedAt,
            hasWhatsapp: !!aiContext.whatsappToken,
        });
    } catch (error: any) {
        return apiError(error.message);
    }
}
