"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { getSubscriptionStatus, createCheckoutSession } from "@/app/actions/stripe-actions";
import { AlertCircle, CreditCard, Rocket, Loader2 } from "lucide-react";

export function SubscriptionBarrier() {
    const [status, setStatus] = useState<{ active: boolean; loading: boolean }>({
        active: true,
        loading: true,
    });
    const [subscribing, setSubscribing] = useState(false);

    useEffect(() => {
        async function check() {
            const res = await getSubscriptionStatus();
            setStatus({ active: res.active, loading: false });
        }
        check();
    }, []);

    const handleSubscribe = async () => {
        setSubscribing(true);
        // Default to PRO plan if none specified
        const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || "price_1TISxDF9fVZA3i56U6ZPO5aW";
        const res = await createCheckoutSession(priceId);
        if (res.url) {
            window.location.href = res.url;
        } else {
            alert(res.error || "Erro ao redirecionar para o pagamento");
            setSubscribing(false);
        }
    };

    if (status.loading || status.active) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Darker backdrop to fully block content */}
            <div className="absolute inset-0 bg-dark-950/95 backdrop-blur-xl animate-fade-in" />
            
            <div className="relative w-full max-w-lg bg-dark-800 border border-brand-500/30 rounded-[40px] shadow-2xl p-10 text-center animate-scale-in">
                <div className="w-20 h-20 bg-brand-gradient rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-brand-lg">
                    <Rocket className="w-10 h-10 text-white" />
                </div>

                <h2 className="text-3xl font-display font-bold text-white mb-4">
                    Assinatura Requerida
                </h2>
                <p className="text-zinc-400 text-lg mb-10 leading-relaxed">
                    Seu acesso ao painel administrativo está pausado. Para continuar gerenciando sua barbearia, ative sua assinatura com o teste grátis de 14 dias.
                </p>

                <div className="space-y-4">
                    <button
                        onClick={handleSubscribe}
                        disabled={subscribing}
                        className="w-full bg-brand-gradient text-white py-5 rounded-2xl font-bold text-lg hover:shadow-brand-md transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {subscribing ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                <CreditCard className="w-6 h-6" />
                                Iniciar Teste Grátis (14 dias)
                            </>
                        )}
                    </button>
                    
                    <p className="text-xs text-zinc-500">
                        Nenhuma cobrança será feita nos primeiros 14 dias. Você pode cancelar a qualquer momento.
                    </p>
                </div>
            </div>
        </div>
    );
}
