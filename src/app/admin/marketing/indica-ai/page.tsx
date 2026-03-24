import AdminShell from "@/components/admin/admin-shell";
import { Gift, Plus, Users, TrendingUp, Link2, CheckCircle, Clock } from "lucide-react";

const campaigns = [
    {
        id: 1,
        name: "Indique e Ganhe — Q1 2026",
        status: "ACTIVE",
        referrals: 38,
        conversions: 22,
        promoters: 15,
        staffReward: "5%",
        promoterReward: "R$ 20,00",
        newClientDiscount: "10%",
    },
];

const referrals = [
    { promoter: "João Silva", barber: "Carlos B.", code: "JOS2024", status: "CONVERTED", newClients: 4, date: "20/03" },
    { promoter: "Pedro Souza", barber: "Rodrigo S.", code: "PES5512", status: "CONVERTED", newClients: 2, date: "22/03" },
    { promoter: "Bruno Alves", barber: "Carlos B.", code: "BRA9933", status: "PENDING", newClients: 1, date: "23/03" },
    { promoter: "Rafael Lima", barber: "Marcos O.", code: "RAF3341", status: "CONVERTED", newClients: 6, date: "15/03" },
];

const statusColors: Record<string, string> = {
    CONVERTED: "text-green-400 bg-green-500/10",
    PENDING: "text-yellow-400 bg-yellow-500/10",
    EXPIRED: "text-red-400 bg-red-500/10",
};

export default function IndicaAiPage() {
    return (
        <AdminShell>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Gift className="w-5 h-5 text-brand-400" />
                            <span className="text-xs text-brand-400 font-semibold uppercase tracking-wider">Marketing</span>
                        </div>
                        <h1 className="font-display text-2xl font-bold">IndicaAí</h1>
                        <p className="text-zinc-500 text-sm mt-1">Gerencie campanhas de indicação e rastreie conversões</p>
                    </div>
                    <button className="flex items-center gap-2 bg-brand-gradient text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-brand-sm">
                        <Plus className="w-4 h-4" />
                        Nova Campanha
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Promotores Ativos", value: "15", icon: Users, color: "text-purple-400 bg-purple-500/10" },
                        { label: "Indicações Totais", value: "38", icon: Link2, color: "text-blue-400 bg-blue-500/10" },
                        { label: "Convertidos", value: "22", icon: CheckCircle, color: "text-green-400 bg-green-500/10" },
                        { label: "Taxa de Conversão", value: "57%", icon: TrendingUp, color: "text-brand-400 bg-brand-500/10" },
                    ].map((s) => (
                        <div key={s.label} className="glass-card rounded-2xl p-5">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color.split(" ")[1]}`}>
                                <s.icon className={`w-4 h-4 ${s.color.split(" ")[0]}`} />
                            </div>
                            <p className="text-2xl font-bold">{s.value}</p>
                            <p className="text-zinc-500 text-sm mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Active Campaign */}
                {campaigns.map((c) => (
                    <div key={c.id} className="glass-card rounded-2xl p-6 border border-brand-500/15">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                    <span className="text-xs text-green-400 font-semibold">Ativa</span>
                                </div>
                                <h2 className="font-semibold text-lg">{c.name}</h2>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <div className="text-center">
                                    <p className="text-xl font-bold text-brand-400">{c.staffReward}</p>
                                    <p className="text-xs text-zinc-500">comissão barbeiro</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xl font-bold text-purple-400">{c.promoterReward}</p>
                                    <p className="text-xs text-zinc-500">reward promotor</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xl font-bold text-blue-400">{c.newClientDiscount}</p>
                                    <p className="text-xs text-zinc-500">desconto indicado</p>
                                </div>
                            </div>
                        </div>

                        {/* Referrals table */}
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="text-left py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Promotor</th>
                                    <th className="text-left py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden md:table-cell">Barbeiro</th>
                                    <th className="text-left py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden md:table-cell">Código</th>
                                    <th className="text-left py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Novos Clientes</th>
                                    <th className="text-left py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/4">
                                {referrals.map((r, i) => (
                                    <tr key={i} className="hover:bg-white/2 transition-colors">
                                        <td className="py-3">
                                            <p className="font-medium text-sm">{r.promoter}</p>
                                            <p className="text-zinc-600 text-xs">{r.date}</p>
                                        </td>
                                        <td className="py-3 text-sm text-zinc-400 hidden md:table-cell">{r.barber}</td>
                                        <td className="py-3 hidden md:table-cell">
                                            <code className="text-xs bg-dark-600 px-2 py-1 rounded font-mono text-brand-400">{r.code}</code>
                                        </td>
                                        <td className="py-3 text-center font-bold text-lg">{r.newClients}</td>
                                        <td className="py-3">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[r.status]}`}>
                                                {r.status === "CONVERTED" ? "Convertido" : r.status === "PENDING" ? "Pendente" : "Expirado"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </AdminShell>
    );
}
