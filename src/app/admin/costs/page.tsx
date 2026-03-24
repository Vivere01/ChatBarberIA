"use client";

import AdminShell from "@/components/admin/admin-shell";
import { Plus, TrendingDown } from "lucide-react";
import { EmptyState } from "@/components/admin/empty-state";

export default function CostsPage() {
    return (
        <AdminShell>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-display text-2xl font-bold">Custos</h1>
                        <p className="text-zinc-500 text-sm mt-1">Gerencie as despesas da sua barbearia</p>
                    </div>
                    <button className="flex items-center gap-2 bg-brand-gradient text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-brand-sm">
                        <Plus className="w-4 h-4" />
                        Lançar Custo
                    </button>
                </div>
                <EmptyState
                    icon={TrendingDown}
                    title="Nenhum custo lançado"
                    description="Lance aqui suas despesas fixas e variáveis (aluguel, luz, água, materiais, etc)."
                    buttonText="Lançar meu primeiro custo"
                />
            </div>
        </AdminShell>
    );
}
