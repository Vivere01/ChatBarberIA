import AdminShell from "@/components/admin/admin-shell";
import {
    BarChart3, TrendingUp, TrendingDown, Users, CreditCard, ArrowUpRight, DollarSign, Wallet
} from "lucide-react";

const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export default function FinancialPage() {
    const currentMonth = { revenue: 0, costs: 0 };
    const monthlyData: any[] = [];
    const topServices: any[] = [];
    const profit = currentMonth.revenue - currentMonth.costs;

    return (
        <AdminShell>
            <div className="space-y-6">
                <div>
                    <h1 className="font-display text-2xl font-bold font-black uppercase tracking-tighter italic">Dashboard Financeiro</h1>
                    <p className="text-zinc-500 text-sm mt-1">Março 2026 · Visão consolidada</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="glass-card rounded-2xl p-5 stat-glow-green">
                        <p className="text-zinc-500 text-sm mb-3 font-bold uppercase tracking-widest text-[10px]">Receita do Mês</p>
                        <p className="text-2xl font-bold text-green-400">{fmt(currentMonth.revenue)}</p>
                        <p className="text-xs text-zinc-600 mt-1">0% vs mês anterior</p>
                    </div>
                    <div className="glass-card rounded-2xl p-5 stat-glow-orange">
                        <p className="text-zinc-500 text-sm mb-3 font-bold uppercase tracking-widest text-[10px]">Custos do Mês</p>
                        <p className="text-2xl font-bold text-red-400">{fmt(currentMonth.costs)}</p>
                        <p className="text-xs text-zinc-600 mt-1">Fixos + Variáveis</p>
                    </div>
                    <div className="glass-card rounded-2xl p-5 stat-glow-blue">
                        <p className="text-zinc-500 text-sm mb-3 font-bold uppercase tracking-widest text-[10px]">Lucro Líquido</p>
                        <p className="text-2xl font-bold text-blue-400">{fmt(profit)}</p>
                        <p className="text-xs text-zinc-600 mt-1">0% margem</p>
                    </div>
                    <div className="glass-card rounded-2xl p-5">
                        <p className="text-zinc-500 text-sm mb-3 font-bold uppercase tracking-widest text-[10px]">Ticket Médio</p>
                        <p className="text-2xl font-bold">{fmt(0)}</p>
                        <p className="text-xs text-zinc-600 mt-1">0 atendimentos</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 glass-card rounded-2xl p-12 flex flex-col items-center justify-center min-h-[400px] text-center opacity-30">
                        <div className="w-20 h-20 bg-dark-700/50 rounded-full flex items-center justify-center mb-6">
                            <BarChart3 className="w-10 h-10 text-zinc-600" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-300 uppercase italic tracking-tighter">Histórico de Faturamento</h3>
                        <p className="text-sm text-zinc-500 mt-2 max-w-xs">Os gráficos de evolução mensal serão gerados automaticamente assim que houver movimentação no caixa.</p>
                    </div>

                    <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center min-h-[400px] text-center opacity-30">
                        <div className="w-20 h-20 bg-dark-700/50 rounded-full flex items-center justify-center mb-6">
                            <Wallet className="w-10 h-10 text-zinc-600" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-300 uppercase italic tracking-tighter">Top Serviços</h3>
                        <p className="text-sm text-zinc-500 mt-2 max-w-xs">Ranking dos serviços mais lucrativos da sua barbearia.</p>
                    </div>
                </div>
            </div>
        </AdminShell>
    );
}
