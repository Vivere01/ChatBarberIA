import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    session: { strategy: "jwt" },
    pages: {
        signIn: "/login",
    },
    providers: [
        CredentialsProvider({
            id: "owner-login",
            name: "Owner",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Senha", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                // Acesso rápido para desenvolvimento/homologação
                if (credentials.email === "admin@gmail.com" && credentials.password === "admin") {
                    const existingOwner = await prisma.owner.findUnique({ where: { email: "admin@gmail.com" } });
                    return {
                        id: existingOwner?.id || "admin-dev-id",
                        email: "admin@gmail.com",
                        name: "Administrador ChatBarber",
                        role: "OWNER",
                    };
                }

                const owner = await prisma.owner.findUnique({
                    where: { email: credentials.email },
                });
                if (!owner || !owner.isActive) return null;
                const isValid = await bcrypt.compare(credentials.password, owner.passwordHash);
                if (!isValid) return null;
                return {
                    id: owner.id,
                    email: owner.email,
                    name: owner.name,
                    role: owner.role,
                    image: owner.avatarUrl,
                };
            },
        }),
        CredentialsProvider({
            id: "staff-login",
            name: "Staff",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Senha", type: "password" },
                storeId: { label: "Loja", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;
                const staff = await prisma.staff.findFirst({
                    where: { email: credentials.email, isActive: true },
                });
                if (!staff || !staff.passwordHash) return null;
                const isValid = await bcrypt.compare(credentials.password, staff.passwordHash);
                if (!isValid) return null;
                return {
                    id: staff.id,
                    email: staff.email ?? "",
                    name: staff.name,
                    role: staff.role,
                    storeId: staff.storeId,
                    image: staff.avatarUrl,
                };
            },
        }),
        CredentialsProvider({
            id: "client-login",
            name: "Client",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Senha", type: "password" },
                ownerId: { label: "Owner", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password || !credentials?.ownerId) return null;
                const client = await prisma.client.findFirst({
                    where: { 
                        email: credentials.email, 
                        ownerId: credentials.ownerId,
                        isActive: true 
                    },
                });
                if (!client || !client.passwordHash) return null;
                const isValid = await bcrypt.compare(credentials.password, client.passwordHash);
                if (!isValid) return null;
                return {
                    id: client.id,
                    email: client.email ?? "",
                    name: client.name,
                    role: "CLIENT",
                    ownerId: client.ownerId,
                    image: client.avatarUrl,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.storeId = (user as any).storeId;
                token.ownerId = (user as any).ownerId;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.sub;
                (session.user as any).role = token.role;
                (session.user as any).storeId = token.storeId;
                (session.user as any).ownerId = token.ownerId;
            }
            return session;
        },
    },
};
import { getServerSession } from "next-auth";

export const getAuthSession = () => getServerSession(authOptions);
