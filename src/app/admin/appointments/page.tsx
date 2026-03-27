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

export default function AppointmentsPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [appointments, setAppointments] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [formData, setFormData] = useState({
        clientId: "",
        serviceId: "",
        staffId: "",
        time: "09:00",
    });

    useEffect(() => {
        loadData();
    }, [selectedDate]);

    const loadData = async () => {
        setFetching(true);
        try {
            const [apptData, staffData, serviceData, clientData] = await Promise.all([
                getAppointments(selectedDate),
                getStaffList(),
                getServicesList(),
                getClientsList(),
            ]);
            setAppointments(apptData || []);
            setStaff(staffData?.filter((s:any) => s.isActive !== false) || []);
            setServices(serviceData || []);
            setClients(clientData || []);
        } catch (err) {
            console.error("Erro ao carregar agenda:", err);
        } finally {
            setFetching(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await createAdminAppointment({...formData, date: selectedDate});
            if (result.success) {
                await loadData();
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

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            const result = await updateAppointmentStatus(id, status);
            if (result.success) loadData();
            setOpenMenuId(null);
        } catch (err) { alert("Erro ao atualizar."); }
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

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-dark-800 p-1.5 rounded-2xl border border-white/5">
                            <button onClick={() => setSelectedDate(subDays(selectedDate, 1))} className="p-1.5 hover:bg-white/5 rounded-xl transition-all"><ChevronLeft className="w-4 h-4" /></button>
                            <button onClick={() => setSelectedDate(new Date())} className="px-4 py-1.5 bg-brand-gradient text-white text-[10px] font-bold uppercase rounded-xl hover:opacity-90 shadow-brand-sm">Hoje</button>
                            <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="p-1.5 hover:bg-white/5 rounded-xl transition-all"><ChevronRight className="w-4 h-4" /></button>
                        </div>

                        <div className="relative group bg-dark-800 p-3 rounded-2xl border border-white/5 flex items-center gap-2 cursor-pointer hover:border-brand-500/30 transition-all">
                            <span className="text-sm font-bold text-zinc-300">{format(selectedDate, "dd/MM/yyyy")}</span>
                            <CalendarIcon className="w-4 h-4 opacity-30" />
                            <input type="date" value={format(selectedDate, "yyyy-MM-dd")} onChange={(e) => {
                                const [y,m,d] = e.target.value.split('-').map(Number);
                                setSelectedDate(new Date(y, m-1, d));
                            }} className="absolute inset-0 opacity-0 cursor-pointer w-full" />
                        </div>

                        <button onClick={() => setIsModalOpen(true)} className="bg-brand-gradient text-white px-6 py-3 rounded-xl text-sm font-bold shadow-brand flex items-center gap-2 hover:scale-[1.02] transition-all">
                            <Plus className="w-4 h-4" /> Novo Agendamento
                        </button>
                    </div>
                </div>

                {/* Week Mini Calendar */}
                <div className="grid grid-cols-7 gap-3">
                    {weekDays.map((day) => (
                        <button key={day.toString()} onClick={() => setSelectedDate(day)} className={`flex flex-col items-center py-5 h-28 justify-center rounded-3xl border-2 transition-all ${
                            isSameDay(day, selectedDate) ? "bg-brand-500/10 border-brand-500/40" : "bg-dark-800/50 border-white/5 hover:border-white/10"
                        }`}>
                            <span className={`text-[10px] font-bold uppercase mb-2 ${isSameDay(day, selectedDate) ? "text-brand-400" : "text-zinc-600"}`}>
                                {format(day, "EEEE", { locale: ptBR })}
                            </span>
                            <span className={`text-2xl font-bold font-display ${isSameDay(day, selectedDate) ? "text-white" : "text-zinc-400"}`}>
                                {format(day, "dd")}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Agenda Grid */}
                <div className="glass-card rounded-3xl border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-dark-800/80 backdrop-blur-sm border-b border-white/5">
                                    <th className="p-6 text-left text-[10px] font-bold uppercase text-zinc-600 border-r border-white/5 sticky left-0 z-20 bg-dark-800 w-24">Hora</th>
                                    {staff.map(member => (
                                        <th key={member.id} className="p-6 min-w-[280px] border-r border-white/5">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-12 h-12 rounded-full border-2 border-brand-500/30 flex items-center justify-center bg-dark-700 text-brand-400 font-bold overflow-hidden shadow-lg">
                                                    {member.avatarUrl ? <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" /> : member.name.charAt(0)}
                                                </div>
                                                <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-100">{member.name}</span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {timeSlots.map(time => (
                                    <tr key={time} className="border-b border-white/[0.03] group">
                                        <td className="p-4 text-center sticky left-0 z-10 bg-dark-900 border-r border-white/5 text-xs font-bold text-zinc-500 group-hover:text-brand-400 transition-colors">
                                            {time}
                                        </td>
                                        {staff.map(member => {
                                            const appt = appointments.find(a => 
                                                a.staffId === member.id && 
                                                format(new Date(a.scheduledAt), "HH:mm") === time
                                            );
                                            
                                            // Handle multi-slot height? Keep it simple: 1 row per 30m
                                            return (
                                                <td key={`${member.id}-${time}`} className="p-2 border-r border-white/5 align-top relative min-h-[90px]">
                                                    {appt ? (
                                                        <div className={`p-4 rounded-2xl border flex flex-col justify-between h-full animate-in fade-in zoom-in duration-300 ${
                                                            appt.status === 'CONFIRMED' ? 'bg-green-500/10 border-green-500/20' :
                                                            appt.status === 'CANCELLED' ? 'bg-red-500/10 border-red-500/20' :
                                                            'bg-brand-500/10 border-brand-500/20 shadow-[inset_0_0_20px_rgba(76,62,245,0.05)]'
                                                        }`}>
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h4 className="text-xs font-bold text-white max-w-[80%] flex items-center gap-1.5 flex-wrap">
                                                                    <span className="truncate block max-w-full">{appt.client.name}</span>
                                                                    {appt.client.isDefaulter && (
                                                                        <span className="text-[8px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-sm uppercase font-black tracking-widest border border-red-500/10">Inadimplente</span>
                                                                    )}
                                                                </h4>
                                                                <div className="relative">
                                                                    <button onClick={() => setOpenMenuId(openMenuId === appt.id ? null : appt.id)} className="p-1 text-zinc-600 hover:text-white transition-colors">
                                                                        <MoreVertical className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    {openMenuId === appt.id && (
                                                                        <div className="absolute right-0 mt-2 w-44 bg-dark-700 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden font-bold">
                                                                            <button onClick={() => handleStatusUpdate(appt.id, 'CONFIRMED')} className="w-full text-left px-4 py-3 text-[10px] text-zinc-300 hover:bg-white/5 flex items-center gap-2">
                                                                                <CheckCircle className="w-3.5 h-3.5 text-green-400" /> Presença Confirmada
                                                                            </button>
                                                                            <button onClick={() => handleStatusUpdate(appt.id, 'CANCELLED')} className="w-full text-left px-4 py-3 text-[10px] text-zinc-300 hover:bg-white/5 flex items-center gap-2">
                                                                                <XCircle className="w-3.5 h-3.5 text-yellow-400" /> Marcar como Faltou
                                                                            </button>
                                                                            <button onClick={() => handleDelete(appt.id)} className="w-full text-left px-4 py-3 text-[10px] text-red-400 hover:bg-red-500/10 flex items-center gap-2 border-t border-white/5">
                                                                                <Trash2 className="w-3.5 h-3.5" /> Cancelar Horário
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-400">
                                                                <Scissors className="w-3 h-3 text-brand-400" />
                                                                <span className="uppercase">{appt.items[0]?.service.name || "Serviço"}</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            onClick={() => {
                                                                setFormData({...formData, staffId: member.id, time});
                                                                setIsModalOpen(true);
                                                            }}
                                                            className="w-full h-full min-h-[50px] flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white/[0.02] rounded-xl transition-all"
                                                        >
                                                            <Plus className="w-4 h-4 text-zinc-800" />
                                                        </button>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Agendamento">
                <form onSubmit={handleCreate} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Cliente</label>
                        <select required value={formData.clientId} onChange={(e) => setFormData({...formData, clientId: e.target.value})} className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50">
                            <option value="">Selecionar cliente...</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}{c.phone ? ` — ${c.phone}` : ""}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Serviço</label>
                            <select required value={formData.serviceId} onChange={(e) => setFormData({...formData, serviceId: e.target.value})} className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50">
                                <option value="">Selecionar...</option>
                                {services.map(s => <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Barbeiro</label>
                            <select required value={formData.staffId} onChange={(e) => setFormData({...formData, staffId: e.target.value})} className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50">
                                <option value="">Selecionar...</option>
                                {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Horário</label>
                            <select value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50">
                                {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Data</label>
                            <div className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-3 text-zinc-400">
                                {format(selectedDate, "dd/MM/yyyy")}
                            </div>
                        </div>
                    </div>
                    <div className="pt-8 flex gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-zinc-400 font-semibold hover:bg-white/5 rounded-xl transition-all">Cancelar</button>
                        <button type="submit" disabled={loading} className="flex-3 bg-brand-gradient text-white py-3 px-8 rounded-xl font-bold hover:opacity-90 shadow-brand transition-all flex justify-center">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmar Agendamento"}
                        </button>
                    </div>
                </form>
            </Modal>
        </AdminShell>
    );
}
