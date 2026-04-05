"use client";

import AdminShell from "@/components/admin/admin-shell";
import { Plus, Search, MoreVertical, Scissors, Clock, Save, Loader2, DollarSign, Wrench, Edit2, Trash2, Building2, CheckCircle } from "lucide-react";
import { EmptyState } from "@/components/admin/empty-state";
import { Modal } from "@/components/ui/modal";
import { formatCurrency } from "@/lib/utils";
import { useState, useEffect } from "react";
import { getServicesList, createService, updateService, deleteService } from "@/app/actions/service-actions";
import { getOwnerStores } from "@/app/actions/store-actions";

export default function ServicesPage() {
    const [services, setServices] = useState<any[]>([]);
    const [stores, setStores] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<any>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [formData, setFormData] = useState<{
        name: string;
        description: string;
        price: string;
        duration: string;
        category: string;
        storeIds: string[];
    }>({
        name: "",
        description: "",
        price: "0",
        duration: "30",
        category: "HAIR",
        storeIds: [],
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setFetching(true);
        try {
            const [servicesData, storesData] = await Promise.all([
                getServicesList(),
                getOwnerStores()
            ]);
            setServices(servicesData || []);
            setStores(storesData || []);
            if (storesData.length > 0 && formData.storeIds.length === 0) {
                setFormData(prev => ({ ...prev, storeIds: [storesData[0].id] }));
            }
        } catch (err) {
            console.error("Erro ao carregar dados:", err);
        } finally {
            setFetching(false);
        }
    };

    const handleAction = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (formData.storeIds.length === 0) {
            alert("Selecione pelo menos uma barbearia.");
            setLoading(false);
            return;
        }

        try {
            const basePayload = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                durationMinutes: parseInt(formData.duration),
                category: formData.category,
            };

            let success = true;
            let lastError = "";

            if (editingService) {
                // Update single service (the storeId is immutable in update for now)
                const result = await updateService(editingService.id, {
                    ...basePayload,
                    storeId: formData.storeIds[0] 
                });
                if (!result.success) {
                    success = false;
                    lastError = result.error || "Erro ao atualizar.";
                }
            } else {
                // Bulk create for each selected store
                for (const storeId of formData.storeIds) {
                    const result = await createService({
                        ...basePayload,
                        storeId
                    });
                    if (!result.success) {
                        success = false;
                        lastError = result.error || "Erro ao criar em uma das lojas.";
                    }
                }
            }

            if (success) {
                await loadData();
                closeModal();
            } else {
                alert(lastError || "Tente novamente.");
            }
        } catch (err) {
            console.error("Erro na operação:", err);
            alert("Erro na conexão.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Excluir este serviço?")) return;
        try {
            const result = await deleteService(id);
            if (result.success) loadData();
            else alert(result.error);
        } catch (err) { alert("Erro ao excluir."); }
    };

    const openEdit = (service: any) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            description: service.description || "",
            price: service.price.toString(),
            duration: service.durationMinutes.toString(),
            category: service.category || "HAIR",
            storeIds: [service.storeId],
        });
        setIsModalOpen(true);
        setOpenMenuId(null);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingService(null);
        setFormData({ 
            name: "", 
            description: "", 
            price: "0", 
            duration: "30", 
            category: "HAIR",
            storeIds: stores.length > 0 ? [stores[0].id] : [],
        });
    };

    const toggleStore = (id: string) => {
        setFormData(prev => {
            const updated = prev.storeIds.includes(id)
                ? prev.storeIds.filter(sid => sid !== id)
                : [...prev.storeIds, id];
            return { ...prev, storeIds: updated };
        });
    };

    const filteredServices = services.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminShell>
            <div className="space-y-6">
                <div className="flex items-center justify-between font-display">
                    <div>
                        <h1 className="text-2xl font-black uppercase italic tracking-tight text-white">Catálogo de Serviços</h1>
                        <p className="text-zinc-500 text-sm mt-1 font-medium italic">Gerencie o cardápio de serviços de todas as suas barbearias</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-brand-gradient text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-brand shadow-orange-600/20 italic"
                    >
                        <Plus className="w-4 h-4" />
                        Novo Serviço
                    </button>
                </div>

                {fetching ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-brand-400 opacity-20" />
                    </div>
                ) : services.length === 0 ? (
                    <EmptyState
                        icon={Wrench}
                        title="Nenhum serviço cadastrado"
                        description="Você ainda não cadastrou nenhum serviço. Comece adicionando seus cortes, barbas e tratamentos."
                        buttonText="Cadastrar primeiro serviço"
                        onAction={() => setIsModalOpen(true)}
                    />
                ) : (
                    <>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                                type="text"
                                placeholder="Buscar serviço por nome..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-dark-800 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-brand-500/30 transition-all font-bold"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredServices.map((service) => (
                                <div key={service.id} className="glass-card rounded-[2.5rem] p-8 hover:border-white/15 transition-all group relative flex flex-col bg-dark-800/20 border border-white/5 overflow-visible">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20 group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-brand/10">
                                            <Scissors className="w-6 h-6 text-brand-400" />
                                        </div>

                                        <div className="relative">
                                            <button
                                                onClick={() => setOpenMenuId(openMenuId === service.id ? null : service.id)}
                                                className="text-zinc-600 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5"
                                            >
                                                <MoreVertical className="w-5 h-5" />
                                            </button>

                                            {openMenuId === service.id && (
                                                <div className="absolute right-0 mt-2 w-44 bg-dark-800 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
                                                    <button
                                                        onClick={() => openEdit(service)}
                                                        className="w-full text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:bg-white/10 hover:text-white flex items-center gap-3 transition-colors"
                                                    >
                                                        <Edit2 className="w-4 h-4 text-blue-400" /> Editar Dados
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(service.id)}
                                                        className="w-full text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 flex items-center gap-3 transition-colors border-t border-white/5"
                                                    >
                                                        <Trash2 className="w-4 h-4" /> Excluir Registro
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-black font-display italic uppercase tracking-tight text-white mb-2 truncate">{service.name}</h3>
                                    
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="flex items-center gap-1.5 text-zinc-500 bg-dark-900/50 px-3 py-1 rounded-full border border-white/5">
                                            <Building2 className="w-3 h-3 text-brand-400" />
                                            <span className="text-[9px] font-black uppercase tracking-widest line-clamp-1 max-w-[150px]">
                                                {service.store?.name}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-zinc-500 text-xs mb-8 line-clamp-2 h-10 font-medium italic">
                                        {service.description || "Este serviço ainda não possui uma descrição para os clientes."}
                                    </p>

                                    <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <div className="w-8 h-8 rounded-[10px] bg-dark-700 flex items-center justify-center border border-white/5">
                                                <Clock className="w-3.5 h-3.5 opacity-50 text-brand-400" />
                                            </div>
                                            <span className="text-xs font-black italic uppercase tracking-widest">{service.durationMinutes} min</span>
                                        </div>
                                        <span className="font-black text-2xl text-green-400 font-display italic tracking-tighter">
                                            {formatCurrency(service.price)}
                                        </span>
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
                title={editingService ? "Editar Serviço" : "Novo Serviço"}
            >
                <form onSubmit={handleAction} className="space-y-6 py-4">
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                                {editingService ? "Unidade Alocada" : "Unidades / Alocação (Selecione uma ou mais)"}
                            </label>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {stores.map(st => (
                                    <button
                                        key={st.id}
                                        type="button"
                                        disabled={!!editingService}
                                        onClick={() => toggleStore(st.id)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left ${
                                            formData.storeIds.includes(st.id) 
                                                ? "bg-brand-500/10 border-brand-500/40 text-white" 
                                                : "bg-dark-700 border-white/5 text-zinc-500 hover:border-white/10"
                                        } ${editingService ? "opacity-70 cursor-not-allowed" : ""}`}
                                    >
                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                            formData.storeIds.includes(st.id)
                                                ? "bg-brand-500 border-brand-500 text-white"
                                                : "border-white/10"
                                        }`}>
                                            {formData.storeIds.includes(st.id) && <CheckCircle className="w-3.5 h-3.5" />}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest truncate">{st.name}</span>
                                    </button>
                                ))}
                            </div>
                            {!editingService && stores.length > 1 && (
                                <button 
                                    type="button" 
                                    onClick={() => setFormData(prev => ({ ...prev, storeIds: stores.map(s => s.id) }))}
                                    className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-400 hover:text-brand-300 transition-colors ml-1"
                                >
                                    + Selecionar todas as unidades
                                </button>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Nome do Serviço Profissional</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Corte Degradê Navalhado"
                                className="w-full bg-dark-700 border border-white/5 rounded-2xl px-6 h-16 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-bold uppercase italic tracking-tight"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Descrição Comercial</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Descreva os diferenciais deste serviço para o seu cliente..."
                                rows={3}
                                className="w-full bg-dark-700 border border-white/5 rounded-2xl px-6 py-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium resize-none shadow-inner italic"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Valor do Serviço</label>
                                <div className="relative">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-green-500 font-black italic">R$</div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full bg-dark-700 border border-white/5 rounded-2xl pl-14 pr-6 h-16 text-white focus:outline-none font-black italic tracking-tight text-lg"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Tempo Estimado</label>
                                <div className="relative">
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-600 font-black italic uppercase tracking-widest text-[10px]">MIN</div>
                                    <input
                                        type="number"
                                        required
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        className="w-full bg-dark-700 border border-white/5 rounded-2xl px-6 h-16 text-white focus:outline-none font-black italic tracking-tight text-lg"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 flex gap-4">
                        <button type="button" onClick={closeModal} className="flex-1 h-16 text-zinc-500 font-black uppercase tracking-widest text-[10px] hover:bg-white/5 rounded-2xl transition-all italic">Cancelar</button>
                        <button type="submit" disabled={loading} className="flex-[2] h-16 bg-brand-gradient text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:opacity-90 shadow-brand active:scale-95 transition-all shadow-orange-600/20 italic">
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-5 h-5 text-white/40" />} {editingService ? "Salvar Alterações" : "Cadastrar Serviço"}
                        </button>
                    </div>
                </form>
            </Modal>
        </AdminShell>
    );
}
