"use client";

import AdminShell from "@/components/admin/admin-shell";
import {
    TrendingUp, TrendingDown, DollarSign, CreditCard,
    ArrowUpRight, ArrowDownRight, PlusCircle, X, Loader2
} from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";

// This would normally come from a server action
const initialEntries: any[] = [];

export default function CashierPage() {
    const [entries, setEntries] = useState(initialEntries);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const totalIn = entries.filter(e => e.type === "income").reduce((s, e) => s + e.value, 0);
    const totalOut = entries.filter(e => e.type === "expense").reduce((s, e) => s + e.value, 0);
    const balance = totalIn - totalOut;

    const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        
        const newEntry = {
            desc: formData.get("desc"),
            value: Number(formData.get("value")),
            type: formData.get("type"),
            method: formData.get("method"),
            date: new Date().toLocaleDateString("pt-BR")
        };

        // In a real app, call a server action here
        setEntries([newEntry, ...entries]);
        setIsModalOpen(false);
        setLoading(false);
    };

    return (
        <AdminShell>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-display text-2xl font-bold italic uppercase tracking-tighter">Caixa</h1>
                        <p className="text-zinc-500 text-sm mt-1">Movimentações financeiras do dia</p>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-brand-gradient text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-brand"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Novo Lançamento
                    </button>
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
                                <p className="text-2xl font-black text-green-400">{fmt(totalIn)}</p>
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
                                <p className="text-2xl font-black text-red-400">{fmt(totalOut)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card rounded-2xl p-6 stat-glow-blue">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${balance >= 0 ? "bg-blue-500/10" : "bg-red-500/10"}`}>
                                <DollarSign className={`w-6 h-6 ${balance >= 0 ? "text-blue-400" : "text-red-400"}`} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Saldo Atual</p>
                                <p className={`text-2xl font-black ${balance >= 0 ? "text-blue-400" : "text-red-400"}`}>{fmt(balance)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="glass-card rounded-[32px] overflow-hidden border border-white/5">
                    <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <h2 className="text-sm font-black uppercase tracking-widest">Histórico de Lançamentos</h2>
                        <select className="bg-dark-800 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-bold text-zinc-400 outline-none">
                            <option>Hoje</option>
                            <option>Ontem</option>
                            <option>Últimos 7 dias</option>
                        </select>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-white/5">
                                <tr>
                                    <th className="px-8 py-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest">Descrição</th>
                                    <th className="px-8 py-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest">Tipo</th>
                                    <th className="px-8 py-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest">Método</th>
                                    <th className="px-8 py-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.02]">
                                {entries.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center text-xs font-black uppercase tracking-widest text-zinc-600 opacity-30">
                                            Nenhum lançamento registrado hoje
                                        </td>
                                    </tr>
                                ) : (
                                    entries.map((entry, i) => (
                                        <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${entry.type === "income" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                                                        {entry.type === "income" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                                    </div>
                                                    <span className="text-xs font-bold text-zinc-300 uppercase tracking-tight">{entry.desc}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${entry.type === "income" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                                                    {entry.type === "income" ? "Entrada" : "Saída"}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-[10px] font-bold text-zinc-500 italic">{entry.method}</span>
                                            </td>
                                            <td className={`px-8 py-5 text-right font-black text-xs ${entry.type === "income" ? "text-green-400" : "text-red-400"}`}>
                                                {entry.type === "income" ? "+" : "-"}{fmt(entry.value)}
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
                            <input name="value" type="number" step="0.01" required className="custom-input h-14" placeholder="0.00" />
                        </div>
                        <div className="space-y-2">
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Tipo</span>
                            <select name="type" required className="custom-input h-14 cursor-pointer">
                                <option value="income">Entrada (+)</option>
                                <option value="expense">Saída (-)</option>
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
                        <button type="submit" disabled={loading} className="flex-[2] h-14 bg-brand-gradient text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-brand">
                            {loading ? <Loader2 className="animate-spin mx-auto w-5 h-5" /> : "REGISTRAR LANÇAMENTO"}
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
