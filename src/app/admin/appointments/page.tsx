"use client";

import AdminShell from "@/components/admin/admin-shell";
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Scissors, MoreVertical, Trash2, CheckCircle, XCircle, Loader2, Info, ListTodo, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { format, addDays, subDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Modal } from "@/components/ui/modal";
import { createAdminAppointment, getAppointments, updateAppointmentStatus, deleteAppointment } from "@/app/actions/appointment-actions";
import { getStaffList } from "@/app/actions/staff-actions";
import { getServicesList } from "@/app/actions/service-actions";
import { getClientsList } from "@/app/actions/client-actions";
import { getWaitlistEntries, updateWaitlistStatus } from "@/app/actions/waitlist-actions";
import { cn } from "@/lib/utils";

const TIME_SLOT_HEIGHT = 80;
const MINUTE_HEIGHT = TIME_SLOT_HEIGHT / 60;

export default function AppointmentsPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentTime, setCurrentTime] = useState(new Date());
    const [appointments, setAppointments] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [waitlist, setWaitlist] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    
    // Form data
    const [formData, setFormData] = useState<{
        clientId: string;
        staffId: string;
        serviceIds: string[];
        time: string;
    }>({
        clientId: "",
        staffId: "",
        serviceIds: [],
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
            const [aptRes, staffRes, servRes, clientRes, waitRes] = await Promise.all([
                getAppointments(selectedDate),
                getStaffList(),
                getServicesList(),
                getClientsList(),
                getWaitlistEntries(selectedDate)
            ]);
            setAppointments(aptRes);
            setStaff(staffRes);
            setServices(servRes);
            setClients(clientRes);
            setWaitlist(waitRes);
        } catch (err) {
            console.error("Error loading data:", err);
        } finally {
            setFetching(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.serviceIds.length === 0) return alert("Selecione ao menos um serviço.");
        setLoading(true);
        try {
            const result = await createAdminAppointment({
                ...formData,
                date: selectedDate
            });
            if (result.success) {
                loadData();
                setIsModalOpen(false);
                setFormData({ clientId: "", staffId: "", serviceIds: [], time: "09:00" });
            } else { alert(result.error); }
        } catch (err) { alert("Erro na conexão."); } finally { setLoading(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Cancelar este agendamento?")) return;
        try {
            await deleteAppointment(id);
            loadData();
            setOpenMenuId(null);
        } catch (err) { alert("Erro ao excluir."); }
    };

    const openCreateAtSlot = (staffId: string, hour: number, minutes: number = 0) => {
        setFormData({
            ...formData,
            staffId,
            time: `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
        });
        setIsModalOpen(true);
    };

    const toggleService = (id: string) => {
        setFormData(prev => ({
            ...prev,
            serviceIds: prev.serviceIds.includes(id) 
                ? prev.serviceIds.filter(sid => sid !== id)
                : [...prev.serviceIds, id]
        }));
    };

    const getAppointmentColorStyles = (apt: any) => {
        if (apt.client?.isDefaulter) {
            return "bg-red-500/20 border-red-500/40 text-red-100 hover:bg-red-500/30";
        }
        if (apt.client?.subscription?.status === 'ACTIVE') {
            return "bg-emerald-500/20 border-emerald-500/40 text-emerald- account focus:ring-emerald-500/50 hover:bg-emerald-500/30";
        }
        return "bg-zinc-500/10 border-zinc-500/20 text-zinc-300 hover:bg-zinc-500/20";
    };

    const getStatusIndicatorColor = (apt: any) => {
        if (apt.client?.isDefaulter) return "bg-red-500 shadow-red-sm";
        if (apt.client?.subscription?.status === 'ACTIVE') return "bg-emerald-500 shadow-emerald-sm";
        return "bg-zinc-500 shadow-zinc-sm";
    };

    // Gerar horários (08:00 - 22:00)
    const startHour = 8;
    const endHour = 22;
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
                        <div className="flex items-center gap-1 bg-dark-800 p-1.5 rounded-xl border border-white/5">
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
                        <button 
                            onClick={() => setIsWaitlistOpen(true)}
                            className="flex items-center gap-2 bg-dark-800 text-zinc-400 px-5 py-2.5 rounded-xl text-sm font-bold border border-white/5 hover:bg-white/10 transition-all relative"
                        >
                            <ListTodo className="w-4 h-4 text-orange-400" />
                            Lista de Espera
                            {waitlist.filter(w => w.status === 'PENDING').length > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[10px] flex items-center justify-center rounded-full shadow-lg border-2 border-dark-900 font-black">
                                    {waitlist.filter(w => w.status === 'PENDING').length}
                                </span>
                            )}
                        </button>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 bg-brand-gradient text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-brand hover:scale-105 transition-all text-white"
                        >
                            <Plus className="w-4 h-4" />
                            Novo agendamento
                        </button>
                        <Info className="w-5 h-5 text-zinc-600 cursor-pointer hover:text-zinc-400 transition-colors" />
                    </div>
                </div>

                {/* Grid Agenda */}
                <div className="flex-1 glass-card rounded-3xl border border-white/5 overflow-hidden flex flex-col shadow-2xl relative bg-dark-900/40">
                    {/* Header dos Barbeiros */}
                    <div className="flex border-b border-white/5 bg-dark-800/80 backdrop-blur-md z-20">
                        <div className="w-20 border-r border-white/5 flex-shrink-0" />
                        <div className="flex-1 flex overflow-x-auto scrollbar-hide py-4">
                            {staff.map((member) => (
                                <div key={member.id} className="min-w-[220px] flex-1 flex flex-center px-4 border-r border-white/5 last:border-0">
                                    <div className="flex items-center gap-3 mx-auto">
                                        <div className="w-10 h-10 rounded-xl bg-dark-700 border border-white/10 overflow-hidden shadow-inner flex-shrink-0">
                                            {member.avatarUrl ? (
                                                <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-bold text-zinc-500 uppercase">{member.name[0]}</div>
                                            )}
                                        </div>
                                        <span className="font-bold text-sm text-zinc-200 truncate max-w-[130px]">{member.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Área de Scroll */}
                    <div className="flex-1 overflow-y-auto relative scrollbar-hide" ref={scrollContainerRef}>
                        <div className="flex min-h-full">
                            {/* Coluna de Horários */}
                            <div className="w-20 border-r border-white/5 bg-dark-900/30 flex-shrink-0 z-10 sticky left-0">
                                {timeSlots.map(hour => (
                                    <div key={hour} className="relative h-[80px] border-b border-white/[0.02]">
                                        <span className="absolute -top-3 right-4 text-[11px] font-black text-zinc-600 uppercase tracking-tight">
                                            {String(hour).padStart(2, '0')}:00
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Grade Central */}
                            <div className="flex-1 flex overflow-x-auto scrollbar-hide relative group">
                                {staff.map((member) => (
                                    <div key={member.id} className="min-w-[220px] flex-1 border-r border-white/5 last:border-0 relative">
                                        {/* Clickable Time Slots Overlay */}
                                        {timeSlots.map(hour => (
                                            <div key={hour} className="h-[80px] border-b border-white/[0.03] relative">
                                                <button 
                                                    onClick={() => openCreateAtSlot(member.id, hour, 0)}
                                                    className="absolute top-0 w-full h-1/4 hover:bg-white/[0.02] transition-colors outline-none"
                                                />
                                                <button 
                                                    onClick={() => openCreateAtSlot(member.id, hour, 15)}
                                                    className="absolute top-1/4 w-full h-1/4 hover:bg-white/[0.02] border-t border-white/[0.01] transition-colors outline-none"
                                                />
                                                <button 
                                                    onClick={() => openCreateAtSlot(member.id, hour, 30)}
                                                    className="absolute top-2/4 w-full h-1/4 hover:bg-white/[0.02] border-t border-white/[0.01] transition-colors outline-none"
                                                />
                                                <button 
                                                    onClick={() => openCreateAtSlot(member.id, hour, 45)}
                                                    className="absolute top-3/4 w-full h-1/4 hover:bg-white/[0.02] border-t border-white/[0.01] transition-colors outline-none"
                                                />
                                            </div>
                                        ))}

                                        {/* Agendamentos */}
                                        {!fetching && appointments
                                            .filter(apt => apt.staffId === member.id)
                                            .map(apt => {
                                                const scheduledAt = new Date(apt.scheduledAt);
                                                const startMinutes = (scheduledAt.getHours() - startHour) * 60 + scheduledAt.getMinutes();
                                                const top = startMinutes * MINUTE_HEIGHT;
                                                const height = Math.max((apt.durationMinutes || 30) * MINUTE_HEIGHT, 40);

                                                return (
                                                    <div 
                                                        key={apt.id}
                                                        className={cn(
                                                            "absolute left-1.5 right-1.5 rounded-2xl p-3 border shadow-2xl cursor-pointer transition-all hover:scale-[1.03] hover:z-30 group overflow-hidden select-none backdrop-blur-sm",
                                                            getAppointmentColorStyles(apt)
                                                        )}
                                                        style={{ top: `${top}px`, height: `${height}px` }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenMenuId(openMenuId === apt.id ? null : apt.id);
                                                        }}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <div className="flex items-center gap-1.5 mb-1.5 capitalize">
                                                                     <Clock className="w-2.5 h-2.5 opacity-50 text-white" />
                                                                     <p className="text-[10px] font-black leading-none bg-dark-900/50 px-1.5 py-0.5 rounded text-white shadow-inner">
                                                                        {format(scheduledAt, "HH:mm")}
                                                                    </p>
                                                                </div>
                                                                <p className="font-black text-xs text-white truncate leading-tight flex items-center gap-1">
                                                                    {apt.client?.name}
                                                                </p>
                                                                <div className="flex flex-wrap gap-1 mt-2">
                                                                    {apt.items?.map((item: any, i: number) => (
                                                                        <span key={i} className="text-[8px] font-bold bg-dark-900/30 px-1.5 py-0.5 rounded uppercase tracking-tighter opacity-70 border border-white/5">
                                                                            {item.service?.name}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            
                                                            <button className="p-1.5 hover:bg-white/10 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                                                                <MoreVertical className="w-4 h-4 text-white" />
                                                            </button>
                                                        </div>

                                                        {/* Menu Flutuante ao Clicar */}
                                                        {openMenuId === apt.id && (
                                                            <div className="absolute top-2 right-10 bg-dark-800 border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-2 z-50 flex flex-col gap-1 min-w-[140px] animate-in slide-in-from-right-2 duration-200 backdrop-blur-xl">
                                                                {apt.status === 'SCHEDULED' && (
                                                                    <button 
                                                                        onClick={() => { updateStatus(apt.id, 'COMPLETED'); setOpenMenuId(null); }}
                                                                        className="flex items-center justify-between px-3 py-2 text-[10px] font-black text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all uppercase tracking-widest"
                                                                    >
                                                                        Finalizar <CheckCircle className="w-3 h-3" />
                                                                    </button>
                                                                )}
                                                                <button 
                                                                    onClick={() => handleDelete(apt.id)}
                                                                    className="flex items-center justify-between px-3 py-2 text-[10px] font-black text-red-400 hover:bg-red-500/10 rounded-xl transition-all uppercase tracking-widest"
                                                                >
                                                                    Cancelar <Trash2 className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        )}

                                                        {/* Indicador Lateral de Status */}
                                                        <div className={cn(
                                                            "absolute left-0 top-0 h-full w-1 opacity-60",
                                                            getStatusIndicatorColor(apt)
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
                                        className="absolute left-0 w-full flex items-center pointer-events-none z-40"
                                        style={{ top: `${currentTimePos}px` }}
                                    >
                                        <div className="w-3.5 h-3.5 rounded-full bg-brand-500 shadow-brand -ml-2 border-2 border-white" />
                                        <div className="flex-1 h-0.5 bg-brand-500 shadow-brand opacity-80" />
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
                                className="w-full h-14 bg-dark-700 border border-white/8 rounded-xl px-4 text-sm font-medium text-white focus:border-brand-500 outline-none transition-all shadow-inner"
                            >
                                <option value="">Selecione o Cliente</option>
                                {clients.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} {c.isDefaulter ? "(DEVEDOR)" : c.subscription?.status === 'ACTIVE' ? "(ASSINANTE)" : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
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
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Início</label>
                                <input 
                                    type="time"
                                    required
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    className="w-full h-14 bg-dark-700 border border-white/8 rounded-xl px-4 text-sm font-medium text-white focus:border-brand-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex justify-between">
                                Serviços Selecionados
                                <span className="text-zinc-600">Soma automática de tempo e preço</span>
                            </label>
                            
                            {/* Lista de seleção múltipla personalizada */}
                            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-hide py-1">
                                {services.map(s => {
                                    const selected = formData.serviceIds.includes(s.id);
                                    return (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => toggleService(s.id)}
                                            className={cn(
                                                "flex flex-col items-start p-3 rounded-xl border text-left transition-all",
                                                selected 
                                                    ? "bg-brand-500/10 border-brand-500 text-white shadow-brand-sm" 
                                                    : "bg-dark-800 border-white/5 text-zinc-500 hover:border-white/10"
                                            )}
                                        >
                                            <span className="text-xs font-bold truncate w-full">{s.name}</span>
                                            <div className="flex items-center justify-between w-full mt-1">
                                                <span className="text-[9px] opacity-70">{s.durationMinutes} min</span>
                                                <span className="text-[10px] font-black text-brand-400">R$ {s.price}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {formData.serviceIds.length > 0 && (
                                <div className="mt-4 p-4 rounded-xl bg-dark-900/50 border border-white/5 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Resumo Total</span>
                                        <span className="text-xs text-zinc-200 mt-1 font-bold">
                                            {services.filter(s => formData.serviceIds.includes(s.id)).reduce((acc, s) => acc + s.durationMinutes, 0)} minutos totais
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-black text-brand-400">
                                            R$ {services.filter(s => formData.serviceIds.includes(s.id)).reduce((acc, s) => acc + s.price, 0).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-zinc-500 font-bold hover:bg-white/5 rounded-xl transition-all uppercase tracking-widest text-[10px]">Cancelar</button>
                        <button type="submit" disabled={loading || formData.serviceIds.length === 0} className="flex-[2] bg-brand-gradient text-white py-4 px-8 rounded-xl font-black uppercase tracking-widest shadow-brand hover:scale-[1.02] active:scale-95 transition-all text-[11px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Confirmar Agendamento</>}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Lista de Espera */}
            <Modal isOpen={isWaitlistOpen} onClose={() => setIsWaitlistOpen(false)} title="Lista de Espera">
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
                    {waitlist.length === 0 ? (
                        <div className="py-12 text-center text-zinc-500 text-sm italic">Nenhum cliente aguardando hoje.</div>
                    ) : (
                        waitlist.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-4 glass-card rounded-2xl border border-white/5 group bg-dark-800/40">
                                <div>
                                    <h4 className="font-bold text-white text-sm">{item.client.name}</h4>
                                    <p className="text-[10px] text-zinc-500 mt-0.5">{item.client.phone || "Sem telefone"}</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className={cn(
                                            "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                                            item.status === 'PENDING' ? "bg-orange-500/10 text-orange-400" :
                                            item.status === 'FULFILLED' ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-500/10 text-zinc-400"
                                        )}>
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {item.status === 'PENDING' && (
                                        <>
                                            <button 
                                                onClick={async () => {
                                                    await updateWaitlistStatus(item.id, 'FULFILLED');
                                                    loadData();
                                                }}
                                                className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-emerald"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={async () => {
                                                    await updateWaitlistStatus(item.id, 'CANCELLED');
                                                    loadData();
                                                }}
                                                className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                            >
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="mt-8 pt-4 border-t border-white/5 flex justify-end">
                    <button onClick={() => setIsWaitlistOpen(false)} className="bg-dark-800 text-zinc-400 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest">Fechar</button>
                </div>
            </Modal>
        </AdminShell>
    );

    async function updateStatus(id: string, status: string) {
        setLoading(true);
        await updateAppointmentStatus(id, status);
        loadData();
        setLoading(false);
    }
}
