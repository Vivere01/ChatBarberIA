"use client";

import AdminShell from "@/components/admin/admin-shell";
import { Settings, Save, Clock, MapPin, Phone, Bell, Shield, Paintbrush, CreditCard, Copy, CheckCircle2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getGatewaySettings, updateGatewaySettings } from "@/app/actions/settings-actions";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("Geral");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [copied, setCopied] = useState(false);
    
    // Gateway settings
    const [gatewayData, setGatewayData] = useState({
        celcashToken: "",
        celcashPublicToken: ""
    });

    useEffect(() => {
        if (activeTab === "Pagamentos") {
            loadGateway();
        }
    }, [activeTab]);

    const loadGateway = async () => {
        setFetching(true);
        const res = await getGatewaySettings();
        if (res.success && res.settings) {
            setGatewayData({
                celcashToken: res.settings.celcashToken || "",
                celcashPublicToken: res.settings.celcashPublicToken || ""
            });
        }
        setFetching(false);
    };

    const handleSaveGateway = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await updateGatewaySettings(gatewayData);
        if (res.success) {
            alert("Configurações salvas com sucesso!");
        } else {
            alert(res.error || "Erro ao salvar.");
        }
        setLoading(false);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const webhookUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/celcash` : "...";

    return (
        <AdminShell>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-display text-2xl font-bold">Configurações</h1>
                        <p className="text-zinc-500 text-sm mt-1">Gerencie o funcionamento da sua plataforma</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
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
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === item.label
                                        ? "bg-brand-gradient text-white shadow-brand-sm"
                                        : "text-zinc-500 hover:bg-white/5"
                                    }`}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 space-y-6">
                        {activeTab === "Geral" && (
                            <div className="glass-card rounded-3xl p-8 space-y-6">
                                <h2 className="font-bold flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-brand-400" />
                                    Perfil do Sistema
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Nome do Negócio</label>
                                        <input type="text" placeholder="Minha Barbearia" className="w-full h-14 bg-dark-800 border border-white/8 rounded-xl px-4 text-sm font-medium text-white focus:border-brand-500/30 transition-all outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">E-mail de Contato</label>
                                        <input type="email" placeholder="contato@barbearia.com" className="w-full h-14 bg-dark-800 border border-white/8 rounded-xl px-4 text-sm font-medium text-white focus:border-brand-500/30 transition-all outline-none" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "Pagamentos" && (
                            <div className="space-y-6">
                                {/* Webhook Info */}
                                <div className="glass-card rounded-3xl p-8 bg-brand-500/5 border-brand-500/10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-brand">
                                            <CreditCard className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="font-bold text-lg">Integração Celcash</h2>
                                            <p className="text-zinc-500 text-sm">Configure o recebimento automático de assinaturas</p>
                                        </div>
                                    </div>

                                    <div className="bg-dark-900/50 border border-white/5 rounded-2xl p-6 mb-8">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-3">Link de Webhook do seu site</label>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-12 bg-dark-800 rounded-xl px-4 flex items-center font-mono text-sm text-brand-400 overflow-x-auto whitespace-nowrap scrollbar-hide">
                                                {webhookUrl}
                                            </div>
                                            <button 
                                                onClick={() => copyToClipboard(webhookUrl)}
                                                className="h-12 w-12 flex items-center justify-center bg-dark-800 border border-white/5 rounded-xl hover:bg-white/5 transition-all outline-none"
                                            >
                                                {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-zinc-400" />}
                                            </button>
                                        </div>
                                        <p className="mt-4 text-xs text-zinc-500 leading-relaxed italic">
                                            * Copie este link e cole no campo "URL de Webhook" no painel da Celcash para que o sistema receba aprovações automáticas.
                                        </p>
                                    </div>

                                    <form onSubmit={handleSaveGateway} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Token Celcash (Secreto)</label>
                                                <input 
                                                    type="password" 
                                                    value={gatewayData.celcashToken}
                                                    onChange={(e) => setGatewayData({ ...gatewayData, celcashToken: e.target.value })}
                                                    placeholder="Digite o seu Token" 
                                                    className="w-full h-14 bg-dark-800 border border-white/8 rounded-xl px-4 text-sm font-medium text-white focus:border-brand-500/30 transition-all outline-none" 
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Hash Público (Secreto)</label>
                                                <input 
                                                    type="password" 
                                                    value={gatewayData.celcashPublicToken}
                                                    onChange={(e) => setGatewayData({ ...gatewayData, celcashPublicToken: e.target.value })}
                                                    placeholder="Digite o seu Hash de Webhook" 
                                                    className="w-full h-14 bg-dark-800 border border-white/8 rounded-xl px-4 text-sm font-medium text-white focus:border-brand-500/30 transition-all outline-none" 
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <button 
                                                type="submit"
                                                disabled={loading}
                                                className="h-14 px-8 bg-brand-gradient text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-brand hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                                            >
                                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Salvar Configurações"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab !== "Geral" && activeTab !== "Pagamentos" && (
                            <div className="glass-card rounded-3xl p-12 flex flex-col items-center justify-center text-center opacity-40">
                                <Settings className="w-12 h-12 text-zinc-600 mb-4" />
                                <h2 className="font-bold underline decoration-zinc-700/50 underline-offset-4">Área em Desenvolvimento</h2>
                                <p className="text-sm text-zinc-500 mt-1 max-w-xs">Esta funcionalidade será liberada nas próximas atualizações do painel administrativo.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminShell>
    );
}
