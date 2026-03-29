"use client";

import AdminShell from "@/components/admin/admin-shell";
import { Plus, ChevronLeft, ChevronRight, Clock, User, Scissors, MoreVertical, Trash2, CheckCircle, XCircle, Loader2, Info, ListTodo, X, Monitor, Trophy, DollarSign, AlertCircle, Crown, Search, Calendar, History, MessageCircle, ExternalLink, UserPlus, ArrowRight } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { format, addDays, subDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Modal } from "@/components/ui/modal";
import { createAdminAppointment, getAppointments, updateAppointmentStatus, deleteAppointment, getClientHistory, updateAdminAppointment } from "@/app/actions/appointment-actions";
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
    const [editingAptId, setEditingAptId] = useState<string | null>(null);
    const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
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
    }, [selectedDate]);

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
                        <button onClick={() => setIsWaitlistOpen(true)} className="flex items-center gap-2 bg-dark-800/40 text-[10px] font-black uppercase tracking-widest text-orange-400 px-5 py-3 rounded-xl border border-orange-500/10 hover:bg-orange-500/5 relative">
                            <ListTodo className="w-3.5 h-3.5" /> Lista de Espera {waitlist.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white flex items-center justify-center rounded-full text-[9px] border-2 border-dark-900 shadow-xl">{waitlist.length}</span>}
                        </button>
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
                                                        onDragOver={(e) => e.preventDefault()}
                                                        onDrop={async (e) => {
                                                            e.preventDefault();
                                                            const aptId = e.dataTransfer.getData("appointmentId");
                                                            if (!aptId) return;
                                                            
                                                            const targetTime = `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                                                            const [h, mm] = targetTime.split(':').map(Number);
                                                            const newDate = new Date(selectedDate);
                                                            newDate.setHours(h, mm, 0, 0);

                                                            setLoading(true);
                                                            await updateAdminAppointment(aptId, {
                                                                staffId: member.id,
                                                                scheduledAt: newDate
                                                            });
                                                            await loadData();
                                                            setLoading(false);
                                                        }}
                                                        className="h-1/4 w-full cursor-pointer hover:bg-brand-500/[0.03] transition-colors" 
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
            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingAptId(null); }} title={editingAptId ? "Gerenciar Agendamento" : "Novo Agendamento"}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 min-h-[500px] w-full max-w-5xl mx-auto overflow-hidden">
                    
                    {/* COLUNA ESQUERDA: FORMULÁRIO (8 colunas) */}
                    <div className="lg:col-span-12 xl:col-span-7 space-y-8 flex flex-col justify-between h-full">
                        <div className="space-y-6">
                            <Section label="CLIENTE">
                                <div className="flex gap-3">
                                    <select required value={formData.clientId} onChange={(e) => setFormData({ ...formData, clientId: e.target.value })} className="custom-input flex-1">
                                        <option value="">Selecione o Cliente</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    <button type="button" className="h-[60px] w-[60px] bg-brand-500/10 text-brand-500 rounded-2xl flex items-center justify-center hover:bg-brand-500 hover:text-white transition-all shadow-sm border border-brand-500/10">
                                        <UserPlus className="w-6 h-6" />
                                    </button>
                                </div>
                            </Section>

                            <div className="grid grid-cols-2 gap-4">
                                <Section label="PROFISSIONAL">
                                    <select required value={formData.staffId} onChange={(e) => setFormData({ ...formData, staffId: e.target.value })} className="custom-input">
                                        <option value="">Selecione Profissional</option>
                                        {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </Section>
                                <Section label="HORA DE INÍCIO">
                                    <div className="relative">
                                        <input type="time" required value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="custom-input !pr-10" />
                                        <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                                    </div>
                                </Section>
                            </div>

                            <Section label="ESCOLHA OS SERVIÇOS">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[180px] overflow-y-auto scrollbar-hide pr-1">
                                    {services.map(s => (
                                        <button 
                                            key={s.id} 
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, serviceIds: prev.serviceIds.includes(s.id) ? prev.serviceIds.filter(id => id !== s.id) : [...prev.serviceIds, s.id] }))}
                                            className={cn("p-4 rounded-2xl border-2 text-left transition-all relative group", formData.serviceIds.includes(s.id) ? "bg-brand-500/10 border-brand-500 shadow-brand-inner" : "bg-dark-800 border-white/5 opacity-60 hover:opacity-100")}
                                        >
                                            <div className="flex justify-between items-start">
                                                <p className="text-[11px] font-black uppercase tracking-wider text-white">{s.name}</p>
                                                {formData.serviceIds.includes(s.id) && <CheckCircle className="w-4 h-4 text-brand-500" />}
                                            </div>
                                            <p className="text-[10px] font-bold text-zinc-500 mt-1">R$ {s.price} • {s.durationMinutes}m</p>
                                        </button>
                                    ))}
                                </div>
                            </Section>
                        </div>

                        {/* AÇÕES DE RODAPÉ */}
                        <div className="pt-8 border-t border-white/5 flex flex-col gap-4">
                            {editingAptId && (
                                <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-2 transition-all overflow-hidden", showOptions ? "max-h-40 opacity-100" : "max-h-0 opacity-0")}>
                                    <QuickAction label="FINALIZAR" icon={CheckCircle} color="emerald" onClick={() => updateAppointmentStatus(editingAptId, 'COMPLETED').then(loadData)} />
                                    <QuickAction label="FALTOU" icon={XCircle} color="orange" onClick={() => updateAppointmentStatus(editingAptId, 'CANCELLED').then(loadData)} />
                                    <QuickAction label="WHATSAPP" icon={MessageCircle} color="blue" onClick={() => {}} />
                                    <QuickAction label="EXCLUIR" icon={Trash2} color="red" onClick={() => deleteAppointment(editingAptId).then(loadData)} />
                                </div>
                            )}
                            
                            <div className="flex gap-4">
                                {editingAptId && (
                                    <button type="button" onClick={() => setShowOptions(!showOptions)} className="h-[60px] px-6 bg-dark-800 border border-white/5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-zinc-400 hover:text-white transition-all flex items-center justify-center gap-2">
                                        {showOptions ? <X className="w-4 h-4" /> : <MoreVertical className="w-4 h-4" />}
                                        {showOptions ? "FECHAR" : "OPÇÕES"}
                                    </button>
                                )}
                                <button type="submit" disabled={loading} onClick={handleSave} className="flex-1 h-[60px] bg-brand-gradient text-white rounded-2xl font-black uppercase text-[11px] tracking-[3px] shadow-brand hover:scale-[1.01] active:scale-95 transition-all">
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (editingAptId ? "SALVAR ALTERAÇÕES" : "CONFIRMAR RESERVA")}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* COLUNA DIREITA: DOSSIÊ (5 colunas) */}
                    <div className="lg:col-span-12 xl:col-span-5 flex flex-col h-full bg-dark-950/40 rounded-[32px] p-8 border border-white/5 relative overflow-hidden group/dossie">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 blur-[80px] -mr-16 -mt-16 rounded-full group-hover/dossie:bg-brand-500/20 transition-all" />
                        
                        <div className="relative z-10 flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-dark-900 rounded-2xl flex items-center justify-center shadow-lg border border-white/5">
                                <History className="w-6 h-6 text-brand-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-white">Dossiê do Cliente</h3>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase mt-0.5">Visão analítica do histórico</p>
                            </div>
                        </div>
                        
                        <div className="flex-1 space-y-8 relative z-10">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-6 h-px bg-zinc-800" /> ÚLTIMO AGENDAMENTO
                                </h4>
                                {clientHistory.length > 0 ? (
                                    <div className="p-5 bg-dark-900/60 rounded-[28px] border border-white/5 space-y-4 shadow-inner">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                                                <span className="text-xs font-black text-zinc-300 tabular-nums">{format(new Date(clientHistory[0].scheduledAt), "dd/MM/yyyy")}</span>
                                            </div>
                                            <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest px-3 py-1 bg-brand-500/5 rounded-full">{clientHistory[0].staff.name}</span>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Scissors className="w-3.5 h-3.5 text-zinc-600 mt-1" />
                                            <p className="text-xs text-zinc-400 leading-relaxed font-bold">
                                                {clientHistory[0].items.map((i: any) => i.service.name).join(", ")}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-12 flex flex-col items-center justify-center bg-dark-800/20 rounded-[28px] border border-dashed border-white/10 opacity-30">
                                        <Info className="w-8 h-8 mb-3 text-zinc-700" />
                                        <p className="text-[10px] font-black uppercase tracking-wider text-zinc-600">Nenhum registro prévio</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-6 h-px bg-zinc-800" /> ITENS RECORRENTES
                                </h4>
                                {clientHistory.length > 1 ? (
                                    <div className="space-y-2">
                                        {clientHistory.slice(1, 4).map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4 p-4 bg-dark-800/40 rounded-2xl border border-white/5 hover:bg-dark-800 transition-all group/item">
                                                <div className="w-9 h-9 rounded-xl bg-dark-900 border border-white/10 flex items-center justify-center text-[11px] font-black text-brand-400 group-hover/item:scale-110 transition-transform">{idx + 1}</div>
                                                <div className="flex-1">
                                                    <span className="text-[11px] font-black text-zinc-300 uppercase tracking-wider block">{item.items[0]?.service.name}</span>
                                                    <span className="text-[9px] font-bold text-zinc-600 uppercase mt-0.5 block">{format(new Date(item.scheduledAt), "MMMM/yyyy", { locale: ptBR })}</span>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-zinc-800 group-hover/item:text-brand-500 transition-colors" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-zinc-700 text-[10px] font-black uppercase border border-dashed border-white/5 rounded-[28px]">Aguardando dados...</div>
                                )}
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
                            <button onClick={() => updateWaitlistStatus(item.id, 'FULFILLED').then(loadData)} className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all"><CheckCircle className="w-6 h-6" /></button>
                        </div>
                    ))}
                </div>
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
