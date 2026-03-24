import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getEffectiveStoreId() {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Não autorizado");

    const userEmail = session.user.email;
    const userId = (session.user as any).id;

    let owner = await prisma.owner.findUnique({
        where: { email: userEmail! }
    });

    if (!owner) {
        owner = await prisma.owner.create({
            data: {
                id: userId === "admin-dev-id" ? `dev-owner-${Date.now()}` : userId,
                email: userEmail!,
                name: (session.user as any).name || "Admin",
                passwordHash: "not-needed-for-dev",
                role: "OWNER",
            }
        });
    }

    let store = await prisma.store.findFirst({
        where: { ownerId: owner.id }
    });

    if (!store) {
        store = await prisma.store.create({
            data: {
                ownerId: owner.id,
                name: "Minha Barbearia",
                slug: `barbearia-${owner.id.slice(-4)}`,
            }
        });
    }

    return store.id;
}

export async function getEffectiveOwnerId() {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Não autorizado");

    const userEmail = session.user.email;

    let owner = await prisma.owner.findUnique({
        where: { email: userEmail! }
    });

    if (!owner) {
        owner = await prisma.owner.create({
            data: {
                id: (session.user as any).id === "admin-dev-id" ? `dev-owner-${Date.now()}` : (session.user as any).id,
                email: userEmail!,
                name: (session.user as any).name || "Admin",
                passwordHash: "not-needed-for-dev",
                role: "OWNER",
            }
        });
    }

    return owner.id;
}
