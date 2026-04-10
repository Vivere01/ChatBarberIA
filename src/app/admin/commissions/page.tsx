"use client";

import AdminShell from "@/components/admin/admin-shell";
import { Percent, CheckCircle, Clock, DollarSign, Users, Loader2, UserCheck, User } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { getCommissions, markCommissionPaid } from "@/app/actions/commission-actions";
import DateRangeFilter from "@/components/admin/date-range-filter";
import { useSearchParams } from "next/navigation";

const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

function CommissionsContent() {
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [paying, setPayingId] = useState<string | null>(null);
    const [data, setData] = useState<{
        staffList: any[];
        totalPending: number;
        totalPaid: number;
        totalCommission: number;
    }>({ staffList: [], totalPending: 0, totalPaid: 0, totalCommission: 0 });

    const load = async () => {
        setLoading(true);
        const from = searchParams.get("from");
        const to = searchParams.get("to");
        
        const dateRange = from && to ? {
            from: new Date(from),
            to: new Date(to)
        } : undefined;

        const result = await getCommissions(dateRange);
        setData(result);
        setLoading(false);
    };

    useEffect(() => { load(); }, [searchParams]);

    const handleMarkPaid = async (staffId: string) => {
        setPayingId(staffId);
        const res = await markCommissionPaid(staffId);
        if (res.success) await load();
        setPayingId(null);
    };

    return (
        <AdminShell>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-display text-2xl font-black uppercase tracking-tighter italic">Comissões</h1>
                        <p className="text-zinc-500 text-sm mt-1 font-medium">Controle de pagamentos profissional</p>
                    </div>
                    <DateRangeFilter />
                </div>

                {/* Totals */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="glass-card rounded-2xl p-5 stat-glow-orange">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-yellow-400" />
                            </div>
                            <p className="text-sm text-zinc-400">A Pagar</p>
                        </div>
                        {loading
                            ? <div className="h-8 w-28 bg-white/5 animate-pulse rounded-lg" />
                            : <p className="text-2xl font-bold text-yellow-400">{fmt(data.totalPending || 0)}</p>
                        }
                    </div>
                    <div className="glass-card rounded-2xl p-5 stat-glow-green">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                            </div>
                            <p className="text-sm text-zinc-400">Pago</p>
                        </div>
                        {loading
                            ? <div className="h-8 w-28 bg-white/5 animate-pulse rounded-lg" />
                            : <p className="text-2xl font-bold text-green-400">{fmt(data.totalPaid || 0)}</p>
                        }
                    </div>
                    <div className="glass-card rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-brand-400" />
                            </div>
                            <p className="text-sm text-zinc-400">Total Comissões</p>
                        </div>
                        {loading
                            ? <div className="h-8 w-28 bg-white/5 animate-pulse rounded-lg" />
                            : <p className="text-2xl font-bold">{fmt(data.totalCommission || 0)}</p>
                        }
                    </div>
                </div>

                {/* Table per Barber */}
                <div className="glass-card rounded-2xl overflow-hidden min-h-[400px]">
                    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                        <h2 className="font-semibold">Comissões por Barbeiro</h2>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                            {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
                        </div>
                    ) : data.staffList.length === 0 ? (
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
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden md:table-cell">Atendimentos</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden lg:table-cell">Assinantes</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden lg:table-cell">Avulsos</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden md:table-cell">% Comissão</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden md:table-cell">Fat. Bruto</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Comissão</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/4">
                                {data.staffList.map((s: any) => (
                                    <tr key={s.staffId} className="hover:bg-white/2 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-dark-600 flex items-center justify-center text-xs font-bold overflow-hidden flex-shrink-0">
                                                    {s.avatarUrl
                                                        ? <img src={s.avatarUrl} alt={s.staffName} className="w-full h-full object-cover" />
                                                        : s.staffName.slice(0, 2).toUpperCase()
                                                    }
                                                </div>
                                                <span className="font-medium text-sm">{s.staffName}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center hidden md:table-cell">
                                            <span className="text-sm font-bold text-zinc-300">{s.appointmentCount}</span>
                                        </td>
                                        <td className="px-4 py-4 text-center hidden lg:table-cell">
                                            <div className="flex items-center justify-center gap-1">
                                                <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                                                <span className="text-sm font-bold text-purple-400">{s.subscriberCount}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center hidden lg:table-cell">
                                            <div className="flex items-center justify-center gap-1">
                                                <User className="w-3.5 h-3.5 text-zinc-400" />
                                                <span className="text-sm font-bold text-zinc-400">{s.walkInCount}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 hidden md:table-cell">
                                            <span className="text-sm text-zinc-400">{s.commissionPercent}%</span>
                                        </td>
                                        <td className="px-4 py-4 hidden md:table-cell">
                                            <span className="text-sm font-semibold">{fmt(s.grossTotal)}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-sm font-bold text-brand-400">{fmt(s.commissionTotal)}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            {s.pendingAmount > 0 ? (
                                                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 uppercase">
                                                    ● {fmt(s.pendingAmount)} a pagar
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-500/10 text-green-400 uppercase">
                                                    ✓ Pago
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            {s.pendingAmount > 0 && (
                                                <button
                                                    onClick={() => handleMarkPaid(s.staffId)}
                                                    disabled={paying === s.staffId}
                                                    className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-green-500/10 text-green-400 hover:bg-green-500/20 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                                                >
                                                    {paying === s.staffId
                                                        ? <Loader2 className="w-3 h-3 animate-spin" />
                                                        : <CheckCircle className="w-3 h-3" />
                                                    }
                                                    Marcar Pago
                                                </button>
                                            )}
                                        </td>
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

export default function CommissionsPage() {
    return (
        <Suspense fallback={
            <AdminShell>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
                </div>
            </AdminShell>
        }>
            <CommissionsContent />
        </Suspense>
    );
}

