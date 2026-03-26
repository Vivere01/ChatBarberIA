import AdminShell from "@/components/admin/admin-shell";
import { Gift, Plus, Users, TrendingUp, Link2, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function IndicaAiPage() {
    const campaigns: any[] = [];
    const referrals: any[] = [];

    const stats = [
        { label: "Promotores Ativos", value: "0", icon: Users, color: "text-purple-400 bg-purple-500/10" },
        { label: "Indicações Totais", value: "0", icon: Link2, color: "text-blue-400 bg-blue-500/10" },
        { label: "Convertidos", value: "0", icon: CheckCircle, color: "text-green-400 bg-green-500/10" },
        { label: "Taxa de Conversão", value: "0%", icon: TrendingUp, color: "text-brand-400 bg-brand-500/10" },
    ];

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
                        <h3 className="text-lg font-bold text-zinc-300">Nenhuma campanha ativa</h3>
                        <p className="text-zinc-500 text-sm mt-1 max-w-sm">Crie campanhas de indicação para transformar seus clientes em promotores da sua marca.</p>
                        <button className="mt-6 text-brand-400 font-bold hover:underline">Criar primeira campanha →</button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Campaign lists would go here */}
                    </div>
                )}
            </div>
        </AdminShell>
    );
}
