"use server";

import { prisma } from "@/lib/db";
import { getEffectiveStoreId } from "./shared";
import { revalidatePath } from "next/cache";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subDays } from "date-fns";

export type CashEntryFilter = "today" | "yesterday" | "last7" | "thisMonth" | "custom";

export async function getCashEntries(
    filter: CashEntryFilter = "today",
    customRange?: { from: Date; to: Date }
) {
    try {
        const storeId = await getEffectiveStoreId();
        const now = new Date();

        let start: Date;
        let end: Date;

        if (filter === "custom" && customRange) {
            start = startOfDay(customRange.from);
            end = endOfDay(customRange.to);
        } else {
            switch (filter) {
            case "yesterday":
                start = startOfDay(subDays(now, 1));
                end = endOfDay(subDays(now, 1));
                break;
            case "last7":
                start = startOfDay(subDays(now, 6));
                end = endOfDay(now);
                break;
            case "thisMonth":
                start = startOfMonth(now);
                end = endOfMonth(now);
                break;
            case "today":
            default:
                start = startOfDay(now);
                end = endOfDay(now);
                break;
            }
        }

        const entries = await prisma.cashEntry.findMany({
            where: {
                storeId,
                entryDate: { gte: start, lte: end },
            },
            orderBy: { entryDate: "desc" },
        });

        const totalIn = entries
            .filter((e) => e.type === "INCOME")
            .reduce((s, e) => s + e.amount, 0);
        const totalOut = entries
            .filter((e) => e.type === "EXPENSE")
            .reduce((s, e) => s + e.amount, 0);

        return { entries, totalIn, totalOut, balance: totalIn - totalOut };
    } catch (error) {
        console.error("Error fetching cash entries:", error);
        return { entries: [], totalIn: 0, totalOut: 0, balance: 0 };
    }
}

const paymentMethodMap: Record<string, string> = {
    DINHEIRO: "CASH",
    PIX: "PIX",
    CARTÃO_CRÉDITO: "CREDIT_CARD",
    CARTÃO_DÉBITO: "DEBIT_CARD",
};

export async function createCashEntry(data: {
    description: string;
    amount: number;
    type: "INCOME" | "EXPENSE";
    paymentMethod: string;
}) {
    try {
        const storeId = await getEffectiveStoreId();
        const method = (paymentMethodMap[data.paymentMethod] ?? "CASH") as any;

        await prisma.cashEntry.create({
            data: {
                storeId,
                type: data.type,
                amount: data.amount,
                description: data.description,
                paymentMethod: method,
                entryDate: new Date(),
            },
        });

        revalidatePath("/admin/cashier");
        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error creating cash entry:", error);
        return { success: false, error: "Erro ao registrar lançamento." };
    }
}
