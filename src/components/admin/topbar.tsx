"use client";

import { useSession } from "next-auth/react";
import { Bell, Search, ChevronDown, Store } from "lucide-react";
import { getInitials } from "@/lib/utils";

export function Topbar() {
    const { data: session } = useSession();
    const user = session?.user;

    return (
        <header className="h-16 border-b border-white/5 bg-dark-800 flex items-center justify-between px-6 flex-shrink-0">
            {/* Search */}
            <div className="flex items-center gap-3 flex-1 max-w-md">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                        type="text"
                        placeholder="Buscar clientes, serviços..."
                        className="w-full bg-dark-700 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-brand-500/30 transition-all"
                    />
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-4">
                {/* Store selector */}
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/8 text-sm text-zinc-300 hover:border-white/15 transition-all">
                    <Store className="w-4 h-4 text-brand-400" />
                    <span className="hidden md:block">Todas as lojas</span>
                    <ChevronDown className="w-3 h-3 text-zinc-500" />
                </button>

                {/* Notifications */}
                <button className="relative w-9 h-9 rounded-lg border border-white/8 flex items-center justify-center hover:border-white/15 transition-all">
                    <Bell className="w-4 h-4 text-zinc-400" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
                </button>

                {/* User */}
                <button className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-xs font-bold text-white">
                        {user?.name ? getInitials(user.name) : "CB"}
                    </div>
                    <div className="hidden md:block text-left">
                        <p className="text-sm font-medium text-zinc-200 leading-none">{user?.name ?? "Usuário"}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Admin</p>
                    </div>
                    <ChevronDown className="w-3 h-3 text-zinc-500" />
                </button>
            </div>
        </header>
    );
}
