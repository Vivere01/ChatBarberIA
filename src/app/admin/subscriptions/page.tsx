"use client";

import AdminShell from "@/components/admin/admin-shell";
import { Plus, CreditCard } from "lucide-react";
import { EmptyState } from "@/components/admin/empty-state";

export default function SubscriptionsPage() {
    return (
        <AdminShell>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-display text-2xl font-bold">Assinaturas</h1>
                        <p className="text-zinc-500 text-sm mt-1">Gerencie os planos recorrentes de seus clientes</p>
                    </div>
                    <button className="flex items-center gap-2 bg-brand-gradient text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-brand-sm">
                        <Plus className="w-4 h-4" />
                        Novo Plano
                    </button>
                </div>
                <EmptyState
                    icon={CreditCard}
                    title="Nenhum plano recorrente"
                    description="Crie planos de assinatura para fidelizar seus clientes com cortes ilimitados ou descontos."
                    buttonText="Criar meu primeiro plano"
                />
            </div>
        </AdminShell>
    );
}
