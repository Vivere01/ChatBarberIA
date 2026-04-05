"use client";

import AdminShell from "@/components/admin/admin-shell";
import { 
    ChevronLeft, 
    Save, 
    Loader2, 
    Calendar, 
    Clock, 
    Scissors, 
    Users, 
    Settings2, 
    Target, 
    CheckCircle2, 
    Circle,
    Package,
    TrendingDown,
    Zap
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    getSubscriptionPlanById, 
    updateSubscriptionPlan, 
    syncPlanServices, 
    syncPlanStaff 
} from "@/app/actions/subscription-actions";
import { getServicesList } from "@/app/actions/service-actions";
import { getStaffList } from "@/app/actions/staff-actions";
import { SubscriptionPeriodicity } from "@prisma/client";

const PERIODICITIES = [
    { label: "Semanal", value: "WEEKLY" },
    { label: "Quinzenal", value: "BIWEEKLY" },
    { label: "Mensal", value: "MONTHLY" },
    { label: "Trimestral", value: "QUARTERLY" },
    { label: "Semestral", value: "SEMIANNUAL" },
    { label: "Anual", value: "YEARLY" },
];

const DAYS_OF_WEEK = [
    { label: "Dom", value: 0 },
    { label: "Seg", value: 1 },
    { label: "Ter", value: 2 },
    { label: "Qua", value: 3 },
    { label: "Qui", value: 4 },
    { label: "Sex", value: 5 },
    { label: "Sáb", value: 6 },
];

