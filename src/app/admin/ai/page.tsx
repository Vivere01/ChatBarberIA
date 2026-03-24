import AdminShell from "@/components/admin/admin-shell";
import { Bot, Zap, Key, RefreshCw, Link2, Info, CheckCircle } from "lucide-react";

export default function AiPage() {
    return (
        <AdminShell>
            <div className="space-y-6">
                <div>
                    <h1 className="font-display text-2xl font-bold">IA & API</h1>
                    <p className="text-zinc-500 text-sm mt-1">Integração de inteligência artificial e acesso via API</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* API Key */}
                    <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                                <Key className="w-5 h-5 text-brand-400" />
                            </div>
                            <div>
                                <h2 className="font-semibold">Chave de API</h2>
                                <p className="text-zinc-500 text-xs">Use para conectar a IA ao seu painel</p>
                            </div>
                        </div>
                        <div className="bg-dark-700 rounded-xl p-3 font-mono text-sm text-zinc-300 flex items-center justify-between gap-3 mb-4">
                            <span className="truncate">cb_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx</span>
                            <button className="text-brand-400 hover:text-brand-300 transition-colors flex-shrink-0">Copiar</button>
                        </div>
                        <button className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors">
                            <RefreshCw className="w-4 h-4" />
                            Regenerar chave
                        </button>
                    </div>

                    {/* MCP Server */}
                    <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h2 className="font-semibold">MCP Server</h2>
                                <p className="text-zinc-500 text-xs">Model Context Protocol para IA</p>
                            </div>
                        </div>
                        <div className="space-y-3 mb-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-400">Status</span>
                                <span className="flex items-center gap-1.5 text-green-400">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                    Online
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-400">Endpoint</span>
                                <code className="text-xs bg-dark-700 px-2 py-1 rounded text-brand-400">/api/v1/mcp</code>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-400">Versão</span>
                                <span className="text-zinc-300">v1.0.0</span>
                            </div>
                        </div>
                    </div>

                    {/* WhatsApp Integration */}
                    <div className="glass-card rounded-2xl p-6 border border-green-500/15">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                <Zap className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <h2 className="font-semibold">WhatsApp CRM</h2>
                                <p className="text-zinc-500 text-xs">Evolution API + IA treinada</p>
                            </div>
                        </div>
                        <div className="space-y-3 mb-4">
                            <div>
                                <label className="block text-xs text-zinc-500 mb-1.5">URL Evolution API</label>
                                <input
                                    type="url"
                                    placeholder="https://api.evolution.seudominio.com"
                                    className="w-full bg-dark-700 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-green-500/40 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-zinc-500 mb-1.5">Token Evolution API</label>
                                <input
                                    type="password"
                                    placeholder="••••••••••••••"
                                    className="w-full bg-dark-700 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-green-500/40 transition-all"
                                />
                            </div>
                        </div>
                        <button className="w-full bg-green-500/10 border border-green-500/25 text-green-400 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-500/15 transition-all">
                            Conectar WhatsApp
                        </button>
                    </div>

                    {/* AI Training */}
                    <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <RefreshCw className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h2 className="font-semibold">Treinamento da IA</h2>
                                <p className="text-zinc-500 text-xs">Sincronize os dados para treinar a IA</p>
                            </div>
                        </div>
                        <div className="space-y-2.5 mb-5">
                            {[
                                { label: "Clientes cadastrados", count: "1.240", done: true },
                                { label: "Histórico de agendamentos", count: "8.450", done: true },
                                { label: "Serviços e preços", count: "24", done: true },
                                { label: "Avaliações NPS", count: "100", done: false },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className={`w-4 h-4 ${item.done ? "text-green-400" : "text-zinc-600"}`} />
                                        <span className="text-zinc-300">{item.label}</span>
                                    </div>
                                    <span className="text-zinc-500">{item.count}</span>
                                </div>
                            ))}
                        </div>
                        <button className="w-full bg-blue-500/10 border border-blue-500/25 text-blue-400 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-500/15 transition-all flex items-center justify-center gap-2">
                            <RefreshCw className="w-4 h-4" />
                            Sincronizar e Treinar IA
                        </button>
                    </div>
                </div>

                {/* API Endpoints Reference */}
                <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <Link2 className="w-5 h-5 text-brand-400" />
                        <h2 className="font-semibold">Endpoints da API</h2>
                    </div>
                    <div className="space-y-3">
                        {[
                            { method: "GET", path: "/api/v1/{owner_id}/clients", desc: "Listar todos os clientes" },
                            { method: "GET", path: "/api/v1/{owner_id}/appointments", desc: "Listar agendamentos" },
                            { method: "POST", path: "/api/v1/{owner_id}/appointments", desc: "Criar agendamento via IA" },
                            { method: "GET", path: "/api/v1/{owner_id}/services", desc: "Listar serviços disponíveis" },
                            { method: "GET", path: "/api/v1/{owner_id}/staff", desc: "Listar barbeiros" },
                            { method: "GET", path: "/api/v1/{owner_id}/ai-context", desc: "Contexto de treinamento da IA" },
                        ].map((ep) => (
                            <div key={ep.path} className="flex items-center gap-4 p-3 bg-dark-700 rounded-xl">
                                <span className={`text-xs font-bold font-mono px-2 py-1 rounded ${ep.method === "GET" ? "bg-blue-500/15 text-blue-400" : "bg-green-500/15 text-green-400"
                                    }`}>
                                    {ep.method}
                                </span>
                                <code className="text-sm text-zinc-300 font-mono flex-1">{ep.path}</code>
                                <span className="text-xs text-zinc-500 hidden md:block">{ep.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminShell>
    );
}
