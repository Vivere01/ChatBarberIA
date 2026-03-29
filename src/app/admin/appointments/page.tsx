"use client";

import AdminShell from "@/components/admin/admin-shell";
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Scissors, MoreVertical, Trash2, CheckCircle, XCircle, Loader2, Info } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { format, addDays, subDays, startOfWeek, isSameDay, startOfDay, eachMinuteOfInterval, setHours, setMinutes, isWithinInterval, addMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Modal } from "@/components/ui/modal";
import { createAdminAppointment, getAppointments, updateAppointmentStatus, deleteAppointment } from "@/app/actions/appointment-actions";
import { getStaffList } from "@/app/actions/staff-actions";
import { getServicesList } from "@/app/actions/service-actions";
import { getClientsList } from "@/app/actions/client-actions";
import { cn } from "@/lib/utils";

const TIME_SLOT_HEIGHT = 60; // 1 hora = 60px
const MINUTE_HEIGHT = TIME_SLOT_HEIGHT / 60; // 1px por minuto

export default function AppointmentsPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentTime, setCurrentTime] = useState(new Date());
    const [appointments, setAppointments] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form data
    const [formData, setFormData] = useState({
        clientId: "",
        serviceId: "",
        staffId: "",
        time: "09:00"
    });

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        loadData();
    }, [selectedDate]);

    const loadData = async () => {
        setFetching(true);
        try {
            const [aptRes, staffRes, servRes, clientRes] = await Promise.all([
                getAppointments(selectedDate),
                getStaffList(),
                getServicesList(),
                getClientsList(),
            ]);
            setAppointments(aptRes);
            setStaff(staffRes);
            setServices(servRes);
            setClients(clientRes);
        } catch (err) {
            console.error("Error loading data:", err);
        } finally {
            setFetching(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await createAdminAppointment({
                ...formData,
                date: selectedDate
            });
            if (result.success) {
                loadData();
                setIsModalOpen(false);
                setFormData({ clientId: "", serviceId: "", staffId: "", time: "09:00" });
            } else { alert(result.error); }
        } catch (err) { alert("Erro na conexão."); } finally { setLoading(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Cancelar este agendamento?")) return;
        try {
            await deleteAppointment(id);
            loadData();
        } catch (err) { alert("Erro ao excluir."); }
    };

    // Gerar horários (08:00 - 21:00)
    const startHour = 8;
    const endHour = 21;
    const timeSlots = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

    // Calcular posição da linha de tempo atual
    const calculateCurrentTimePosition = () => {
        if (!isSameDay(currentTime, selectedDate)) return null;
        const hours = currentTime.getHours();
        const minutes = currentTime.getMinutes();
        if (hours < startHour || hours > endHour) return null;
        return (hours - startHour) * TIME_SLOT_HEIGHT + (minutes * MINUTE_HEIGHT);
    };

    const currentTimePos = calculateCurrentTimePosition();

    return (
        <AdminShell>
            <div className="h-[calc(100vh-140px)] flex flex-col space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <h1 className="font-display text-2xl font-bold capitalize">
                            {format(selectedDate, "EEEE, dd MMM. yyyy", { locale: ptBR })}
                        </h1>
                        <div className="flex items-center gap-1 bg-dark-800 p-1 rounded-xl border border-white/5">
                            <button 
                                onClick={() => setSelectedDate(new Date())}
                                className="px-3 py-1.5 text-xs font-bold hover:bg-white/5 rounded-lg transition-all"
                            >
                                Hoje
                            </button>
                            <div className="w-px h-3 bg-white/10 mx-1" />
                            <button onClick={() => setSelectedDate(subDays(selectedDate, 1))} className="p-1.5 hover:bg-white/5 rounded-lg transition-all">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="p-1.5 hover:bg-white/5 rounded-lg transition-all">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 bg-dark-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold border border-white/5 hover:bg-white/5 transition-all">
                            <Plus className="w-4 h-4 text-brand-400" />
                            Nova comanda de consumo
                        </button>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 bg-brand-gradient text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-brand hover:scale-105 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Novo agendamento
                        </button>
                        <Info className="w-5 h-5 text-zinc-600 cursor-pointer hover:text-zinc-400 transition-colors" />
                    </div>
                </div>

                {/* Grid Agenda */}
                <div className="flex-1 glass-card rounded-3xl border border-white/5 overflow-hidden flex flex-col shadow-2xl relative">
                    {/* Header dos Barbeiros (Fixo no topo) */}
                    <div className="flex border-b border-white/5 bg-dark-800/50 backdrop-blur-md z-20">
                        <div className="w-20 border-r border-white/5 flex-shrink-0" />
                        <div className="flex-1 flex overflow-x-auto scrollbar-hide py-4">
                            {staff.map((member) => (
                                <div key={member.id} className="min-w-[200px] flex-1 flex flex-center px-4 border-r border-white/5 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-dark-700 border border-white/10 overflow-hidden shadow-inner">
                                            {member.avatarUrl ? (
                                                <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-bold text-zinc-500 uppercase">{member.name[0]}</div>
                                            )}
                                        </div>
                                        <span className="font-bold text-sm text-zinc-200 truncate max-w-[120px]">{member.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Área de Scroll da Agenda */}
                    <div className="flex-1 overflow-y-auto relative scrollbar-hide" ref={scrollContainerRef}>
                        <div className="flex min-h-full">
                            {/* Coluna de Horários */}
                            <div className="w-20 border-r border-white/5 bg-dark-900/30 flex-shrink-0 z-10">
                                {timeSlots.map(hour => (
                                    <div key={hour} className="relative h-[60px]">
                                        <span className="absolute -top-2 left-6 text-[10px] font-black text-zinc-600 uppercase tracking-tighter">
                                            {hour}:00
                                        </span>
                                        {/* Sub-horários de 10 em 10 min (opcional, igual ao print) */}
                                        <div className="absolute top-1/4 left-8 w-1 h-px bg-white/5" />
                                        <div className="absolute top-2/4 left-8 w-1 h-px bg-white/5" />
                                        <div className="absolute top-3/4 left-8 w-1 h-px bg-white/5" />
                                    </div>
                                ))}
                            </div>

                            {/* Grade Central */}
                            <div className="flex-1 flex overflow-x-auto scrollbar-hide relative group">
                                {staff.map((member) => (
                                    <div key={member.id} className="min-w-[200px] flex-1 border-r border-white/5 last:border-0 relative">
                                        {/* Linhas horizontais (background) */}
                                        {timeSlots.map(hour => (
                                            <div key={hour} className="h-[60px] border-b border-white/[0.02] relative">
                                                {/* Slots de 10 min virtuais para clique ou visual */}
                                                <div className="absolute top-0 w-full h-full border-b border-white/[0.01]" />
                                            </div>
                                        ))}

                                        {/* Agendamentos do Barbeiro */}
                                        {appointments
                                            .filter(apt => apt.staffId === member.id)
                                            .map(apt => {
                                                const scheduledAt = new Date(apt.scheduledAt);
                                                const startMinutes = (scheduledAt.getHours() - startHour) * 60 + scheduledAt.getMinutes();
                                                const top = startMinutes * MINUTE_HEIGHT;
                                                const height = (apt.durationMinutes || 30) * MINUTE_HEIGHT;

                                                return (
                                                    <div 
                                                        key={apt.id}
                                                        className={cn(
                                                            "absolute left-1 right-1 rounded-xl p-3 border shadow-lg cursor-pointer transition-all hover:scale-[1.02] hover:z-10 group overflow-hidden",
                                                            apt.status === 'SCHEDULED' ? "bg-brand-500/10 border-brand-500/20" : 
                                                            apt.status === 'COMPLETED' ? "bg-emerald-500/10 border-emerald-500/20" : 
                                                            "bg-zinc-500/10 border-zinc-500/20"
                                                        )}
                                                        style={{ top: `${top}px`, height: `${height}px` }}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <p className="text-[10px] font-bold text-zinc-400 mb-0.5 leading-none">
                                                                    {format(scheduledAt, "HH:mm")}
                                                                </p>
                                                                <p className="font-bold text-xs text-white truncate">{apt.client?.name}</p>
                                                                <p className="text-[10px] text-zinc-500 truncate mt-0.5 uppercase tracking-widest font-black">
                                                                    {apt.items?.[0]?.service?.name}
                                                                </p>
                                                            </div>
                                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-dark-900/80 rounded-lg p-1">
                                                                <MoreVertical className="w-3 h-3 text-white" />
                                                            </div>
                                                        </div>

                                                        {/* Indicador de Status */}
                                                        <div className={cn(
                                                            "absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full",
                                                            apt.status === 'SCHEDULED' ? "bg-brand-500 shadow-brand-sm" : 
                                                            apt.status === 'COMPLETED' ? "bg-emerald-500 shadow-emerald-sm" : "bg-zinc-500"
                                                        )} />
                                                    </div>
                                                );
                                            })
                                        }
                                    </div>
                                ))}

                                {/* Linha de Tempo Atual */}
                                {currentTimePos !== null && (
                                    <div 
                                        className="absolute left-0 w-full flex items-center pointer-events-none z-30"
                                        style={{ top: `${currentTimePos}px` }}
                                    >
                                        <div className="w-2.5 h-2.5 rounded-full bg-brand-500 shadow-brand -ml-[5px] border border-white/20" />
                                        <div className="flex-1 h-px bg-brand-500 shadow-brand opacity-50" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Novo Agendamento */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Agendamento">
                <form onSubmit={handleCreate} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Cliente</label>
                            <select 
                                required
                                value={formData.clientId}
                                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                className="w-full h-14 bg-dark-700 border border-white/8 rounded-xl px-4 text-sm font-medium text-white focus:border-brand-500 outline-none transition-all"
                            >
                                <option value="">Selecione o Cliente</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Serviço</label>
                                <select 
                                    required
                                    value={formData.serviceId}
                                    onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                                    className="w-full h-14 bg-dark-700 border border-white/8 rounded-xl px-4 text-sm font-medium text-white focus:border-brand-500 outline-none transition-all"
                                >
                                    <option value="">Selecione o Serviço</option>
                                    {services.map(s => <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Barbeiro</label>
                                <select 
                                    required
                                    value={formData.staffId}
                                    onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                                    className="w-full h-14 bg-dark-700 border border-white/8 rounded-xl px-4 text-sm font-medium text-white focus:border-brand-500 outline-none transition-all"
                                >
                                    <option value="">Selecione o Barbeiro</option>
                                    {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Horário</label>
                            <input 
                                type="time"
                                required
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className="w-full h-14 bg-dark-700 border border-white/8 rounded-xl px-4 text-sm font-medium text-white focus:border-brand-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-zinc-400 font-bold hover:bg-white/5 rounded-xl transition-all uppercase tracking-widest text-[10px]">Cancelar</button>
                        <button type="submit" disabled={loading} className="flex-[2] bg-brand-gradient text-white py-4 px-8 rounded-xl font-black uppercase tracking-widest shadow-brand hover:scale-[1.02] active:scale-95 transition-all text-[11px] flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Confirmar Agendamento</>}
                        </button>
                    </div>
                </form>
            </Modal>
        </AdminShell>
    );
}
