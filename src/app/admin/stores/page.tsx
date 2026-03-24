"use client";

import AdminShell from "@/components/admin/admin-shell";
import { Plus, Store } from "lucide-react";
import { EmptyState } from "@/components/admin/empty-state";

export default function StoresPage() {
    return (
        <AdminShell>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-display text-2xl font-bold">Lojas</h1>
                        <p className="text-zinc-500 text-sm mt-1">Gerencie a sua rede de barbearias</p>
                    </div>
                </div>
                <EmptyState
                    icon={Store}
                    title="Configurando sua primeira loja"
                    description="As informações da sua barbearia atual estão aparecendo no painel, mas você pode gerenciar mais lojas aqui."
                    buttonText="Adicionar Filial"
                />
            </div>
        </AdminShell>
    );
}
