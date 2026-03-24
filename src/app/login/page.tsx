"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Scissors, Eye, EyeOff, Loader2 } from "lucide-react";
import { ChatbarberLogo } from "@/components/logo";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("admin@gmail.com");
    const [password, setPassword] = useState("admin");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");
        const res = await signIn("owner-login", {
            email,
            password,
            redirect: false,
        });
        setLoading(false);
        if (res?.error) {
            setError("Email ou senha incorretos.");
        } else {
            router.push("/admin/dashboard");
        }
    }

    return (
        <div className="min-h-screen bg-dark-900 flex">
            {/* Left side — decorative */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 bg-dark-800 border-r border-white/5 p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-brand-500/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="flex items-center gap-2 relative">
                    <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-brand-sm">
                        <Scissors className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-display font-bold text-2xl">
                        Chat<span className="brand-gradient-text">Barber</span>
                    </span>
                </div>

                <div className="relative">
                    <blockquote className="text-2xl font-display font-bold leading-snug mb-4 text-white">
                        "Aumentei meu faturamento em 40% no primeiro mês com o ChatBarber."
                    </blockquote>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center text-sm font-bold">RM</div>
                        <div>
                            <p className="font-medium text-sm">Rafael Moura</p>
                            <p className="text-zinc-500 text-xs">Barbearia Royal · São Paulo, SP</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side — form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md animate-slide-up">
                    {/* Logo mobile */}
                    <div className="flex items-center gap-2 mb-10 lg:hidden">
                        <ChatbarberLogo className="w-8 h-8" fill="white" />
                        <span className="font-display font-bold text-xl">
                            Chat<span className="brand-gradient-text">Barber</span>
                        </span>
                    </div>

                    <h1 className="font-display text-3xl font-bold mb-2">Bem-vindo de volta</h1>
                    <p className="text-zinc-400 mb-8">Entre na sua conta para continuar</p>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                required
                                className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 transition-all"
                            />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-zinc-300">Senha</label>
                                <a href="#" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">Esqueci minha senha</a>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPass ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-3 pr-12 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                                >
                                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            id="login-btn"
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand-gradient text-white py-3.5 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-brand-sm"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Entrar na Conta"}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-zinc-500">
                        Não tem uma conta?{" "}
                        <Link href="/register" className="text-brand-400 hover:text-brand-300 transition-colors font-medium">
                            Criar conta grátis
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
