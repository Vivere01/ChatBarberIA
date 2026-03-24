import AdminShell from "@/components/admin/admin-shell";
import { Star, TrendingUp, MessageSquare, Award } from "lucide-react";

const npsData = [
    { staff: "Carlos Barbosa", avatar: "CB", score: 9.4, ratings: 48, promoters: 38, passives: 8, detractors: 2 },
    { staff: "Rodrigo Santos", avatar: "RS", score: 8.8, ratings: 32, promoters: 28, passives: 3, detractors: 1 },
    { staff: "Marcos Oliveira", avatar: "MO", score: 7.5, ratings: 20, promoters: 14, passives: 4, detractors: 2 },
];

const recentRatings = [
    { client: "João Silva", staff: "Carlos B.", score: 10, comment: "Melhor barbearia da cidade!", date: "24/03" },
    { client: "Pedro Souza", staff: "Rodrigo S.", score: 9, comment: "Atendimento excelente", date: "23/03" },
    { client: "Bruno Alves", staff: "Carlos B.", score: 8, comment: "Gostei muito, voltarei!", date: "22/03" },
    { client: "Rafael Lima", staff: "Marcos O.", score: 6, comment: "Esperou um pouco para ser atendido", date: "21/03" },
];

function npsScore(promoters: number, detractors: number, total: number) {
    return Math.round(((promoters - detractors) / total) * 100);
}

function scoreColor(score: number) {
    if (score >= 9) return "text-green-400";
    if (score >= 7) return "text-yellow-400";
    return "text-red-400";
}

export default function NpsPage() {
    return (
        <AdminShell>
            <div className="space-y-6">
                <div>
                    <h1 className="font-display text-2xl font-bold">NPS — Net Promoter Score</h1>
                    <p className="text-zinc-500 text-sm mt-1">Avaliações dos clientes por barbeiro</p>
                </div>

                {/* Overall NPS */}
                <div className="glass-card rounded-2xl p-6 border border-brand-500/10">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <p className="text-5xl font-bold font-display text-green-400">72</p>
                            <p className="text-zinc-400 text-sm mt-2">NPS Geral</p>
                            <p className="text-xs text-green-400 mt-1">✓ Excelente</p>
                        </div>
                        <div className="text-center border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0">
                            <p className="text-3xl font-bold text-green-400">80</p>
                            <p className="text-zinc-500 text-sm mt-1">Promotores</p>
                            <p className="text-xs text-zinc-600">nota 9–10</p>
                        </div>
                        <div className="text-center border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0">
                            <p className="text-3xl font-bold text-yellow-400">15</p>
                            <p className="text-zinc-500 text-sm mt-1">Passivos</p>
                            <p className="text-xs text-zinc-600">nota 7–8</p>
                        </div>
                        <div className="text-center border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0">
                            <p className="text-3xl font-bold text-red-400">5</p>
                            <p className="text-zinc-500 text-sm mt-1">Detratores</p>
                            <p className="text-xs text-zinc-600">nota 0–6</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* By Staff */}
                    <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <Award className="w-5 h-5 text-brand-400" />
                            <h2 className="font-semibold">NPS por Barbeiro</h2>
                        </div>
                        <div className="space-y-4">
                            {npsData.map((s) => {
                                const nps = npsScore(s.promoters, s.detractors, s.ratings);
                                return (
                                    <div key={s.staff} className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-dark-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                            {s.avatar}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="font-medium text-sm truncate">{s.staff}</p>
                                                <span className={`font-bold text-sm ${scoreColor(s.score)}`}>{s.score}</span>
                                            </div>
                                            <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-green-500/80 transition-all"
                                                    style={{ width: `${(s.score / 10) * 100}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-zinc-600 mt-1">{s.ratings} avaliações · NPS {nps}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recent Ratings */}
                    <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <MessageSquare className="w-5 h-5 text-brand-400" />
                            <h2 className="font-semibold">Avaliações Recentes</h2>
                        </div>
                        <div className="space-y-4">
                            {recentRatings.map((r, i) => (
                                <div key={i} className="p-4 bg-dark-700 rounded-xl">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="font-medium text-sm">{r.client}</p>
                                            <p className="text-zinc-500 text-xs">{r.staff} · {r.date}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Star className={`w-4 h-4 ${r.score >= 9 ? "text-yellow-400" : r.score >= 7 ? "text-blue-400" : "text-red-400"} fill-current`} />
                                            <span className={`font-bold text-sm ${scoreColor(r.score)}`}>{r.score}</span>
                                        </div>
                                    </div>
                                    {r.comment && (
                                        <p className="text-zinc-400 text-xs leading-relaxed">"{r.comment}"</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminShell>
    );
}
