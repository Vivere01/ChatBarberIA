"use client";

import { useSession, signOut } from "next-auth/react";
import { Bell, Search, ChevronDown, Store, LogOut, Settings, User, Menu } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { getOwnerStores } from "@/app/actions/store-actions";

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
    const { data: session } = useSession();
    const user = session?.user;
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [storeMenuOpen, setStoreMenuOpen] = useState(false);
    const [stores, setStores] = useState<any[]>([]);

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const currentStoreId = searchParams.get("storeId") || "all";

    useEffect(() => {
        getOwnerStores().then(setStores);
    }, []);

    const selectedStoreName = currentStoreId === "all" ? "Todas as lojas" : stores.find(s => s.id === currentStoreId)?.name || "Carregando...";

    return (
        <header className="h-16 border-b border-white/5 bg-dark-800 flex items-center justify-between px-4 md:px-6 flex-shrink-0 relative z-30">
            <div className="flex items-center gap-4 flex-1">
                {/* Mobile Menu Toggle */}
                <button onClick={onMenuClick} className="lg:hidden p-2 text-zinc-400 hover:text-white">
                    <Menu className="w-6 h-6" />
                </button>

                {/* Search - Hidden on very small mobile */}
                <div className="hidden sm:flex items-center gap-3 flex-1 max-w-md">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="w-full bg-dark-700 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-brand-500/30 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-4">
                {/* Store selector */}
                {/* Store selector */}
                <div className="relative">
                    <button onClick={() => setStoreMenuOpen(!storeMenuOpen)} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/8 text-sm text-zinc-300 hover:border-white/15 transition-all">
                        <Store className="w-4 h-4 text-brand-400" />
                        <span className="hidden md:block truncate max-w-[120px]">{selectedStoreName}</span>
                        <ChevronDown className="w-3 h-3 text-zinc-500" />
                    </button>
                    {storeMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setStoreMenuOpen(false)} />
                            <div className="absolute right-0 mt-2 w-56 bg-dark-800 border border-white/10 rounded-2xl shadow-2xl z-20 overflow-hidden backdrop-blur-xl py-2">
                                <button
                                    onClick={() => {
                                        const params = new URLSearchParams(searchParams);
                                        params.delete("storeId");
                                        router.replace(`${pathname}?${params.toString()}`);
                                        setStoreMenuOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold hover:bg-white/5 transition-colors ${currentStoreId === "all" ? "text-brand-400" : "text-zinc-300"}`}
                                >
                                    <Store className="w-4 h-4" />
                                    Todas as lojas
                                </button>
                                {stores.map(store => (
                                    <button
                                        key={store.id}
                                        onClick={() => {
                                            const params = new URLSearchParams(searchParams);
                                            params.set("storeId", store.id);
                                            router.replace(`${pathname}?${params.toString()}`);
                                            setStoreMenuOpen(false);
                                        }}
                                        className={`w-full text-left flex items-center gap-3 px-4 py-2.5 text-xs font-bold hover:bg-white/5 transition-colors ${currentStoreId === store.id ? "text-brand-400" : "text-zinc-300"}`}
                                    >
                                        <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center shrink-0 uppercase">
                                            {store.name.charAt(0)}
                                        </div>
                                        <span className="truncate">{store.name}</span>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Notifications */}
                <button className="relative w-9 h-9 rounded-lg border border-white/8 flex items-center justify-center hover:border-white/15 transition-all">
                    <Bell className="w-4 h-4 text-zinc-400" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
                </button>

                {/* User menu */}
                <div className="relative">
                    <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
                    >
                        <div className="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center text-xs font-black text-white shadow-lg shadow-brand/20">
                            {user?.name ? getInitials(user.name) : "CB"}
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-bold text-zinc-200 leading-none truncate max-w-[140px]">
                                {user?.name ?? "Proprietário"}
                            </p>
                            <p className="text-[10px] text-brand-400 mt-0.5 font-black uppercase tracking-widest">
                                Proprietário
                            </p>
                        </div>
                        <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                    </button>

                    {userMenuOpen && (
                        <>
                            {/* Backdrop */}
                            <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                            {/* Dropdown */}
                            <div className="absolute right-0 mt-2 w-56 bg-dark-800 border border-white/10 rounded-2xl shadow-2xl z-20 overflow-hidden backdrop-blur-xl">
                                <div className="px-5 py-4 border-b border-white/5">
                                    <p className="text-xs font-black text-white uppercase tracking-widest truncate">{user?.name}</p>
                                    <p className="text-[10px] text-zinc-500 mt-0.5 truncate">{user?.email}</p>
                                </div>
                                <div className="py-2">
                                    <Link
                                        href="/admin/settings"
                                        onClick={() => setUserMenuOpen(false)}
                                        className="flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
                                    >
                                        <Settings className="w-4 h-4 text-brand-400" />
                                        Configurações do Perfil
                                    </Link>
                                    <button
                                        onClick={() => signOut({ callbackUrl: "/login" })}
                                        className="w-full flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-colors border-t border-white/5"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sair da Conta
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
