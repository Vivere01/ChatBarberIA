import AdminShell from "@/components/admin/admin-shell";
import { Trophy, Flame, Star, Users, TrendingUp, Plus, ChevronRight } from "lucide-react";

const levelConfig: Record<string, { emoji: string; class: string; label: string }> = {
    BRONZE: { emoji: "🥉", class: "badge-bronze", label: "BRONZE" },
    PRATA: { emoji: "🥈", class: "badge-prata", label: "PRATA" },
    OURO: { emoji: "🥇", class: "badge-ouro", label: "OURO" },
    PLATINA: { emoji: "⚪", class: "badge-platina", label: "PLATINA" },
    DIAMANTE: { emoji: "💎", class: "badge-diamante", label: "DIAMANTE" },
    RUBI: { emoji: "❤️", class: "badge-rubi", label: "RUBI" },
};

const campaignStaff = [
    { rank: 1, name: "Carlos Barbosa", avatar: "CB", level: "OURO", points: 2840, sales: 42, revenue: 8200 },
    { rank: 2, name: "Rodrigo Santos", avatar: "RS", level: "PRATA", points: 1250, sales: 28, revenue: 6100 },
    { rank: 3, name: "Marcos Oliveira", avatar: "MO", level: "PRATA", points: 980, sales: 22, revenue: 4240 },
    { rank: 4, name: "Felipe Costa", avatar: "FC", level: "BRONZE", points: 320, sales: 10, revenue: 1980 },
];

const activeCampaign = {
    name: "Campanha Março — Verão",
    ends: "31/03/2026",
    target: 15000,
    current: 20520,
};

const progress = Math.min((activeCampaign.current / activeCampaign.target) * 100, 100);

const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const rankColors = ["text-yellow-400", "text-zinc-300", "text-orange-400"];

export default function CampaignsPage() {
    return (
        <AdminShell>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-display text-2xl font-bold">Campanhas & Gamificação</h1>
                        <p className="text-zinc-500 text-sm mt-1">Engaje sua equipe com metas e rankings</p>
                    </div>
                    <button className="flex items-center gap-2 bg-brand-gradient text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-brand-sm">
                        <Plus className="w-4 h-4" />
                        Nova Campanha
                    </button>
                </div>

                {/* Active Campaign Banner */}
                <div className="glass-card rounded-2xl p-6 border border-brand-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-[80px] pointer-events-none" />
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Flame className="w-4 h-4 text-brand-400" />
                                <span className="text-xs text-brand-400 font-semibold uppercase tracking-wider">Campanha Ativa</span>
                            </div>
                            <h2 className="font-display text-xl font-bold">{activeCampaign.name}</h2>
                            <p className="text-zinc-500 text-sm mt-1">Encerra em {activeCampaign.ends}</p>
                        </div>
                        <div className="md:text-right">
                            <p className="text-3xl font-bold text-green-400">{fmt(activeCampaign.current)}</p>
                            <p className="text-zinc-500 text-sm">de {fmt(activeCampaign.target)} (meta)</p>
                        </div>
                    </div>
                    <div className="mt-4 relative">
                        <div className="flex justify-between text-xs text-zinc-500 mb-1">
                            <span>Progresso da Meta</span>
                            <span>{progress.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-brand-gradient rounded-full transition-all duration-700"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Ranking */}
                    <div className="lg:col-span-2 glass-card rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-400" />
                                <h2 className="font-semibold">Ranking de Barbeiros</h2>
                            </div>
                            <span className="text-xs text-zinc-500">Março 2026</span>
                        </div>
                        <div className="p-6 space-y-4">
                            {campaignStaff.map((staff) => {
                                const lv = levelConfig[staff.level];
                                return (
                                    <div key={staff.rank} className={`flex items-center gap-4 p-4 rounded-xl ${staff.rank === 1 ? "bg-yellow-500/5 border border-yellow-500/15" : "hover:bg-white/2"
                                        } transition-colors`}>
                                        <span className={`text-2xl font-bold font-display w-8 text-center ${rankColors[staff.rank - 1] ?? "text-zinc-600"}`}>
                                            #{staff.rank}
                                        </span>
                                        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold ${staff.rank === 1 ? "bg-yellow-500/20 border border-yellow-500/30" : "bg-dark-600"
                                            }`}>
                                            {staff.avatar}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold">{staff.name}</p>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${lv.class}`}>
                                                    {lv.emoji} {lv.label}
                                                </span>
                                            </div>
                                            <p className="text-zinc-500 text-xs mt-0.5">{staff.sales} vendas · {staff.points} pts</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-400">{fmt(staff.revenue)}</p>
                                            <p className="text-zinc-600 text-xs">faturamento</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Level Guide */}
                    <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <Star className="w-5 h-5 text-brand-400" />
                            <h2 className="font-semibold">Níveis de Gamificação</h2>
                        </div>
                        <div className="space-y-3">
                            {[
                                { level: "BRONZE", emoji: "🥉", pts: "0", class: "badge-bronze" },
                                { level: "PRATA", emoji: "🥈", pts: "500", class: "badge-prata" },
                                { level: "OURO", emoji: "🥇", pts: "1.500", class: "badge-ouro" },
                                { level: "PLATINA", emoji: "⚪", pts: "4.000", class: "badge-platina" },
                                { level: "DIAMANTE", emoji: "💎", pts: "10.000", class: "badge-diamante" },
                                { level: "RUBI", emoji: "❤️", pts: "25.000", class: "badge-rubi" },
                            ].map((lv) => (
                                <div key={lv.level} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full text-white ${lv.class}`}>
                                            {lv.emoji} {lv.level}
                                        </span>
                                    </div>
                                    <span className="text-xs text-zinc-500">{lv.pts}+ pts</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-4 border-t border-white/5">
                            <p className="text-xs text-zinc-500 leading-relaxed">
                                Pontos são acumulados a cada venda registrada durante a campanha ativa.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminShell>
    );
}
