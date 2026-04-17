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

// MCP uses POST for tool discovery and execution
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
        const { method, params: rpcParams, id } = body;

        let result: any = null;

        switch (method) {
            case "mcp.list_tools":
                result = {
                    tools: [
                        {
                            name: "get_system_context",
                            description: "Retorna a estrutura completa de unidades, serviços e barbeiros.",
                            inputSchema: { type: "object", properties: {} }
                        },
                        {
                            name: "search_clients",
                            description: "Busca clientes por nome ou telefone.",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    query: { type: "string", description: "Nome ou telefone do cliente" }
                                },
                                required: ["query"]
                            }
                        },
                        {
                            name: "get_dashboard_stats",
                            description: "Retorna estatísticas rápidas do dashboard (clientes e agendamentos).",
                            inputSchema: { type: "object", properties: {} }
                        }
                    ]
                };
                break;

            case "mcp.call_tool":
                const { name, arguments: args } = rpcParams;
                
                if (name === "get_system_context") {
                    const [stores, services, staff] = await Promise.all([
                        prisma.store.findMany({ where: { ownerId: owner.id }, select: { id: true, name: true } }),
                        prisma.service.findMany({ where: { store: { ownerId: owner.id } }, select: { id: true, name: true, price: true, storeId: true } }),
                        prisma.staff.findMany({ where: { store: { ownerId: owner.id } }, select: { id: true, name: true, storeId: true } })
                    ]);
                    result = {
                        content: [{
                            type: "text",
                            text: JSON.stringify({ stores, services, staff })
                        }]
                    };
                } 
                else if (name === "search_clients") {
                    const clients = await prisma.client.findMany({
                        where: {
                            ownerId: owner.id,
                            OR: [
                                { name: { contains: args.query, mode: 'insensitive' } },
                                { phone: { contains: args.query } }
                            ]
                        },
                        take: 5
                    });
                    result = {
                        content: [{
                            type: "text",
                            text: JSON.stringify(clients)
                        }]
                    };
                }
                else if (name === "get_dashboard_stats") {
                    const [clientCount, appointmentCount] = await Promise.all([
                        prisma.client.count({ where: { ownerId: owner.id } }),
                        prisma.appointment.count({ where: { store: { ownerId: owner.id } } })
                    ]);
                    result = {
                        content: [{
                            type: "text",
                            text: JSON.stringify({ totalClientes: clientCount, totalAgendamentos: appointmentCount })
                        }]
                    };
                } else {
                    return apiError(`Ferramenta '${name}' não encontrada.`, 404);
                }
                break;

            default:
                // Se não for MCP puro, podemos aceitar outros métodos ou retornar erro
                return apiError(`Método '${method}' não suportado pelo servidor MCP ChatBarber.`, 400);
        }

        return apiResponse({
            jsonrpc: "2.0",
            id,
            result
        });
    } catch (error: any) {
        console.error("[MCP_POST_ERROR]", error);
        return apiError(error.message, 500);
    }
}
