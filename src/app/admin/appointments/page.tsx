"use client";

import AdminShell from "@/components/admin/admin-shell";
import { Plus, Clock, ChevronLeft, ChevronRight, User, Scissors, Loader2, Save, CalendarCheck, UserCog } from "lucide-react";
import { format, addDays, subDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, useEffect } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { getStaffList } from "@/app/actions/staff-actions";
import { getAppointments, createAppointment } from "@/app/actions/appointment-actions";
import { getServicesList } from "@/app/actions/service-actions";
import Link from "next/link";

const hours = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00"];

export default function AppointmentsPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [staffList, setStaffList] = useState<any[]>([]);
    const [servicesList, setServicesList] = useState<any[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        client: "",
        serviceId: "",
        staffId: "",
        time: "",
    });

    useEffect(() => {
        const loadAgendaData = async () => {
            setFetching(true);
            try {
                const [staff, services, apts] = await Promise.all([
                    getStaffList(),
                    getServicesList(),
                    getAppointments(selectedDate)
                ]);

                setStaffList(staff || []);
                setServicesList(services || []);
                setAppointments(apts || []);

                if (services && services.length > 0) {
                    setFormData(prev => ({ ...prev, serviceId: services[0].id }));
                }
            } catch (err) {
                console.error("Erro ao carregar agenda:", err);
            } finally {
                setFetching(false);
            }
        };
        loadAgendaData();
    }, [selectedDate]);

    const handlePrevDay = () => setSelectedDate(subDays(selectedDate, 1));
    const handleNextDay = () => setSelectedDate(addDays(selectedDate, 1));
    const handleToday = () => setSelectedDate(new Date());

    const openCreateModal = (time?: string, staffMemberId?: string) => {
        if (staffList.length === 0) {
            alert("Você precisa cadastrar ao menos um profissional primeiro.");
            return;
        }

        setFormData(prev => ({
            ...prev,
            client: "",
            staffId: staffMemberId || staffList[0].id,
            time: time || hours[0],
        }));
        setIsModalOpen(true);
    };

    const handleSaveAppointment = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await createAppointment({
                ...formData,
                date: selectedDate,
            });

            if (result.success) {
                setAppointments([...appointments, result.appointment]);
                setIsModalOpen(false);
            } else {
                alert(result.error || "Tente novamente.");
            }
        } catch (err) {
            console.error("Erro ao agendar:", err);
            alert("Erro na conexão.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminShell>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-dark-800/50 border border-white/5 p-4 rounded-2xl">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <h1 className="font-display text-xl font-bold capitalize">
                                {format(selectedDate, "eeee, dd 'de' MMMM", { locale: ptBR })}
                            </h1>
                            <p className="text-zinc-500 text-xs mt-0.5">
                                {isSameDay(selectedDate, new Date()) ? "Visualizando agenda de hoje" : "Visualizando data selecionada"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-dark-900 border border-white/10 rounded-xl p-1 shadow-inner">
                            <button onClick={handlePrevDay} className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-all">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button onClick={handleToday} className={cn("px-4 py-1.5 rounded-lg text-xs font-semibold transition-all", isSameDay(selectedDate, new Date()) ? "bg-brand-500/10 text-brand-400 border border-brand-500/20" : "text-zinc-400 hover:text-white")}>
                                Hoje
                            </button>
                            <button onClick={handleNextDay} className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-all">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="relative">
                            <input
                                type="date"
                                className="bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-brand-500/40 w-40 flex items-center gap-2 cursor-pointer [color-scheme:dark]"
                                value={format(selectedDate, "yyyy-MM-dd")}
                                onChange={(e) => setSelectedDate(new Date(e.target.value + 'T00:00:00'))}
                            />
                        </div>

                        <button onClick={() => openCreateModal()} disabled={fetching} className="flex items-center gap-2 bg-brand-gradient text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition-all shadow-brand-sm group disabled:opacity-50">
                            <Plus className="w-4 h-4" />
                            Novo Agendamento
                        </button>
                    </div>
                </div>

                {fetching ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-brand-400 opacity-20" />
                        <p className="text-zinc-500 text-sm">Organizando sua agenda...</p>
                    </div>
                ) : staffList.length === 0 ? (
                    <div className="glass-card rounded-[2.5rem] p-16 flex flex-col items-center justify-center text-center gap-8 border-white/[0.03] overflow-hidden relative">
                        <div className="w-24 h-24 rounded-[2rem] bg-brand-500/10 flex items-center justify-center border border-brand-500/20 shadow-brand-sm">
                            <UserCog className="w-10 h-10 text-brand-400" />
                        </div>
                        <div className="max-w-md space-y-3 relative z-10">
                            <h3 className="text-3xl font-display font-bold text-white tracking-tight">Agenda Bloqueada</h3>
                            <p className="text-zinc-500 leading-relaxed">
                                Você ainda não possui barbeiros cadastrados neste estabelecimento.
                                Cadastre um profissional para começar a gerenciar os horários.
                            </p>
                        </div>
                        <Link href="/admin/staff" className="flex items-center gap-3 bg-brand-gradient text-white px-10 py-5 rounded-[1.5rem] font-bold hover:scale-105 active:scale-95 transition-all shadow-brand">
                            <Plus className="w-5 h-5" />
                            Cadastrar meu primeiro Profissional
                        </Link>
                    </div>
                ) : (
                    <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full border-separate border-spacing-0">
                                <thead>
                                    <tr className="bg-white/2">
                                        <th className="text-left px-4 py-4 text-xs font-bold text-zinc-500 w-20 sticky left-0 z-20 bg-dark-800 border-r border-white/5 backdrop-blur-md">
                                            <div className="flex flex-col items-center">
                                                <Clock className="w-3 h-3 mb-1" />
                                                <span>HORA</span>
                                            </div>
                                        </th>
                                        {staffList.map((s) => (
                                            <th key={s.id} className="text-center px-6 py-4 text-[11px] font-bold text-zinc-400 min-w-[200px] border-b border-white/5">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="w-10 h-10 rounded-full bg-brand-gradient p-[1px]">
                                                        <div className="w-full h-full rounded-full bg-dark-800 flex items-center justify-center text-xs font-bold text-brand-400">
                                                            {s.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    </div>
                                                    <span className="uppercase tracking-wider truncate max-w-[150px]">{s.name}</span>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/4">
                                    {hours.map((hour) => (
                                        <tr key={hour} className="group">
                                            <td className="px-4 py-6 text-[11px] text-zinc-500 font-mono font-medium sticky left-0 z-10 bg-dark-800/90 border-r border-white/5 text-center backdrop-blur-sm">
                                                {hour}
                                            </td>
                                            {staffList.map((s) => {
                                                const apt = appointments.find(a => {
                                                    const aptTime = format(new Date(a.scheduledAt), "HH:mm");
                                                    return aptTime === hour && a.staffId === s.id;
                                                });

                                                return (
                                                    <td key={s.id} className="p-1 border-r border-white/[0.02]">
                                                        {apt ? (
                                                            <div className="h-14 w-full rounded-xl bg-brand-500/20 border border-brand-500/30 p-2.5 flex flex-col justify-center animate-fade-in relative group/apt cursor-pointer overflow-hidden text-center shadow-lg">
                                                                <p className="text-[10px] font-bold text-brand-400 truncate">{apt.client.name}</p>
                                                                <p className="text-[9px] text-white/50 truncate uppercase mt-0.5">
                                                                    {apt.items?.[0]?.service?.name || "Sem Serviço"}
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <div
                                                                onClick={() => openCreateModal(hour, s.id)}
                                                                className="h-14 w-full rounded-xl border border-white/5 hover:bg-brand-500/[0.05] hover:border-brand-500/20 transition-all cursor-pointer flex items-center justify-center group/cell relative overflow-hidden"
                                                            >
                                                                <Plus className="w-3 h-3 text-white/5 group-hover/cell:text-brand-400/50 transition-colors" />
                                                            </div>
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
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Agendar Cliente">
                <form onSubmit={handleSaveAppointment} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2 font-display">Nome do Cliente</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input type="text" required value={formData.client} onChange={(e) => setFormData({ ...formData, client: e.target.value })} placeholder="Nome do cliente" className="w-full bg-dark-700 border border-white/8 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 transition-all font-medium" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2 font-display">Serviço</label>
                            <select className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50 transition-all font-medium" value={formData.serviceId} onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}>
                                {servicesList.length === 0 ? <option disabled>Nenhum serviço</option> : servicesList.map(s => <option key={s.id} value={s.id}>{s.name} ({formatCurrency(s.price)})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2 font-display">Profissional</label>
                            <select className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50 transition-all font-medium" value={formData.staffId} onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}>
                                {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2 font-display">Horário</label>
                        <select className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50 transition-all font-medium" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })}>
                            {hours.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                    </div>

                    <div className="flex gap-3 pt-6 border-t border-white/5 mt-8">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 rounded-xl border border-white/5 text-zinc-400 font-semibold hover:bg-white/5 transition-all">Cancelar</button>
                        <button type="submit" disabled={loading || servicesList.length === 0} className="flex-3 bg-brand-gradient text-white py-3.5 px-8 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-brand disabled:opacity-50">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" />Confirmar Agendamento</>}
                        </button>
                    </div>
                </form>
            </Modal>
        </AdminShell>
    );
}
