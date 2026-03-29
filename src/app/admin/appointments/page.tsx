"use client";

import AdminShell from "@/components/admin/admin-shell";
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Scissors, MoreVertical, Trash2, CheckCircle, XCircle, Loader2, Info, ListTodo } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { format, addDays, subDays, startOfWeek, isSameDay, startOfDay, eachMinuteOfInterval, setHours, setMinutes, isWithinInterval, addMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Modal } from "@/components/ui/modal";
import { createAdminAppointment, getAppointments, updateAppointmentStatus, deleteAppointment } from "@/app/actions/appointment-actions";
import { getStaffList } from "@/app/actions/staff-actions";
import { getServicesList } from "@/app/actions/service-actions";
import { getClientsList } from "@/app/actions/client-actions";
import { getWaitlistEntries, updateWaitlistStatus } from "@/app/actions/waitlist-actions";
import { cn } from "@/lib/utils";

const TIME_SLOT_HEIGHT = 80; // Aumentado para dar mais espaço
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
                        <button className="hidden xl:flex items-center gap-2 bg-dark-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold border border-white/5 hover:bg-white/5 transition-all">
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
                    {/* Header dos Barbeiros */}
                    <div className="flex border-b border-white/5 bg-dark-800/80 backdrop-blur-md z-20">
                        <div className="w-20 border-r border-white/5 flex-shrink-0" />
                        <div className="flex-1 flex overflow-x-auto scrollbar-hide py-4">
                            {staff.map((member) => (
                                <div key={member.id} className="min-w-[200px] flex-1 flex flex-center px-4 border-r border-white/5 last:border-0">
                                    <div className="flex items-center gap-3 mx-auto">
                                        <div className="w-10 h-10 rounded-xl bg-dark-700 border border-white/10 overflow-hidden shadow-inner flex-shrink-0">
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
                                    <div key={member.id} className="min-w-[200px] flex-1 border-r border-white/5 last:border-0 relative">
                                        {/* Clickable Time Slots Overlay */}
                                        {timeSlots.map(hour => (
                                            <div key={hour} className="h-[80px] border-b border-white/[0.03] relative">
                                                {/* Slots de 30 min para clique */}
                                                <button 
                                                    onClick={() => openCreateAtSlot(member.id, hour, 0)}
                                                    className="absolute top-0 w-full h-1/2 hover:bg-white/[0.02] transition-colors outline-none"
                                                />
                                                <button 
                                                    onClick={() => openCreateAtSlot(member.id, hour, 30)}
                                                    className="absolute top-1/2 w-full h-1/2 hover:bg-white/[0.02] border-t border-white/[0.01] transition-colors outline-none"
                                                />
                                            </div>
                                        ))}

                                        {/* Agendamentos */}
                                        {fetching ? (
                                             <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                                 <Loader2 className="w-8 h-8 animate-spin" />
                                             </div>
                                        ) : (
                                            appointments
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
                                                                "absolute left-1 right-1 rounded-xl p-3 border shadow-lg cursor-pointer transition-all hover:scale-[1.02] hover:z-30 group overflow-hidden select-none",
                                                                apt.status === 'SCHEDULED' ? "bg-brand-500/10 border-brand-500/20 active:bg-brand-500/20" : 
                                                                apt.status === 'COMPLETED' ? "bg-emerald-500/10 border-emerald-500/20" : 
                                                                "bg-zinc-500/10 border-zinc-500/20"
                                                            )}
                                                            style={{ top: `${top}px`, height: `${height}px` }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setOpenMenuId(openMenuId === apt.id ? null : apt.id);
                                                            }}
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <p className="text-[10px] font-black text-zinc-400 mb-0.5 leading-none bg-dark-900/40 w-fit px-1 rounded">
                                                                        {format(scheduledAt, "HH:mm")}
                                                                    </p>
                                                                    <p className="font-bold text-[11px] text-white truncate leading-tight mt-1">{apt.client?.name}</p>
                                                                    <p className="text-[9px] text-zinc-500 truncate mt-0.5 uppercase tracking-tighter font-black opacity-80">
                                                                        {apt.items?.[0]?.service?.name}
                                                                    </p>
                                                                </div>
                                                                
                                                                {/* Menu de Ações Rápido no Card */}
                                                                <button className="p-1 hover:bg-white/10 rounded-lg transition-all">
                                                                    <MoreVertical className="w-3 h-3 text-zinc-500" />
                                                                </button>
                                                            </div>

                                                            {/* Menu Flutuante ao Clicar */}
                                                            {openMenuId === apt.id && (
                                                                <div className="absolute top-2 right-8 bg-dark-800 border border-white/10 rounded-xl shadow-2xl p-2 z-50 flex flex-col gap-1 min-w-[120px] animate-in fade-in zoom-in duration-200">
                                                                    {apt.status === 'SCHEDULED' && (
                                                                        <button 
                                                                            onClick={() => { updateStatus(apt.id, 'COMPLETED'); setOpenMenuId(null); }}
                                                                            className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                                                                        >
                                                                            <CheckCircle className="w-3 h-3" /> Finalizar
                                                                        </button>
                                                                    )}
                                                                    <button 
                                                                        onClick={() => handleDelete(apt.id)}
                                                                        className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" /> Cancelar
                                                                    </button>
                                                                </div>
                                                            )}

                                                            <div className={cn(
                                                                "absolute bottom-0 left-0 w-full h-1 opacity-50",
                                                                apt.status === 'SCHEDULED' ? "bg-brand-500" : 
                                                                apt.status === 'COMPLETED' ? "bg-emerald-500" : "bg-zinc-500"
                                                            )} />
                                                        </div>
                                                    );
                                                })
                                        )}
                                    </div>
                                ))}

                                {/* Linha de Tempo Atual */}
                                {currentTimePos !== null && (
                                    <div 
                                        className="absolute left-0 w-full flex items-center pointer-events-none z-40"
                                        style={{ top: `${currentTimePos}px` }}
                                    >
                                        <div className="w-3 h-3 rounded-full bg-brand-500 shadow-brand -ml-[6px] border-2 border-white" />
                                        <div className="flex-1 h-0.5 bg-brand-500 shadow-brand opacity-60" />
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