export default function PlanManagementPage() {
    const { id } = useParams();
    const router = useRouter();
    const [plan, setPlan] = useState<any>(null);
    const [services, setServices] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<"geral" | "servicos" | "barbeiros">("geral");

    // Form states
    const [formData, setFormData] = useState<any>({
        name: "",
        description: "",
        price: 0,
        potAmount: 0,
        chipsPerService: 1,
        periodicity: "MONTHLY",
        productDiscountPercent: 0,
        activeDays: [1, 2, 3, 4, 5, 6],
        maxSimultaneousAppointments: 1,
        galaxId: "",
        checkoutUrl: "",
        isActive: true
    });

    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [selectedStaff, setSelectedStaff] = useState<string[]>([]);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        const [planData, servicesData, staffData] = await Promise.all([
            getSubscriptionPlanById(id as string),
            getServicesList(),
            getStaffList()
        ]);

        if (planData) {
            setPlan(planData);
            setFormData({
                name: planData.name,
                description: planData.description || "",
                price: planData.price,
                potAmount: planData.potAmount,
                chipsPerService: planData.chipsPerService,
                periodicity: planData.periodicity,
                productDiscountPercent: planData.productDiscountPercent,
                activeDays: planData.activeDays,
                maxSimultaneousAppointments: planData.maxSimultaneousAppointments,
                galaxId: planData.galaxId || "",
                checkoutUrl: planData.checkoutUrl || "",
                isActive: planData.isActive
            });
            setSelectedServices(planData.services.map((s: any) => s.serviceId));
            setSelectedStaff(planData.allowedStaff.map((s: any) => s.staffId));
        }

        setServices(servicesData);
        setStaff(staffData);
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await Promise.all([
                updateSubscriptionPlan(id as string, formData),
                syncPlanServices(id as string, selectedServices),
                syncPlanStaff(id as string, selectedStaff)
            ]);
            alert("Plano atualizado com sucesso!");
        } catch (e) {
            alert("Erro ao salvar alterações.");
        }
        setSaving(false);
    };

    const toggleDay = (day: number) => {
        setFormData((prev: any) => ({
            ...prev,
            activeDays: prev.activeDays.includes(day)
                ? prev.activeDays.filter((d: number) => d !== day)
                : [...prev.activeDays, day]
        }));
    };

    const toggleService = (serviceId: string) => {
        setSelectedServices(prev => 
            prev.includes(serviceId) 
                ? prev.filter(id => id !== serviceId) 
                : [...prev, serviceId]
        );
    };

    const toggleStaff = (staffId: string) => {
        setSelectedStaff(prev => 
            prev.includes(staffId) 
                ? prev.filter(id => id !== staffId) 
                : [...prev, staffId]
        );
    };

    if (loading) {
        return (
            <AdminShell>
                <div className="h-screen flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
                </div>
            </AdminShell>
        );
    }

    return (
        <AdminShell>
            <div className="max-w-5xl mx-auto space-y-8 pb-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/subscriptions" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-zinc-400">
                            <ChevronLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-brand-500/10 text-brand-400 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded">Gerenciamento</span>
                                <h1 className="font-display text-2xl font-bold text-white">{plan?.name}</h1>
                            </div>
                            <p className="text-zinc-500 text-sm">Configure as regras e abrangência deste plano de assinatura.</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center justify-center gap-2 bg-brand-gradient text-white px-8 py-3 rounded-xl text-sm font-bold shadow-brand hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Salvar Alterações
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-dark-800 rounded-2xl border border-white/5 w-fit">
                    {(["geral", "servicos", "barbeiros"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                                activeTab === tab 
                                ? "bg-white/10 text-white shadow-xl" 
                                : "text-zinc-500 hover:text-zinc-300"
                            }`}
                        >
                            {tab === "geral" && "Geral"}
                            {tab === "servicos" && "Serviços Incluídos"}
                            {tab === "barbeiros" && "Profissionais"}
                        </button>
                    ))}
                </div>

                {/* Tab Content: Geral */}
                {activeTab === "geral" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {/* Basic Info Card */}
                        <div className="glass-card p-8 rounded-3xl space-y-6 border border-white/5">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                    <Target className="w-5 h-5 text-blue-400" />
                                </div>
                                <h2 className="font-bold text-lg">Informações Básicas</h2>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Nome do Plano</label>
                                <input 
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full h-14 bg-dark-700 border border-white/8 rounded-xl px-4 text-sm font-medium text-white focus:border-brand-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Descrição</label>
                                <textarea 
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-dark-700 border border-white/8 rounded-xl p-4 text-sm font-medium text-white focus:border-brand-500 outline-none transition-all resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Preço (R$)</label>
                                    <input 
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                        className="w-full h-14 bg-dark-700 border border-white/8 rounded-xl px-4 text-sm font-medium text-white focus:border-brand-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-500 block mb-2">Valor no Pote (R$)</label>
                                    <input 
                                        type="number"
                                        value={formData.potAmount}
                                        onChange={(e) => setFormData({ ...formData, potAmount: Number(e.target.value) })}
                                        className="w-full h-14 bg-dark-700 border border-brand-500/20 rounded-xl px-4 text-sm font-bold text-brand-400 focus:border-brand-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Periocididade</label>
                                    <select 
                                        value={formData.periodicity}
                                        onChange={(e) => setFormData({ ...formData, periodicity: e.target.value })}
                                        className="w-full h-14 bg-dark-700 border border-white/8 rounded-xl px-4 text-sm font-medium text-white focus:border-brand-500 outline-none transition-all"
                                    >
                                        {PERIODICITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Galax ID (Gateway)</label>
                                    <input 
                                        value={formData.galaxId}
                                        onChange={(e) => setFormData({ ...formData, galaxId: e.target.value })}
                                        placeholder="Ex: 54321"
                                        className="w-full h-14 bg-dark-700 border border-white/8 rounded-xl px-4 text-sm font-medium text-white focus:border-brand-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-400 block mb-2 flex items-center gap-1">
                                        Link de Checkout (Celcoin)
                                        <Zap className="w-3 h-3" />
                                    </label>
                                    <input 
                                        value={formData.checkoutUrl}
                                        onChange={(e) => setFormData({ ...formData, checkoutUrl: e.target.value })}
                                        placeholder="https://pay.celcoin.com.br/..."
                                        className="w-full h-14 bg-dark-700 border border-brand-500/20 rounded-xl px-4 text-sm font-medium text-white focus:border-brand-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Rules Card */}
                        <div className="glass-card p-8 rounded-3xl space-y-6 border border-white/5">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                    <Settings2 className="w-5 h-5 text-amber-400" />
                                </div>
                                <h2 className="font-bold text-lg">Regras & Benefícios</h2>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-3">Dias da Semana Ativos</label>
                                <div className="flex flex-wrap gap-2">
                                    {DAYS_OF_WEEK.map(day => (
                                        <button
                                            key={day.value}
                                            onClick={() => toggleDay(day.value)}
                                            className={`w-10 h-10 rounded-lg text-[10px] font-black transition-all border ${
                                                formData.activeDays.includes(day.value)
                                                ? "bg-brand-500 border-brand-500 text-white shadow-brand-sm"
                                                : "bg-dark-700 border-white/5 text-zinc-500"
                                            }`}
                                        >
                                            {day.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Fichas / Atend.</label>
                                    <input 
                                        type="number"
                                        value={formData.chipsPerService}
                                        onChange={(e) => setFormData({ ...formData, chipsPerService: Number(e.target.value) })}
                                        className="w-full h-14 bg-dark-700 border border-white/8 rounded-xl px-4 text-sm font-medium text-white focus:border-brand-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Agend. Simultâneos</label>
                                    <input 
                                        type="number"
                                        value={formData.maxSimultaneousAppointments}
                                        onChange={(e) => setFormData({ ...formData, maxSimultaneousAppointments: Number(e.target.value) })}
                                        className="w-full h-14 bg-dark-700 border border-white/8 rounded-xl px-4 text-sm font-medium text-white focus:border-brand-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="p-5 bg-brand-500/5 rounded-2xl border border-brand-500/10">
                                <div className="flex items-center gap-3 mb-4">
                                    <TrendingDown className="w-5 h-5 text-brand-400" />
                                    <h3 className="text-sm font-bold">Desconto em Produtos</h3>
                                </div>
                                <div className="flex items-center gap-4">
                                    <input 
                                        type="range" min="0" max="100" step="5"
                                        value={formData.productDiscountPercent}
                                        onChange={(e) => setFormData({ ...formData, productDiscountPercent: Number(e.target.value) })}
                                        className="flex-1 accent-brand-500"
                                    />
                                    <span className="w-16 text-center bg-dark-800 py-2 rounded-lg font-black text-brand-400 text-sm">
                                        {formData.productDiscountPercent}%
                                    </span>
                                </div>
                                <p className="text-[10px] text-zinc-500 mt-3 italic">O cliente deste plano pagará menos ao comprar produtos da loja.</p>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <Zap className={`w-5 h-5 ${formData.isActive ? "text-green-400" : "text-zinc-500"}`} />
                                    <div>
                                        <h3 className="text-xs font-bold">Plano Ativo</h3>
                                        <p className="text-[10px] text-zinc-500">Invisível para novos clientes se desativado.</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                    className={`w-12 h-6 rounded-full transition-all relative ${formData.isActive ? "bg-green-500" : "bg-zinc-700"}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.isActive ? "right-1" : "left-1"}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab Content: Servicos */}
                {activeTab === "servicos" && (
                    <div className=" glass-card p-8 rounded-3xl border border-white/5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                                <Scissors className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="font-bold text-xl">Serviços Abrangidos</h2>
                                <p className="text-zinc-500 text-sm">Selecione quais serviços os assinantes deste plano podem realizar.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {services.map(service => (
                                <button 
                                    key={service.id}
                                    onClick={() => toggleService(service.id)}
                                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group ${
                                        selectedServices.includes(service.id)
                                        ? "bg-brand-500/10 border-brand-500/30 text-white shadow-brand-sm"
                                        : "bg-dark-700 border-white/5 text-zinc-500 hover:border-white/10"
                                    }`}
                                >
                                    {selectedServices.includes(service.id) 
                                        ? <CheckCircle2 className="w-5 h-5 text-brand-400 shrink-0" />
                                        : <Circle className="w-5 h-5 text-zinc-700 shrink-0 group-hover:text-zinc-500" />
                                    }
                                    <div>
                                        <div className="font-bold text-sm">{service.name}</div>
                                        <div className="text-[10px] opacity-60">R$ {service.price.toFixed(2)} • {service.durationMinutes} min</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tab Content: Barbeiros */}
                {activeTab === "barbeiros" && (
                    <div className="glass-card p-8 rounded-3xl border border-white/5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                                <Users className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <h2 className="font-bold text-xl">Profissionais que Atendem</h2>
                                <p className="text-zinc-500 text-sm">Quais profissionais aceitam este plano de assinatura?</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {staff.map(member => (
                                <button 
                                    key={member.id}
                                    onClick={() => toggleStaff(member.id)}
                                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group ${
                                        selectedStaff.includes(member.id)
                                        ? "bg-brand-500/10 border-brand-500/30 text-white shadow-brand-sm"
                                        : "bg-dark-700 border-white/5 text-zinc-500 hover:border-white/10"
                                    }`}
                                >
                                    <div className="relative shrink-0">
                                        <img src={member.avatarUrl || `https://ui-avatars.com/api/?name=${member.name}&background=random`} className="w-10 h-10 rounded-xl object-cover" alt="" />
                                        {selectedStaff.includes(member.id) && (
                                            <div className="absolute -top-2 -right-2 bg-brand-500 rounded-full p-0.5 border-2 border-dark-900 shadow-brand">
                                                <CheckCircle2 className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">{member.name}</div>
                                        <div className="text-[10px] opacity-60 uppercase tracking-wider font-black">{member.role}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminShell>
    );
}
