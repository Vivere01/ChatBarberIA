"use client";

import AdminShell from "@/components/admin/admin-shell";
import { Users, Plus, Search, Phone, Crown, MoreVertical, Mail, Hash, UserPlus, Loader2 } from "lucide-react";
import { EmptyState } from "@/components/admin/empty-state";
import { Modal } from "@/components/ui/modal";
import { useState, useEffect } from "react";
import { getClientsList, createClient } from "@/app/actions/client-actions";

export default function ClientsPage() {
    const [clients, setClients] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const loadClients = async () => {
            try {
                const data = await getClientsList();
                setClients(data || []);
            } catch (err) {
                console.error("Erro ao carregar clientes:", err);
            } finally {
                setFetching(false);
            }
        };
        loadClients();
    }, []);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        cpf: "",
        type: "WALK_IN",
    });

    const handleAddClient = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await createClient({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                cpf: formData.cpf,
                clientType: formData.type,
            });

            if (result.success) {
                setClients([result.client, ...clients]);
                setIsModalOpen(false);
                setFormData({ name: "", email: "", phone: "", cpf: "", type: "WALK_IN" });
            } else {
                alert(result.error || "Erro ao salvar.");
            }
        } catch (err) {
            console.error("Erro ao cadastrar cliente:", err);
            alert("Erro na conexão.");
        } finally {
            setLoading(false);
        }
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm) ||
        c.cpf?.includes(searchTerm)
    );

    return (
        <AdminShell>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-display text-2xl font-bold">Clientes</h1>
                        <p className="text-zinc-500 text-sm mt-1">{clients.length} clientes cadastrados</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-brand-gradient text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-brand-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Novo Cliente
                    </button>
                </div>

                {fetching ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-brand-400 opacity-20" />
                        <p className="text-zinc-500 text-sm">Carregando sua base...</p>
                    </div>
                ) : clients.length === 0 ? (
                    <EmptyState
                        icon={Users}
                        title="Nenhum cliente cadastrado"
                        description="Sua base de clientes está vazia. Comece cadastrando seus clientes para ter acesso ao CRM e Histórico."
                        buttonText="Cadastrar primeiro cliente"
                        onAction={() => setIsModalOpen(true)}
                    />
                ) : (
                    <>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nome, CPF ou telefone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-dark-800 border border-white/8 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-brand-500/30 transition-all"
                                />
                            </div>
                        </div>

                        <div className="glass-card rounded-2xl overflow-hidden mt-6">
                            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                                <table className="w-full text-sm text-zinc-400">
                                    <thead className="sticky top-0 z-10">
                                        <tr className="border-b border-white/5 bg-dark-900">
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Cliente</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden md:table-cell">Contato</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Tipo</th>
                                            <th className="px-6 py-4" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/4">
                                        {filteredClients.map((client) => (
                                            <tr key={client.id} className="hover:bg-white/2 transition-colors group">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-dark-600 flex items-center justify-center text-xs font-bold flex-shrink-0 text-brand-400">
                                                            {client.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-sm text-white truncate max-w-[200px]">{client.name}</p>
                                                            <p className="text-zinc-600 text-[10px]">{client.cpf || "Sem CPF"}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 hidden md:table-cell">
                                                    <div className="flex flex-col gap-0.5">
                                                        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                                                            <Phone className="w-3 h-3 opacity-50" />
                                                            {client.phone || "---"}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
                                                            <Mail className="w-2.5 h-2.5 opacity-50" />
                                                            {client.email || "---"}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    {client.clientType === "SUBSCRIBER" ? (
                                                        <span className="flex items-center gap-1 text-[10px] font-bold text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-full w-fit uppercase">
                                                            <Crown className="w-3 h-3" />
                                                            Assinante
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full w-fit uppercase">
                                                            Avulso
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <button className="p-2 rounded-lg text-zinc-600 hover:text-white hover:bg-white/5 transition-all">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Novo Cliente"
            >
                <form onSubmit={handleAddClient} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2 font-display">Nome do Cliente</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ex: Carlos Oliveira"
                            className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 transition-all font-medium"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2 font-display text-xs uppercase tracking-wider">WhatsApp</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="(11) 90000-0000"
                                    className="w-full bg-dark-700 border border-white/8 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 transition-all font-medium"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2 font-display text-xs uppercase tracking-wider">CPF (Opcional)</label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input
                                    type="text"
                                    value={formData.cpf}
                                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                                    placeholder="000.000.000-00"
                                    className="w-full bg-dark-700 border border-white/8 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 transition-all font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2 font-display text-xs uppercase tracking-wider">Email (Opcional)</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="exemplo@email.com"
                                className="w-full bg-dark-700 border border-white/8 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2 font-display text-xs uppercase tracking-wider">Tipo de Cliente</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50 transition-all font-medium"
                        >
                            <option value="WALK_IN">Cliente Avulso</option>
                            <option value="SUBSCRIBER">Assinante / VIP</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-6 border-t border-white/5 mt-8">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 py-3.5 rounded-xl border border-white/5 text-zinc-400 font-semibold hover:bg-white/5 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-3 bg-brand-gradient text-white py-3.5 px-8 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-brand disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    <UserPlus className="w-4 h-4" />
                                    Cadastrar Cliente
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </AdminShell>
    );
}
