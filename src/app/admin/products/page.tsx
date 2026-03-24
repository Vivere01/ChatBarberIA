"use client";

import AdminShell from "@/components/admin/admin-shell";
import { Plus, Package, Search, Filter } from "lucide-react";
import { EmptyState } from "@/components/admin/empty-state";

export default function ProductsPage() {
    return (
        <AdminShell>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-display text-2xl font-bold">Produtos</h1>
                        <p className="text-zinc-500 text-sm mt-1">Gerencie o estoque e venda de produtos</p>
                    </div>
                    <button className="flex items-center gap-2 bg-brand-gradient text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-brand-sm">
                        <Plus className="w-4 h-4" />
                        Novo Produto
                    </button>
                </div>
                <EmptyState
                    icon={Package}
                    title="Nenhum produto cadastrado"
                    description="Cadastre pomadas, óleos e outros produtos para vender na sua barbearia."
                    buttonText="Cadastrar primeiro produto"
                />
            </div>
        </AdminShell>
    );
}
