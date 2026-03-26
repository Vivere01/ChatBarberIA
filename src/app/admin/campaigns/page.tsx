import AdminShell from "@/components/admin/admin-shell";
import { Trophy, Flame, Star, Users, TrendingUp, Plus, ChevronRight, Target } from "lucide-react";

const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export default function CampaignsPage() {
    const campaignStaff: any[] = [];
    const activeCampaign = null;

    return (
        <AdminShell>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-display text-2xl font-bold font-black uppercase tracking-tighter italic">Campanhas & Gamificação</h1>
                        <p className="text-zinc-500 text-sm mt-1">Engaje sua equipe com metas e rankings</p>
                    </div>
                    <button className="flex items-center gap-2 bg-brand-gradient text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-brand-sm">
                        <Plus className="w-4 h-4" /> Nova Campanha
                    </button>
                </div>

                {!activeCampaign ? (
                    <div className="glass-card rounded-2xl p-12 py-20 border border-dashed border-white/5 flex flex-col items-center justify-center text-center opacity-40">
                        <div className="w-20 h-20 bg-dark-700/50 rounded-full flex items-center justify-center mb-6">
                            <Target className="w-10 h-10 text-zinc-600" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-300 uppercase italic tracking-tighter">Nenhuma Campanha Ativa</h3>
                        <p className="text-sm text-zinc-500 mt-2 max-w-sm">Defina desafios para sua equipe e acompanhe o crescimento do faturamento da sua barbearia em tempo real.</p>
                        <button className="mt-6 text-brand-400 font-bold hover:underline">Configurar metas agora →</button>
                    </div>
                ) : (
                    <div className="glass-card rounded-2xl p-6 border border-brand-500/20 relative overflow-hidden">
                        {/* Campaign content */}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Ranking */}
                    <div className="lg:col-span-2 glass-card rounded-2xl overflow-hidden min-h-[400px] flex flex-col items-center justify-center opacity-20 text-center p-12">
                        <Trophy className="w-16 h-16 mb-4 text-zinc-600" />
                        <h3 className="text-lg font-bold text-zinc-400 uppercase italic tracking-tighter">Ranking de Barbeiros</h3>
                        <p className="text-sm mt-1">O ranking será exibido aqui após o início da primeira campanha.</p>
                    </div>

                    {/* Level Guide */}
                    <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Star className="w-5 h-5 text-brand-400" />
                            <h2 className="font-semibold uppercase tracking-widest text-[10px] text-zinc-400">Níveis de Gamificação</h2>
                        </div>
                        <div className="space-y-4">
                            {[
                                { level: "BRONZE", emoji: "🥉", pts: "0", class: "badge-bronze" },
                                { level: "PRATA", emoji: "🥈", pts: "500", class: "badge-prata" },
                                { level: "OURO", emoji: "🥇", pts: "1.500", class: "badge-ouro" },
                                { level: "PLATINA", emoji: "⚪", pts: "4.000", class: "badge-platina" },
                                { level: "DIAMANTE", emoji: "💎", pts: "10.000", class: "badge-diamante" },
                                { level: "RUBI", emoji: "❤️", pts: "25.000", class: "badge-rubi" },
                            ].map((lv) => (
                                <div key={lv.level} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${lv.class}`}>
                                            {lv.emoji}
                                        </div>
                                        <span className="text-xs font-bold text-zinc-300">{lv.level}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-zinc-600">{lv.pts}+ pts</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminShell>
    );
}
