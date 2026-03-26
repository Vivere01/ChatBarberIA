"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
    Mail, Lock, User, Phone, 
    ArrowRight, Loader2, Scissors,
    CheckCircle2, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { registerClient } from "@/app/actions/client-actions";
import { getStoreForBooking } from "@/app/actions/booking-actions";

export default function ClientLoginPage({ params }: { params: { storeId: string } }) {
    const router = useRouter();
    const storeId = params.storeId;
    
    const [isRegister, setIsRegister] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [store, setStore] = useState<any>(null);

    // Form states
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    useEffect(() => {
        const fetchStore = async () => {
            const data = await getStoreForBooking(storeId);
            if (data) setStore(data);
        };
        fetchStore();
    }, [storeId]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const result = await signIn("client-login", {
                email,
                password,
                ownerId: store?.ownerId,
                redirect: false,
            });

            if (result?.error) {
                setError("Email ou senha incorretos.");
            } else {
                router.push(`/booking/${storeId}/inicio`);
                router.refresh();
            }
        } catch (err) {
            setError("Ocorreu um erro ao tentar entrar.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (!email || !password || !name) {
                setError("Preencha todos os campos obrigatórios.");
                setIsLoading(false);
                return;
            }

            const res = await registerClient({
                name,
                email,
                password,
                phone,
                ownerId: store?.ownerId,
                storeId: storeId,
            });

            if (res.success) {
                // Login automático após registro
                const loginRes = await signIn("client-login", {
                    email,
                    password,
                    ownerId: store?.ownerId,
                    redirect: false,
                });

                if (loginRes?.ok) {
                    router.push(`/booking/${storeId}/inicio`);
                    router.refresh();
                } else {
                    setIsRegister(false);
                    setError("Conta criada! Por favor, faça login.");
                }
            } else {
                setError(res.error || "Erro ao criar conta.");
            }
        } catch (err) {
            setError("Erro ao processar registro.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!store) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col md:flex-row">
            {/* Esquerda: Branding/Imagem */}
            <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-zinc-900">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070" 
                        alt="Barbershop" 
                        className="w-full h-full object-cover opacity-40 grayscale"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-zinc-950/90" />
                </div>
                
                <div className="relative z-10 p-16 flex flex-col justify-between h-full w-full">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-2xl shadow-orange-600/20">
                            {store.logoUrl ? (
                                <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover rounded-2xl" />
                            ) : (
                                <Scissors className="w-8 h-8" />
                            )}
                        </div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                            {store.name}
                        </h1>
                    </div>

                    <div className="max-w-md">
                        <h2 className="text-5xl font-black text-white leading-none mb-6">
                            SUA MELHOR <br /> VERSÃO COMEÇA <br /> <span className="text-orange-500 underline decoration-4 underline-offset-8">AQUI.</span>
                        </h2>
                        <p className="text-zinc-400 text-lg">
                            Faça seu login para acessar o sistema de agendamentos e conferir seus benefícios exclusivos.
                        </p>
                    </div>

                    <div className="text-zinc-500 text-sm font-medium">
                        © 2026 {store.name} — Powered by ChatBarber
                    </div>
                </div>
            </div>

            {/* Direita: Formulário */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 lg:p-24">
                <div className="w-full max-w-[420px] space-y-8">
                    {/* Logo Mobile */}
                    <div className="md:hidden flex flex-col items-center gap-4 mb-12">
                        <div className="w-20 h-20 rounded-3xl bg-orange-600 flex items-center justify-center text-white shadow-2xl shadow-orange-600/30">
                           <Scissors className="w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">{store.name}</h1>
                    </div>

                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold text-white tracking-tight">
                            {isRegister ? "Criar conta" : "Bem-vindo de volta"}
                        </h2>
                        <p className="text-zinc-400 mt-2">
                            {isRegister 
                                ? "Cadastre-se para começar a agendar seus cortes." 
                                : "Entre com seus dados para continuar."}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-500 text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="font-medium">{error}</p>
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={isRegister ? handleRegister : handleLogin}>
                        {isRegister && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Nome Completo</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-orange-500 transition-colors" />
                                    <input 
                                        type="text" 
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Seu nome"
                                        className="w-full h-14 bg-zinc-900/50 border border-white/5 rounded-2xl pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">E-mail</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-orange-500 transition-colors" />
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    className="w-full h-14 bg-zinc-900/50 border border-white/5 rounded-2xl pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                                />
                            </div>
                        </div>

                        {isRegister && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Celular</label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-orange-500 transition-colors" />
                                    <input 
                                        type="tel" 
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="(00) 00000-0000"
                                        className="w-full h-14 bg-zinc-900/50 border border-white/5 rounded-2xl pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between pb-1">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Senha</label>
                                {!isRegister && (
                                    <button type="button" className="text-xs font-bold text-orange-600 hover:text-orange-500">Esqueceu a senha?</button>
                                )}
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-orange-500 transition-colors" />
                                <input 
                                    type="password" 
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full h-14 bg-zinc-900/50 border border-white/5 rounded-2xl pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-2xl shadow-orange-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none mt-4"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {isRegister ? "Criar minha conta" : "Entrar agora"}
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/5"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-zinc-950 px-4 text-zinc-600 font-bold tracking-widest">ou entrar com</span>
                        </div>
                    </div>

                    <button 
                        type="button"
                        className="w-full h-14 bg-white hover:bg-zinc-100 text-zinc-900 font-bold rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
                    >
                        <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                        Google
                    </button>

                    <div className="text-center">
                        <button 
                            type="button"
                            onClick={() => {
                                setIsRegister(!isRegister);
                                setError(null);
                            }}
                            className="text-white/60 text-sm font-medium hover:text-white transition-colors"
                        >
                            {isRegister 
                                ? "Já tem uma conta? Clique para entrar" 
                                : "Ainda não tem conta? Crie agora mesmo"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
