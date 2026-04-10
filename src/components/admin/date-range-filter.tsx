"use client";

import { Calendar, Search, X } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function DateRangeFilter() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [from, setFrom] = useState(searchParams.get("from") || "");
    const [to, setTo] = useState(searchParams.get("to") || "");

    const handleFilter = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (from) params.set("from", from);
        else params.delete("from");
        
        if (to) params.set("to", to);
        else params.delete("to");

        router.push(`${pathname}?${params.toString()}`);
    };

    const clearFilter = () => {
        setFrom("");
        setTo("");
        router.push(pathname);
    };

    return (
        <div className="flex flex-wrap items-center gap-3 bg-dark-800/50 border border-white/5 p-2 rounded-2xl backdrop-blur-md">
            <div className="flex items-center gap-2 px-3 py-2 bg-dark-900/50 rounded-xl border border-white/5">
                <Calendar className="w-4 h-4 text-brand-400" />
                <input 
                    type="date" 
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="bg-transparent text-xs font-bold text-white outline-none [color-scheme:dark]"
                />
                <span className="text-zinc-600 text-[10px] font-black uppercase">até</span>
                <input 
                    type="date" 
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="bg-transparent text-xs font-bold text-white outline-none [color-scheme:dark]"
                />
            </div>
            
            <div className="flex items-center gap-1">
                <button
                    onClick={handleFilter}
                    className="bg-brand-500 hover:bg-brand-600 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-brand/20"
                >
                    <Search className="w-4 h-4" />
                </button>
                {(from || to) && (
                    <button
                        onClick={clearFilter}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 p-2.5 rounded-xl transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
