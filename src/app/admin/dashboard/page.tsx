import AdminShell from "@/components/admin/admin-shell";
import {
    TrendingUp, Users, Calendar, DollarSign, Scissors,
    ArrowUpRight, ArrowDownRight, Star, Clock
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getDashboardData } from "@/app/actions/dashboard-actions";

const statusConfig: Record<string, { label: string; color: string }> = {
    completed: { label: "Concluído", color: "text-green-400 bg-green-500/10" },
    in_progress: { label: "Em andamento", color: "text-brand-400 bg-brand-500/10" },
    scheduled: { label: "Agendado", color: "text-blue-400 bg-blue-500/10" },
    confirmed: { label: "Confirmado", color: "text-cyan-400 bg-cyan-500/10" },
    cancelled: { label: "Cancelado", color: "text-red-400 bg-red-500/10" },
    no_show: { label: "Não Compareceu", color: "text-zinc-400 bg-zinc-500/10" },
};

const levelConfig: Record<string, { emoji: string; class: string }> = {
    BRONZE: { emoji: "🥉", class: "badge-bronze" },
    PRATA: { emoji: "🥈", class: "badge-prata" },
    OURO: { emoji: "🥇", class: "badge-ouro" },
    PLATINA: { emoji: "⚪", class: "badge-platina" },
    DIAMANTE: { emoji: "💎", class: "badge-diamante" },
    RUBI: { emoji: "❤️", class: "badge-rubi" },
};

export default async function DashboardPage() {
    const data = await getDashboardData();

    const today = new Date().toLocaleDateString("pt-BR", {
        weekday: "long", day: "numeric", month: "long"
    });

    const stats = [
        {
            label: "Receita do Mês",
            value: formatCurrency(data.monthRevenue),
            icon: DollarSign,
            glow: "stat-glow-green",
            color: "text-green-400",
            bg: "bg-green-500/10",
        },
        {
            label: "Agendamentos",
            value: String(data.appointmentsCount),
            icon: Calendar,
            glow: "stat-glow-blue",
            color: "text-blue-400",
            bg: "bg-blue-500/10",
        },
        {
            label: "Clientes Ativos",
            value: String(data.clientsCount),
            icon: Users,
            glow: "stat-glow-purple",
            color: "text-purple-400",
            bg: "bg-purple-500/10",
        },
        {
            label: "Ticket Médio",
            value: formatCurrency(data.avgTicket),
            icon: TrendingUp,
            glow: "stat-glow-orange",
            color: "text-brand-400",
            bg: "bg-brand-500/10",
        },
    ];

    return (
        <AdminShell>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="font-display text-2xl font-bold">Dashboard</h1>
                    <p className="text-zinc-500 text-sm mt-1">Visão geral do seu negócio hoje</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className={`glass-card rounded-2xl p-5 ${stat.glow}`}>
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                            </div>
                            <p className="text-2xl font-bold font-display">{stat.value}</p>
                            <p className="text-zinc-500 text-sm mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Today's Appointments */}
                    <div className="lg:col-span-2 glass-card rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="font-semibold text-lg">Agenda de Hoje</h2>
                                <p className="text-zinc-500 text-sm capitalize">{today}</p>
                            </div>
                            <a href="/admin/appointments" className="text-xs text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1">
                                Ver tudo <ArrowUpRight className="w-3 h-3" />
                            </a>
                        </div>
                        <div className="space-y-3">
                            {data.todayAppointments.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-zinc-500 text-sm italic">Nenhum agendamento para hoje</p>
                                </div>
                            ) : data.todayAppointments.map((apt) => {
                                const cfg = statusConfig[apt.status] ?? statusConfig["scheduled"];
                                return (
                                    <div key={apt.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/3 transition-colors group">
                                        <div className="text-center w-14 flex-shrink-0">
                                            <Clock className="w-3.5 h-3.5 text-zinc-600 mx-auto mb-0.5" />
                                            <p className="text-sm font-semibold">{apt.time}</p>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{apt.client}</p>
                                            <p className="text-zinc-500 text-xs">{apt.service} · {apt.staff}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="font-semibold text-sm">{formatCurrency(apt.value)}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.color}`}>
                                                {cfg.label}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Top Staff Ranking */}
                    <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="font-semibold text-lg">Ranking Barbeiros</h2>
                                <p className="text-zinc-500 text-sm">Este mês</p>
                            </div>
                            <Star className="w-4 h-4 text-brand-400" />
                        </div>
                        <div className="space-y-4">
                            {data.topStaff.length === 0 ? (
                                <div className="text-center py-10 border border-dashed border-white/5 rounded-xl">
                                    <p className="text-zinc-600 text-xs">Sem profissionais ativos</p>
                                </div>
                            ) : data.topStaff.map((staff, i) => {
                                const lv = levelConfig[staff.level] ?? levelConfig["BRONZE"];
                                const initials = staff.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();
                                return (
                                    <div key={staff.id} className="flex items-center gap-3">
                                        <span className="text-lg font-bold text-zinc-600 w-5">#{i + 1}</span>
                                        <div className="w-9 h-9 rounded-full bg-dark-600 flex items-center justify-center text-xs font-bold flex-shrink-0 overflow-hidden">
                                            {staff.avatarUrl
                                                ? <img src={staff.avatarUrl} alt={staff.name} className="w-full h-full object-cover" />
                                                : initials
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{staff.name}</p>
                                            <p className="text-zinc-500 text-xs">{formatCurrency(staff.revenue)}</p>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${lv.class}`}>
                                            {lv.emoji} {staff.level}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/5">
                            <a href="/admin/commissions" className="text-xs text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1">
                                Ver comissões <ArrowUpRight className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Novo Agendamento", href: "/admin/appointments", icon: Calendar, color: "brand" },
                        { label: "Cadastrar Cliente", href: "/admin/clients", icon: Users, color: "blue" },
                        { label: "Lançar Caixa", href: "/admin/cashier", icon: DollarSign, color: "green" },
                        { label: "Ver Comissões", href: "/admin/commissions", icon: Scissors, color: "purple" },
                    ].map((action) => (
                        <a
                            key={action.label}
                            href={action.href}
                            className="glass-card rounded-xl p-4 flex items-center gap-3 hover:border-white/12 transition-all hover:-translate-y-0.5 group"
                        >
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${action.color === "brand" ? "bg-brand-500/15" :
                                action.color === "blue" ? "bg-blue-500/15" :
                                    action.color === "green" ? "bg-green-500/15" :
                                        "bg-purple-500/15"
                                }`}>
                                <action.icon className={`w-4 h-4 ${action.color === "brand" ? "text-brand-400" :
                                    action.color === "blue" ? "text-blue-400" :
                                        action.color === "green" ? "text-green-400" :
                                            "text-purple-400"
                                    }`} />
                            </div>
                            <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                                {action.label}
                            </span>
                        </a>
                    ))}
                </div>
            </div>
        </AdminShell>
    );
}
