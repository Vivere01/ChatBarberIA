import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

export function formatDate(date: Date | string): string {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(date));
}

export function getInitials(name: string): string {
    return name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase();
}

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export const GAMIFICATION_LEVELS = [
    { level: "BRONZE", minPoints: 0, color: "#cd7f32", emoji: "🥉" },
    { level: "PRATA", minPoints: 500, color: "#c0c0c0", emoji: "🥈" },
    { level: "OURO", minPoints: 1500, color: "#ffd700", emoji: "🥇" },
    { level: "PLATINA", minPoints: 4000, color: "#e5e4e2", emoji: "⚪" },
    { level: "DIAMANTE", minPoints: 10000, color: "#b9f2ff", emoji: "💎" },
    { level: "RUBI", minPoints: 25000, color: "#9b111e", emoji: "❤️" },
] as const;

export function getLevelInfo(level: string) {
    return GAMIFICATION_LEVELS.find((l) => l.level === level) ?? GAMIFICATION_LEVELS[0];
}

export function getNextLevel(points: number) {
    const sorted = [...GAMIFICATION_LEVELS].sort((a, b) => b.minPoints - a.minPoints);
    return sorted.find((l) => points < l.minPoints) ?? null;
}
