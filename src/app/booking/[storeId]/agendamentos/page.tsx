"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Calendar, Clock, User, Scissors, ChevronRight, Loader2, CalendarX, History as HistoryIcon, MapPin } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getClientAppointments, cancelClientAppointment } from "@/app/actions/appointment-actions";
import { getClientWaitlist } from "@/app/actions/waitlist-actions";

const statusConfig: Record<string, { label: string; class: string }> = {
    SCHEDULED: { label: "Agendado", class: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    CONFIRMED: { label: "Confirmado", class: "bg-green-500/10 text-green-500 border-green-500/20" },
    COMPLETED: { label: "Concluído", class: "bg-zinc-500/10 text-zinc-400 border-zinc-500/10" },
    CANCELLED: { label: "Cancelado", class: "bg-red-500/10 text-red-500 border-red-500/20" },
    WAITING: { label: "Aguardando Encaixe", class: "bg-orange-500/10 text-orange-600 border-orange-500/20 animate-pulse" },
};

export default function ClientAppointmentsPage() {
    const { storeId } = useParams() as { storeId: string };
    const [appointments, setAppointments] = useState<any[]>([]);
    const [waitlist, setWaitlist] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const [apptData, waitData] = await Promise.all([
                getClientAppointments(storeId),
                getClientWaitlist(storeId)
            ]);
            setAppointments(apptData || []);
            setWaitlist(waitData || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [storeId]);

    const handleCancel = async (id: string) => {
        if (confirm("Deseja realmente cancelar este agendamento?")) {
            setLoading(true);
            const res = await cancelClientAppointment(id);
            if (res.success) {
                await loadData();
            } else {
                alert(res.error || "Erro ao cancelar.");
                setLoading(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Carregando seus agendamentos...</p>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto py-6 md:py-10 space-y-8 pb-32">
            <header className="flex items-center justify-between px-2">
                <div>
                    <h1 className="text-2xl font-black italic uppercase tracking-tight text-zinc-900 group flex items-center gap-2">
                        Meus <span className="text-orange-600">Agendamentos</span>
                    </h1>
                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">Histórico completo de visitas</p>
                </div>
            </header>

            {/* Bottom Nav for Client App - Premium Touch */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-zinc-100 px-6 py-4 flex items-center justify-between z-50 lg:hidden">
                 <Link href={`/booking/${storeId}/agendar`} className="flex flex-col items-center gap-1 group">
                    <div className="p-3 bg-orange-600 text-white rounded-2xl shadow-lg ring-4 ring-orange-600/10 group-active:scale-95 transition-all">
                        <Calendar className="w-6 h-6" />
                    </div>
                </Link>
                <Link href={`/booking/${storeId}/agendamentos`} className="flex flex-col items-center gap-1 text-orange-600">
                    <HistoryIcon className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Agenda</span>
                </Link>
                <Link href={`/booking/${storeId}/lojas`} className="flex flex-col items-center gap-1 text-zinc-400">
                    <MapPin className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Lojas</span>
                </Link>
            </div>

            {appointments.length === 0 && waitlist.length === 0 ? (
                <div className="py-20 flex flex-col items-center text-center px-6">
                    <div className="w-20 h-20 bg-zinc-50 rounded-[2rem] flex items-center justify-center mb-6 text-zinc-200 border border-zinc-100 shadow-inner">
                        <CalendarX className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-black italic uppercase tracking-tight text-zinc-900">Nenhum agendamento ativo</h3>
                    <p className="text-zinc-500 text-sm mt-2 max-w-[240px] font-medium leading-relaxed">Você ainda não possui horários marcados ou na fila de espera nesta unidade.</p>
                    <Link 
                        href={`/booking/${storeId}/agendar`}
                        className="mt-8 bg-orange-600 text-white px-8 py-4 rounded-2xl font-black italic uppercase tracking-widest text-[10px] hover:bg-zinc-900 transition-all shadow-xl shadow-orange-600/20 active:scale-95"
                    >
                        Agendar agora →
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Render Waitlist Cards First */}
                    {waitlist.map((entry) => (
                        <div key={entry.id} className="bg-orange-50/10 border border-orange-500/20 rounded-[2rem] p-6 shadow-sm relative overflow-hidden ring-2 ring-orange-500/5 transition-all">
                            <div className="absolute top-0 right-0 p-4 opacity-5 bg-orange-500 rounded-bl-3xl">
                                <Clock className="w-12 h-12" />
                            </div>
                            <div className="flex items-start justify-between mb-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border bg-orange-500/10 text-orange-600 border-orange-500/20 animate-pulse">
                                            Aguardando Encaixe
                                        </span>
                                    </div>
                                    <h4 className="text-lg font-black italic uppercase tracking-tight text-zinc-900">Pedido de Encaixe</h4>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-orange-500/5 flex items-center justify-center text-orange-600/50">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">Data Desejada</p>
                                    <p className="text-xs font-bold text-zinc-900">{new Date(entry.requestedDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</p>
                                </div>
                            </div>
                            {entry.notes && (
                                <p className="mt-4 text-[11px] font-medium text-zinc-500 leading-normal border-l-2 border-orange-500/10 pl-3">
                                    "{entry.notes}"
                                </p>
                            )}
                            <div className="mt-4 pt-4 border-t border-orange-500/5 flex items-center justify-between">
                                <p className="text-[9px] font-bold text-zinc-400 italic">Notificaremos assim que houver uma vaga!</p>
                            </div>
                        </div>
                    ))}

                    {/* Render Appointment Cards */}
                    {appointments.map((apt) => {
                        const status = statusConfig[apt.status] || statusConfig.SCHEDULED;
                        const date = new Date(apt.scheduledAt);
                        const servicesList = apt.items.map((i: any) => i.service?.name).filter(Boolean).join(", ");

                        return (
                            <div key={apt.id} className="bg-white border border-zinc-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className={cn("text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border", status.class)}>
                                                {status.label}
                                            </span>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300">#{apt.id.slice(-5)}</span>
                                        </div>
                                        <h4 className="text-lg font-black italic uppercase tracking-tight text-zinc-900 line-clamp-1">{servicesList || "Serviço não especificado"}</h4>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center group-hover:bg-orange-50 group-hover:border-orange-100 transition-all overflow-hidden">
                                        {apt.staff?.avatarUrl ? (
                                            <img src={apt.staff.avatarUrl} alt={apt.staff.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-5 h-5 text-zinc-400 group-hover:text-orange-600 transition-colors" />
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">Data</p>
                                            <p className="text-xs font-bold text-zinc-900">{date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">Horário</p>
                                            <p className="text-xs font-bold text-zinc-900">
                                                {String(date.getUTCHours()).padStart(2, '0')}:{String(date.getUTCMinutes()).padStart(2, '0')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-5 border-t border-zinc-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Scissors className="w-3.5 h-3.5 text-orange-600" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total</span>
                                        <span className="text-sm font-black text-zinc-900 ml-1">R$ {apt.totalAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex gap-4">
                                        {(apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED') && (
                                            <button 
                                                onClick={() => handleCancel(apt.id)}
                                                className="text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function PlusIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
    )
}
