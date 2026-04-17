"use client";

import AdminShell from "@/components/admin/admin-shell";
import { Plus, Search, MoreVertical, User, Phone, Mail, FileText, Save, Loader2, Edit2, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/admin/empty-state";
import { Modal } from "@/components/ui/modal";
import { formatCurrency } from "@/lib/utils";
import { useState, useEffect } from "react";
import { getClientsList, createClient, updateClient, deleteClient } from "@/app/actions/client-actions";

export default function ClientsPage() {
    const [clients, setClients] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<any>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        cpf: "",
        clientType: "WALK_IN",
        password: "",
        birthDate: "",
    });

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        setFetching(true);
        try {
            const data = await getClientsList();
            setClients(data || []);
        } catch (err) {
            console.error("Erro ao carregar clientes:", err);
        } finally {
            setFetching(false);
        }
    };

    const handleAction = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                cpf: formData.cpf,
                clientType: formData.clientType,
                password: formData.password || undefined,
                birthDate: formData.birthDate || undefined,
            };

            const result = editingClient
                ? await updateClient(editingClient.id, payload)
                : await createClient(payload);

            if (result.success) {
                await loadClients();
                closeModal();
            } else {
                alert(result.error);
            }
        } catch (err) {
            alert("Erro na conexão.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Excluir este cliente?")) return;
        try {
            const result = await deleteClient(id);
            if (result.success) loadClients();
            else alert(result.error);
        } catch (err) { alert("Erro ao excluir."); }
    };

    const openEdit = (client: any) => {
        setEditingClient(client);
        setFormData({
            name: client.name,
            email: client.email || "",
            phone: client.phone || "",
            cpf: client.cpf || "",
            clientType: client.clientType,
            password: "", // Don't show password hash
            birthDate: client.birthDate ? new Date(client.birthDate).toISOString().split('T')[0] : "",
        });
        setIsModalOpen(true);
        setOpenMenuId(null);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingClient(null);
        setFormData({ name: "", email: "", phone: "", cpf: "", clientType: "WALK_IN", password: "", birthDate: "" });
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm)
    );

    return (
        <AdminShell>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-display text-2xl font-bold">Clientes</h1>
                        <p className="text-zinc-500 text-sm mt-1">Gerencie sua base de dados de clientes e fidelidade</p>
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
                        <p className="text-zinc-500 text-sm">Carregando seus clientes...</p>
                    </div>
                ) : clients.length === 0 ? (
                    <EmptyState
                        icon={User}
                        title="Nenhum cliente cadastrado"
                        description="Sua base de clientes está vazia. Comece a cadastrar para criar um histórico de agendamentos."
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
                                    placeholder="Buscar por nome ou WhatsApp..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-dark-800 border border-white/8 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-brand-500/30 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredClients.map((client) => (
                                <div key={client.id} className="glass-card rounded-2xl p-6 hover:border-white/15 transition-all group relative overflow-visible">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="w-12 h-12 rounded-full bg-dark-700 flex items-center justify-center border border-white/5 text-xl font-bold font-display text-brand-400">
                                                {client.name.charAt(0).toUpperCase()}
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    navigator.clipboard.writeText(client.id);
                                                    alert("ID do Cliente Copiado!");
                                                }}
                                                className="text-[8px] font-mono text-zinc-600 hover:text-brand-400 transition-colors bg-white/5 px-1 rounded"
                                                title="Copiar ID para IA"
                                            >
                                                {client.id.substring(0, 6)}
                                            </button>
                                        </div>

                                        <div className="relative">
                                            <button
                                                onClick={() => setOpenMenuId(openMenuId === client.id ? null : client.id)}
                                                className="text-zinc-600 hover:text-white transition-colors p-1"
                                            >
                                                <MoreVertical className="w-5 h-5" />
                                            </button>

                                            {openMenuId === client.id && (
                                                <div className="absolute right-0 mt-2 w-32 bg-dark-800 border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden">
                                                    <button
                                                        onClick={() => openEdit(client)}
                                                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5 text-blue-400" /> Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(client.id)}
                                                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 flex items-center gap-2 border-t border-white/5"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" /> Excluir
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <h3 className="text-lg font-bold font-display">{client.name}</h3>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded">
                                                {client.clientType}
                                            </span>
                                            {client.isDefaulter && (
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                                                    Inadimplente
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-6 text-sm text-zinc-500">
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-3.5 h-3.5 opacity-50" /> {client.phone || "Sem WhatsApp"}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-3.5 h-3.5 opacity-50" /> {client.email || "Sem e-mail"}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-3.5 h-3.5 opacity-50" /> {client.cpf || "Sem CPF"}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                                        <div>
                                            <p className="text-[10px] text-zinc-600 font-bold uppercase">Total Gasto</p>
                                            <p className="font-bold text-sm text-green-400">{formatCurrency(client.totalSpent || 0)}</p>
                                        </div>
                                        <button className="text-xs text-brand-400 font-semibold hover:underline">
                                            Ficha Completa →
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingClient ? "Editar Cliente" : "Novo Cliente"}
            >
                <form onSubmit={handleAction} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Nome Completo</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ex: João Silva"
                            className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 transition-all font-medium"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">WhatsApp</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="(11) 99999-9999"
                                className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 transition-all font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">CPF</label>
                            <input
                                type="text"
                                value={formData.cpf}
                                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                                placeholder="000.000.000-00"
                                className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="cliente@exemplo.com"
                                className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 transition-all font-medium"
                            />
                        </div>
                        {!editingClient && (
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">Senha Provisória</label>
                                <input
                                    type="text"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Senha para o cliente logar"
                                    className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 transition-all font-medium"
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Data de Nascimento</label>
                        <input
                            type="date"
                            value={formData.birthDate}
                            onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                            className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50 transition-all font-medium"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Tipo de Cliente</label>
                        <select
                            value={formData.clientType}
                            onChange={(e) => setFormData({ ...formData, clientType: e.target.value })}
                            className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50 transition-all font-medium"
                        >
                            <option value="SUBSCRIBER">Assinante (Cliente Fiel)</option>
                            <option value="WALK_IN">Walk-in (Avulso)</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-6 border-t border-white/5 mt-8">
                        <button
                            type="button"
                            onClick={closeModal}
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
                                    <Save className="w-4 h-4" />
                                    {editingClient ? "Atualizar Cliente" : "Salvar Cliente"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </AdminShell>
    );
}
