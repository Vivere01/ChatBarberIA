"use client";

import AdminShell from "@/components/admin/admin-shell";
import { Plus, ChevronLeft, ChevronRight, Clock, User, Scissors, MoreVertical, Trash2, CheckCircle, XCircle, Loader2, Info, ListTodo, X, Monitor, Trophy, DollarSign, AlertCircle, Crown, Search, Calendar, History, MessageCircle, ExternalLink, UserPlus } from "lucide-react";
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
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);
    
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

    // Quando o cliente muda no form, busca o histórico
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
            setFormData({ clientId: "", staffId: "", serviceIds: [], time: "09:00", date: new Date() });
        } catch (err) { alert("Erro ao salvar."); } finally { setLoading(false); }
    };

    const openEdit = (apt: any) => {
        const d = new Date(apt.scheduledAt);
        setEditingAptId(apt.id);
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

    const colors = {
        subscriber: storeSettings?.colorSubscriber || "#166534",
        regular: storeSettings?.colorRegular || "#475569",
        defaulter: storeSettings?.colorDefaulter || "#991B1B"
    };

    const timeSlots = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

    const sendWhatsApp = (apt: any) => {
        const phone = apt.client?.phone?.replace(/\D/g, "");
        if (!phone) return alert("Cliente sem celular.");
        const text = encodeURIComponent(`Olá ${apt.client.name}, confirmando seu agendamento no ChatBarber para ${format(new Date(apt.scheduledAt), "dd/MM 'às' HH:mm", { locale: ptBR })}. Podemos confirmar?`);
        window.open(`https://wa.me/55${phone}?text=${text}`, "_blank");
    };

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
                        <div className="flex-1 flex overflow-x-auto scrollbar-hide py-4">
                            {staff.map((member) => (
                                <div key={member.id} className="min-w-[240px] flex-1 flex flex-col items-center border-r border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
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
                            <div className="flex-1 flex overflow-x-auto scrollbar-hide relative min-w-max">
                                {staff.map((member) => (
                                    <div key={member.id} className="min-w-[240px] flex-1 border-r border-white/5 last:border-0 relative">
                                        {timeSlots.map(hour => (
                                            <div key={hour} className="h-[100px] border-b border-white/[0.03] relative">
                                                {[0, 15, 30, 45].map(m => (
                                                    <div key={m} onClick={() => { setFormData({ clientId: "", staffId: member.id, serviceIds: [], time: `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')}`, date: selectedDate }); setIsModalOpen(true); }} className="h-1/4 w-full cursor-pointer hover:bg-brand-500/[0.03] transition-colors" />
                                                ))}
                                            </div>
                                        ))}
                                        {appointments.filter(a => a.staffId === member.id).map(apt => {
                                            const { top, height, hours, minutes } = calculatePos(apt.scheduledAt, apt.durationMinutes || 30);
                                            const isSelected = editingAptId === apt.id;
                                            const statusColor = apt.client?.isDefaulter ? colors.defaulter : (apt.client?.subscription?.status === 'ACTIVE' ? colors.subscriber : colors.regular);
                                            
                                            return (
                                                <div 
                                                    key={apt.id}
                                                    className={cn("absolute left-3 right-3 rounded-2xl border-2 p-3.5 cursor-pointer transition-all hover:scale-[1.02] hover:z-50 flex flex-col shadow-2xl overflow-hidden backdrop-blur-xl group", isSelected && "ring-4 ring-brand-500/50")}
                                                    style={{ top: `${top}px`, height: `${height}px`, backgroundColor: statusColor + '15', borderColor: statusColor + '40', color: statusColor }}
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

            {/* MODAL MESTRE (CRIAÇÃO / EDIÇÃO / HISTÓRICO) */}
            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingAptId(null); }} title={editingAptId ? "Gerenciar Agendamento" : "Novo Agendamento"}>
                <div className="flex flex-col lg:flex-row gap-8 min-h-[500px]">
                    <form onSubmit={handleSave} className="flex-1 space-y-6">
                        <div className="space-y-4">
                            <Section label="CLIENTE">
                                <div className="flex gap-2">
                                    <select required value={formData.clientId} onChange={(e) => setFormData({ ...formData, clientId: e.target.value })} className="custom-input flex-1">
                                        <option value="">Selecione o Cliente</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    <button type="button" className="p-4 bg-brand-500/10 text-brand-500 rounded-2xl hover:bg-brand-500 hover:text-white transition-all"><UserPlus className="w-5 h-5" /></button>
                                </div>
                            </Section>

                            <div className="grid grid-cols-2 gap-4">
                                <Section label="PROFISSIONAL">
                                    <select required value={formData.staffId} onChange={(e) => setFormData({ ...formData, staffId: e.target.value })} className="custom-input">
                                        <option value="">Selecione</option>
                                        {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </Section>
                                <Section label="HORÁRIO">
                                    <input type="time" required value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="custom-input" />
                                </Section>
                            </div>

                            <Section label="SERVIÇOS">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto scrollbar-hide">
                                    {services.map(s => (
                                        <button 
                                            key={s.id} 
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, serviceIds: prev.serviceIds.includes(s.id) ? prev.serviceIds.filter(id => id !== s.id) : [...prev.serviceIds, s.id] }))}
                                            className={cn("p-4 rounded-xl border-2 text-left transition-all", formData.serviceIds.includes(s.id) ? "bg-brand-500/10 border-brand-500" : "bg-dark-800 border-white/5 opacity-50")}
                                        >
                                            <p className="text-[10px] font-black uppercase tracking-widest">{s.name}</p>
                                            <p className="text-[9px] font-bold text-zinc-500 mt-1">R$ {s.price} • {s.durationMinutes}m</p>
                                        </button>
                                    ))}
                                </div>
                            </Section>
                        </div>

                        <div className="pt-6 flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <button type="button" onClick={() => setIsOptionsOpen(!isOptionsOpen)} className="w-full h-14 bg-dark-800 border border-white/5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-zinc-400 flex items-center justify-center gap-2 hover:bg-white/5">
                                    Opções <ChevronLeft className={cn("w-4 h-4 transition-all", isOptionsOpen ? "-rotate-90" : "")} />
                                </button>
                                {isOptionsOpen && (
                                    <div className="absolute bottom-full left-0 w-full mb-2 bg-dark-900 border border-white/5 rounded-2xl p-2 shadow-2xl z-50 overflow-hidden">
                                        {[
                                            { label: "Finalizar Atendimento", icon: CheckCircle, color: "text-emerald-400", onClick: () => updateAppointmentStatus(editingAptId!, 'COMPLETED').then(loadData) },
                                            { label: "Cliente Faltou", icon: XCircle, color: "text-orange-500", onClick: () => updateAppointmentStatus(editingAptId!, 'CANCELLED').then(loadData) },
                                            { label: "Enviar WhatsApp", icon: MessageCircle, color: "text-emerald-500", onClick: () => sendWhatsApp(appointments.find(a => a.id === editingAptId)) },
                                            { label: "Excluir Agendamento", icon: Trash2, color: "text-red-500", onClick: () => deleteAppointment(editingAptId!).then(loadData) },
                                        ].map(opt => (
                                            <button key={opt.label} type="button" onClick={() => { opt.onClick(); setIsOptionsOpen(false); setIsModalOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-left group">
                                                <opt.icon className={cn("w-4 h-4", opt.color)} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300 group-hover:text-white">{opt.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button type="submit" disabled={loading} className="flex-[2] h-14 bg-brand-gradient text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-brand">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Salvar Agendamento"}
                            </button>
                        </div>
                    </form>

                    {/* SIDEBAR: HISTÓRICO DO CLIENTE */}
                    <div className="w-full lg:w-80 bg-dark-900/60 rounded-[28px] p-6 border border-white/5">
                        <div className="flex items-center gap-3 mb-6">
                            <History className="w-5 h-5 text-zinc-600" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Dossiê do Cliente</h3>
                        </div>
                        
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-3">Último Agendamento</h4>
                                {clientHistory.length > 0 ? (
                                    <div className="p-4 bg-dark-800 rounded-2xl border border-white/5 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-white">{format(new Date(clientHistory[0].scheduledAt), "dd/MM/yyyy")}</span>
                                            <span className="text-[9px] font-bold text-zinc-500 uppercase">{clientHistory[0].staff.name}</span>
                                        </div>
                                        <p className="text-[10px] text-zinc-400 leading-relaxed font-bold italic">
                                            {clientHistory[0].items.map((i: any) => i.service.name).join(", ")}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="p-6 text-center bg-dark-800/20 rounded-2xl border border-dashed border-white/5">
                                        <p className="text-[9px] font-black uppercase text-zinc-700 tracking-tighter">Sem registros</p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-3">Itens Recorrentes</h4>
                                <div className="space-y-2">
                                    {clientHistory.slice(1, 3).map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 bg-dark-800/40 rounded-xl border border-white/5 opacity-60">
                                            <div className="w-8 h-8 rounded-lg bg-dark-900 flex items-center justify-center text-[10px] font-black text-brand-400">{idx + 1}</div>
                                            <span className="text-[9px] font-bold text-zinc-300 uppercase truncate">{item.items[0]?.service.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isWaitlistOpen} onClose={() => setIsWaitlistOpen(false)} title="Lista de Espera">
                 <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {waitlist.length === 0 ? <div className="py-16 text-center text-zinc-600 font-bold uppercase text-[9px]">Ninguém na espera</div> : waitlist.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-6 bg-dark-800/20 rounded-2xl border border-white/5">
                            <div className="flex flex-col"><h4 className="font-black text-white uppercase text-[10px]">{item.client.name}</h4><span className="text-[9px] font-bold text-zinc-500">{item.client.phone}</span></div>
                            <div className="flex gap-3"><button onClick={() => updateWaitlistStatus(item.id, 'FULFILLED').then(loadData)} className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl"><CheckCircle className="w-5 h-5" /></button></div>
                        </div>
                    ))}
                </div>
            </Modal>

            <style jsx global>{`
                .custom-input { width: 100%; height: 56px; background: #111111; border: 1px solid rgba(255,255,255,0.05); border-radius: 18px; padding: 0 20px; font-size: 13px; font-weight: 800; color: white; outline: none; }
                .custom-input:focus { border-color: #4f46e5; }
            `}</style>
        </AdminShell>
    );
}

function Section({ label, children }: { label: string, children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">{label}</span>
            {children}
        </div>
    );
}
