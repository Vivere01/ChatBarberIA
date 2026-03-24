import AdminShell from "@/components/admin/admin-shell";
import { Percent, CheckCircle, Clock, DollarSign } from "lucide-react";

const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const commissions = [
    { staff: "Carlos Barbosa", avatar: "CB", rate: 40, grossAmount: 8200, commissionAmount: 3280, status: "PENDING", period: "Março 2026" },
    { staff: "Rodrigo Santos", avatar: "RS", rate: 35, grossAmount: 6100, commissionAmount: 2135, status: "PENDING", period: "Março 2026" },
    { staff: "Marcos Oliveira", avatar: "MO", rate: 35, grossAmount: 4240, commissionAmount: 1484, status: "PAID", period: "Março 2026" },
    { staff: "Felipe Costa", avatar: "FC", rate: 30, grossAmount: 1980, commissionAmount: 594, status: "PENDING", period: "Março 2026" },
];

const totalPending = commissions.filter(c => c.status === "PENDING").reduce((s, c) => s + c.commissionAmount, 0);
const totalPaid = commissions.filter(c => c.status === "PAID").reduce((s, c) => s + c.commissionAmount, 0);

export default function CommissionsPage() {
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

                <div className="glass-card rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                        <h2 className="font-semibold">Comissões por Barbeiro</h2>
                        <select className="bg-dark-700 border border-white/8 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none">
                            <option>Março 2026</option>
                            <option>Fevereiro 2026</option>
                        </select>
                    </div>
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
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-dark-600 flex items-center justify-center text-xs font-bold">{c.avatar}</div>
                                            <div>
                                                <p className="font-medium text-sm">{c.staff}</p>
                                                <p className="text-zinc-600 text-xs">{c.period}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell">
                                        <span className="flex items-center gap-1 text-sm font-semibold text-brand-400">
                                            <Percent className="w-3 h-3" />{c.rate}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-zinc-300 hidden md:table-cell">{fmt(c.grossAmount)}</td>
                                    <td className="px-6 py-4 font-bold text-green-400">{fmt(c.commissionAmount)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.status === "PAID"
                                                ? "text-green-400 bg-green-500/10"
                                                : "text-yellow-400 bg-yellow-500/10"
                                            }`}>
                                            {c.status === "PAID" ? "✓ Pago" : "⏳ Pendente"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {c.status === "PENDING" && (
                                            <button className="text-xs text-brand-400 hover:text-brand-300 transition-colors font-medium">
                                                Marcar pago
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminShell>
    );
}
