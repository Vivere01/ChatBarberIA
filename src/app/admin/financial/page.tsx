import AdminShell from "@/components/admin/admin-shell";
import {
    BarChart3, TrendingUp, TrendingDown, Users, CreditCard, ArrowUpRight
} from "lucide-react";

const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const monthlyData = [
    { month: "Mar", revenue: 0, costs: 0 },
];

const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));

const topServices: any[] = [];

export default function FinancialPage() {
    const currentMonth = monthlyData[monthlyData.length - 1];
    const prevMonth = monthlyData.length > 1 ? monthlyData[monthlyData.length - 2] : currentMonth;
    const growth = prevMonth.revenue > 0 ? ((currentMonth.revenue - prevMonth.revenue) / prevMonth.revenue * 100).toFixed(1) : "0";
    const profit = currentMonth.revenue - currentMonth.costs;

    return (
        <AdminShell>
            <div className="space-y-6">
                <div>
                    <h1 className="font-display text-2xl font-bold">Dashboard Financeiro</h1>
                    <p className="text-zinc-500 text-sm mt-1">Março 2026 · Visão consolidada</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="glass-card rounded-2xl p-5 stat-glow-green">
                        <p className="text-zinc-500 text-sm mb-3">Receita do Mês</p>
                        <p className="text-2xl font-bold text-green-400">{fmt(currentMonth.revenue)}</p>
                        <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> +{growth}% vs mês anterior
                        </p>
                    </div>
                    <div className="glass-card rounded-2xl p-5 stat-glow-orange">
                        <p className="text-zinc-500 text-sm mb-3">Custos do Mês</p>
                        <p className="text-2xl font-bold text-red-400">{fmt(currentMonth.costs)}</p>
                        <p className="text-xs text-zinc-500 mt-1">Fixos + Variáveis</p>
                    </div>
                    <div className="glass-card rounded-2xl p-5 stat-glow-blue">
                        <p className="text-zinc-500 text-sm mb-3">Lucro Líquido</p>
                        <p className="text-2xl font-bold text-blue-400">{fmt(profit)}</p>
                        <p className="text-xs text-blue-400 mt-1">{((profit / currentMonth.revenue) * 100).toFixed(0)}% margem</p>
                    </div>
                    <div className="glass-card rounded-2xl p-5">
                        <p className="text-zinc-500 text-sm mb-3">Ticket Médio</p>
                        <p className="text-2xl font-bold">{fmt(currentMonth.revenue / 284)}</p>
                        <p className="text-xs text-zinc-500 mt-1">284 atendimentos</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Revenue Chart (CSS-based bar chart) */}
                    <div className="lg:col-span-2 glass-card rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-semibold">Receita vs Custos — 6 meses</h2>
                            <div className="flex items-center gap-4 text-xs text-zinc-500">
                                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-400" />Receita</span>
                                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-400" />Custos</span>
                            </div>
                        </div>
                        <div className="flex items-end gap-4 h-48">
                            {monthlyData.map((d, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                    <div className="w-full flex gap-1 items-end" style={{ height: "160px" }}>
                                        <div
                                            className="flex-1 rounded-t-lg bg-green-500/40 hover:bg-green-500/60 transition-colors"
                                            style={{ height: `${(d.revenue / maxRevenue) * 160}px` }}
                                            title={fmt(d.revenue)}
                                        />
                                        <div
                                            className="flex-1 rounded-t-lg bg-red-500/30 hover:bg-red-500/50 transition-colors"
                                            style={{ height: `${(d.costs / maxRevenue) * 160}px` }}
                                            title={fmt(d.costs)}
                                        />
                                    </div>
                                    <span className="text-xs text-zinc-500">{d.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Services */}
                    <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-semibold">Top Serviços</h2>
                            <BarChart3 className="w-4 h-4 text-brand-400" />
                        </div>
                        <div className="space-y-4">
                            {topServices.map((s, i) => {
                                const pct = (s.revenue / topServices[0].revenue) * 100;
                                return (
                                    <div key={i}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <p className="text-sm font-medium">{s.name}</p>
                                            <p className="text-sm font-bold text-green-400">{fmt(s.revenue)}</p>
                                        </div>
                                        <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
                                            <div className="h-full bg-brand-gradient rounded-full" style={{ width: `${pct}%` }} />
                                        </div>
                                        <p className="text-xs text-zinc-600 mt-1">{s.count} atendimentos</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </AdminShell>
    );
}
