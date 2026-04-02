"use client";

import AdminShell from "@/components/admin/admin-shell";
import { Plus, ChevronLeft, ChevronRight, Clock, User, Scissors, MoreVertical, Trash2, CheckCircle, XCircle, Loader2, Info, ListTodo, X, Monitor, Trophy, DollarSign, AlertCircle, Crown, Search, Calendar, History, MessageCircle, ExternalLink, UserPlus, ArrowRight } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { format, addDays, subDays, isSameDay } from "date-fns";
import { useSearchParams } from "next/navigation";
import { ptBR } from "date-fns/locale";
import { Modal } from "@/components/ui/modal";
import { createAdminAppointment, getAppointments, updateAppointmentStatus, deleteAppointment, getClientHistory, updateAdminAppointment } from "@/app/actions/appointment-actions";
import { getStaffList } from "@/app/actions/staff-actions";
import { getServicesList } from "@/app/actions/service-actions";
import { getClientsList } from "@/app/actions/client-actions";
import { getWaitlistEntries, updateWaitlistStatus, createAdminWaitlistEntry } from "@/app/actions/waitlist-actions";
import { getStoreSettings } from "@/app/actions/settings-actions";
import { cn } from "@/lib/utils";

const TIME_SLOT_HEIGHT = 100;
const START_HOUR = 8;
const END_HOUR = 22;

