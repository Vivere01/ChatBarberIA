"use client";

import { useState } from "react";
import Link from "next/link";
import { Scissors, Loader2, ArrowRight } from "lucide-react";
import { ChatbarberLogo } from "@/components/logo";

export default function ClientLogPage({ params }: { params: { slug: string } }) {
    const [loading, setLoading] = useState(false);

    return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6">
            <div className="w-full max-w-sm">
                <div className="text-center mb-10">
                    <ChatbarberLogo className="w-16 h-16 mx-auto mb-4 drop-shadow-lg" fill="white" />
                    <h1 className="font-display font-bold text-2xl">Área do Cliente</h1>
                    <p className="text-zinc-500 text-sm">Faça login para gerenciar seus agendamentos</p>
                </div>

                <form className="space-y-4" onSubmit={e => { e.preventDefault(); setLoading(true); setTimeout(() => window.location.href = `/${params.slug}/dashboard`, 1000) }}>
                    <div>
                        <label className="text-sm font-semibold text-zinc-400 mb-2 block">Email / Telefone</label>
                        <input
                            type="text"
                            required
                            placeholder="seu@email.com"
                            className="w-full bg-dark-800 border border-white/8 rounded-xl px-4 py-3 placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 transition-all font-medium text-white"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-semibold text-zinc-400">Senha</label>
                            <a href="#" className="text-xs text-brand-400">Esqueceu?</a>
                        </div>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full bg-dark-800 border border-white/8 rounded-xl px-4 py-3 placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 transition-all font-medium text-white"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-gradient text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all mt-6 shadow-brand-sm group"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Entrar"}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <p className="text-center text-sm text-zinc-500 mt-8">
                    Ainda não tem conta? <Link href={`/${params.slug}/booking`} className="text-brand-400 hover:text-brand-300 font-semibold">Agende agora e crie uma</Link>
                </p>
            </div>
        </div>
    );
}
