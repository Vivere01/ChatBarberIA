"use client";

import AdminShell from "@/components/admin/admin-shell";
import { Plus, ChevronLeft, ChevronRight, Clock, User, Scissors, MoreVertical, Trash2, CheckCircle, XCircle, Loader2, Info, ListTodo, X, Monitor, Trophy, DollarSign, AlertCircle, Crown, Search, Calendar } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { format, addDays, subDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Modal } from "@/components/ui/modal";
import { createAdminAppointment, getAppointments, updateAppointmentStatus, deleteAppointment } from "@/app/actions/appointment-actions";
import { getStaffList } from "@/app/actions/staff-actions";
import { getServicesList } from "@/app/actions/service-actions";
import { getClientsList } from "@/app/actions/client-actions";
import { getWaitlistEntries, updateWaitlistStatus } from "@/app/actions/waitlist-actions";
import { getStoreSettings } from "@/app/actions/settings-actions";
import { cn } from "@/lib/utils";

const TIME_SLOT_HEIGHT = 100;
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
    const [storeSettings, setStoreSettings] = useState<any>(null);
    const [fetching, setFetching] = useState(true);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    
    const [formData, setFormData] = useState({
        clientId: "",
        staffId: "",
        serviceIds: [] as string[],
        time: "09:00"
    });

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
            const [aptRes, staffRes, servRes, clientRes, waitRes, storeRes] = await Promise.all([
                getAppointments(selectedDate),
                getStaffList(),
                getServicesList(),
                getClientsList(),
                getWaitlistEntries(selectedDate),
                getStoreSettings()
            ]);
            
            setAppointments(aptRes || []);
            setStaff(staffRes || []);
            setServices(servRes || []);
            setClients(clientRes || []);
            setWaitlist(waitRes || []);
            setStoreSettings(storeRes?.store || null);
        } catch (err) {
            console.error("Error loading data:", err);
        } finally {
            setFetching(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.serviceIds.length === 0) return alert("Ops! Selecione ao menos um serviço.");
        setLoading(true);
        try {
            // Garantir que a data enviada ignore o fuso local no momento da criação
            const result = await createAdminAppointment({ ...formData, date: selectedDate });
            if (result.success) {
                await loadData();
                setIsModalOpen(false);
                setFormData({ clientId: "", staffId: "", serviceIds: [], time: "09:00" });
            } else alert("FALHA AO SALVAR: " + result.error);
        } catch (err) { alert("ERRO DE REDE: Não foi possível conectar ao servidor."); } finally { setLoading(false); }
    };

    const calculatePos = (scheduledAtStr: string, duration: number) => {
        const d = new Date(scheduledAtStr);
        
        // 🛡️ TIMEZONE PROTECTION: Como salvamos em UTC (09:00Z para 09:00), 
        // usamos o getUTC aqui para ler exatamente o número que foi gravado.
        const hours = d.getUTCHours();
        const minutes = d.getUTCMinutes();
        
        const totalMinutesFromStart = (hours - START_HOUR) * 60 + minutes;
        const top = (totalMinutesFromStart / 60) * TIME_SLOT_HEIGHT;
        const height = (duration / 60) * TIME_SLOT_HEIGHT;
        return { top, height, hours, minutes };
    };

    const getApptColorStyles = (apt: any) => {
        const colors = {
            subscriber: storeSettings?.colorSubscriber || "#166534",
            regular: storeSettings?.colorRegular || "#475569",
            defaulter: storeSettings?.colorDefaulter || "#991B1B"
        };
        if (apt.client?.isDefaulter) return { backgroundColor: colors.defaulter + '15', borderColor: colors.defaulter + '40', color: colors.defaulter };
        if (apt.client?.subscription?.status === 'ACTIVE') return { backgroundColor: colors.subscriber + '15', borderColor: colors.subscriber + '40', color: colors.subscriber };
        return { backgroundColor: colors.regular + '15', borderColor: colors.regular + '40', color: colors.regular };
    };

    const timeSlots = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

    return (
        <AdminShell>
            <div className="h-[calc(100vh-140px)] flex flex-col space-y-6">
                {/* Header Minimalista com Data Picker */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4">
                             <div className="flex flex-col">
                                <h1 className="text-xl font-light tracking-tight text-white/90">
                                    <span className="font-black text-brand-400 mr-2">{format(selectedDate, "dd", { locale: ptBR })}</span>
                                    {format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}
                                </h1>
                                <p className="text-[10px] uppercase font-black tracking-[3px] text-zinc-600 mt-1">{format(selectedDate, "EEEE", { locale: ptBR })}</p>
                            </div>
                            
                            {/* 📅 CALENDÁRIO / DATA PICKER */}
                            <div className="relative group">
                                <input 
                                    type="date" 
                                    value={format(selectedDate, "yyyy-MM-dd")}
                                    onChange={(e) => setSelectedDate(new Date(e.target.value + "T12:00:00"))}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                />
                                <div className="p-2.5 bg-dark-800 border border-white/5 rounded-xl text-zinc-400 group-hover:bg-white/5 transition-all">
                                    <Calendar className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center bg-dark-800/50 p-1 rounded-xl border border-white/5">
                            <button onClick={() => setSelectedDate(subDays(selectedDate, 1))} className="p-2 hover:bg-white/5 rounded-lg text-zinc-500"><ChevronLeft className="w-4 h-4" /></button>
                            <button onClick={() => setSelectedDate(new Date())} className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:text-white transition-all">Hoje</button>
                            <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="p-2 hover:bg-white/5 rounded-lg text-zinc-500"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsWaitlistOpen(true)} className="flex items-center gap-2 bg-dark-800/40 text-[10px] font-black uppercase tracking-widest text-orange-400 px-5 py-3 rounded-xl border border-orange-500/10 hover:bg-orange-500/5 relative">
                            <ListTodo className="w-3.5 h-3.5" />
                            Lista de Espera
                            {waitlist.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white flex items-center justify-center rounded-full text-[9px] border-2 border-dark-900 shadow-xl">{waitlist.length}</span>}
                        </button>
                        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-brand-gradient text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-brand hover:scale-105 transition-all">
                            <Plus className="w-4 h-4" /> NOVO AGENDAMENTO
                        </button>
                    </div>
                </div>

                {/* Grade Principal da Agenda */}
                <div className="flex-1 glass-card rounded-3xl border border-white/5 overflow-hidden flex flex-col shadow-2xl bg-dark-900/10 backdrop-blur-sm">
                    {/* Header Profissionais */}
                    <div className="flex border-b border-white/5 bg-dark-900/40 backdrop-blur-xl z-20">
                        <div className="w-20 flex-shrink-0 flex items-center justify-center"><Clock className="w-4 h-4 text-zinc-700" /></div>
                        <div className="flex-1 flex overflow-x-auto scrollbar-hide py-3">
                            {staff.map((member) => (
                                <div key={member.id} className="min-w-[240px] flex-1 flex flex-col items-center justify-center border-r border-white/5 last:border-0">
                                    <div className="w-11 h-11 rounded-[14px] bg-dark-800 border-2 border-white/5 overflow-hidden mb-1.5 shadow-lg group-hover:scale-110 transition-transform">
                                        <img src={member.avatarUrl || "https://ui-avatars.com/api/?name="+member.name} className="w-full h-full object-cover grayscale" alt={member.name} />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{member.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto relative scrollbar-hide">
                        <div className="flex min-h-full">
                            {/* Coluna Horários */}
                            <div className="w-20 border-r border-white/5 flex-shrink-0 z-20 bg-dark-950/20 backdrop-blur-sm sticky left-0">
                                {timeSlots.map(hour => (
                                    <div key={hour} className="h-[100px] flex items-start justify-end pr-4 pt-1 border-b border-white/[0.02]">
                                        <span className="text-[11px] font-black text-zinc-600 tracking-tighter tabular-nums">{String(hour).padStart(2, '0')}:00</span>
                                    </div>
                                ))}
                            </div>

                            {/* Colunas Barbeiros */}
                            <div className="flex-1 flex overflow-x-auto scrollbar-hide relative min-w-max">
                                {staff.map((member) => (
                                    <div key={member.id} className="min-w-[240px] flex-1 border-r border-white/5 last:border-0 relative">
                                        {/* Zonas de Clique (15 min) */}
                                        {timeSlots.map(hour => (
                                            <div key={hour} className="h-[100px] border-b border-white/[0.03] relative pointer-events-none">
                                                {[0, 15, 30, 45].map(m => (
                                                    <div 
                                                        key={m} 
                                                        onClick={() => {
                                                            setFormData({ ...formData, staffId: member.id, time: `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')}` });
                                                            setIsModalOpen(true);
                                                        }}
                                                        className="h-1/4 w-full cursor-pointer hover:bg-brand-500/[0.03] transition-colors pointer-events-auto"
                                                    />
                                                ))}
                                            </div>
                                        ))}

                                        {/* Agendamentos (AS COMANDAS) */}
                                        {appointments.filter(a => a.staffId === member.id).map(apt => {
                                            const { top, height, hours, minutes } = calculatePos(apt.scheduledAt, apt.durationMinutes || 30);
                                            const colorStyle = getApptColorStyles(apt);
                                            
                                            if (hours < START_HOUR || hours > END_HOUR) return null;

                                            return (
                                                <div 
                                                    key={apt.id}
                                                    className="absolute left-2.5 right-2.5 rounded-[20px] border-2 p-3.5 cursor-pointer transition-all hover:scale-[1.03] hover:z-50 group flex flex-col z-10 shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in duration-300"
                                                    style={{ 
                                                        top: `${top}px`, 
                                                        height: `${height}px`, 
                                                        backgroundColor: colorStyle.backgroundColor, 
                                                        borderColor: colorStyle.borderColor, 
                                                        color: colorStyle.color 
                                                    }}
                                                    onClick={() => setOpenMenuId(openMenuId === apt.id ? null : apt.id)}
                                                >
                                                    {/* Header Minimalista */}
                                                    <div className="flex justify-between items-start mb-2 opacity-60">
                                                        <div className="flex gap-2">
                                                            <Monitor className="w-3 h-3" />
                                                            {apt.client?.subscription?.status === 'ACTIVE' && <Trophy className="w-3 h-3" />}
                                                            <DollarSign className="w-3 h-3" />
                                                        </div>
                                                        <span className="text-[9px] font-black tabular-nums">{String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}</span>
                                                    </div>

                                                    {/* Cliente em Destaque */}
                                                    <h3 className="font-black text-[11px] uppercase leading-tight tracking-wide truncate mb-1.5">{apt.client?.name}</h3>
                                                    
                                                    {/* Lista de Serviços Compacta */}
                                                    <div className="flex flex-wrap gap-1 overflow-hidden mt-auto">
                                                        {apt.items?.map((item: any, i: number) => (
                                                            <span key={i} className="text-[7px] font-black uppercase tracking-[1px] opacity-60 bg-white/10 px-1.5 py-0.5 rounded-sm">
                                                                {item.service?.name}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    {/* Menu de Ação Flutuante */}
                                                    {openMenuId === apt.id && (
                                                        <div className="absolute inset-0 bg-dark-900/98 backdrop-blur-xl rounded-[20px] flex items-center justify-around px-2 z-[200] border border-white/10 shadow-2xl">
                                                            <button onClick={() => updateAppointmentStatus(apt.id, 'COMPLETED').then(loadData)} className="text-emerald-400 font-black text-[9px] flex flex-col items-center gap-2 group/btn uppercase tracking-[2px]">
                                                                <CheckCircle className="w-7 h-7 group-hover/btn:scale-125 transition-all" /> FECHAR
                                                            </button>
                                                            <button onClick={() => deleteAppointment(apt.id).then(loadData)} className="text-red-500 font-black text-[9px] flex flex-col items-center gap-2 group/btn uppercase tracking-[2px]">
                                                                <Trash2 className="w-7 h-7 group-hover/btn:scale-125 transition-all" /> CANCELAR
                                                            </button>
                                                            <button onClick={() => setOpenMenuId(null)} className="absolute top-3 right-3 text-white/20 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}

                                {/* Linha do Tempo Estilizada */}
                                {isSameDay(currentTime, selectedDate) && currentTime.getHours() >= START_HOUR && currentTime.getHours() <= END_HOUR && (
                                    <div 
                                        className="absolute left-0 w-full flex items-center pointer-events-none z-[60]"
                                        style={{ top: `${((currentTime.getHours() - START_HOUR) * 60 + currentTime.getMinutes()) * (TIME_SLOT_HEIGHT / 60)}px` }}
                                    >
                                        <div className="w-3.5 h-3.5 rounded-full bg-brand-500 shadow-brand -ml-1.5 border-[3px] border-white" />
                                        <div className="flex-1 h-px bg-brand-500/80 shadow-brand" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals de Criação */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Agendar Horário">
                <form onSubmit={handleCreate} className="space-y-6">
                    <div className="space-y-5">
                        <SelectionSection label="CLIENTE">
                            <select required value={formData.clientId} onChange={(e) => setFormData({ ...formData, clientId: e.target.value })} className="custom-input-premium">
                                <option value="">Selecione o Cliente</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </SelectionSection>

                        <div className="grid grid-cols-2 gap-4">
                            <SelectionSection label="PROFISSIONAL">
                                <select required value={formData.staffId} onChange={(e) => setFormData({ ...formData, staffId: e.target.value })} className="custom-input-premium">
                                    <option value="">Selecione</option>
                                    {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </SelectionSection>
                            <SelectionSection label="INÍCIO">
                                <input type="time" required value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="custom-input-premium" />
                            </SelectionSection>
                        </div>

                        <SelectionSection label="SERVIÇOS (COMBO)">
                            <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto scrollbar-hide py-1">
                                {services.map(s => (
                                    <div key={s.id} onClick={() => {
                                        const ids = formData.serviceIds.includes(s.id) ? formData.serviceIds.filter(id => id !== s.id) : [...formData.serviceIds, s.id];
                                        setFormData({ ...formData, serviceIds: ids });
                                    }} className={cn("p-4 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all", formData.serviceIds.includes(s.id) ? "bg-brand-500/10 border-brand-500 shadow-brand-inner" : "bg-dark-800 border-white/5 opacity-50 hover:opacity-100")}>
                                        <span className="text-[10px] font-black uppercase truncate tracking-widest">{s.name}</span>
                                        <span className="text-[9px] font-bold text-zinc-500 truncate">{s.durationMinutes} min • R$ {s.price}</span>
                                    </div>
                                ))}
                            </div>
                        </SelectionSection>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="submit" disabled={loading} className="flex-1 bg-brand-gradient py-5 rounded-2xl font-black text-white uppercase text-[11px] tracking-[3px] shadow-brand hover:scale-[1.02] active:scale-95 transition-all border border-white/5">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Confirmar Agendamento"}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isWaitlistOpen} onClose={() => setIsWaitlistOpen(false)} title="Lista de Espera">
                 <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-hide">
                    {waitlist.length === 0 ? (
                        <div className="py-16 text-center text-zinc-600 font-bold uppercase text-[9px] tracking-widest italic opacity-50">Nenhum cliente aguardando agora...</div>
                    ) : (
                        waitlist.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-6 bg-dark-800/20 rounded-2xl border border-white/5 shadow-xl">
                                <div className="flex flex-col">
                                    <h4 className="font-black text-white uppercase text-[11px] tracking-[2px]">{item.client.name}</h4>
                                    <span className="text-[9px] font-black text-zinc-600 mt-1 uppercase">{item.client.phone}</span>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => updateWaitlistStatus(item.id, 'FULFILLED').then(loadData)} className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"><CheckCircle className="w-5 h-5" /></button>
                                    <button onClick={() => updateWaitlistStatus(item.id, 'CANCELLED').then(loadData)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><XCircle className="w-5 h-5" /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Modal>

            <style jsx global>{`
                .custom-input-premium {
                    width: 100%;
                    height: 56px;
                    background: #111111;
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 16px;
                    padding: 0 20px;
                    font-size: 13px;
                    font-weight: 800;
                    color: white;
                    outline: none;
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
                }
                .custom-input-premium:focus { border-color: #4f46e5; }
            `}</style>
        </AdminShell>
    );
}

function SelectionSection({ label, children }: { label: string, children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[4px] ml-1">{label}</span>
            {children}
        </div>
    );
}
