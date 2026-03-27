"use client";

import AdminShell from "@/components/admin/admin-shell";
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Scissors, MoreVertical, Trash2, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { format, addDays, subDays, startOfWeek, isSameDay, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Modal } from "@/components/ui/modal";
import { createAdminAppointment, getAppointments, updateAppointmentStatus, deleteAppointment } from "@/app/actions/appointment-actions";
import { getStaffList } from "@/app/actions/staff-actions";
import { getServicesList } from "@/app/actions/service-actions";
import { getClientsList } from "@/app/actions/client-actions";
import { getWaitlistEntries, updateWaitlistStatus } from "@/app/actions/waitlist-actions";
import { cn } from "@/lib/utils";

export default function AppointmentsPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [appointments, setAppointments] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [waitlist, setWaitlist] = useState<any[]>([]);
    const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [formData, setFormData] = useState({
        clientId: "",
        serviceId: "",
        staffId: "",
        time: "09:00"
    });

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
            const result = await deleteAppointment(id);
            if (result.success) loadData();
            setOpenMenuId(null);
        } catch (err) { alert("Erro ao excluir."); }
    };

    const handleStatusUpdate = async (id: string, status: "PENDING" | "FULFILLED" | "CANCELLED") => {
        try {
            const result = await updateWaitlistStatus(id, status);
            if (result.success) loadData();
        } catch (err) { alert("Erro ao atualizar."); }
    };

    const handleAppointmentStatus = async (id: string, status: string) => {
        try {
            const result = await updateAppointmentStatus(id, status);
            if (result.success) loadData();
            setOpenMenuId(null);
        } catch (err) { alert("Erro ao atualizar agenda."); }
    };

    const timeSlots = [];
    for (let h = 8; h <= 21; h++) {
        timeSlots.push(`${h.toString().padStart(2, '0')}:00`);
        timeSlots.push(`${h.toString().padStart(2, '0')}:30`);
    }

    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(selectedDate, { weekStartsOn: 0 }), i));

    return (
        <AdminShell>
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-display text-2xl font-bold capitalize">
                            {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                        </h1>
                        <p className="text-zinc-500 text-sm">Visualizando agenda de hoje</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-dark-800 rounded-xl p-1 border border-white/5">
                            <button onClick={() => setSelectedDate(subDays(selectedDate, 1))} className="p-2 hover:bg-white/5 rounded-lg transition-all text-zinc-400"><ChevronLeft className="w-5 h-5"/></button>
                            <button onClick={() => setSelectedDate(new Date())} className="px-4 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-all">Hoje</button>
                            <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="p-2 hover:bg-white/5 rounded-lg transition-all text-zinc-400"><ChevronRight className="w-5 h-5"/></button>
                        </div>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="h-12 px-6 bg-brand-gradient text-white rounded-xl font-bold flex items-center gap-2 shadow-brand hover:scale-105 active:scale-95 transition-all text-sm"
                        >
                            <Plus className="w-5 h-5" /> Novo Agendamento
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Calendar Grid */}
                    <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-7 gap-2">
                            {weekDays.map((day, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedDate(day)}
                                    className={cn(
                                        "flex flex-col items-center p-3 rounded-2xl border transition-all",
                                        isSameDay(day, selectedDate)
                                            ? "bg-brand-gradient border-brand-500/50 shadow-brand text-white"
                                            : "bg-dark-800 border-white/5 text-zinc-500 hover:border-white/20"
                                    )}
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">
                                        {format(day, "EEE", { locale: ptBR })}
                                    </span>
                                    <span className="text-lg font-bold">{format(day, "dd")}</span>
                                </button>
                            ))}
                        </div>

                        <div className="bg-dark-800 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                            <div className="divide-y divide-white/5">
                                {timeSlots.map(time => {
                                    const appointment = appointments.find(a => a.scheduledAt.split('T')[1].startsWith(time));
                                    return (
                                        <div key={time} className="group flex min-h-[80px] hover:bg-white/[0.02] transition-all">
                                            <div className="w-24 flex items-center justify-center border-r border-white/5 text-xs font-bold text-zinc-500">
                                                {time}
                                            </div>
                                            <div className="flex-1 p-3">
                                                {appointment ? (
                                                    <div className="h-full bg-dark-700/50 border border-white/5 rounded-2xl p-4 flex items-center justify-between group-hover:border-white/10 transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                                                                <User className="w-5 h-5 text-brand-400" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-white flex items-center gap-2">
                                                                    {appointment.client.name}
                                                                    {appointment.client.isDefaulter && (
                                                                        <span className="bg-red-500/10 text-red-500 text-[9px] px-2 py-0.5 rounded-full border border-red-500/20 uppercase font-black">Inadimplente</span>
                                                                    )}
                                                                </p>
                                                                <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mt-1 flex items-center gap-2">
                                                                    <Scissors className="w-3 h-3" /> {appointment.service.name} • {appointment.staff.name}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="relative">
                                                            <button 
                                                                onClick={() => setOpenMenuId(openMenuId === appointment.id ? null : appointment.id)}
                                                                className="p-2 hover:bg-white/5 rounded-lg transition-all text-zinc-500"
                                                            >
                                                                <MoreVertical className="w-5 h-5" />
                                                            </button>
                                                            {openMenuId === appointment.id && (
                                                                <div className="absolute right-0 mt-2 w-48 bg-dark-800 border border-white/10 rounded-xl shadow-2xl py-2 z-50">
                                                                    <button onClick={() => handleAppointmentStatus(appointment.id, 'COMPLETED')} className="w-full px-4 py-2 text-left text-xs font-bold text-emerald-400 hover:bg-white/5 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Concluído</button>
                                                                    <button onClick={() => handleDelete(appointment.id)} className="w-full px-4 py-2 text-left text-xs font-bold text-red-400 hover:bg-white/5 flex items-center gap-2"><XCircle className="w-4 h-4" /> Cancelar</button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => { setFormData({ ...formData, time }); setIsModalOpen(true); }}
                                                        className="w-full h-full border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 hover:border-white/10 hover:bg-white/[0.02] transition-all"
                                                    >
                                                        <Plus className="w-5 h-5 text-zinc-600" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Waitlist Sidebar */}
                    <div className="lg:w-80 space-y-4">
                        <div className="bg-dark-800 border border-white/5 rounded-3xl p-6 shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                                        <Clock className="w-5 h-5 text-orange-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-white">Lista de Encaixe</h2>
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{waitlist.length} Clientes</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {waitlist.length === 0 ? (
                                    <div className="py-8 text-center">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Ninguém na fila</p>
                                    </div>
                                ) : (
                                    waitlist.map((entry) => (
                                        <div key={entry.id} className="bg-dark-700/30 border border-white/5 rounded-2xl p-4 space-y-3 hover:border-white/10 transition-all">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-xs font-bold text-white">{entry.client.name}</p>
                                                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter mt-0.5">{entry.client.phone}</p>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button onClick={() => handleStatusUpdate(entry.id, 'FULFILLED')} className="p-1.5 hover:bg-emerald-500/10 text-emerald-500 rounded-lg transition-all" title="Encaixado"><CheckCircle className="w-4 h-4"/></button>
                                                    <button onClick={() => handleStatusUpdate(entry.id, 'CANCELLED')} className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg transition-all" title="Remover"><Trash2 className="w-4 h-4"/></button>
                                                </div>
                                            </div>
                                            {entry.notes && (
                                                <div className="bg-dark-800/50 rounded-lg p-2 border border-white/5">
                                                    <p className="text-[9px] text-zinc-400 leading-relaxed italic italic">"{entry.notes}"</p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Agendamento */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Agendamento">
                <form onSubmit={handleCreate} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Cliente</label>
                            <select 
                                required
                                value={formData.clientId}
                                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                className="w-full h-14 bg-dark-700 border border-white/8 rounded-xl px-4 text-sm font-medium text-white focus:border-brand-500 outline-none transition-all"
                            >
                                <option value="">Selecionar Cliente</option>
                                {clients.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} {c.isDefaulter ? "(INADIMPLENTE)" : ""}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Profissional</label>
                                <select 
                                    required
                                    value={formData.staffId}
                                    onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                                    className="w-full h-14 bg-dark-700 border border-white/8 rounded-xl px-4 text-sm font-medium text-white focus:border-brand-500 outline-none transition-all"
                                >
                                    <option value="">Selecionar</option>
                                    {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Serviço</label>
                                <select 
                                    required
                                    value={formData.serviceId}
                                    onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                                    className="w-full h-14 bg-dark-700 border border-white/8 rounded-xl px-4 text-sm font-medium text-white focus:border-brand-500 outline-none transition-all"
                                >
                                    <option value="">Selecionar</option>
                                    {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Horário</label>
                                <select 
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    className="w-full h-14 bg-dark-700 border border-white/8 rounded-xl px-4 text-sm font-medium text-white focus:border-brand-500 outline-none transition-all"
                                >
                                    {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Data</label>
                                <div className="w-full h-14 bg-dark-700 border border-white/8 rounded-xl px-4 flex items-center text-sm font-medium text-zinc-400">
                                    {format(selectedDate, "dd/MM/yyyy")}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="pt-8 flex gap-3">
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
