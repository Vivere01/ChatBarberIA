"use client";

import AdminShell from "@/components/admin/admin-shell";
import { FeatureBarrier } from "@/components/admin/feature-barrier";
import { Gift, Plus, Users, TrendingUp, Link2, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";

export default function IndicaAiPage() {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const stats = [
        { label: "Promotores Ativos", value: "0", icon: Users, color: "text-purple-400 bg-purple-500/10" },
        { label: "Indicações Totais", value: "0", icon: Link2, color: "text-blue-400 bg-blue-500/10" },
        { label: "Convertidos", value: "0", icon: CheckCircle, color: "text-green-400 bg-green-500/10" },
        { label: "Taxa de Conversão", value: "0%", icon: TrendingUp, color: "text-brand-400 bg-brand-500/10" },
    ];

    const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const fd = new FormData(e.currentTarget);
        const newC = {
            name: fd.get("name"),
            reward: fd.get("reward"),
            active: true
        };
        setCampaigns([...campaigns, newC]);
        setIsModalOpen(false);
        setLoading(false);
    };

    return (
        <AdminShell>
            <FeatureBarrier feature="INDICA_AI">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Gift className="w-5 h-5 text-brand-400" />
                                <span className="text-xs text-brand-400 font-semibold uppercase tracking-wider">Marketing</span>
                            </div>
                            <h1 className="font-display text-2xl font-bold italic uppercase tracking-tighter">IndicaAí</h1>
                            <p className="text-zinc-500 text-sm mt-1">Gerencie campanhas de indicação e rastreie conversões</p>
                        </div>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 bg-brand-gradient text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-brand"
                        >
                            <Plus className="w-4 h-4" />
                            Nova Campanha
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.map((s) => (
                            <div key={s.label} className="glass-card rounded-2xl p-5">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color.split(" ")[1]}`}>
                                    <s.icon className={`w-4 h-4 ${s.color.split(" ")[0]}`} />
                                </div>
                                <p className="text-2xl font-bold">{s.value}</p>
                                <p className="text-zinc-500 text-sm mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {campaigns.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 bg-dark-800/20 border-2 border-dashed border-white/5 rounded-3xl text-center">
                            <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mb-4">
                                <Gift className="w-8 h-8 text-zinc-600" />
                            </div>
                            <h3 className="text-lg font-bold text-zinc-300 uppercase italic">Nenhuma campanha ativa</h3>
                            <p className="text-zinc-500 text-sm mt-1 max-w-sm">Crie campanhas de indicação para transformar seus clientes em promotores da sua marca.</p>
                            <button onClick={() => setIsModalOpen(true)} className="mt-6 text-brand-400 font-black uppercase text-[10px] tracking-widest hover:underline">Criar primeira campanha →</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {campaigns.map((c, i) => (
                                <div key={i} className="glass-card p-6 rounded-2xl flex justify-between items-center border border-white/5 bg-white/[0.02]">
                                    <div>
                                        <h4 className="font-black text-white uppercase text-xs tracking-wider">{c.name}</h4>
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Recompensa: {c.reward}</p>
                                    </div>
                                    <span className="bg-green-500/10 text-green-500 text-[9px] font-black uppercase px-2 py-1 rounded">Ativa</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Campanha IndicaAí">
                    <form onSubmit={handleCreate} className="space-y-6">
                        <div className="space-y-2">
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Nome da Campanha</span>
                            <input name="name" required className="custom-input h-14" placeholder="Ex: Indique um Amigo" />
                        </div>
                        <div className="space-y-2">
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Recompensa (O que o cliente ganha?)</span>
                            <input name="reward" required className="custom-input h-14" placeholder="Ex: 10% de desconto" />
                        </div>
                        <div className="pt-4 flex gap-4">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-14 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Cancelar</button>
                            <button type="submit" disabled={loading} className="flex-[2] h-14 bg-brand-gradient text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-brand">
                                {loading ? <Loader2 className="animate-spin mx-auto w-5 h-5" /> : "CRIAR CAMPANHA"}
                            </button>
                        </div>
                    </form>
                </Modal>

                <style jsx global>{`
                    .custom-input { width: 100%; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 0 20px; font-size: 13px; font-weight: 700; color: white; outline: none; transition: all 0.2s; }
                    .custom-input:focus { border-color: #4f46e5; background: rgba(255,255,255,0.05); }
                `}</style>
            </FeatureBarrier>
        </AdminShell>
    );
}