export default function AppointmentsPage() {
    const searchParams = useSearchParams();
    const currentStoreId = searchParams.get("storeId") || "all";
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
    const [editingAptId, setEditingAptId] = useState<string | null>(null);
    const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
    const [isAddWaitlistOpen, setIsAddWaitlistOpen] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    
    const [clientHistory, setClientHistory] = useState<any[]>([]);
    
    const [formData, setFormData] = useState({
        clientId: "",
        staffId: "",
        serviceIds: [] as string[],
        time: "09:00",
        date: new Date()
    });

    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        loadData();
    }, [selectedDate, currentStoreId]);

    // Auto-refresh every 30 seconds to see client bookings automatically
    useEffect(() => {
        const refreshInterval = setInterval(() => {
            loadData();
        }, 30000); // 30 seconds
        return () => clearInterval(refreshInterval);
    }, [selectedDate, currentStoreId]);

    useEffect(() => {
        if (formData.clientId) {
            getClientHistory(formData.clientId).then(setClientHistory);
        } else {
            setClientHistory([]);
        }
    }, [formData.clientId]);

    const loadData = async () => {
        setFetching(true);
        try {
            const [aptRes, staffRes, servRes, clientRes, waitRes, storeRes] = await Promise.all([
                getAppointments(selectedDate, currentStoreId),
                getStaffList(currentStoreId),
                getServicesList(),
                getClientsList(),
                getWaitlistEntries(selectedDate, currentStoreId),
                getStoreSettings(currentStoreId)
            ]);
            setAppointments(aptRes || []);
            setStaff(staffRes || []);
            setServices(servRes || []);
            setClients(clientRes || []);
            setWaitlist(waitRes || []);
            setStoreSettings(storeRes?.store || null);
        } catch (err) { console.error(err); } finally { setFetching(false); }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingAptId) {
                await updateAdminAppointment(editingAptId, {
                    staffId: formData.staffId,
                    time: formData.time,
                    date: formData.date,
                    serviceIds: formData.serviceIds
                });
            } else {
                await createAdminAppointment({ ...formData, date: selectedDate });
            }
            await loadData();
            setIsModalOpen(false);
            setEditingAptId(null);
            setShowOptions(false);
            setFormData({ clientId: "", staffId: "", serviceIds: [], time: "09:00", date: new Date() });
        } catch (err) { alert("Erro ao salvar."); } finally { setLoading(false); }
    };

    const openEdit = (apt: any) => {
        const d = new Date(apt.scheduledAt);
        setEditingAptId(apt.id);
        setShowOptions(false);
        setFormData({
            clientId: apt.clientId,
            staffId: apt.staffId,
            serviceIds: apt.items.map((i: any) => i.serviceId),
            time: `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`,
            date: new Date(apt.scheduledAt)
        });
        setIsModalOpen(true);
    };

    const calculatePos = (scheduledAtStr: string, duration: number) => {
        const d = new Date(scheduledAtStr);
        const hours = d.getUTCHours();
        const minutes = d.getUTCMinutes();
        const top = ((hours - START_HOUR) * 60 + minutes) * (TIME_SLOT_HEIGHT / 60);
        const height = (duration / 60) * TIME_SLOT_HEIGHT;
        return { top, height, hours, minutes };
    };

    const colorStyles = {
        subscriber: storeSettings?.colorSubscriber || "#166534",
        regular: storeSettings?.colorRegular || "#475569",
        defaulter: storeSettings?.colorDefaulter || "#991B1B"
    };

    const timeSlots = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

    return (
        <AdminShell>
            <div className="h-[calc(100vh-140px)] flex flex-col space-y-6">
                {/* Header Superior */}
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
                            <div className="relative group">
                                <input type="date" value={format(selectedDate, "yyyy-MM-dd")} onChange={(e) => setSelectedDate(new Date(e.target.value + "T12:00:00"))} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                <div className="p-2.5 bg-dark-800 border border-white/5 rounded-xl text-zinc-400 group-hover:bg-brand-500/20 transition-all"><Calendar className="w-5 h-5" /></div>
                            </div>
                        </div>
                        <div className="flex items-center bg-dark-800/50 p-1 rounded-xl border border-white/5 select-none">
                            <button onClick={() => setSelectedDate(subDays(selectedDate, 1))} className="p-2 hover:bg-white/5 rounded-lg text-zinc-500"><ChevronLeft className="w-4 h-4" /></button>
                            <button onClick={() => setSelectedDate(new Date())} className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:text-white">Hoje</button>
                            <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="p-2 hover:bg-white/5 rounded-lg text-zinc-500"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-dark-800/40 rounded-xl border border-white/5 overflow-hidden">
                            <button onClick={() => setIsWaitlistOpen(true)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-400 px-5 py-3 hover:bg-orange-500/5 relative border-r border-white/5">
                                <ListTodo className="w-3.5 h-3.5" /> Lista de Espera {waitlist.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white flex items-center justify-center rounded-full text-[9px] border-2 border-dark-900 shadow-xl">{waitlist.length}</span>}
                            </button>
                            <button onClick={() => setIsAddWaitlistOpen(true)} className="p-3 text-orange-400 hover:bg-orange-500/5" title="Adicionar à Espera">
                                <UserPlus className="w-4 h-4" />
                            </button>
                        </div>
                        <button onClick={() => { setEditingAptId(null); setFormData({ clientId: "", staffId: "", serviceIds: [], time: "09:00", date: selectedDate }); setIsModalOpen(true); }} className="flex items-center gap-2 bg-brand-gradient text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-brand hover:scale-105 transition-all">
                            <Plus className="w-4 h-4" /> NOVO AGENDAMENTO
                        </button>
                    </div>
                </div>

                {/* Grade Principal */}
                <div className="flex-1 glass-card border border-white/5 overflow-hidden flex flex-col shadow-2xl bg-dark-950/20 backdrop-blur-md rounded-[32px]">
                    <div className="flex border-b border-white/5 bg-dark-900/40 z-20">
                        <div className="w-20" />
                        <div className="flex-1 flex overflow-x-auto scrollbar-hide py-4 lg:snap-none snap-x snap-mandatory">
                            {staff.map((member) => (
                                <div key={member.id} className="min-w-[85vw] sm:min-w-[200px] xl:min-w-0 xl:flex-1 flex flex-col items-center border-r border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors snap-center">
                                    <div className="w-12 h-12 rounded-2xl bg-dark-800 border-2 border-white/5 overflow-hidden mb-2 shadow-xl"><img src={member.avatarUrl || `https://ui-avatars.com/api/?name=${member.name}`} className="w-full h-full object-cover" /></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{member.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto relative scrollbar-hide">
                        <div className="flex min-h-full">
                            <div className="w-20 border-r border-white/5 bg-dark-950/40 sticky left-0 z-20">
                                {timeSlots.map(hour => (
                                    <div key={hour} className="h-[100px] flex items-start justify-end pr-4 pt-1 border-b border-white/[0.02]"><span className="text-[11px] font-black text-zinc-600">{String(hour).padStart(2, '0')}:00</span></div>
                                ))}
                            </div>
                            <div className="flex-1 flex overflow-x-auto scrollbar-hide relative min-w-max lg:snap-none snap-x snap-mandatory">
                                {staff.map((member) => (
                                    <div key={member.id} className="min-w-[85vw] sm:min-w-[200px] xl:min-w-0 xl:flex-1 border-r border-white/5 last:border-0 relative snap-center">
                                        {timeSlots.map(hour => (
                                            <div key={hour} className="h-[100px] border-b border-white/[0.03] relative">
                                                {[0, 15, 30, 45].map(m => (
                                                    <div 
                                                        key={m} 
                                                        onClick={() => { setFormData({ clientId: "", staffId: member.id, serviceIds: [], time: `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')}`, date: selectedDate }); setIsModalOpen(true); }} 
                                                        onDragOver={(e) => {
                                                            e.preventDefault();
                                                            e.currentTarget.classList.add('bg-white/10');
                                                        }}
                                                        onDragLeave={(e) => {
                                                            e.currentTarget.classList.remove('bg-white/10');
                                                        }}
                                                        onDrop={async (e) => {
                                                            e.preventDefault();
                                                            e.currentTarget.classList.remove('bg-white/10');
                                                            const aptId = e.dataTransfer.getData("appointmentId");
                                                            if (!aptId) return;
                                                            
                                                            const newDate = new Date(Date.UTC(
                                                                selectedDate.getUTCFullYear(),
                                                                selectedDate.getUTCMonth(),
                                                                selectedDate.getUTCDate(),
                                                                hour,
                                                                m,
                                                                0, 0
                                                            ));

                                                            setLoading(true);
                                                            try {
                                                                await updateAdminAppointment(aptId, {
                                                                    staffId: member.id,
                                                                    scheduledAt: newDate
                                                                });
                                                                await loadData();
                                                            } finally {
                                                                setLoading(false);
                                                            }
                                                        }}
                                                        className="h-1/4 w-full cursor-pointer hover:bg-brand-500/[0.03] transition-all border-b border-white/[0.01] last:border-0" 
                                                    />
                                                ))}
                                            </div>
                                        ))}
                                        {appointments.filter(a => a.staffId === member.id).map(apt => {
                                            const { top, height, hours, minutes } = calculatePos(apt.scheduledAt, apt.durationMinutes || 30);
                                            const sColor = apt.client?.isDefaulter ? colorStyles.defaulter : (apt.client?.subscription?.status === 'ACTIVE' ? colorStyles.subscriber : colorStyles.regular);
                                            
                                            return (
                                                <div 
                                                    key={apt.id}
                                                    draggable="true"
                                                    onDragStart={(e) => {
                                                        e.dataTransfer.setData("appointmentId", apt.id);
                                                        e.dataTransfer.effectAllowed = "move";
                                                    }}
                                                    className="absolute left-3 right-3 rounded-2xl border-2 p-3.5 cursor-move transition-all hover:scale-[1.01] hover:z-50 flex flex-col shadow-2xl overflow-hidden backdrop-blur-xl group"
                                                    style={{ top: `${top}px`, height: `${height}px`, backgroundColor: sColor + '15', borderColor: sColor + '40', color: sColor }}
                                                    onClick={() => openEdit(apt)}
                                                >
                                                    <div className="flex justify-between items-start mb-2 opacity-60">
                                                        <div className="flex gap-2">
                                                            <Monitor className="w-3 h-3" />
                                                            {apt.client?.subscription?.status === 'ACTIVE' && <Crown className="w-3.5 h-3.5 text-orange-400" />}
                                                        </div>
                                                        <span className="text-[9px] font-black">{String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}</span>
                                                    </div>
                                                    <h3 className="font-black text-xs uppercase truncate mb-1">{apt.client?.name}</h3>
                                                    <div className="flex flex-wrap gap-1 mt-auto">
                                                        {apt.items?.map((item: any, i: number) => (
                                                            <span key={i} className="text-[7px] font-black uppercase tracking-widest bg-white/10 px-1.5 py-0.5 rounded-md opacity-70">{item.service?.name}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                                {isSameDay(currentTime, selectedDate) && (
                                    <div className="absolute left-0 w-full flex items-center z-[60]" style={{ top: `${((currentTime.getHours() - START_HOUR) * 60 + currentTime.getMinutes()) * (TIME_SLOT_HEIGHT / 60)}px` }}>
                                        <div className="w-3 h-3 rounded-full bg-brand-500 shadow-brand -ml-1.5 border-2 border-white" /><div className="flex-1 h-px bg-brand-500 shadow-brand opacity-50" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL REDESENHADO: RESPONSIVO E UI/UX PREMIUM */}
            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingAptId(null); }} title={editingAptId ? "Editar Agendamento" : "Novo Agendamento"} maxWidth="7xl">
                <div className="w-full space-y-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        
                        {/* COLUNA DA ESQUERDA: AÇÃO E COMANDA (7 colunas) */}
                        <div className="lg:col-span-8 space-y-10">
                            
                            {/* DADOS PRINCIPAIS */}
                            <div className="bg-white/[0.02] p-8 rounded-[32px] border border-white/5 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <Section label="CLIENTE">
                                        <div className="flex gap-3">
                                            <select required value={formData.clientId} onChange={(e) => setFormData({ ...formData, clientId: e.target.value })} className="custom-input flex-1 !h-14">
                                                <option value="">Selecione o Cliente</option>
                                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                            <button type="button" className="w-14 h-14 bg-brand-500/10 text-brand-500 rounded-2xl flex items-center justify-center hover:bg-brand-500 hover:text-white transition-all border border-brand-500/20"><UserPlus className="w-5 h-5" /></button>
                                        </div>
                                    </Section>
                                    <Section label="PROFISSIONAL">
                                        <div className="flex gap-3">
                                            <select required value={formData.staffId} onChange={(e) => setFormData({ ...formData, staffId: e.target.value })} className="custom-input flex-1 !h-14">
                                                <option value="">Selecione Profissional</option>
                                                {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                            <div className="w-14 h-14 bg-dark-800 border border-white/5 rounded-2xl flex items-center justify-center"><User className="w-5 h-5 text-zinc-600" /></div>
                                        </div>
                                    </Section>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    <Section label="DATA">
                                        <div className="relative">
                                            <input type="date" value={format(formData.date, "yyyy-MM-dd")} onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value + "T12:00:00") })} className="custom-input !h-14 !px-4 text-xs" />
                                            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                                        </div>
                                    </Section>
                                    <Section label="INÍCIO">
                                        <div className="relative">
                                            <input type="time" required value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="custom-input !h-14 !px-4 text-lg font-black tracking-widest text-brand-400" />
                                            <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                                        </div>
                                    </Section>
                                    <Section label="FIM ESTIMADO">
                                        <div className="relative">
                                            {(() => {
                                                const [h, m] = formData.time.split(':').map(Number);
                                                const totalDur = services.filter(s => formData.serviceIds.includes(s.id)).reduce((acc, s) => acc + s.durationMinutes, 0);
                                                const end = new Date();
                                                end.setHours(h, m + (totalDur || 30), 0, 0);
                                                return <input type="time" readOnly value={`${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`} className="custom-input !h-14 !px-4 text-lg font-bold text-zinc-600 bg-dark-900/50 border-dashed opacity-50" />;
                                            })()}
                                            <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                                        </div>
                                    </Section>
                                </div>
                            </div>

                            {/* TABELA DE SERVIÇOS (CENTRALIZADA) */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[4px]">Itens da Comanda</h3>
                                    <div className="text-right">
                                        <span className="text-[9px] font-black text-zinc-600 block uppercase tracking-widest">Total Acumulado</span>
                                        <span className="text-2xl font-black text-white">R$ {services.filter(s => formData.serviceIds.includes(s.id)).reduce((acc, s) => acc + Number(s.price), 0).toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="glass-card border border-white/5 overflow-hidden rounded-[32px]">
                                    <div className="p-4 bg-white/[0.02] border-b border-white/5 flex gap-4">
                                        <select 
                                            className="custom-input !h-12 !rounded-xl !px-4 text-xs flex-1"
                                            onChange={(e) => {
                                                const id = e.target.value;
                                                if (id && !formData.serviceIds.includes(id)) {
                                                    setFormData(prev => ({ ...prev, serviceIds: [...prev.serviceIds, id] }));
                                                }
                                                e.target.value = "";
                                            }}
                                        >
                                            <option value="">Adicionar novo serviço ou produto...</option>
                                            {services.map(s => <option key={s.id} value={s.id}>{s.name} • R$ {s.price}</option>)}
                                        </select>
                                        <button type="button" className="w-12 h-12 bg-brand-500 text-white rounded-xl shadow-lg shadow-brand/20 flex items-center justify-center hover:scale-105 transition-all"><Plus className="w-5 h-5" /></button>
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
                                        <table className="w-full text-left">
                                            <thead className="bg-white/5 border-b border-white/5 sticky top-0 z-10 backdrop-blur-md">
                                                <tr>
                                                    <th className="px-8 py-4 text-[9px] font-black text-zinc-600 uppercase tracking-widest">Serviço</th>
                                                    <th className="px-8 py-4 text-[9px] font-black text-zinc-600 uppercase tracking-widest text-center">Valor</th>
                                                    <th className="px-8 py-4 text-[9px] font-black text-zinc-600 uppercase tracking-widest text-center">Duração</th>
                                                    <th className="px-8 py-4 text-right"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/[0.02]">
                                                {formData.serviceIds.length === 0 ? (
                                                    <tr><td colSpan={4} className="px-8 py-12 text-center text-xs font-medium text-zinc-600 italic">Lista de serviços vazia.</td></tr>
                                                ) : (
                                                    services.filter(s => formData.serviceIds.includes(s.id)).map(s => (
                                                        <tr key={s.id} className="group hover:bg-white/[0.01]">
                                                            <td className="px-8 py-5">
                                                                <span className="text-xs font-black text-white uppercase tracking-wider block">{s.name}</span>
                                                                <span className="text-[9px] text-zinc-600 uppercase font-bold mt-0.5">Procedimento Confirmado</span>
                                                            </td>
                                                            <td className="px-8 py-5 text-center text-xs font-black text-brand-400">R$ {s.price}</td>
                                                            <td className="px-8 py-5 text-center text-xs font-bold text-zinc-500">{s.durationMinutes}m</td>
                                                            <td className="px-8 py-5 text-right">
                                                                <button onClick={() => setFormData(prev => ({ ...prev, serviceIds: prev.serviceIds.filter(id => id !== s.id) }))} className="p-2 text-zinc-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* COLUNA DA DIREITA: DOSSIÊ E AÇÕES (4 colunas) */}
                        <div className="lg:col-span-4 flex flex-col space-y-10">
                            
                            {/* DOSSIÊ ANALÍTICO */}
                            <div className="flex-1 bg-dark-950/40 rounded-[40px] border border-white/5 p-8 relative overflow-hidden flex flex-col">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-brand-500/5 blur-[100px] rounded-full" />
                                
                                <div className="flex items-center gap-4 mb-10 relative">
                                    <div className="w-12 h-12 bg-dark-900 rounded-2xl flex items-center justify-center border border-white/10 shadow-xl"><History className="w-6 h-6 text-brand-400" /></div>
                                    <div>
                                        <h3 className="text-xs font-black text-white uppercase tracking-widest leading-none">Dossiê do Cliente</h3>
                                        <p className="text-[9px] text-zinc-600 uppercase font-black mt-1.5 tracking-tight">Análise de histórico recente</p>
                                    </div>
                                </div>

                                <div className="space-y-6 flex-1">
                                    {clientHistory.length > 0 ? (
                                        clientHistory.slice(0, 4).map((hist, i) => (
                                            <div key={i} className="group cursor-default">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-black text-zinc-500 tabular-nums">{format(new Date(hist.scheduledAt), "dd/MM/yyyy HH:mm")}</span>
                                                    <span className="text-[9px] font-black text-brand-500/60 uppercase">{hist.staff.name}</span>
                                                </div>
                                                <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 group-hover:bg-white/[0.03] transition-all">
                                                    <p className="text-[11px] font-bold text-zinc-400 leading-relaxed uppercase">{hist.items.map((it: any) => it.service.name).join(" + ")}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="h-40 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-[32px] opacity-20">
                                            <Info className="w-8 h-8 mb-4" />
                                            <p className="text-[9px] font-black uppercase tracking-widest">Sem registros prévios</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-10 pt-8 border-t border-white/5 space-y-4">
                                    <Section label="OBSERVAÇÕES INTERNAS">
                                        <textarea className="w-full bg-dark-900/50 border border-white/5 rounded-2xl p-4 text-xs text-zinc-400 outline-none focus:border-brand-500/30 transition-all min-h-[100px] scrollbar-hide" placeholder="Notas sobre preferências do cliente..." />
                                    </Section>
                                </div>
                            </div>

                            {/* AÇÕES FIXAS NO RODAPÉ DO DOSSIÊ */}
                            <div className="space-y-4">
                                {editingAptId && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <button onClick={() => updateAppointmentStatus(editingAptId, 'COMPLETED').then(loadData).then(() => setIsModalOpen(false))} className="flex items-center justify-center gap-2 h-14 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all"><CheckCircle className="w-4 h-4" /> FINALIZAR</button>
                                            <button onClick={() => updateAppointmentStatus(editingAptId, 'CANCELLED').then(loadData).then(() => setIsModalOpen(false))} className="flex items-center justify-center gap-2 h-14 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all"><XCircle className="w-4 h-4" /> FALTOU/CAN</button>
                                        </div>
                                        <button 
                                            onClick={async () => {
                                                if (confirm("Tem certeza que deseja EXCLUIR este agendamento? Esta ação é irreversível.")) {
                                                    setLoading(true);
                                                    const res = await deleteAppointment(editingAptId);
                                                    if (res.success) {
                                                        await loadData();
                                                        setIsModalOpen(false);
                                                        setEditingAptId(null);
                                                    } else {
                                                        alert("Erro ao excluir agendamento.");
                                                    }
                                                    setLoading(false);
                                                }
                                            }} 
                                            className="w-full flex items-center justify-center gap-2 h-14 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" /> EXCLUIR AGENDAMENTO
                                        </button>
                                    </div>
                                )}
                                <div className="flex gap-4">
                                    <button onClick={() => { setIsModalOpen(false); setEditingAptId(null); }} className="px-6 h-16 text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors">Cancelar</button>
                                    <button type="submit" disabled={loading} onClick={handleSave} className="flex-1 h-16 bg-brand-gradient text-white rounded-[24px] font-black uppercase text-[11px] tracking-[3px] shadow-brand hover:scale-[1.02] active:scale-95 transition-all">
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (editingAptId ? "SALVAR ALTERAÇÕES" : "CONFIRMAR RESERVA")}
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </Modal>

            {/* LISTA DE ESPERA MODAL (NÃO MUDOU) */}
            <Modal isOpen={isWaitlistOpen} onClose={() => setIsWaitlistOpen(false)} title="Lista de Espera">
                 <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-hide">
                    {waitlist.length === 0 ? <div className="py-20 text-center opacity-30 uppercase font-black tracking-widest text-xs">Sem clientes em espera</div> : waitlist.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-7 bg-dark-800/20 rounded-3xl border border-white/5 shadow-2xl">
                            <div className="flex flex-col"><h4 className="font-black text-white uppercase text-xs tracking-wider">{item.client.name}</h4><span className="text-[10px] font-bold text-zinc-600 mt-1">{item.client.phone}</span></div>
                            <div className="flex gap-2">
                                <button onClick={() => updateWaitlistStatus(item.id, 'FULFILLED').then(loadData)} className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all"><CheckCircle className="w-6 h-6" /></button>
                                <button onClick={() => updateWaitlistStatus(item.id, 'CANCELLED').then(loadData)} className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><X className="w-6 h-6" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </Modal>

            <Modal isOpen={isAddWaitlistOpen} onClose={() => setIsAddWaitlistOpen(false)} title="Adicionar à Lista de Espera">
                <form onSubmit={async (e) => {
                    e.preventDefault();
                    setLoading(true);
                    const formDataObj = new FormData(e.currentTarget);
                    const clientId = formDataObj.get("clientId") as string;
                    const storeId = storeSettings?.id;
                    if (!clientId || !storeId) return alert("Selecione um cliente.");
                    
                    const res = await createAdminWaitlistEntry({
                        clientId,
                        storeId,
                        requestedDate: selectedDate,
                        notes: formDataObj.get("notes") as string
                    });
                    
                    if (res.success) {
                        await loadData();
                        setIsAddWaitlistOpen(false);
                    } else {
                        alert(res.error);
                    }
                    setLoading(false);
                }} className="space-y-6">
                    <Section label="CLIENTE">
                        <select name="clientId" required className="custom-input !h-14">
                            <option value="">Selecione o Cliente</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </Section>
                    <Section label="OBSERVAÇÕES">
                        <textarea name="notes" className="custom-input !h-24 py-4" placeholder="Alguma observação?" />
                    </Section>
                    <button type="submit" disabled={loading} className="w-full h-14 bg-brand-gradient text-white rounded-2xl font-black uppercase tracking-widest">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "ADICIONAR À ESPERA"}
                    </button>
                </form>
            </Modal>

            <style jsx global>{`
                .custom-input { width: 100%; height: 60px; background: #0a0a0a; border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 0 24px; font-size: 14px; font-weight: 800; color: white; outline: none; transition: all 0.2s; box-shadow: inset 0 2px 4px rgba(0,0,0,0.5); }
                .custom-input:focus { border-color: #4f46e5; background: #000; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }
                select.custom-input { appearance: none; cursor: pointer; }
            `}</style>
        </AdminShell>
    );
}

function Section({ label, children }: { label: string, children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[4px] ml-1">{label}</span>
            {children}
        </div>
    );
}

function QuickAction({ label, icon: Icon, color, onClick }: { label: string, icon: any, color: string, onClick: () => void }) {
    const colorClasses: any = {
        emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white",
        orange: "bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500 hover:text-white",
        blue: "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500 hover:text-white",
        red: "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white"
    };
    return (
        <button type="button" onClick={onClick} className={cn("p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all font-black text-[9px] uppercase tracking-wider", colorClasses[color])}>
            <Icon className="w-5 h-5" /> {label}
        </button>
    );
}
