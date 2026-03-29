"use client";

import AdminShell from "@/components/admin/admin-shell";
import { Settings, Save, Clock, Bell, Shield, Paintbrush, CreditCard, Copy, CheckCircle2, Loader2, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { getGatewaySettings, updateGatewaySettings, getStoreSettings, updateStoreSettings } from "@/app/actions/settings-actions";
import { cn } from "@/lib/utils";

const WEEKDAYS = [
    { id: 0, name: "Domingo" },
    { id: 1, name: "Segunda-feira" },
    { id: 2, name: "Terça-feira" },
    { id: 3, name: "Quarta-feira" },
    { id: 4, name: "Quinta-feira" },
    { id: 5, name: "Sexta-feira" },
    { id: 6, name: "Sábado" },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("Geral");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [copied, setCopied] = useState(false);
    
    // Gateway settings
    const [gatewayData, setGatewayData] = useState({
        id: "",
        celcashToken: "",
        celcashPublicToken: ""
    });

    // Store settings
    const [storeData, setStoreData] = useState({
        primaryColor: "#f97316",
        colorSubscriber: "#166534",
        colorRegular: "#475569",
        colorDefaulter: "#991B1B",
        businessHours: [] as any[]
    });

    useEffect(() => {
        loadAll();
    }, []);

    const loadAll = async () => {
        setFetching(true);
        const [gateRes, storeRes] = await Promise.all([
            getGatewaySettings(),
            getStoreSettings()
        ]);
        
        if (gateRes.success && gateRes.settings) {
            setGatewayData({
                id: (gateRes.settings as any).id || "",
                celcashToken: (gateRes.settings as any).celcashToken || "",
                celcashPublicToken: (gateRes.settings as any).celcashPublicToken || ""
            });
        }

        if (storeRes.success && storeRes.store) {
            setStoreData({
                primaryColor: (storeRes.store as any).primaryColor || "#f97316",
                colorSubscriber: (storeRes.store as any).colorSubscriber || "#166534",
                colorRegular: (storeRes.store as any).colorRegular || "#475569",
                colorDefaulter: (storeRes.store as any).colorDefaulter || "#991B1B",
                businessHours: (storeRes.store as any).businessHours || []
            });
        }
        setFetching(false);
    };

    const handleSaveGateway = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await updateGatewaySettings({
            celcashToken: gatewayData.celcashToken,
            celcashPublicToken: gatewayData.celcashPublicToken
        });
        if (res.success) alert("Configurações salvas!"); else alert(res.error);
        setLoading(false);
    };

    const handleSaveStore = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await updateStoreSettings(storeData);
        if (res.success) alert("Personalização atualizada!"); else alert(res.error);
        setLoading(false);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const webhookUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/api/webhooks/celcash/${gatewayData.id || 'seu-id'}` 
        : "...";

    return (
        <AdminShell>
            <div className="space-y-6">
                <div>
                    <h1 className="font-display text-2xl font-bold">Configurações</h1>
                    <p className="text-zinc-500 text-sm mt-1">Gerencie cada detalhe da sua plataforma</p>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Menu Sidebar */}
                    <div className="w-full md:w-72 glass-card rounded-2xl p-4 h-fit space-y-1">
                        {[
                            { label: "Geral", icon: Settings },
                            { label: "Horários", icon: Clock },
                            { label: "Notificações", icon: Bell },
                            { label: "Pagamentos", icon: CreditCard },
                            { label: "Aparência", icon: Paintbrush },
                            { label: "Segurança", icon: Shield },
                        ].map((item) => (
                            <button
                                key={item.label}
                                onClick={() => setActiveTab(item.label)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                                    activeTab === item.label ? "bg-brand-gradient text-white shadow-brand-sm" : "text-zinc-500 hover:bg-white/5"
                                )}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Section */}
                    <div className="flex-1">
                        {fetching ? (
                            <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>
                        ) : (
                            <div className="space-y-6">
                                {activeTab === "Aparência" && (
                                    <div className="glass-card rounded-3xl p-8 space-y-8 border border-white/5 bg-dark-800/20 shadow-2xl">
                                        <div>
                                            <h2 className="font-bold text-lg flex items-center gap-3">
                                                <Paintbrush className="w-5 h-5 text-brand-400" /> Cores da Agenda
                                            </h2>
                                            <p className="text-zinc-500 text-xs uppercase tracking-widest font-black mt-1">Personalize o visual das comandas</p>
                                        </div>

                                        <form onSubmit={handleSaveStore} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <ColorPicker 
                                                    label="Cor Principal (Marca)" 
                                                    value={storeData.primaryColor} 
                                                    onChange={(v) => setStoreData({ ...storeData, primaryColor: v })} 
                                                />
                                                <ColorPicker 
                                                    label="Agendamento Assinante" 
                                                    value={storeData.colorSubscriber} 
                                                    onChange={(v) => setStoreData({ ...storeData, colorSubscriber: v })} 
                                                />
                                                <ColorPicker 
                                                    label="Agendamento Avulso" 
                                                    value={storeData.colorRegular} 
                                                    onChange={(v) => setStoreData({ ...storeData, colorRegular: v })} 
                                                />
                                                <ColorPicker 
                                                    label="Agendamento Devedor" 
                                                    value={storeData.colorDefaulter} 
                                                    onChange={(v) => setStoreData({ ...storeData, colorDefaulter: v })} 
                                                />
                                            </div>

                                            <div className="pt-6 border-t border-white/5 flex justify-end">
                                                <button type="submit" disabled={loading} className="h-14 px-10 bg-brand-gradient text-white rounded-xl font-black uppercase tracking-widest text-[11px] shadow-brand flex items-center gap-2">
                                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                    Salvar Aparência
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {activeTab === "Horários" && (
                                    <div className="glass-card rounded-3xl p-8 space-y-8 border border-white/5 bg-dark-800/20 shadow-2xl">
                                         <div>
                                            <h2 className="font-bold text-lg flex items-center gap-3">
                                                <Clock className="w-5 h-5 text-brand-400" /> Horários de Funcionamento
                                            </h2>
                                            <p className="text-zinc-500 text-xs uppercase tracking-widest font-black mt-1">Defina quando sua barbearia abre e fecha</p>
                                        </div>

                                        <form onSubmit={handleSaveStore} className="space-y-4">
                                            {WEEKDAYS.map(day => {
                                                const config = storeData.businessHours.find(bh => bh.dayOfWeek === day.id) || { isOpen: true, openTime: "08:00", closeTime: "20:00" };
                                                return (
                                                    <div key={day.id} className="flex items-center justify-between p-4 bg-dark-900/40 rounded-2xl border border-white/5">
                                                        <div className="flex items-center gap-4 min-w-[140px]">
                                                            <div className={cn("w-3 h-3 rounded-full", config.isOpen ? "bg-emerald-500" : "bg-red-500")} />
                                                            <span className="text-sm font-bold text-zinc-200">{day.name}</span>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-6">
                                                            <div className="flex items-center gap-2">
                                                                <input 
                                                                    type="time" 
                                                                    disabled={!config.isOpen}
                                                                    value={config.openTime}
                                                                    onChange={(e) => {
                                                                        const newHours = [...storeData.businessHours];
                                                                        const idx = newHours.findIndex(bh => bh.dayOfWeek === day.id);
                                                                        if (idx >= 0) newHours[idx].openTime = e.target.value;
                                                                        else newHours.push({ dayOfWeek: day.id, isOpen: true, openTime: e.target.value, closeTime: "20:00" });
                                                                        setStoreData({ ...storeData, businessHours: newHours });
                                                                    }}
                                                                    className="bg-dark-800 border-none rounded-lg px-3 py-2 text-xs font-bold text-zinc-300 outline-none disabled:opacity-30" 
                                                                />
                                                                <span className="text-zinc-600 text-[10px] font-black uppercase">até</span>
                                                                <input 
                                                                    type="time" 
                                                                    disabled={!config.isOpen}
                                                                    value={config.closeTime}
                                                                    onChange={(e) => {
                                                                        const newHours = [...storeData.businessHours];
                                                                        const idx = newHours.findIndex(bh => bh.dayOfWeek === day.id);
                                                                        if (idx >= 0) newHours[idx].closeTime = e.target.value;
                                                                        else newHours.push({ dayOfWeek: day.id, isOpen: true, openTime: "08:00", closeTime: e.target.value });
                                                                        setStoreData({ ...storeData, businessHours: newHours });
                                                                    }}
                                                                    className="bg-dark-800 border-none rounded-lg px-3 py-2 text-xs font-bold text-zinc-300 outline-none disabled:opacity-30" 
                                                                />
                                                            </div>

                                                            <button 
                                                                type="button"
                                                                onClick={() => {
                                                                    const newHours = [...storeData.businessHours];
                                                                    const idx = newHours.findIndex(bh => bh.dayOfWeek === day.id);
                                                                    if (idx >= 0) newHours[idx].isOpen = !newHours[idx].isOpen;
                                                                    else newHours.push({ dayOfWeek: day.id, isOpen: false, openTime: "08:00", closeTime: "20:00" });
                                                                    setStoreData({ ...storeData, businessHours: newHours });
                                                                }}
                                                                className={cn(
                                                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                                    config.isOpen ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white" : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                                                                )}
                                                            >
                                                                {config.isOpen ? "FECHAR" : "ABRIR"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            <div className="pt-6 border-t border-white/5 flex justify-end">
                                                <button type="submit" disabled={loading} className="h-14 px-10 bg-brand-gradient text-white rounded-xl font-black uppercase tracking-widest text-[11px] shadow-brand flex items-center gap-2">
                                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                    Salvar Horários
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {activeTab === "Geral" && (
                                    <div className="glass-card rounded-3xl p-8 space-y-6 border border-white/5 bg-dark-800/20 shadow-2xl">
                                        <h2 className="font-bold flex items-center gap-2">
                                            <Settings className="w-5 h-5 text-brand-400" />
                                            Perfil do Sistema
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Nome do Negócio</label>
                                                <input type="text" placeholder="Minha Barbearia" className="w-full h-14 bg-dark-800 border border-white/8 rounded-xl px-4 text-sm font-medium text-white focus:border-brand-500/30 outline-none" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "Pagamentos" && (
                                    <div className="glass-card rounded-3xl p-8 bg-brand-500/5 border-brand-500/10 shadow-2xl space-y-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-brand">
                                                <CreditCard className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="font-bold text-lg text-white">Integração Celcash</h2>
                                                <p className="text-zinc-400 text-xs font-medium uppercase tracking-widest mt-0.5">Seguro e Multi-tenant</p>
                                            </div>
                                        </div>

                                        <div className="bg-dark-900/80 border border-white/5 rounded-2xl p-6 shadow-inner">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-3">Seu Link de Webhook Único</label>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-12 bg-dark-800 rounded-xl px-4 flex items-center font-mono text-sm text-brand-400 overflow-x-auto whitespace-nowrap border border-white/5">
                                                    {webhookUrl}
                                                </div>
                                                <button onClick={() => copyToClipboard(webhookUrl)} className="h-12 w-12 flex items-center justify-center bg-dark-800 border border-white/5 rounded-xl hover:bg-white/5 transition-all outline-none">
                                                    {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-zinc-400" />}
                                                </button>
                                            </div>
                                        </div>

                                        <form onSubmit={handleSaveGateway} className="space-y-6">
                                            <div className="grid grid-cols-1 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Galax HASH (Token Secreto)</label>
                                                    <input type="password" value={gatewayData.celcashToken} onChange={(e) => setGatewayData({ ...gatewayData, celcashToken: e.target.value })} className="selection-input" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Galax ID</label>
                                                    <input type="text" value={gatewayData.celcashPublicToken} onChange={(e) => setGatewayData({ ...gatewayData, celcashPublicToken: e.target.value })} className="selection-input" />
                                                </div>
                                            </div>
                                            <div className="flex justify-end pt-4">
                                                <button type="submit" disabled={loading} className="h-14 px-10 bg-brand-gradient text-white rounded-xl font-black uppercase tracking-widest text-[11px] shadow-brand flex items-center gap-2">
                                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-4 h-4" />}
                                                    Salvar Integração
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {(activeTab === "Notificações" || activeTab === "Segurança") && (
                                    <div className="glass-card rounded-3xl p-16 flex flex-col items-center justify-center text-center border border-white/5 opacity-40">
                                        <Settings className="w-12 h-12 text-zinc-600 mb-6" />
                                        <h2 className="font-bold text-white uppercase tracking-widest text-xs">Área em Desenvolvimento</h2>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .selection-input {
                    width: 100%;
                    height: 56px;
                    background: #111111;
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 16px;
                    padding: 0 20px;
                    font-size: 14px;
                    color: white;
                    outline: none;
                }
            `}</style>
        </AdminShell>
    );
}

function ColorPicker({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
    return (
        <div className="space-y-3">
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{label}</span>
            <div className="flex items-center gap-4">
                <input 
                    type="color" 
                    value={value} 
                    onChange={(e) => onChange(e.target.value)}
                    className="w-16 h-16 bg-transparent rounded-2xl cursor-pointer border-none shadow-xl transform hover:scale-105 transition-all" 
                />
                <div className="flex-1">
                    <input 
                        type="text" 
                        value={value} 
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full bg-dark-900/50 border border-white/5 rounded-xl px-4 py-2 text-xs font-mono text-zinc-400 outline-none" 
                    />
                </div>
            </div>
        </div>
    );
}
