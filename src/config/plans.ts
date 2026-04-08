export type PlanFeature = 
    | "STORES_LIMIT" 
    | "CLIENTS_LIMIT" 
    | "GAMIFICATION" 
    | "INDICA_AI" 
    | "ADVANCED_REPORTS" 
    | "AI_WHATSAPP" 
    | "PUBLIC_API" 
    | "MCP_SERVER";

export interface PlanConfig {
    name: string;
    priceId: string;
    limits: {
        stores: number; // -1 for unlimited
        clients: number; // -1 for unlimited
    };
    features: PlanFeature[];
}

export const PLANS: Record<string, PlanConfig> = {
    STARTER: {
        name: "Starter",
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || "price_1TISwOF9fVZA3i56pwHbDjW9",
        limits: {
            stores: 1,
            clients: 200,
        },
        features: [],
    },
    PRO: {
        name: "Pro",
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || "price_1TISxDF9fVZA3i56U6ZPO5aW",
        limits: {
            stores: 3,
            clients: -1,
        },
        features: ["GAMIFICATION", "INDICA_AI", "ADVANCED_REPORTS"],
    },
    ENTERPRISE: {
        name: "Enterprise",
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE || "price_1TISxDF9fVZA3i56w5OzipDP",
        limits: {
            stores: -1,
            clients: -1,
        },
        features: ["GAMIFICATION", "INDICA_AI", "ADVANCED_REPORTS", "AI_WHATSAPP", "PUBLIC_API", "MCP_SERVER"],
    },
};

export function getPlanByPriceId(priceId: string): PlanConfig | null {
    return Object.values(PLANS).find(p => p.priceId === priceId) || null;
}
