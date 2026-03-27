"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { 
    Users, UserPlus, UserX, Crown, Cake, Filter, 
    Calendar, Phone, Mail, ChevronRight, Loader2,
    Clock, Search
} from "lucide-react";
import { format, subDays, startOfMonth, startOfYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
    getAbsentClients, 
    getNewClients, 
    getCanceledSubscriptions, 
    getBirthdayClients 
} from "@/app/actions/report-actions";

type ReportType = 'ABSENT' | 'NEW' | 'CANCELED' | 'BIRTHDAYS';

export default function ReportsPage() {
    const [reportType, setReportType] = useState<ReportType>('NEW');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any[]>([]);
    
    // Filters
    const [dateRange, setDateRange] = useState({
        start: startOfMonth(new Date()),
        end: new Date()
    });
    const [absentDays, setAbsentDays] = useState(30);
    const [birthdayMonth, setBirthdayMonth] = useState(new Date().getUTCMonth());

    useEffect(() => {
        loadReport();
    }, [reportType, dateRange, absentDays, birthdayMonth]);

    const loadReport = async () => {
        setLoading(true);
        try {
            let result: any[] = [];
            switch (reportType) {
                case 'ABSENT':
                    result = await getAbsentClients(absentDays);
                    break;
                case 'NEW':
                    result = await getNewClients(dateRange.start, dateRange.end);
                    break;
                case 'CANCELED':
                    result = await getCanceledSubscriptions();
                    break;
                case 'BIRTHDAYS':
                    result = await getBirthdayClients(birthdayMonth);
                    break;
            }
            setData(result || []);
        } catch (err) {
            console.error("Erro ao carregar relatório:", err);
        } finally {
            setLoading(false);
        }
    };

    const setQuickRange = (days: number) => {
        setDateRange({
            start: subDays(new Date(), days),
            end: new Date()
        });
        setReportType('NEW');
    };

    const BirthdayMonths = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    return (
        <AdminShell>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-display text-2xl font-bold">Relatórios Especializados</h1>
                        <p className="text-zinc-500 text-sm mt-1">Dados reais de comportamento e novos acessos</p>
                    </div>
                </div>

                {/* Report Type Selector */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { id: 'NEW', label: 'Novos Clientes', icon: UserPlus, color: 'text-green-400 bg-green-500/10' },
                        { id: 'ABSENT', label: 'Clientes Ausentes', icon: UserX, color: 'text-red-400 bg-red-500/10' },
                        { id: 'CANCELED', label: 'Assinaturas Canceladas', icon: Crown, color: 'text-orange-400 bg-orange-500/10' },
                        { id: 'BIRTHDAYS', label: 'Aniversariantes', icon: Cake, color: 'text-pink-400 bg-pink-500/10' },
                    ].map((btn) => (
                        <button
                            key={btn.id}
                            onClick={() => setReportType(btn.id as ReportType)}
                            className={`glass-card rounded-2xl p-6 flex flex-col items-center gap-3 transition-all border-2 ${
                                reportType === btn.id ? 'border-brand-500/40 bg-brand-500/5' : 'border-white/5 hover:border-white/10'
                            }`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${btn.color}`}>
                                <btn.icon className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-bold">{btn.label}</span>
                        </button>
                    ))}
                </div>

                {/* Filters Section */}
                <div className="glass-card rounded-2xl p-6 border border-white/5">
                    <div className="flex flex-col lg:flex-row items-center gap-6">
                        {reportType === 'NEW' && (
                            <div className="flex-1 flex flex-col gap-4">
                                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                    <Filter className="w-3.5 h-3.5" /> Período de Entrada
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {[7, 14, 21, 30, 60, 90, 180, 365].map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setQuickRange(d)}
                                            className="px-3 py-1.5 rounded-lg bg-dark-800 border border-white/5 text-[10px] font-bold text-zinc-400 hover:text-white hover:border-brand-500/30 transition-all uppercase"
                                        >
                                            {d} dias
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-4">
                                    <input 
                                        type="date" 
                                        value={format(dateRange.start, "yyyy-MM-dd")} 
                                        onChange={(e) => setDateRange({...dateRange, start: new Date(e.target.value)})}
                                        className="bg-dark-800 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-brand-500/50 outline-none" 
                                    />
                                    <input 
                                        type="date" 
                                        value={format(dateRange.end, "yyyy-MM-dd")} 
                                        onChange={(e) => setDateRange({...dateRange, end: new Date(e.target.value)})}
                                        className="bg-dark-800 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-brand-500/50 outline-none" 
                                    />
                                </div>
                            </div>
                        )}

                        {reportType === 'ABSENT' && (
                            <div className="flex-1 flex flex-col gap-4">
                                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                    <Filter className="w-3.5 h-3.5" /> Período de Inatividade
                                </p>
                                <div className="flex gap-2">
                                    {[30, 60, 90, 180].map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setAbsentDays(d)}
                                            className={`px-4 py-2 rounded-xl border font-bold text-xs uppercase transition-all ${
                                                absentDays === d ? 'bg-brand-500/20 border-brand-500/40 text-brand-400' : 'bg-dark-800 border-white/5 text-zinc-400'
                                            }`}
                                        >
                                            +{d} dias
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {reportType === 'BIRTHDAYS' && (
                            <div className="flex-1 flex flex-col gap-4">
                                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                    <Filter className="w-3.5 h-3.5" /> Mês de Nascimento
                                </p>
                                <select 
                                    className="bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-brand-500/50"
                                    value={birthdayMonth}
                                    onChange={(e) => setBirthdayMonth(parseInt(e.target.value))}
                                >
                                    {BirthdayMonths.map((m, i) => (
                                        <option key={m} value={i}>{m}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        
                        {reportType === 'CANCELED' && (
                            <div className="flex-1">
                                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Histórico de saídas do clube de assinaturas</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Results Area */}
                <div className="glass-card rounded-2xl border border-white/10 overflow-hidden min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-brand-400 opacity-20" />
                            <p className="text-zinc-500 text-sm">Gerando relatório...</p>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4 opacity-50">
                            <Search className="w-12 h-12 text-zinc-700" />
                            <p className="text-zinc-500 text-sm">Nenhum dado encontrado para os filtros selecionados.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-dark-800/80 border-b border-white/5">
                                        <th className="p-6 text-[10px] font-bold uppercase text-zinc-600">Cliente</th>
                                        <th className="p-6 text-[10px] font-bold uppercase text-zinc-600">Contato</th>
                                        <th className="p-6 text-[10px] font-bold uppercase text-zinc-600">
                                            {reportType === 'NEW' ? 'Data de Cadastro' : 
                                             reportType === 'ABSENT' ? 'Última Visita' : 
                                             reportType === 'CANCELED' ? 'Plano / Cancelamento' : 
                                             'Data de Nasc.'}
                                        </th>
                                        <th className="p-6"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item, i) => (
                                        <tr key={item.id || i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-dark-800 border border-white/5 flex items-center justify-center font-bold text-brand-400 uppercase">
                                                        {(item.client?.name || item.name || "?").charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-zinc-100">{item.client?.name || item.name}</p>
                                                        {item.clientType === 'SUBSCRIBER' && (
                                                            <span className="text-[9px] font-black uppercase text-brand-400">Assinante</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <p className="text-xs text-zinc-400 flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                                                        <Phone className="w-3 h-3 opacity-40" /> {item.client?.phone || item.phone || "N/A"}
                                                    </p>
                                                    <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                                                        <Mail className="w-3 h-3 opacity-40" /> {item.client?.email || item.email || "N/A"}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                {reportType === 'NEW' && (
                                                    <p className="text-xs font-bold text-zinc-300">
                                                        {format(new Date(item.createdAt), "dd/MM/yyyy 'às' HH:mm")}
                                                    </p>
                                                )}
                                                {reportType === 'ABSENT' && (
                                                    <div className="space-y-1">
                                                        {item.appointments?.[0] ? (
                                                            <>
                                                                <p className="text-xs font-bold text-zinc-400">
                                                                    {format(new Date(item.appointments[0].scheduledAt), "dd/MM/yyyy")}
                                                                </p>
                                                                <p className="text-[9px] text-zinc-600 uppercase font-black">Há {Math.floor((new Date().getTime() - new Date(item.appointments[0].scheduledAt).getTime()) / (1000 * 60 * 60 * 24))} dias</p>
                                                            </>
                                                        ) : (
                                                            <p className="text-xs font-bold text-red-400/60 uppercase">Nunca agendou</p>
                                                        )}
                                                    </div>
                                                )}
                                                {reportType === 'CANCELED' && (
                                                    <div>
                                                        <p className="text-xs font-bold text-orange-400">{item.plan?.name}</p>
                                                        <p className="text-[9px] text-zinc-600 uppercase font-bold">Em {format(new Date(item.updatedAt), "dd/MM/yyyy")}</p>
                                                    </div>
                                                )}
                                                {reportType === 'BIRTHDAYS' && (
                                                    <p className="text-xs font-bold text-pink-400 flex items-center gap-2">
                                                        <Cake className="w-3.5 h-3.5" /> 
                                                        {format(new Date(item.birthDate), "dd 'de' MMMM", { locale: ptBR })}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="p-6 text-right">
                                                <button className="p-2.5 rounded-xl bg-dark-800 border border-white/5 opacity-0 group-hover:opacity-100 transition-all hover:border-brand-500/50">
                                                    <ChevronRight className="w-4 h-4 text-zinc-500" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AdminShell>
    );
}
