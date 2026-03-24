"use client";

import AdminShell from "@/components/admin/admin-shell";
import { Settings, Save, Clock, MapPin, Phone, Bell, Shield, Paintbrush } from "lucide-react";

export default function SettingsPage() {
    return (
        <AdminShell>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-display text-2xl font-bold">Configurações</h1>
                        <p className="text-zinc-500 text-sm mt-1">Personalize o funcionamento da sua conta</p>
                    </div>
                    <button className="flex items-center gap-2 bg-brand-gradient text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-brand-sm">
                        <Save className="w-4 h-4" />
                        Salvar Alterações
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Menu de Configurações */}
                    <div className="glass-card rounded-2xl p-4 h-fit space-y-1">
                        {[
                            { label: "Geral", icon: Settings, active: true },
                            { label: "Horários de Funcionamento", icon: Clock },
                            { label: "Endereço e Contato", icon: MapPin },
                            { label: "Notificações", icon: Bell },
                            { label: "Aparência", icon: Paintbrush },
                            { label: "Segurança", icon: Shield },
                        ].map((item) => (
                            <button
                                key={item.label}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${item.active
                                        ? "bg-brand-500/10 text-brand-400 border border-brand-500/20"
                                        : "text-zinc-500 hover:bg-white/5"
                                    }`}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Formulário */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="glass-card rounded-2xl p-6">
                            <h2 className="font-bold mb-4">Perfil da Barbearia</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-zinc-400 mb-1.5 block">Nome do Negócio</label>
                                    <input type="text" placeholder="Minha Barbearia" className="w-full bg-dark-800 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500/30 transition-all" />
                                </div>
                                <div>
                                    <label className="text-sm text-zinc-400 mb-1.5 block">CNPJ (Opcional)</label>
                                    <input type="text" placeholder="00.000.000/0001-00" className="w-full bg-dark-800 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500/30 transition-all" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminShell>
    );
}
