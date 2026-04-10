import AdminShell from "@/components/admin/admin-shell";
import {
    BarChart3, TrendingUp, TrendingDown, Users, CreditCard, ArrowUpRight, DollarSign, Wallet, Target
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getDashboardData } from "@/app/actions/dashboard-actions";
import DateRangeFilter from "@/components/admin/date-range-filter";

export default async function FinancialPage({
    searchParams
}: {
    searchParams: { from?: string; to?: string }
}) {
    // Converte strings da URL para objetos Date
    const dateRange = searchParams.from && searchParams.to ? {
        from: new Date(searchParams.from),
        to: new Date(searchParams.to)
    } : undefined;

    const data = await getDashboardData(dateRange);

    // Cálculos Financeiros
    const revenue = data.monthRevenue;
    const expense = data.cashOut;
    const profit = revenue - expense;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    
    // Formatação de período para o cabeçalho
    const periodLabel = dateRange 
        ? `${new Date(searchParams.from!).toLocaleDateString('pt-BR')} até ${new Date(searchParams.to!).toLocaleDateString('pt-BR')}`
        : "Mês Atual";

    return (
        <AdminShell>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-display text-2xl font-black uppercase tracking-tighter italic text-white leading-none">Dashboard Financeiro</h1>
                        <p className="text-zinc-500 text-sm mt-2 font-medium">Período: <span className="text-zinc-300">{periodLabel}</span></p>
                    </div>
                    <DateRangeFilter />
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="glass-card rounded-[2rem] p-6 stat-glow-green border border-white/5 bg-dark-800/20">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-green-400" />
                            </div>
                            <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Receita Bruta</p>
                        </div>
                        <p className="text-3xl font-black text-green-400 font-display italic tracking-tighter">{formatCurrency(revenue)}</p>
                        <div className="flex items-center gap-2 mt-2">
                             <TrendingUp className="w-3 h-3 text-green-500" />
                             <span className="text-[10px] text-zinc-600 font-bold uppercase">Entradas totais</span>
                        </div>
                    </div>

                    <div className="glass-card rounded-[2rem] p-6 stat-glow-orange border border-white/5 bg-dark-800/20">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                                <TrendingDown className="w-5 h-5 text-red-400" />
                            </div>
                            <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Custos Totais</p>
                        </div>
                        <p className="text-3xl font-black text-red-400 font-display italic tracking-tighter">{formatCurrency(expense)}</p>
                        <div className="flex items-center gap-2 mt-2">
                             <span className="text-[10px] text-zinc-600 font-bold uppercase italic">Saídas manuais + fixas</span>
                        </div>
                    </div>

                    <div className="glass-card rounded-[2rem] p-6 stat-glow-blue border border-white/5 bg-dark-800/20">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-blue-400" />
                            </div>
                            <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Lucro Líquido</p>
                        </div>
                        <p className="text-3xl font-black text-blue-400 font-display italic tracking-tighter">{formatCurrency(profit)}</p>
                        <div className="flex items-center gap-2 mt-2 text-zinc-600 uppercase font-black text-[10px]">
                             Margem de {margin.toFixed(1)}%
                        </div>
                    </div>

                    <div className="glass-card rounded-[2rem] p-6 stat-glow-purple border border-white/5 bg-dark-800/20">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <Target className="w-5 h-5 text-purple-400" />
                            </div>
                            <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">LTV Médio</p>
                        </div>
                        <p className="text-3xl font-black text-white font-display italic tracking-tighter">{formatCurrency(data.avgLTV)}</p>
                        <p className="text-[10px] text-zinc-600 mt-2 font-bold uppercase">Valor médio por cliente</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="glass-card rounded-[2.5rem] p-8 border border-white/5 bg-dark-800/10">
                         <div className="flex items-center justify-between mb-8">
                            <h3 className="font-display font-black uppercase italic tracking-tighter text-zinc-300">Desempenho Geral</h3>
                            <Users className="w-5 h-5 text-zinc-600" />
                         </div>
                         <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Ticket Médio</span>
                                <span className="text-lg font-black text-white italic">{formatCurrency(data.avgTicket)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Agendamentos Únicos</span>
                                <span className="text-lg font-black text-white italic">{data.appointmentsCount}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Base de Clientes</span>
                                <span className="text-lg font-black text-white italic">{data.clientsCount}</span>
                            </div>
                         </div>
                    </div>

                    <div className="glass-card rounded-[2.5rem] p-12 flex flex-col items-center justify-center min-h-[300px] text-center bg-dark-800/5">
                        <div className="w-20 h-20 bg-dark-700/50 rounded-full flex items-center justify-center mb-6">
                            <BarChart3 className="w-10 h-10 text-zinc-700" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-600 uppercase italic tracking-tighter">Ranking de Serviços</h3>
                        <p className="text-sm text-zinc-600 mt-2 max-w-xs">Em breve: análise proporcional por categoria de serviço.</p>
                    </div>
                </div>
            </div>
        </AdminShell>
    );
}
