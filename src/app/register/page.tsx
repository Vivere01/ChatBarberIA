"use client";

import { Scissors, Loader2, ArrowRight } from "lucide-react";
import { ChatbarberLogo } from "@/components/logo";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            router.push("/admin/dashboard");
        }, 1500);
    }

    return (
        <div className="min-h-screen bg-dark-900 flex">
            {/* Left side — Info */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 bg-brand-gradient p-12 relative overflow-hidden text-white">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />

                <div className="flex items-center gap-2 relative z-10">
                    <ChatbarberLogo className="w-10 h-10" fill="white" />
                    <span className="font-display font-bold text-2xl">
                        ChatBarber
                    </span>
                </div>

                <div className="relative z-10 max-w-md">
                    <h2 className="font-display text-4xl font-bold leading-tight mb-6">
                        Eleve sua barbearia para o próximo nível.
                    </h2>
                    <ul className="space-y-4">
                        {[
                            "Agendamento automático 24/7",
                            "IA treinada com seus dados no WhatsApp",
                            "Dashboard financeiro completo",
                            "Gamificação para barbeiros",
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-white/90">
                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-sm">✓</div>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="relative z-10 text-sm text-white/60">
                    © 2026 ChatBarber Inc.
                </div>
            </div>

            {/* Right side — Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md animate-slide-up">
                    {/* Mobile logo */}
                    <div className="flex items-center gap-2 mb-10 lg:hidden">
                        <ChatbarberLogo className="w-8 h-8" fill="white" />
                        <span className="font-display font-bold text-xl">
                            Chat<span className="brand-gradient-text">Barber</span>
                        </span>
                    </div>

                    <h1 className="font-display text-3xl font-bold mb-2">Crie sua conta</h1>
                    <p className="text-zinc-400 mb-8">Inicie seu teste grátis de 14 dias hoje mesmo.</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">Nome</label>
                                <input
                                    type="text"
                                    placeholder="Seu nome"
                                    required
                                    className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">Telefone</label>
                                <input
                                    type="tel"
                                    placeholder="(11) 90000-0000"
                                    required
                                    className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">Nome da Barbearia</label>
                            <input
                                type="text"
                                placeholder="Ex: Barbearia Royal"
                                required
                                className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
                            <input
                                type="email"
                                placeholder="seu@email.com"
                                required
                                className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-zinc-300 mb-2 block">Senha</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                required
                                className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand-gradient text-white py-3.5 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-brand-sm group mt-4"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    Criar minha conta <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                        <p className="text-xs text-center text-zinc-500 mt-4">
                            Ao continuar, você concorda com nossos <Link href="#" className="underline hover:text-white">Termos de Serviço</Link> e <Link href="#" className="underline hover:text-white">Política de Privacidade</Link>.
                        </p>
                    </form>

                    <p className="mt-8 text-center text-sm text-zinc-500">
                        Já tem uma conta?{" "}
                        <Link href="/login" className="text-brand-400 hover:text-brand-300 transition-colors font-medium">
                            Fazer Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
