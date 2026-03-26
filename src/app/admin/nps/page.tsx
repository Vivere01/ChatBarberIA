import AdminShell from "@/components/admin/admin-shell";
import { Star, TrendingUp, MessageSquare, Award, AlertCircle } from "lucide-react";

export default function NpsPage() {
    const npsData: any[] = [];
    const recentRatings: any[] = [];
    const overallNps = 0;
    const stats = { promoters: 0, passives: 0, detractors: 0 };

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
                            <p className="text-5xl font-bold font-display text-zinc-700">{overallNps}</p>
                            <p className="text-zinc-400 text-sm mt-2">NPS Geral</p>
                        </div>
                        <div className="text-center border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 opacity-40">
                            <p className="text-3xl font-bold text-green-400">{stats.promoters}</p>
                            <p className="text-zinc-500 text-sm mt-1">Promotores</p>
                        </div>
                        <div className="text-center border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 opacity-40">
                            <p className="text-3xl font-bold text-yellow-400">{stats.passives}</p>
                            <p className="text-zinc-500 text-sm mt-1">Passivos</p>
                        </div>
                        <div className="text-center border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 opacity-40">
                            <p className="text-3xl font-bold text-red-400">{stats.detractors}</p>
                            <p className="text-zinc-500 text-sm mt-1">Detratores</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* By Staff */}
                    <div className="glass-card rounded-2xl p-6 min-h-[300px] flex flex-col items-center justify-center opacity-30 text-center">
                        <Award className="w-10 h-10 mb-4" />
                        <h3 className="font-bold text-sm uppercase tracking-widest">Aguardando Avaliações</h3>
                        <p className="text-xs mt-1">O NPS por barbeiro aparecerá conforme os clientes avaliarem os atendimentos.</p>
                    </div>

                    {/* Recent Ratings */}
                    <div className="glass-card rounded-2xl p-6 min-h-[300px] flex flex-col items-center justify-center opacity-30 text-center">
                        <MessageSquare className="w-10 h-10 mb-4" />
                        <h3 className="font-bold text-sm uppercase tracking-widest">Nenhum feedback recente</h3>
                        <p className="text-xs mt-1">As mensagens dos clientes serão listadas nesta área.</p>
                    </div>
                </div>
            </div>
        </AdminShell>
    );
}
