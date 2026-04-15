import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";

/**
 * Authenticates an API request using the Bearer token (API Key).
 * Returns the owner object if valid, otherwise throws an error.
 */
export async function authenticateApiRequest(req: NextRequest) {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new Error("Missing or invalid Authorization header. Use Bearer <api_key>");
    }

    const apiKey = authHeader.replace("Bearer ", "");

    if (!apiKey) {
        throw new Error("API Key is missing from the Bearer token.");
    }

    const owner = await prisma.owner.findUnique({
        where: { apiKey },
        select: {
            id: true,
            name: true,
            email: true,
        }
    });

    if (!owner) {
        throw new Error("Invalid API Key.");
    }

    return owner;
}

export function apiResponse(data: any, status: number = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json",
        },
    });
}

export function apiError(message: string, status: number = 401) {
    return apiResponse({ error: message }, status);
}
