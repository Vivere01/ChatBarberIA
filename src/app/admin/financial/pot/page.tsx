"use client";

import AdminShell from "@/components/admin/admin-shell";
import { PiggyBank, Users, CreditCard, TrendingUp, Calendar, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getPotStatus, distributePot } from "@/app/actions/pot-actions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PotPage() {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(false);
    const [distributing, setDistributing] = useState(false);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, [month, year]);

    const loadData = async () => {
        setLoading(true);
        const res = await getPotStatus(month, year);
        if (res.success) {
            setData(res.data);
        }
        setLoading(false);
    };

    const handleDistribute = async () => {
        if (!confirm("Deseja fechar o pote deste mês e realizar a distribuição?")) return;
        setDistributing(true);
        const res = await distributePot(month, year);
        if (res.success) {
            alert("Pote distribuído com sucesso!");
            loadData();
        } else {
            alert(res.error);
        }
        setDistributing(false);
    };

    return (
        <AdminShell>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-display text-2xl font-bold">Pote de Comissões</h1>
                        <p className="text-zinc-500 text-sm mt-1">Gestão de rateio proporcional para assinantes</p>
                    </div>

                    <div className="flex items-center gap-3 bg-dark-800 p-1.5 rounded-2xl border border-white/5">
                        <select 
                            value={month}
                            onChange={(e) => setMonth(Number(e.target.value))}
                            className="bg-transparent text-sm font-bold text-white px-4 py-2 outline-none cursor-pointer"
                        >
                            {Array.from({ length: 12 }).map((_, i) => (
                                <option key={i + 1} value={i + 1} className="bg-dark-800">
                                    {format(new Date(2024, i, 1), 'MMMM', { locale: ptBR })}
                                </option>
                            ))}
                        </select>
                        <div className="w-px h-4 bg-white/10" />
                        <select 
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            className="bg-transparent text-sm font-bold text-white px-4 py-2 outline-none cursor-pointer"
                        >
                            {[2024, 2025, 2026].map(y => (
                                <option key={y} value={y} className="bg-dark-800">{y}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="h-96 flex items-center justify-center">
                        <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
                    </div>
                ) : data ? (
                    <>
                        {/* Status Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="glass-card rounded-3xl p-6 border border-white/5 bg-brand-500/5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-brand-400 mb-2">Montante no Pote</p>
                                <h3 className="text-3xl font-black text-white">R$ {data.totalPotAmount.toLocaleString()}</h3>
                                <p className="text-xs text-zinc-500 mt-2">Soma das mensalidades ativas</p>
                            </div>
                            <div className="glass-card rounded-3xl p-6 border border-white/5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Total de Fichas</p>
                                <h3 className="text-3xl font-black text-white">{data.totalFichas}</h3>
                                <p className="text-xs text-zinc-500 mt-2">Serviços realizados no mês</p>
                            </div>
                            <div className="glass-card rounded-3xl p-6 border border-white/5 bg-emerald-500/5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">Valor por Ficha</p>
                                <h3 className="text-3xl font-black text-white">R$ {data.valuePerFicha.toFixed(2)}</h3>
                                <p className="text-xs text-zinc-500 mt-2">Cota por serviço</p>
                            </div>
                            <div className="glass-card rounded-3xl p-6 border border-white/5 flex flex-col justify-between">
                                <button 
                                    onClick={handleDistribute}
                                    disabled={data.totalFichas === 0 || distributing}
                                    className="w-full bg-brand-gradient text-white h-full rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-brand hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                                >
                                    {distributing ? "Processando..." : "Realizar Rateio"}
                                </button>
                            </div>
                        </div>

                        {/* Staff List */}
                        <div className="glass-card rounded-3xl overflow-hidden border border-white/5">
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <h2 className="font-bold flex items-center gap-2">
                                    <Users className="w-5 h-5 text-zinc-400" />
                                    Distribuição por Profissional
                                </h2>
                                <span className="bg-white/5 text-[10px] font-bold px-3 py-1 rounded-full text-zinc-400">
                                    {data.staffStats.length} Profissionais
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white/2 border-b border-white/5">
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Profissional</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center">Fichas Acumuladas</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center">Cota Parte (%)</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Valor a Receber</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {data.staffStats.map((staff: any) => (
                                            <tr key={staff.name} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center font-bold text-brand-400 border border-white/5">
                                                            {staff.name[0]}
                                                        </div>
                                                        <span className="font-bold text-white">{staff.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 font-bold">
                                                        {staff.fichas}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-center text-zinc-500 text-xs font-medium">
                                                    {((staff.fichas / data.totalFichas) * 100).toFixed(1)}% do pote
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <span className="text-emerald-400 font-black text-lg">
                                                        R$ {staff.earnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Explained Box */}
                        <div className="p-8 rounded-3xl bg-dark-800 border border-white/5 flex gap-6 items-start">
                            <div className="w-14 h-14 rounded-2xl bg-dark-700 flex items-center justify-center flex-shrink-0 border border-white/5 shadow-inner">
                                <CheckCircle2 className="w-7 h-7 text-brand-500" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-1">Como funciona este cálculo?</h4>
                                <p className="text-zinc-500 text-sm leading-relaxed max-w-2xl">
                                    O valor do <b>Montante no Pote</b> é a soma do valor destinado ao pote configurado em cada plano de assinatura dos seus clientes ativos. 
                                    O total é dividido pelo número de <b>Fichas</b> (atendimentos de assinantes) realizados no mês, gerando o <b>Valor por Ficha</b>. 
                                    Cada profissional recebe o Valor por Ficha multiplicado pelas fichas que produziu.
                                </p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="h-64 flex items-center justify-center text-zinc-600 font-medium">
                        Nenhum dado encontrado para este período.
                    </div>
                )}
            </div>
        </AdminShell>
    );
}
