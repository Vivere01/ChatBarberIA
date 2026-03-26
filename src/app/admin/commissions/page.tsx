import AdminShell from "@/components/admin/admin-shell";
import { Percent, CheckCircle, Clock, DollarSign, Users } from "lucide-react";

const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export default function CommissionsPage() {
    const commissions: any[] = []; // Empty for setup
    const totalPending = 0;
    const totalPaid = 0;

    return (
        <AdminShell>
            <div className="space-y-6">
                <div>
                    <h1 className="font-display text-2xl font-bold">Comissões</h1>
                    <p className="text-zinc-500 text-sm mt-1">Controle de pagamentos por barbeiro</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="glass-card rounded-2xl p-5 stat-glow-orange">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-yellow-400" />
                            </div>
                            <p className="text-sm text-zinc-400">A Pagar</p>
                        </div>
                        <p className="text-2xl font-bold text-yellow-400">{fmt(totalPending)}</p>
                    </div>
                    <div className="glass-card rounded-2xl p-5 stat-glow-green">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                            </div>
                            <p className="text-sm text-zinc-400">Pago</p>
                        </div>
                        <p className="text-2xl font-bold text-green-400">{fmt(totalPaid)}</p>
                    </div>
                    <div className="glass-card rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-brand-400" />
                            </div>
                            <p className="text-sm text-zinc-400">Total Comissões</p>
                        </div>
                        <p className="text-2xl font-bold">{fmt(totalPending + totalPaid)}</p>
                    </div>
                </div>

                <div className="glass-card rounded-2xl overflow-hidden min-h-[400px]">
                    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                        <h2 className="font-semibold">Comissões por Barbeiro</h2>
                    </div>
                    {commissions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                            <Users className="w-12 h-12 mb-4" />
                            <p className="text-sm font-bold uppercase tracking-widest">Nenhuma comissão registrada</p>
                            <p className="text-xs mt-1">As comissões aparecem aqui após a conclusão dos agendamentos.</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Barbeiro</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden md:table-cell">% Comissão</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden md:table-cell">Faturamento Bruto</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Comissão</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/4">
                                {commissions.map((c, i) => (
                                    <tr key={i} className="hover:bg-white/2 transition-colors">
                                        {/* ... (rest of the row) */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AdminShell>
    );
}
