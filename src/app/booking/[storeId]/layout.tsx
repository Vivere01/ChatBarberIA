"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Home, Calendar, Trophy, FileText, User, LogOut, Scissors, Loader2
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
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
        );
    }

    // Se estiver na página de login, renderiza apenas os filhos
    if (isLoginPage) {
        return <>{children}</>;
    }

    const navItems = [
        { href: `/booking/${storeId}/inicio`, icon: Home, label: "Início" },
        { href: `/booking/${storeId}/agendamentos`, icon: Calendar, label: "Agendamentos" },
        { href: `/booking/${storeId}/clube`, icon: Trophy, label: "Clube do assinante" },
        { href: `/booking/${storeId}/plano`, icon: FileText, label: "Plano" },
        { href: `/booking/${storeId}/perfil`, icon: User, label: "Perfil" },
    ];

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row">
            {/* Sidebar Desktop */}
            <aside className="hidden md:flex flex-col w-72 bg-white border-r border-zinc-200 h-screen sticky top-0 shadow-xl shadow-zinc-200/50">
                <div className="p-8 pb-10">
                    <Link href={`/booking/${storeId}/inicio`} className="flex items-center gap-3 group">
                        <div 
                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform duration-500"
                            style={{ backgroundColor: storeColor, boxShadow: `0 10px 15px -3px ${storeColor}33` }}
                        >
                            {logoUrl ? (
                                <img src={logoUrl} alt={storeName} className="w-full h-full object-cover rounded-2xl" />
                            ) : (
                                <Scissors className="w-6 h-6" />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-display font-black text-2xl tracking-tighter text-zinc-900 italic uppercase leading-tight">
                                {storeName.split(' ')[0]}
                            </span>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: storeColor }}>Barbearia</p>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
                    {navItems.map((item) => {
                        const active = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all group",
                                    active
                                        ? "text-white translate-x-1"
                                        : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900"
                                )}
                                style={active ? { backgroundColor: storeColor, boxShadow: `0 10px 15px -3px ${storeColor}33` } : undefined}
                            >
                                <item.icon className={cn("w-5 h-5 transition-transform", active ? "scale-110" : "group-hover:scale-110")} />
                                {item.label}
                                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-zinc-100 bg-zinc-50/50">
                    <button
                        onClick={() => signOut({ callbackUrl: `/booking/${storeId}/login` })}
                        className="flex items-center gap-4 w-full px-5 py-3.5 rounded-xl text-sm font-bold text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-all group"
                    >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Sair do sistema
                    </button>
                    <div className="mt-4 px-5">
                        <p className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest">© 2026 Chatbarber</p>
                    </div>
                </div>
            </aside>

            {/* Mobile Nav Top */}
            <div className="md:hidden bg-white border-b p-4 flex items-center justify-between sticky top-0 z-40 bg-white/80 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
                        style={{ backgroundColor: storeColor, boxShadow: `0 10px 15px -3px ${storeColor}33` }}
                    >
                        {logoUrl ? (
                            <img src={logoUrl} alt={storeName} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                            <Scissors className="w-5 h-5" />
                        )}
                    </div>
                    <span className="font-black text-xl tracking-tighter uppercase italic text-zinc-900">{storeName}</span>
                </div>
                <button className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 active:scale-90 transition-all">
                    <User className="w-5 h-5" />
                </button>
            </div>

            {/* Content Area */}
            <main className="flex-1 overflow-x-hidden">
                <div className="max-w-4xl mx-auto p-4 pb-36 md:p-12 md:pb-32 min-h-screen">
                    {children}
                </div>
            </main>

            {/* Mobile Nav Bottom */}
            <nav className="md:hidden fixed bottom-6 left-6 right-6 bg-zinc-900/95 backdrop-blur-lg border border-white/10 flex justify-around p-3 z-50 rounded-3xl shadow-2xl">
                {navItems.map((item) => {
                    const active = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href} className="flex flex-col items-center relative py-1">
                            <item.icon 
                                className={cn("w-6 h-6 transition-all", active ? "scale-125 -translate-y-1" : "text-zinc-500")} 
                                style={active ? { color: storeColor } : undefined}
                            />
                            {active && <div className="absolute -bottom-1 w-1 h-1 rounded-full" style={{ backgroundColor: storeColor }} />}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
