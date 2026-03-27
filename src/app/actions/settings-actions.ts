"use server";

import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getGatewaySettings() {
    try {
        const session = await getAuthSession();
        if (!session?.user || (session.user as any).role !== 'OWNER') {
            return { error: "Não autorizado." };
        }

        const owner = await prisma.owner.findUnique({
            where: { id: (session.user as any).id },
            select: {
                celcashToken: true,
                celcashPublicToken: true
            }
        });

        return { success: true, settings: owner };
    } catch (err) {
        console.error("Action Error [getGatewaySettings]:", err);
        return { error: "Erro ao buscar configurações." };
    }
}

export async function updateGatewaySettings(data: {
    celcashToken: string;
    celcashPublicToken: string;
}) {
    try {
        const session = await getAuthSession();
        if (!session?.user || (session.user as any).role !== 'OWNER') {
            return { error: "Não autorizado." };
        }

        await prisma.owner.update({
            where: { id: (session.user as any).id },
            data: {
                celcashToken: data.celcashToken,
                celcashPublicToken: data.celcashPublicToken
            }
        });

        revalidatePath("/admin/settings");
        return { success: true };
    } catch (err) {
        console.error("Action Error [updateGatewaySettings]:", err);
        return { error: "Erro ao salvar configurações." };
    }
}
