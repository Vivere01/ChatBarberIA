"use client";

import AdminShell from "@/components/admin/admin-shell";
import { Plus, CreditCard, Trash2, PiggyBank, Settings2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { getSubscriptionPlans, createSubscriptionPlan, deleteSubscriptionPlan } from "@/app/actions/subscription-actions";
import { EmptyState } from "@/components/admin/empty-state";

export default function SubscriptionsPage() {
    const [plans, setPlans] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    
    // Form data
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: 0,
        potAmount: 0,
        chipsPerService: 1
    });

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        setFetching(true);
        const data = await getSubscriptionPlans();
        setPlans(data);
        setFetching(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await createSubscriptionPlan(formData);
        if (res.success) {
            loadPlans();
            setIsModalOpen(false);
            setFormData({ name: "", description: "", price: 0, potAmount: 0, chipsPerService: 1 });
        } else { alert(res.error); }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Excluir este plano?")) return;
        const res = await deleteSubscriptionPlan(id);
        if (res.success) loadPlans();
    };

    return (
        <AdminShell>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-display text-2xl font-bold">Assinaturas</h1>
                        <p className="text-zinc-500 text-sm mt-1">Gerencie os planos e o sistema de pote de comissão</p>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-brand-gradient text-white px-6 py-3 rounded-xl text-sm font-bold hover:scale-105 transition-all shadow-brand"
                    >
                        <Plus className="w-5 h-5" />
                        Novo Plano
                    </button>
                </div>

                {fetching ? (
                    <div className="h-64 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                    </div>
                ) : plans.length === 0 ? (
                    <EmptyState
                        icon={CreditCard}
                        title="Nenhum plano recorrente"
                        description="Crie planos de assinatura para fidelizar seus clientes e configurar o sistema de pote."
                        buttonText="Criar meu primeiro plano"
                        onAction={() => setIsModalOpen(true)}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <div key={plan.id} className="glass-card rounded-3xl p-6 border border-white/5 hover:border-brand-500/20 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-brand">
                                        <CreditCard className="w-6 h-6 text-white" />
                                    </div>
                                    <button onClick={() => handleDelete(plan.id)} className="p-2 opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 transition-all">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                                <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
                                <p className="text-zinc-500 text-sm mb-6 line-clamp-2">{plan.description || "Sem descrição"}</p>
                                
                                <div className="space-y-3 pt-4 border-t border-white/5">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-500 font-medium">Preço Mensal</span>
                                        <span className="text-white font-bold">R$ {plan.price.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-brand-400 font-bold flex items-center gap-1">
                                            <PiggyBank className="w-4 h-4" />
                                            Valor no Pote
                                        </span>
                                        <span className="text-white font-bold">R$ {plan.potAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-500 font-medium">Fichas/Serviço</span>
                                        <span className="text-white font-bold">{plan.chipsPerService} Fichas</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] pt-2 uppercase font-black tracking-widest text-zinc-600">
                                        <span>Assinantes ativos</span>
                                        <span>{plan._count.clientSubscriptions}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de Novo Plano */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Criar Plano de Assinatura">
                <form onSubmit={handleCreate} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Nome do Plano</label>
                            <input 
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Black VIP"
                                className="w-full h-14 bg-dark-700 border border-white/8 rounded-xl px-4 text-sm font-medium text-white focus:border-brand-500 outline-none transition-all"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Preço Mensal (R$)</label>
                                <input 
                                    type="number" step="0.01" required
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                    className="w-full h-14 bg-dark-700 border border-white/8 rounded-xl px-4 text-sm font-medium text-white focus:border-brand-500 outline-none transition-all"
                                />
                            </div>
                            <div className="relative group">
                                <label className="text-[10px] font-black uppercase tracking-widest text-brand-500 block mb-2 flex items-center gap-1">
                                    Valor no Pote (R$)
                                    <Settings2 className="w-3 h-3 cursor-help" />
                                </label>
                                <input 
                                    type="number" step="0.01" required
                                    value={formData.potAmount}
                                    onChange={(e) => setFormData({ ...formData, potAmount: Number(e.target.value) })}
                                    className="w-full h-14 bg-dark-700 border border-brand-500/20 rounded-xl px-4 text-sm font-bold text-brand-400 focus:border-brand-500 outline-none transition-all shadow-brand-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Fichas por Atendimento</label>
                            <input 
                                type="number" required
                                value={formData.chipsPerService}
                                onChange={(e) => setFormData({ ...formData, chipsPerService: Number(e.target.value) })}
                                className="w-full h-14 bg-dark-700 border border-white/8 rounded-xl px-4 text-sm font-medium text-white focus:border-brand-500 outline-none transition-all"
                            />
                            <p className="text-[9px] text-zinc-500 mt-2 font-medium italic">* Geralmente 1 ficha. Planos mais caros podem gerar mais pontos para o Barbeiro.</p>
                        </div>
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-zinc-400 font-bold hover:bg-white/5 rounded-xl transition-all uppercase tracking-widest text-[10px]">Cancelar</button>
                        <button type="submit" disabled={loading} className="flex-[2] bg-brand-gradient text-white py-4 px-8 rounded-xl font-black uppercase tracking-widest shadow-brand hover:scale-[1.02] active:scale-95 transition-all text-[11px] flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Criar Plano</>}
                        </button>
                    </div>
                </form>
            </Modal>
        </AdminShell>
    );
}
