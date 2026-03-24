import AdminShell from "@/components/admin/admin-shell";
import {
    TrendingUp, TrendingDown, DollarSign, CreditCard,
    ArrowUpRight, ArrowDownRight, PlusCircle
} from "lucide-react";

const income: any[] = [];

export default function CashierPage() {
    const totalIn = income.filter(e => e.type === "income").reduce((s, e) => s + e.value, 0);
    const totalOut = income.filter(e => e.type === "expense").reduce((s, e) => s + e.value, 0);
    const balance = totalIn - totalOut;

    const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

    return (
        <AdminShell>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-display text-2xl font-bold">Caixa</h1>
                        <p className="text-zinc-500 text-sm mt-1">Movimentações financeiras</p>
                    </div>
                    <button className="flex items-center gap-2 bg-brand-gradient text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-brand-sm">
                        <PlusCircle className="w-4 h-4" />
                        Novo Lançamento
                    </button>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="glass-card rounded-2xl p-5 stat-glow-green">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                <ArrowUpRight className="w-5 h-5 text-green-400" />
                            </div>
                            <p className="text-sm text-zinc-400">Total Entradas</p>
                        </div>
                        <p className="text-2xl font-bold text-green-400">{fmt(totalIn)}</p>
                    </div>
                    <div className="glass-card rounded-2xl p-5 stat-glow-orange">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                                <ArrowDownRight className="w-5 h-5 text-red-400" />
                            </div>
                            <p className="text-sm text-zinc-400">Total Saídas</p>
                        </div>
                        <p className="text-2xl font-bold text-red-400">{fmt(totalOut)}</p>
                    </div>
                    <div className={`glass-card rounded-2xl p-5 ${balance >= 0 ? "stat-glow-blue" : "stat-glow-orange"}`}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${balance >= 0 ? "bg-blue-500/10" : "bg-red-500/10"}`}>
                                <DollarSign className={`w-5 h-5 ${balance >= 0 ? "text-blue-400" : "text-red-400"}`} />
                            </div>
                            <p className="text-sm text-zinc-400">Saldo do Caixa</p>
                        </div>
                        <p className={`text-2xl font-bold ${balance >= 0 ? "text-blue-400" : "text-red-400"}`}>{fmt(balance)}</p>
                    </div>
                </div>

                {/* Entries Table */}
                <div className="glass-card rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                        <h2 className="font-semibold">Lançamentos</h2>
                        <div className="flex gap-2">
                            <select className="bg-dark-700 border border-white/8 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none">
                                <option>Março 2026</option>
                                <option>Fevereiro 2026</option>
                            </select>
                        </div>
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Descrição</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden md:table-cell">Data</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden md:table-cell">Método</th>
                                <th className="text-right px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/4">
                            {income.map((entry, i) => (
                                <tr key={i} className="hover:bg-white/2 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${entry.type === "income" ? "bg-green-500/10" : "bg-red-500/10"
                                                }`}>
                                                {entry.type === "income"
                                                    ? <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                                                    : <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                                                }
                                            </div>
                                            <p className="text-sm">{entry.desc}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-zinc-400 hidden md:table-cell">{entry.date}</td>
                                    <td className="px-6 py-4 hidden md:table-cell">
                                        <span className="text-xs bg-white/5 px-2 py-1 rounded-full text-zinc-400">
                                            <CreditCard className="w-3 h-3 inline mr-1" />{entry.method}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 text-right font-semibold text-sm ${entry.type === "income" ? "text-green-400" : "text-red-400"
                                        }`}>
                                        {entry.type === "income" ? "+" : "-"}{fmt(entry.value)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminShell>
    );
}
