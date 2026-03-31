"use client";

import AdminShell from "@/components/admin/admin-shell";
import { Trophy, Flame, Star, Users, TrendingUp, Plus, ChevronRight, Target, Loader2 } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";

const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const fd = new FormData(e.currentTarget);
        const newC = {
            name: fd.get("name"),
            goal: fd.get("goal"),
            status: "ACTIVE"
        };
        setCampaigns([...campaigns, newC]);
        setIsModalOpen(false);
        setLoading(false);
    };

    return (
        <AdminShell>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-display text-2xl font-bold font-black uppercase tracking-tighter italic">Campanhas & Gamificação</h1>
                        <p className="text-zinc-500 text-sm mt-1">Engaje sua equipe com metas e rankings</p>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-brand-gradient text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-brand"
                    >
                        <Plus className="w-4 h-4" /> Nova Campanha
                    </button>
                </div>

                {campaigns.length === 0 ? (
                    <div className="glass-card rounded-[32px] p-12 py-20 border border-dashed border-white/5 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-dark-700/50 rounded-full flex items-center justify-center mb-6">
                            <Target className="w-10 h-10 text-zinc-600" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-300 uppercase italic tracking-tighter">Nenhuma Campanha Ativa</h3>
                        <p className="text-sm text-zinc-500 mt-2 max-w-sm">Defina desafios para sua equipe e acompanhe o crescimento do faturamento da sua barbearia em tempo real.</p>
                        <button onClick={() => setIsModalOpen(true)} className="mt-6 text-brand-400 font-black uppercase text-[10px] tracking-widest hover:underline">Configurar metas agora →</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {campaigns.map((c, i) => (
                             <div key={i} className="glass-card p-6 rounded-[24px] border border-brand-500/20 bg-white/[0.02]">
                                <div className="flex items-center justify-between mb-4">
                                    <Trophy className="w-6 h-6 text-brand-400" />
                                    <span className="text-[9px] font-black uppercase bg-brand-500/10 text-brand-500 px-2 py-1 rounded">EM ANDAMENTO</span>
                                </div>
                                <h4 className="font-black text-white uppercase text-xs mb-1">{c.name}</h4>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Meta: {fmt(Number(c.goal))}</p>
                             </div>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Ranking */}
                    <div className="lg:col-span-2 glass-card rounded-[32px] overflow-hidden min-h-[400px] flex flex-col items-center justify-center opacity-20 text-center p-12">
                        <Trophy className="w-16 h-16 mb-4 text-zinc-600" />
                        <h3 className="text-lg font-bold text-zinc-400 uppercase italic tracking-tighter">Ranking de Barbeiros</h3>
                        <p className="text-sm mt-1">O ranking será exibido aqui após o início da primeira campanha.</p>
                    </div>

                    {/* Level Guide */}
                    <div className="glass-card rounded-[32px] p-8 border border-white/5">
                        <div className="flex items-center gap-2 mb-8">
                            <Star className="w-5 h-5 text-brand-400" />
                            <h2 className="font-black uppercase tracking-[3px] text-[10px] text-zinc-400">Níveis de Progressão</h2>
                        </div>
                        <div className="space-y-5">
                            {[
                                { level: "BRONZE", emoji: "🥉", pts: "0", class: "badge-bronze" },
                                { level: "PRATA", emoji: "🥈", pts: "500", class: "badge-prata" },
                                { level: "OURO", emoji: "🥇", pts: "1.500", class: "badge-ouro" },
                                { level: "PLATINA", emoji: "⚪", pts: "4.000", class: "badge-platina" },
                                { level: "DIAMANTE", emoji: "💎", pts: "10.000", class: "badge-diamante" },
                                { level: "RUBI", emoji: "❤️", pts: "25.000", class: "badge-rubi" },
                            ].map((lv) => (
                                <div key={lv.level} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${lv.class}`}>
                                            {lv.emoji}
                                        </div>
                                        <span className="text-[11px] font-black text-zinc-300 tracking-wider font-display uppercase">{lv.level}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-zinc-600 tracking-widest">{lv.pts}+ PTS</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Campanha de Metas">
                <form onSubmit={handleCreate} className="space-y-6">
                    <div className="space-y-2">
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Título do Desafio</span>
                        <input name="name" required className="custom-input h-14" placeholder="Ex: Meta de Cortes Mensal" />
                    </div>
                    <div className="space-y-2">
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Meta Financeira (R$)</span>
                        <input name="goal" type="number" step="0.01" required className="custom-input h-14" placeholder="0.00" />
                    </div>
                    <div className="pt-4 flex gap-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-14 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Cancelar</button>
                        <button type="submit" disabled={loading} className="flex-[2] h-14 bg-brand-gradient text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-brand">
                            {loading ? <Loader2 className="animate-spin mx-auto w-5 h-5" /> : "ATIVAR CAMPANHA"}
                        </button>
                    </div>
                </form>
            </Modal>

            <style jsx global>{`
                .custom-input { width: 100%; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 0 20px; font-size: 13px; font-weight: 700; color: white; outline: none; transition: all 0.2s; }
                .custom-input:focus { border-color: #4f46e5; background: rgba(255,255,255,0.05); }
            `}</style>
        </AdminShell>
    );
}
