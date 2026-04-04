"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Home, Calendar, Trophy, User, LogOut, Scissors, Loader2, Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getStoreForBooking } from "@/app/actions/booking-actions";
import { useSession, signOut } from "next-auth/react";

interface BookingLayoutProps {
    children: ReactNode;
    params: { storeId: string };
}

export default function BookingLayout({ children, params }: BookingLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, status } = useSession();
    const storeId = params.storeId;
    const [storeName, setStoreName] = useState("Carregando...");
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [storeColor, setStoreColor] = useState("#ea580c");

    const isLoginPage = pathname.endsWith("/login");

    useEffect(() => {
        const fetchStore = async () => {
            const store = await getStoreForBooking(storeId);
            if (store) {
                setStoreName(store.name);
                setLogoUrl(store.logoUrl);
                setStoreColor(store.primaryColor || "#ea580c");
            } else {
                setStoreName("Barbearia");
            }
        };
        fetchStore();
    }, [storeId]);

    useEffect(() => {
        if (status === "unauthenticated" && !isLoginPage) {
            router.push(`/booking/${storeId}/login`);
        }
    }, [status, isLoginPage, storeId, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-300" />
            </div>
        );
    }

    if (isLoginPage) {
        return <>{children}</>;
    }

    // 4 nav items — Plano removed (Clube já cobre isso)
    const navItems = [
        { href: `/booking/${storeId}/inicio`, icon: Home, label: "Início" },
        { href: `/booking/${storeId}/agendamentos`, icon: Calendar, label: "Agenda" },
        { href: `/booking/${storeId}/clube`, icon: Trophy, label: "Clube" },
        { href: `/booking/${storeId}/perfil`, icon: User, label: "Perfil" },
    ];

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row">
            {/* ── Sidebar Desktop ── */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-zinc-100 h-screen sticky top-0">
                <div className="p-6 border-b border-zinc-100">
                    <Link href={`/booking/${storeId}/inicio`} className="flex items-center gap-3">
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white overflow-hidden"
                            style={{ backgroundColor: storeColor }}
                        >
                            {logoUrl
                                ? <img src={logoUrl} alt={storeName} className="w-full h-full object-cover" />
                                : <Scissors className="w-4 h-4" />}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-zinc-900 leading-none">{storeName}</p>
                            <p className="text-[11px] text-zinc-400 mt-0.5">Portal do cliente</p>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 p-3 space-y-0.5">
                    {navItems.map((item) => {
                        const active = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                                    active
                                        ? "text-white"
                                        : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                                )}
                                style={active ? { backgroundColor: storeColor } : undefined}
                            >
                                <item.icon className="w-4 h-4 flex-shrink-0" />
                                {item.label}
                            </Link>
                        );
                    })}

                    <Link
                        href={`/booking/${storeId}/agendar`}
                        className="flex items-center gap-3 px-3 py-2.5 mt-3 rounded-lg text-sm font-semibold text-white w-full transition-all hover:opacity-90"
                        style={{ backgroundColor: storeColor }}
                    >
                        <Plus className="w-4 h-4" />
                        Agendar agora
                    </Link>
                </nav>

                <div className="p-3 border-t border-zinc-100">
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:bg-zinc-50 hover:text-red-500 transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        Sair
                    </button>
                </div>
            </aside>

            {/* ── Mobile Header ── */}
            <div className="md:hidden bg-white border-b border-zinc-100 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
                <div className="flex items-center gap-2.5">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white overflow-hidden"
                        style={{ backgroundColor: storeColor }}
                    >
                        {logoUrl
                            ? <img src={logoUrl} alt={storeName} className="w-full h-full object-cover" />
                            : <Scissors className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-semibold text-zinc-900">{storeName}</span>
                </div>
                <Link href={`/booking/${storeId}/perfil`} className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                    <User className="w-4 h-4" />
                </Link>
            </div>

            {/* ── Content ── */}
            <main className="flex-1 overflow-x-hidden">
                <div className="max-w-2xl mx-auto px-4 pt-5 pb-36 md:px-8 md:pt-10 md:pb-16 min-h-screen">
                    {children}
                </div>
            </main>

            {/* ── Mobile Bottom Nav ── */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-100 flex z-50">
                {navItems.map((item) => {
                    const active = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex-1 flex flex-col items-center gap-1 py-3 transition-all"
                        >
                            <item.icon
                                className={cn("w-5 h-5 transition-all", active ? "" : "text-zinc-300")}
                                style={active ? { color: storeColor } : undefined}
                            />
                            <span
                                className={cn("text-[10px] font-medium", active ? "" : "text-zinc-300")}
                                style={active ? { color: storeColor } : undefined}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
