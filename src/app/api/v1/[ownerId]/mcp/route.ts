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

        return apiResponse({
            status: "online",
            server: "ChatBarber MCP Server",
            version: "1.0.0",
            capabilities: {
                tools: [
                    "list_clients",
                    "list_appointments",
                    "create_appointment",
                    "list_services",
                    "list_staff"
                ],
                resources: true
            },
            owner: owner.name
        });
    } catch (error: any) {
        return apiError(error.message);
    }
}

// MCP usually uses POST for tool execution
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
        // Here you would implement the logic to handle MCP JSON-RPC calls
        // For now, return a generic placeholder that shows the endpoint is working
        
        return apiResponse({
            jsonrpc: "2.0",
            id: body.id,
            result: "MCP Tool execution placeholder. Use specific endpoints for direct data access."
        });
    } catch (error: any) {
        return apiError(error.message);
    }
}
