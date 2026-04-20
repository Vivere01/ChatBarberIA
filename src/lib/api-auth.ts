import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";

/**
 * Authenticates an API request using the Bearer token (API Key).
 * Also verifies if the token belongs to the owner identified by 'requestedIdentifier' (ID or Slug).
 */
export async function authenticateApiRequest(req: NextRequest, requestedIdentifier?: string) {
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
            slug: true,
        }
    });

    if (!owner) {
        throw new Error("Invalid API Key.");
    }

    // If an identifier is provided in the URL, verify it matches the owner (by ID or Slug)
    if (requestedIdentifier) {
        const matchesId = owner.id === requestedIdentifier;
        const matchesSlug = owner.slug && owner.slug === requestedIdentifier;

        if (!matchesId && !matchesSlug) {
            throw new Error("Unauthorized: The provided API key does not correspond to the requested owner ID or slug.");
        }
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
