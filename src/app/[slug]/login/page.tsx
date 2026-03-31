"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, ArrowRight } from "lucide-react";
import { getStoreBySlug } from "@/app/actions/booking-actions";

export default function ClientLogPage({ params }: { params: { slug: string } }) {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [store, setStore] = useState<any>(null);

    useEffect(() => {
        const loadStore = async () => {
            try {
                const data = await getStoreBySlug(params.slug);
                setStore(data);
            } catch (err) {
                console.error("Erro ao carregar loja:", err);
            } finally {
                setFetching(false);
            }
        };
        loadStore();
    }, [params.slug]);

    if (fetching) {
        return (
            <div className="min-h-screen bg-dark-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            </div>
        );
    }

    const primaryColor = store?.primaryColor || "#f97316";

    return (
        <div 
            className="min-h-screen bg-dark-950 flex items-center justify-center p-6 relative overflow-hidden"
            style={{ 
                backgroundImage: store?.loginBackgroundUrl ? `url(${store.loginBackgroundUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            {/* Overlay if there's a background image */}
            {store?.loginBackgroundUrl && (
                <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" />
            )}

            <div className="w-full max-w-sm relative z-10">
                <div className="text-center mb-10">
                    {store?.logoUrl ? (
                        <img src={store.logoUrl} alt={store.name} className="w-24 h-24 mx-auto mb-4 object-contain drop-shadow-2xl" />
                    ) : (
                        <div 
                            className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-brand/20"
                            style={{ backgroundColor: primaryColor }}
                        >
                            {store?.name?.charAt(0) || "B"}
                        </div>
                    )}
                    <h1 className="font-display font-bold text-2xl text-white">Área do Cliente</h1>
                    <p className="text-zinc-400 text-sm mt-1">Bem-vindo à {store?.name || "nossa barbearia"}</p>
                </div>

                <form className="space-y-4" onSubmit={e => { e.preventDefault(); setLoading(true); setTimeout(() => window.location.href = `/${params.slug}/dashboard`, 1000) }}>
                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2 block ml-1">Email / Telefone</label>
                        <input
                            type="text"
                            required
                            placeholder="seu@email.com"
                            className="w-full bg-dark-900/50 backdrop-blur-md border border-white/5 rounded-xl px-4 py-4 placeholder-zinc-700 focus:outline-none focus:border-white/20 transition-all font-bold text-white shadow-xl"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Sua Senha</label>
                            <a href="#" className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors">Esqueceu?</a>
                        </div>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full bg-dark-900/50 backdrop-blur-md border border-white/5 rounded-xl px-4 py-4 placeholder-zinc-700 focus:outline-none focus:border-white/20 transition-all font-bold text-white shadow-xl"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 hover:opacity-95 transition-all mt-6 shadow-xl relative overflow-hidden group"
                        style={{ backgroundColor: primaryColor }}
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Acessar Painel"}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    
                </form>


                <p className="text-center text-xs text-zinc-500 mt-8 font-medium">
                    Ainda não tem conta? <Link href={`/${params.slug}/booking`} className="text-white hover:underline transition-all">Agende agora para criar uma</Link>
                </p>
            </div>
            
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">
                Powered by <span className="text-zinc-500">ChatBarber</span>
            </div>
        </div>
    );
}

