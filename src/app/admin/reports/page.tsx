import AdminShell from "@/components/admin/admin-shell";
import { BarChart3, Users, UserX, Crown, Trophy, Clock, Filter } from "lucide-react";

const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const topClientsRanking = [
    { rank: 1, name: "Bruno Alves", spent: 3600, visits: 24, type: "SUBSCRIBER", lastVisit: "24/03/2026" },
    { rank: 2, name: "Pedro Souza", spent: 2100, visits: 18, type: "SUBSCRIBER", lastVisit: "22/03/2026" },
    { rank: 3, name: "João Silva", spent: 1240, visits: 14, type: "SUBSCRIBER", lastVisit: "20/03/2026" },
    { rank: 4, name: "Marcos Lima", spent: 380, visits: 6, type: "WALK_IN", lastVisit: "18/03/2026" },
    { rank: 5, name: "Rafael Nunes", spent: 95, visits: 2, type: "WALK_IN", lastVisit: "01/03/2026" },
];

const absentClients = [
    { name: "Felipe Costa", lastVisit: "10/01/2026", daysAbsent: 73, type: "WALK_IN", phone: "(11) 99999-0006" },
    { name: "Lucas Ferreira", lastVisit: "05/01/2026", daysAbsent: 78, type: "SUBSCRIBER", phone: "(11) 99999-0007" },
    { name: "André Lima", lastVisit: "20/12/2025", daysAbsent: 95, type: "WALK_IN", phone: "(11) 99999-0008" },
];

const rankColors = ["from-yellow-500 to-amber-500", "from-zinc-400 to-zinc-200", "from-orange-700 to-orange-500"];

export default function ReportsPage() {
    return (
        <AdminShell>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-display text-2xl font-bold">Relatórios</h1>
                        <p className="text-zinc-500 text-sm mt-1">Análises detalhadas do seu negócio</p>
                    </div>
                    <div className="flex gap-3">
                        <select className="bg-dark-800 border border-white/8 rounded-xl px-3 py-2 text-sm text-zinc-300 focus:outline-none">
                            <option>Março 2026</option>
                            <option>Fevereiro 2026</option>
                            <option>Janeiro 2026</option>
                        </select>
                        <select className="bg-dark-800 border border-white/8 rounded-xl px-3 py-2 text-sm text-zinc-300 focus:outline-none">
                            <option>Todas as lojas</option>
                            <option>Loja Centro</option>
                            <option>Loja Jardins</option>
                        </select>
                    </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Total Clientes", value: "1.240", icon: Users, color: "text-blue-400 bg-blue-500/10" },
                        { label: "Assinantes Ativos", value: "340", icon: Crown, color: "text-brand-400 bg-brand-500/10" },
                        { label: "Clientes Ausentes", value: "87", icon: UserX, color: "text-red-400 bg-red-500/10" },
                        { label: "Ativos este mês", value: "284", icon: Clock, color: "text-green-400 bg-green-500/10" },
                    ].map((s) => (
                        <div key={s.label} className="glass-card rounded-2xl p-5">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color.split(" ")[1]}`}>
                                <s.icon className={`w-4 h-4 ${s.color.split(" ")[0]}`} />
                            </div>
                            <p className="text-2xl font-bold">{s.value}</p>
                            <p className="text-zinc-500 text-sm">{s.label}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Spenders Ranking */}
                    <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                            <h2 className="font-semibold">Ranking — Maiores Gastadores</h2>
                        </div>
                        <div className="space-y-3">
                            {topClientsRanking.map((client) => (
                                <div key={client.rank} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/2 transition-colors">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${client.rank <= 3
                                            ? `bg-gradient-to-br ${rankColors[client.rank - 1]}`
                                            : "bg-dark-600"
                                        }`}>
                                        {client.rank}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm">{client.name}</p>
                                        <p className="text-zinc-600 text-xs">{client.visits} visitas · Última: {client.lastVisit}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-400 text-sm">{fmt(client.spent)}</p>
                                        {client.type === "SUBSCRIBER" && (
                                            <Crown className="w-3 h-3 text-brand-400 ml-auto mt-0.5" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Absent Clients */}
                    <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <UserX className="w-5 h-5 text-red-400" />
                                <h2 className="font-semibold">Clientes Ausentes</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-zinc-600" />
                                <select className="bg-dark-700 border border-white/8 rounded-lg px-2 py-1 text-xs text-zinc-400 focus:outline-none">
                                    <option>+30 dias</option>
                                    <option>+60 dias</option>
                                    <option>+90 dias</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {absentClients.map((c, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-red-500/3 border border-red-500/10 hover:border-red-500/20 transition-all">
                                    <div className="w-9 h-9 rounded-full bg-dark-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                        {c.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-sm">{c.name}</p>
                                            {c.type === "SUBSCRIBER" && <Crown className="w-3 h-3 text-brand-400" />}
                                        </div>
                                        <p className="text-zinc-600 text-xs">{c.phone} · Última visita: {c.lastVisit}</p>
                                    </div>
                                    <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-full">
                                        {c.daysAbsent}d
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminShell>
    );
}
