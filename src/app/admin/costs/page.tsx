"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/admin-shell";
import {
    Plus, TrendingDown, MoreVertical,
    Trash2, Edit2, Calendar,
    DollarSign, Loader2, Search,
    Filter, X
} from "lucide-react";
import { EmptyState } from "@/components/admin/empty-state";
import { Modal } from "@/components/ui/modal";
import {
    getCosts,
    createCost,
    updateCost,
    deleteCost
} from "@/app/actions/cost-actions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CostsPage() {
    const [costs, setCosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCost, setEditingCost] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        type: "FIXED",
        amount: "",
        dueDay: "",
        notes: ""
    });

    useEffect(() => {
        loadCosts();
    }, []);

    async function loadCosts() {
        setLoading(true);
        try {
            const data = await getCosts();
            setCosts(data);
        } catch (error) {
            toast.error("Erro ao carregar custos");
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                ...formData,
                amount: String(formData.amount),
                dueDay: formData.dueDay ? parseInt(String(formData.dueDay)) : null
            };

            let result;
            if (editingCost) {
                result = await updateCost(editingCost.id, payload);
            } else {
                result = await createCost(payload);
            }

            if (result?.success) {
                toast.success(editingCost ? "Custo atualizado com sucesso" : "Custo lançado com sucesso");
                setIsModalOpen(false);
                setEditingCost(null);
                resetForm();
                loadCosts();
            } else {
                toast.error(result?.error || "Erro ao salvar custo. Verifique os dados.");
            }
        } catch (error: any) {
            toast.error(error?.message || "Erro inesperado ao salvar custo");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja excluir este custo?")) return;

        try {
            await deleteCost(id);
            toast.success("Custo excluído");
            loadCosts();
        } catch (error) {
            toast.error("Erro ao excluir custo");
        }
    }

    function resetForm() {
        setFormData({
            name: "",
            type: "FIXED",
            amount: "",
            dueDay: "",
            notes: ""
        });
    }

    function handleEdit(cost: any) {
        setEditingCost(cost);
        setFormData({
            name: cost.name,
            type: cost.type,
            amount: cost.amount.toString(),
            dueDay: cost.dueDay ? cost.dueDay.toString() : "",
            notes: cost.notes || ""
        });
        setIsModalOpen(true);
    }

    const filteredCosts = costs.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalFixed = costs.filter(c => c.type === 'FIXED').reduce((acc, curr) => acc + curr.amount, 0);
    const totalVariable = costs.filter(c => c.type === 'VARIABLE').reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <AdminShell>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-display text-3xl font-bold tracking-tight">Gestão de Custos</h1>
                        <p className="text-zinc-500 text-sm mt-1 uppercase font-black tracking-widest opacity-60">Financeiro & Despesas Mensais</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingCost(null);
                            resetForm();
                            setIsModalOpen(true);
                        }}
                        className="flex items-center justify-center gap-2 bg-brand-gradient text-white px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-brand/20 shadow-xl"
                    >
                        <Plus className="w-5 h-5" />
                        Lançar Novo Custo
                    </button>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MetricCard
                        label="Total em Despesas"
                        value={totalFixed + totalVariable}
                        color="orange"
                        icon={DollarSign}
                    />
                    <MetricCard
                        label="Custos Fixos"
                        value={totalFixed}
                        color="zinc"
                        icon={Calendar}
                    />
                    <MetricCard
                        label="Custos Variáveis"
                        value={totalVariable}
                        color="zinc"
                        icon={TrendingDown}
                    />
                </div>

                {/* Filters & Search */}
                <div className="bg-dark-900/50 p-4 border border-white/5 rounded-[32px] flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                        <input
                            type="text"
                            placeholder="Buscar custo pelo nome (ex: Aluguel, Luz...)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-14 bg-dark-950/50 border border-white/5 rounded-2xl pl-12 pr-4 text-sm font-medium focus:border-brand-500/50 outline-none transition-all"
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <button className="flex-1 md:flex-none h-14 px-6 bg-dark-950/50 border border-white/5 rounded-2xl text-zinc-400 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/5 transition-all">
                            <Filter className="w-4 h-4" /> Filtros
                        </button>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="h-[400px] flex items-center justify-center border border-dashed border-white/5 rounded-[40px]">
                        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                    </div>
                ) : costs.length === 0 ? (
                    <EmptyState
                        icon={TrendingDown}
                        title="Nenhum custo lançado"
                        description="Lance aqui suas despesas fixas e variáveis para ter o controle total do seu lucro real."
                        buttonText="Lançar meu primeiro custo"
                    />
                ) : (
                    <div className="bg-white/[0.01] border border-white/5 rounded-[40px] overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-white/5">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Descrição</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Tipo</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Vencimento</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Valor</th>
                                    <th className="px-8 py-5 text-right w-20"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.02]">
                                {filteredCosts.map((cost) => (
                                    <tr key={cost.id} className="group hover:bg-white/[0.01] transition-all cursor-default">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-brand-500/10 transition-all">
                                                    <TrendingDown className="w-5 h-5 text-zinc-600 group-hover:text-brand-500" />
                                                </div>
                                                <span className="text-sm font-bold text-white uppercase tracking-tight">{cost.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                cost.type === 'FIXED' ? "bg-blue-500/10 text-blue-500" : "bg-purple-500/10 text-purple-500"
                                            )}>
                                                {cost.type === 'FIXED' ? 'Fixo' : 'Variável'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center text-xs font-bold text-zinc-500 tabular-nums uppercase">
                                            {cost.dueDay ? `Dia ${cost.dueDay}` : '—'}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className="text-sm font-black text-white tabular-nums">
                                                R$ {cost.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button
                                                    onClick={() => handleEdit(cost)}
                                                    className="p-2 text-zinc-500 hover:text-white transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cost.id)}
                                                    className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal de Lançamento */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingCost ? "Editar Custo" : "Lançar Custo"}
                maxWidth="2xl"
            >
                <form onSubmit={handleSubmit} className="space-y-8 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SectionForm label="NOME DO CUSTO">
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Aluguel, Energia, Materiais..."
                                className="w-full h-14 bg-dark-900 border border-white/5 rounded-2xl px-5 text-sm font-medium focus:border-brand-500/50 outline-none transition-all"
                            />
                        </SectionForm>
                        <SectionForm label="TIPO">
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full h-14 bg-dark-900 border border-white/5 rounded-2xl px-5 text-sm font-black uppercase tracking-widest outline-none focus:border-brand-500/50 transition-all cursor-pointer"
                            >
                                <option value="FIXED">Custo Fixo</option>
                                <option value="VARIABLE">Custo Variável</option>
                            </select>
                        </SectionForm>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SectionForm label="VALOR (R$)">
                            <div className="relative">
                                <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    required
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="0,00"
                                    className="w-full h-14 bg-dark-900 border border-white/5 rounded-2xl pl-12 pr-5 text-sm font-black tabular-nums focus:border-brand-500/50 outline-none transition-all"
                                />
                            </div>
                        </SectionForm>
                        <SectionForm label="DIA DO VENCIMENTO">
                            <div className="relative">
                                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                                <input
                                    type="number"
                                    min="1"
                                    max="31"
                                    value={formData.dueDay}
                                    onChange={(e) => setFormData({ ...formData, dueDay: e.target.value })}
                                    placeholder="Dia 1 a 31"
                                    className="w-full h-14 bg-dark-900 border border-white/5 rounded-2xl pl-12 pr-5 text-sm font-medium focus:border-brand-500/50 outline-none transition-all"
                                />
                            </div>
                        </SectionForm>
                    </div>

                    <SectionForm label="NOTAS ADICIONAIS">
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Descreva detalhes desta despesa..."
                            className="w-full h-32 bg-dark-900 border border-white/5 rounded-3xl p-5 text-sm font-medium focus:border-brand-500/50 outline-none transition-all resize-none"
                        />
                    </SectionForm>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 h-16 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-[2] h-16 bg-brand-gradient text-white rounded-2xl font-black uppercase text-xs tracking-[3px] shadow-brand/20 shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Salvar Lançamento"}
                        </button>
                    </div>
                </form>
            </Modal>
        </AdminShell>
    );
}

function MetricCard({ label, value, color, icon: Icon }: any) {
    return (
        <div className="bg-dark-900/50 border border-white/5 p-8 rounded-[40px] relative overflow-hidden group">
            <div className={cn(
                "absolute -right-4 -bottom-4 w-24 h-24 blur-[60px] transition-all group-hover:scale-150",
                color === 'orange' ? "bg-brand-500/10" : "bg-white/5"
            )} />
            <div className="flex flex-col gap-4 relative z-10">
                <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all",
                    color === 'orange' ? "bg-brand-500/10 border-brand-500/20 text-brand-500" : "bg-white/5 border-white/5 text-zinc-600 group-hover:text-white"
                )}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{label}</h3>
                    <p className="text-3xl font-black text-white tabular-nums mt-1">
                        R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                </div>
            </div>
        </div>
    );
}

function SectionForm({ label, children }: { label: string, children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">{label}</label>
            {children}
        </div>
    );
}
