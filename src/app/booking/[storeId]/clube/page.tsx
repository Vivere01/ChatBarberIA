"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Trophy, Check, Star, Shield, Loader2, Sparkles } from "lucide-react";
import { getClientSubscriptionPlans } from "@/app/actions/subscription-actions";
import { getStoreForBooking } from "@/app/actions/booking-actions";

export default function ClubePage() {
    const { storeId } = useParams() as { storeId: string };
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [storeColor, setStoreColor] = useState("#ea580c");

    useEffect(() => {
        const load = async () => {
            const [store, fetchedPlans] = await Promise.all([
                getStoreForBooking(storeId),
                getClientSubscriptionPlans(storeId)
            ]);
            if (store) {
                setStoreColor(store.primaryColor || "#ea580c");
            }
            setPlans(fetchedPlans || []);
            setLoading(false);
        };
        load();
    }, [storeId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: storeColor }} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-6 md:py-10 space-y-8 pb-32">
            <header className="flex flex-col items-center text-center space-y-4 px-4 bg-zinc-900 rounded-[2.5rem] py-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 opacity-20 rounded-full blur-3xl" style={{ backgroundColor: storeColor }} />
                
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-yellow-400 to-yellow-600 flex items-center justify-center text-white shadow-2xl relative z-10">
                    <Trophy className="w-10 h-10" />
                </div>
                
                <div className="relative z-10 w-full max-w-lg">
                    <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tight text-white flex flex-col gap-1 items-center">
                        Clube do <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Assinante</span>
                    </h1>
                    <p className="text-sm text-zinc-400 font-medium leading-relaxed mt-4">
                        Faça parte do nosso programa de fidelidade. Escolha o plano perfeito para você e tenha benefícios exclusivos o ano todo.
                    </p>
                </div>
            </header>

            {plans.length === 0 ? (
                <div className="py-20 flex flex-col items-center text-center px-6">
                    <div className="w-20 h-20 bg-zinc-50 rounded-[2rem] flex items-center justify-center mb-6 text-zinc-300 border border-zinc-100 shadow-inner">
                        <Star className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-black italic uppercase tracking-tight text-zinc-900">Nenhum plano disponível</h3>
                    <p className="text-zinc-500 text-sm mt-2 max-w-[240px] font-medium leading-relaxed">Não há planos de assinatura ativos no momento. Fique de olho nas novidades!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan, idx) => (
                        <div key={plan.id} className="bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all border border-zinc-100 relative group flex flex-col h-full">
                            {idx === 0 && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full text-white text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5 z-10">
                                    <Sparkles className="w-3 h-3" /> Mais Popular
                                </div>
                            )}
                            
                            <div className="mb-6 pb-6 border-b border-zinc-100 flex-1">
                                <h3 className="text-xl font-black italic uppercase tracking-tight text-zinc-900 mb-2">{plan.name}</h3>
                                {plan.description && (
                                    <p className="text-xs text-zinc-500 font-medium leading-relaxed min-h-[40px]">{plan.description}</p>
                                )}
                                
                                <div className="mt-6 flex items-baseline gap-1">
                                    <span className="text-sm font-bold text-zinc-400">R$</span>
                                    <span className="text-4xl font-black tracking-tighter text-zinc-900">{plan.price.toFixed(2)}</span>
                                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">/mês</span>
                                </div>
                            </div>
                            
                            <div className="space-y-4 mb-8">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 p-1 rounded-full bg-green-50 text-green-600">
                                        <Check className="w-3 h-3" strokeWidth={3} />
                                    </div>
                                    <p className="text-xs font-medium text-zinc-700">
                                        Cortesia em produtos: <strong className="font-bold text-zinc-900">{plan.productDiscountPercent}% OFF</strong>
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 p-1 rounded-full bg-green-50 text-green-600">
                                        <Check className="w-3 h-3" strokeWidth={3} />
                                    </div>
                                    <p className="text-xs font-medium text-zinc-700">
                                        Atendimentos simultâneos: <strong className="font-bold text-zinc-900">{plan.maxSimultaneousAppointments}</strong>
                                    </p>
                                </div>
                                {plan.services && plan.services.length > 0 && (
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 p-1 rounded-full bg-green-50 text-green-600">
                                            <Check className="w-3 h-3" strokeWidth={3} />
                                        </div>
                                        <p className="text-xs font-medium text-zinc-700">
                                            Serviços inclusos: <span className="font-bold text-zinc-900">{plan.services.map((s: any) => s.service?.name).filter(Boolean).join(", ")}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            <button className="w-full py-4 rounded-xl font-black italic uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-2 group-hover:bg-zinc-900 group-hover:text-white bg-zinc-50 text-zinc-900 mt-auto">
                                <Shield className="w-4 h-4" /> Assinar Agora
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
