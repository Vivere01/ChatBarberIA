"use client";

import AdminShell from "@/components/admin/admin-shell";
import { Plus, ChevronLeft, ChevronRight, Clock, User, Scissors, MoreVertical, Trash2, CheckCircle, XCircle, Loader2, Info, ListTodo, X, Monitor, Trophy, DollarSign, AlertCircle, Crown } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { format, addDays, subDays, isSameDay, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Modal } from "@/components/ui/modal";
import { createAdminAppointment, getAppointments, updateAppointmentStatus, deleteAppointment } from "@/app/actions/appointment-actions";
import { getStaffList } from "@/app/actions/staff-actions";
import { getServicesList } from "@/app/actions/service-actions";
import { getClientsList } from "@/app/actions/client-actions";
import { getWaitlistEntries, updateWaitlistStatus } from "@/app/actions/waitlist-actions";
import { cn } from "@/lib/utils";

const TIME_SLOT_HEIGHT = 100; // Altura maior para melhor visibilidade
const START_HOUR = 8;
const END_HOUR = 22;

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
                await loadData();
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

    // Estilo da comanda baseado no status do cliente (Inspirado no print)
    const getApptStyle = (apt: any) => {
        if (apt.client?.isDefaulter) return "bg-[#FEF2F2] border-[#FCA5A5] text-[#991B1B]"; // Vermelho Inadimplente
        if (apt.client?.subscription?.status === 'ACTIVE') return "bg-[#F0FDF4] border-[#86EFAC] text-[#166534]"; // Verde Assinante
        return "bg-[#F8FAFC] border-[#E2E8F0] text-[#475569]"; // Cinza Padrão
    };

    const timeSlots = useMemo(() => {
        return Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);
    }, []);

    const calculatePos = (date: Date, duration: number) => {
        const d = new Date(date);
        const hours = d.getHours();
        const minutes = d.getMinutes();
        const totalMinutesFromStart = (hours - START_HOUR) * 60 + minutes;
        const top = (totalMinutesFromStart / 60) * TIME_SLOT_HEIGHT;
        const height = (duration / 60) * TIME_SLOT_HEIGHT;
        return { top, height };
    };

    return (
        <AdminShell>
            <div className="h-[calc(100vh-140px)] flex flex-col space-y-6">
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <h1 className="font-display text-2xl font-black capitalize text-zinc-200">
                            {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                            <span className="text-zinc-600 font-normal ml-3">{format(selectedDate, "yyyy")}</span>
                        </h1>
                        <div className="flex items-center gap-1 bg-dark-800 p-1.5 rounded-2xl border border-white/5 shadow-xl">
                            <button onClick={() => setSelectedDate(new Date())} className="px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-white/5 rounded-xl transition-all">Hoje</button>
                            <div className="w-px h-4 bg-white/10 mx-1" />
                            <button onClick={() => setSelectedDate(subDays(selectedDate, 1))} className="p-2 hover:bg-white/5 rounded-xl text-zinc-400"><ChevronLeft className="w-5 h-5" /></button>
                            <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="p-2 hover:bg-white/5 rounded-xl text-zinc-400"><ChevronRight className="w-5 h-5" /></button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsWaitlistOpen(true)} className="flex items-center gap-2 bg-dark-800 px-5 py-3 rounded-2xl text-sm font-black border border-white/5 hover:bg-white/10 transition-all text-orange-400 relative">
                            <ListTodo className="w-4 h-4" /> LISTA DE ESPERA
                            {waitlist.filter(w => w.status === 'PENDING').length > 0 && (
                                <span className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-dark-900 shadow-xl">{waitlist.filter(w => w.status === 'PENDING').length}</span>
                            )}
                        </button>
                        <button className="hidden xl:flex items-center gap-2 bg-dark-800 text-white px-5 py-3 rounded-2xl text-sm font-black border border-white/5 hover:bg-white/5 transition-all">
                             <Monitor className="w-4 h-4 text-blue-400" /> CONSUMO
                        </button>
                        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-brand-gradient text-white px-6 py-3 rounded-2xl text-sm font-black shadow-brand hover:scale-105 transition-all">
                            <Plus className="w-4 h-4" /> NOVO AGENDAMENTO
                        </button>
                    </div>
                </div>

                {/* Agenda Grid Workspace */}
                <div className="flex-1 bg-dark-950/20 rounded-[40px] border border-white/5 overflow-hidden flex flex-col shadow-2xl backdrop-blur-sm">
                    {/* Professional Header - Sticky Top */}
                    <div className="flex border-b border-white/5 bg-dark-900/60 backdrop-blur-xl z-30">
                        <div className="w-24 border-r border-white/5 flex-shrink-0 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-zinc-600" />
                        </div>
                        <div className="flex-1 flex overflow-x-auto scrollbar-hide">
                            {staff.map((member) => (
                                <div key={member.id} className="min-w-[280px] flex-1 flex items-center justify-center py-6 border-r border-white/5 last:border-0 relative">
                                    <div className="flex flex-col items-center gap-3 group">
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-[22px] bg-dark-800 border-2 border-white/5 overflow-hidden shadow-2xl group-hover:scale-110 transition-transform duration-300">
                                                <img src={member.avatarUrl || "https://ui-avatars.com/api/?name="+member.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt={member.name} />
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-dark-900 shadow-emerald" />
                                        </div>
                                        <span className="font-display font-black text-sm text-zinc-200 tracking-wide uppercase">{member.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Scrollable Layout Container */}
                    <div className="flex-1 overflow-y-auto relative scrollbar-hide bg-grid-white/[0.02]" ref={scrollContainerRef}>
                        <div className="flex min-h-full">
                            {/* Horizontal Time Labels */}
                            <div className="w-24 border-r border-white/5 bg-dark-950/40 flex-shrink-0 z-20 sticky left-0">
                                {timeSlots.map(hour => (
                                    <div key={hour} className="relative h-[100px] flex items-start justify-end pr-4 pt-1 border-b border-white/[0.02]">
                                        <span className="text-[12px] font-black text-zinc-600 tabular-nums">
                                            {String(hour).padStart(2, '0')}:00
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Main Body - Professionals Grid */}
                            <div className="flex-1 flex overflow-x-auto scrollbar-hide relative min-w-max">
                                {staff.map((member) => (
                                    <div key={member.id} className="min-w-[280px] flex-1 border-r border-white/5 last:border-0 relative">
                                        {/* Click Zones for each 15-min slot */}
                                        {timeSlots.map(hour => (
                                            <div key={hour} className="h-[100px] border-b border-white/[0.03] relative pointer-events-none">
                                                {[0, 15, 30, 45].map(m => (
                                                    <div 
                                                        key={m} 
                                                        onClick={(e) => { e.preventDefault(); openCreateAtSlot(member.id, hour, m); }}
                                                        className="h-1/4 w-full cursor-pointer hover:bg-white/[0.02] pointer-events-auto transition-colors"
                                                    />
                                                ))}
                                            </div>
                                        ))}

                                        {/* Render Active Appointments (The "Comandas") */}
                                        {appointments.filter(a => a.staffId === member.id).map(apt => {
                                            const { top, height } = calculatePos(apt.scheduledAt, apt.durationMinutes || 30);
                                            const endTime = addMinutes(new Date(apt.scheduledAt), apt.durationMinutes || 30);
                                            
                                            return (
                                                <div 
                                                    key={apt.id}
                                                    className={cn(
                                                        "absolute left-2.5 right-2.5 rounded-[22px] border-2 shadow-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] hover:z-50 group flex flex-col z-10",
                                                        getApptStyle(apt)
                                                    )}
                                                    style={{ top: `${top}px`, height: `${height}px` }}
                                                    onClick={() => setOpenMenuId(openMenuId === apt.id ? null : apt.id)}
                                                >
                                                    {/* Comanda Icons (Inspirado no print) */}
                                                    <div className="flex gap-2 mb-3 opacity-80">
                                                        <Monitor className="w-4 h-4" />
                                                        {apt.client?.subscription?.status === 'ACTIVE' ? <Crown className="w-4 h-4 text-[#C2920F]" /> : <Scissors className="w-4 h-4" />}
                                                        <DollarSign className="w-4 h-4" />
                                                    </div>

                                                    {/* Client Info */}
                                                    <div className="flex-1 overflow-hidden">
                                                        <h3 className="font-black text-sm uppercase leading-tight mb-1 truncate">{apt.client?.name}</h3>
                                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 truncate">
                                                            {apt.items?.map((i: any) => i.service?.name).join(', ') || "Serviço"}
                                                        </p>
                                                    </div>

                                                    {/* Time Range Footer */}
                                                    <div className="mt-auto flex items-center gap-2 pt-2 border-t border-current/10 opacity-60">
                                                        <Clock className="w-3 h-3" />
                                                        <span className="text-[10px] font-black tabular-nums">
                                                            {format(new Date(apt.scheduledAt), "HH:mm")} - {format(endTime, "HH:mm")}
                                                        </span>
                                                    </div>

                                                    {/* Comanda Action Menu Overlay */}
                                                    {openMenuId === apt.id && (
                                                        <div className="absolute inset-0 bg-dark-900/95 backdrop-blur-md rounded-[22px] flex items-center justify-around px-4 animate-in fade-in zoom-in duration-200 z-[100]">
                                                            <button onClick={() => updateStatus(apt.id, 'COMPLETED')} className="flex flex-col items-center gap-2 text-emerald-400 hover:scale-110 transition-all font-black text-[10px]">
                                                                <CheckCircle className="w-8 h-8" /> FECHAR
                                                            </button>
                                                            <button onClick={() => handleDelete(apt.id)} className="flex flex-col items-center gap-2 text-red-500 hover:scale-110 transition-all font-black text-[10px]">
                                                                <Trash2 className="w-8 h-8" /> CANCELAR
                                                            </button>
                                                            <button onClick={() => setOpenMenuId(null)} className="absolute top-4 right-4 text-zinc-600"><X className="w-5 h-5" /></button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}

                                {/* Real-time Current Line Indicator */}
                                {isSameDay(currentTime, selectedDate) && currentTime.getHours() >= START_HOUR && currentTime.getHours() <= END_HOUR && (
                                    <div 
                                        className="absolute left-0 w-full flex items-center pointer-events-none z-[60]"
                                        style={{ top: `${((currentTime.getHours() - START_HOUR) * 60 + currentTime.getMinutes()) * (TIME_SLOT_HEIGHT / 60)}px` }}
                                    >
                                        <div className="w-5 h-5 rounded-full bg-brand-500 shadow-brand -ml-2.5 border-4 border-white" />
                                        <div className="flex-1 h-1 bg-brand-500 shadow-brand opacity-100" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Render Modals (Agendamento & Waitlist) */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Comanda de Agendamento">
                <form onSubmit={handleCreate} className="space-y-6">
                    <div className="space-y-6">
                        <SelectionField label="CLIENTE">
                            <select required value={formData.clientId} onChange={(e) => setFormData({ ...formData, clientId: e.target.value })} className="selection-input">
                                <option value="">Selecione o Cliente</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name} {c.isDefaulter ? "(ALERTA!)" : ""}</option>)}
                            </select>
                        </SelectionField>

                        <div className="grid grid-cols-2 gap-4">
                            <SelectionField label="BARBEIRO">
                                <select required value={formData.staffId} onChange={(e) => setFormData({ ...formData, staffId: e.target.value })} className="selection-input">
                                    <option value="">Selecione Profissional</option>
                                    {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </SelectionField>
                            <SelectionField label="HORÁRIO DE INÍCIO">
                                <input type="time" required value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="selection-input" />
                            </SelectionField>
                        </div>

                        <SelectionField label="SERVIÇOS (COMBO)">
                            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto scrollbar-hide py-1">
                                {services.map(s => (
                                    <button 
                                        key={s.id} type="button" 
                                        onClick={() => toggleService(s.id)}
                                        className={cn("p-4 rounded-2xl border text-left transition-all flex flex-col gap-1", formData.serviceIds.includes(s.id) ? "bg-brand-500/20 border-brand-500 text-white shadow-brand-sm" : "bg-dark-800 border-white/5 text-zinc-500")}
                                    >
                                        <span className="text-xs font-black uppercase truncate">{s.name}</span>
                                        <span className="text-[10px] opacity-70 font-bold">{s.durationMinutes} min • R$ {s.price}</span>
                                    </button>
                                ))}
                            </div>
                        </SelectionField>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-4 font-black text-zinc-600 uppercase tracking-tighter text-xs">Cancelar</button>
                        <button type="submit" disabled={loading} className="flex-1 bg-brand-gradient py-5 rounded-[22px] font-black text-white shadow-brand uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all">
                            {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-white" /> : "Confirmar Agendamento"}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isWaitlistOpen} onClose={() => setIsWaitlistOpen(false)} title="Lista de Espera Ativa">
                 <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-hide">
                    {waitlist.length === 0 ? (
                        <div className="py-12 text-center text-zinc-600 font-bold uppercase text-[10px] tracking-widest">Ninguém aguardando no momento</div>
                    ) : (
                        waitlist.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-6 bg-dark-800/40 rounded-[22px] border border-white/5">
                                <div className="flex flex-col">
                                    <h4 className="font-black text-white uppercase text-xs">{item.client.name}</h4>
                                    <span className="text-[10px] font-bold text-zinc-500 mt-1">{item.client.phone}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => updateWaitlistStatus(item.id, 'FULFILLED').then(loadData)} className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl"><CheckCircle className="w-5 h-5" /></button>
                                    <button onClick={() => updateWaitlistStatus(item.id, 'CANCELLED').then(loadData)} className="p-3 bg-red-500/10 text-red-500 rounded-xl"><XCircle className="w-5 h-5" /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Modal>

            <style jsx global>{`
                .selection-input {
                    width: 100%;
                    height: 64px;
                    background: #111111;
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 20px;
                    padding: 0 20px;
                    font-size: 14px;
                    font-weight: 700;
                    color: white;
                    outline: none;
                }
                .selection-input:focus { border-color: var(--brand-500); }
            `}</style>
        </AdminShell>
    );

    async function updateStatus(id: string, status: string) {
        setLoading(true);
        await updateAppointmentStatus(id, status);
        await loadData();
        setLoading(false);
    }
}

function SelectionField({ label, children }: { label: string, children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[2px]">{label}</span>
            {children}
        </div>
    );
}

function addMinutes(date: Date, minutes: number) {
    return new Date(date.getTime() + minutes * 60000);
}
