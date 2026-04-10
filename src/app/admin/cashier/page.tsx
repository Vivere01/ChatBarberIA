"use client";

import AdminShell from "@/components/admin/admin-shell";
import {
    DollarSign,
    ArrowUpRight, ArrowDownRight, PlusCircle, Loader2,
    TrendingUp, TrendingDown
} from "lucide-react";
import { useState, useEffect, useTransition, Suspense } from "react";
import { Modal } from "@/components/ui/modal";
import { getCashEntries, createCashEntry, type CashEntryFilter } from "@/app/actions/cashier-actions";
import DateRangeFilter from "@/components/admin/date-range-filter";
import { useSearchParams } from "next/navigation";

const paymentLabels: Record<string, string> = {
    CASH: "Dinheiro",
    PIX: "Pix",
    CREDIT_CARD: "Cartão de Crédito",
    DEBIT_CARD: "Cartão de Débito",
    TRANSFER: "Transferência",
    OTHER: "Outro",
};

const filterLabels: Record<CashEntryFilter, string> = {
    today: "Hoje",
    yesterday: "Ontem",
    last7: "Últimos 7 dias",
    thisMonth: "Este mês",
    custom: "Personalizado",
};

const fmt = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

function CashierContent() {
    const searchParams = useSearchParams();
    const [filter, setFilter] = useState<CashEntryFilter>("today");
    const [data, setData] = useState<{ entries: any[]; totalIn: number; totalOut: number; balance: number }>({
        entries: [], totalIn: 0, totalOut: 0, balance: 0,
    });
    const [loadingData, setLoadingData] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [saving, setSaving] = useState(false);

    const loadData = async (f: CashEntryFilter) => {
        setLoadingData(true);
        const from = searchParams.get("from");
        const to = searchParams.get("to");

        if (from && to) {
            const res = await getCashEntries("custom", { from: new Date(from), to: new Date(to) });
            setData(res);
            setFilter("custom");
        } else {
            const res = await getCashEntries(f);
            setData(res);
        }
        setLoadingData(false);
    };

    useEffect(() => { loadData(filter); }, [filter, searchParams]);

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        const formData = new FormData(e.currentTarget);
        const res = await createCashEntry({
            description: formData.get("desc") as string,
            amount: Number(formData.get("value")),
            type: formData.get("type") as "INCOME" | "EXPENSE",
            paymentMethod: formData.get("method") as string,
        });
        if (res.success) {
            setIsModalOpen(false);
            await loadData(filter);
        } else {
            alert("Erro ao registrar lançamento.");
        }
        setSaving(false);
    };

    return (
        <AdminShell>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-display text-2xl font-black uppercase tracking-tighter italic">Controle de Caixa</h1>
                        <p className="text-zinc-500 text-sm mt-1 font-medium italic">Gestão de entradas e saídas</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <DateRangeFilter />
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 bg-brand-gradient text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-brand whitespace-nowrap"
                        >
                            <PlusCircle className="w-4 h-4" />
                            Novo Lançamento
                        </button>
                    </div>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="glass-card rounded-2xl p-6 stat-glow-green">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                                <ArrowUpRight className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total Entradas</p>
                                {loadingData
                                    ? <div className="h-8 w-24 bg-white/5 animate-pulse rounded-lg mt-1" />
                                    : <p className="text-2xl font-black text-green-400">{fmt(data.totalIn)}</p>
                                }
                            </div>
                        </div>
                    </div>
                    <div className="glass-card rounded-2xl p-6 stat-glow-orange">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                                <ArrowDownRight className="w-6 h-6 text-red-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total Saídas</p>
                                {loadingData
                                    ? <div className="h-8 w-24 bg-white/5 animate-pulse rounded-lg mt-1" />
                                    : <p className="text-2xl font-black text-red-400">{fmt(data.totalOut)}</p>
                                }
                            </div>
                        </div>
                    </div>
                    <div className="glass-card rounded-2xl p-6 stat-glow-blue">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${data.balance >= 0 ? "bg-blue-500/10" : "bg-red-500/10"}`}>
                                <DollarSign className={`w-6 h-6 ${data.balance >= 0 ? "text-blue-400" : "text-red-400"}`} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Saldo Atual</p>
                                {loadingData
                                    ? <div className="h-8 w-24 bg-white/5 animate-pulse rounded-lg mt-1" />
                                    : <p className={`text-2xl font-black ${data.balance >= 0 ? "text-blue-400" : "text-red-400"}`}>{fmt(data.balance)}</p>
                                }
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="glass-card rounded-[32px] overflow-hidden border border-white/5">
                    <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <h2 className="text-sm font-black uppercase tracking-widest">Histórico de Lançamentos</h2>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as CashEntryFilter)}
                            className="bg-dark-800 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-bold text-zinc-400 outline-none cursor-pointer"
                        >
                            {(Object.keys(filterLabels) as CashEntryFilter[]).map((k) => (
                                <option key={k} value={k}>{filterLabels[k]}</option>
                            ))}
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-white/5">
                                <tr>
                                    <th className="px-8 py-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest">Descrição</th>
                                    <th className="px-8 py-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest">Tipo</th>
                                    <th className="px-8 py-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest hidden md:table-cell">Método</th>
                                    <th className="px-8 py-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest hidden md:table-cell">Data</th>
                                    <th className="px-8 py-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.02]">
                                {loadingData ? (
                                    [...Array(4)].map((_, i) => (
                                        <tr key={i}>
                                            <td colSpan={5} className="px-8 py-5">
                                                <div className="h-4 bg-white/5 animate-pulse rounded-full w-full" />
                                            </td>
                                        </tr>
                                    ))
                                ) : data.entries.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center text-xs font-black uppercase tracking-widest text-zinc-600 opacity-30">
                                            Nenhum lançamento no período
                                        </td>
                                    </tr>
                                ) : (
                                    data.entries.map((entry) => (
                                        <tr key={entry.id} className="hover:bg-white/[0.01] transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${entry.type === "INCOME" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                                                        {entry.type === "INCOME" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                                    </div>
                                                    <span className="text-xs font-bold text-zinc-300 uppercase tracking-tight">{entry.description}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${entry.type === "INCOME" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                                                    {entry.type === "INCOME" ? "Entrada" : "Saída"}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 hidden md:table-cell">
                                                <span className="text-[10px] font-bold text-zinc-500">{paymentLabels[entry.paymentMethod] ?? entry.paymentMethod}</span>
                                            </td>
                                            <td className="px-8 py-5 hidden md:table-cell">
                                                <span className="text-[10px] font-bold text-zinc-500">
                                                    {new Date(entry.entryDate).toLocaleDateString("pt-BR")}
                                                </span>
                                            </td>
                                            <td className={`px-8 py-5 text-right font-black text-xs ${entry.type === "INCOME" ? "text-green-400" : "text-red-400"}`}>
                                                {entry.type === "INCOME" ? "+" : "-"}{fmt(entry.amount)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal de Lançamento */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Lançamento">
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-2">
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Descrição</span>
                        <input name="desc" required className="custom-input h-14" placeholder="Ex: Venda de Produto, Aluguel, etc." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Valor</span>
                            <input name="value" type="number" step="0.01" min="0.01" required className="custom-input h-14" placeholder="0.00" />
                        </div>
                        <div className="space-y-2">
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Tipo</span>
                            <select name="type" required className="custom-input h-14 cursor-pointer">
                                <option value="INCOME">Entrada (+)</option>
                                <option value="EXPENSE">Saída (-)</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Método de Pagamento</span>
                        <select name="method" required className="custom-input h-14 cursor-pointer">
                            <option value="DINHEIRO">Dinheiro</option>
                            <option value="PIX">Pix</option>
                            <option value="CARTÃO_CRÉDITO">Cartão de Crédito</option>
                            <option value="CARTÃO_DÉBITO">Cartão de Débito</option>
                        </select>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-14 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Cancelar</button>
                        <button type="submit" disabled={saving} className="flex-[2] h-14 bg-brand-gradient text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-brand flex items-center justify-center">
                            {saving ? <Loader2 className="animate-spin w-5 h-5" /> : "REGISTRAR LANÇAMENTO"}
                        </button>
                    </div>
                </form>
            </Modal>

            <style jsx global>{`
                .custom-input { width: 100%; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 0 20px; font-size: 13px; font-weight: 700; color: white; outline: none; transition: all 0.2s; }
                .custom-input:focus { border-color: #4f46e5; background: rgba(255,255,255,0.05); }
                select.custom-input { appearance: none; }
            `}</style>
        </AdminShell>
    );
}

export default function CashierPage() {
    return (
        <Suspense fallback={
            <AdminShell>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
                </div>
            </AdminShell>
        }>
            <CashierContent />
        </Suspense>
    );
}
