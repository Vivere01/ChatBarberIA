"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
    name: z.string().min(2, "Nome muito curto"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    phone: z.string().optional(),
    storeName: z.string().min(2, "Nome da barbearia muito curto"),
});

export async function registerOwner(data: z.infer<typeof registerSchema>) {
    try {
        const validated = registerSchema.parse(data);

        // Check if user already exists
        const existing = await prisma.owner.findUnique({
            where: { email: validated.email }
        });

        if (existing) {
            return { error: "Este email já está cadastrado." };
        }

        const passwordHash = await bcrypt.hash(validated.password, 10);

        // Create owner and store in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const owner = await tx.owner.create({
                data: {
                    name: validated.name,
                    email: validated.email,
                    passwordHash,
                    phone: validated.phone,
                }
            });

            const store = await tx.store.create({
                data: {
                    ownerId: owner.id,
                    name: validated.storeName,
                    slug: validated.storeName.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, ""),
                }
            });

            return { owner, store };
        });

        return { success: true, ownerId: result.owner.id };
    } catch (e: any) {
        console.error("Registration error:", e);
        if (e instanceof z.ZodError) {
            return { error: e.issues[0].message };
        }
        return { error: "Ocorreu um erro ao criar sua conta." };
    }
}
