"use client";

import { useEffect, useState } from "react";
import { getSubscriptionStatus } from "@/app/actions/stripe-actions";
import { getPlanByPriceId, PlanFeature } from "@/config/plans";
import { Lock, Rocket, CreditCard, Loader2 } from "lucide-react";
import Link from "next/link";

interface FeatureBarrierProps {
    feature: PlanFeature;
    children: React.ReactNode;
}

export function FeatureBarrier({ feature, children }: FeatureBarrierProps) {
    const [status, setStatus] = useState<{ 
        loading: boolean; 
        hasAccess: boolean;
        planName?: string;
    }>({
        loading: true,
        hasAccess: false,
    });

    useEffect(() => {
        async function check() {
            const res = await getSubscriptionStatus();
            if (res.isDev) {
                setStatus({ loading: false, hasAccess: true });
                return;
            }

            if (res.priceId) {
                const plan = getPlanByPriceId(res.priceId);
                const hasAccess = plan?.features.includes(feature) || false;
                setStatus({ loading: false, hasAccess, planName: plan?.name });
            } else {
                setStatus({ loading: false, hasAccess: false });
            }
        }
        check();
    }, [feature]);

    if (status.loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
                <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest">Verificando permissões...</p>
            </div>
        );
    }

    if (status.hasAccess) {
        return <>{children}</>;
    }

    return (
        <div className="glass-card rounded-[32px] p-12 text-center border-brand-500/20 shadow-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-brand-gradient opacity-[0.03] group-hover:opacity-[0.05] transition-opacity" />
            
            <div className="w-20 h-20 bg-brand-500/10 border border-brand-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Lock className="w-8 h-8 text-brand-400" />
            </div>

            <h2 className="text-3xl font-display font-bold text-zinc-100 mb-4">
                Recurso Premium
            </h2>
            <p className="text-zinc-400 text-lg mb-10 max-w-md mx-auto leading-relaxed">
                Seu plano atual <strong className="text-zinc-200">{status.planName || "Starter"}</strong> não possui acesso a esta ferramenta. Faça um upgrade para liberar o potencial máximo da sua barbearia.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
                <Link 
                    href="/#plans" 
                    className="w-full sm:flex-1 bg-brand-gradient text-white py-4 rounded-2xl font-bold hover:shadow-brand-md transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                >
                    <Rocket className="w-5 h-5" />
                    Fazer Upgrade
                </Link>
                <Link 
                    href="/admin/dashboard" 
                    className="w-full sm:flex-1 bg-white/5 text-zinc-300 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all border border-white/5"
                >
                    Voltar ao Dashboard
                </Link>
            </div>
        </div>
    );
}
