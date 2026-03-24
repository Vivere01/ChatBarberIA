"use client";

import AdminShell from "@/components/admin/admin-shell";
import { Plus, Search, MoreVertical, Scissors, Clock, Save, Loader2, DollarSign, Wrench } from "lucide-react";
import { EmptyState } from "@/components/admin/empty-state";
import { Modal } from "@/components/ui/modal";
import { formatCurrency } from "@/lib/utils";
import { useState, useEffect } from "react";
import { getServicesList, createService } from "@/app/actions/service-actions";

export default function ServicesPage() {
    const [services, setServices] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "0",
        duration: "30",
        category: "HAIR",
    });

    useEffect(() => {
        const loadServices = async () => {
            try {
                const data = await getServicesList();
                setServices(data || []);
            } catch (err) {
                console.error("Erro ao carregar serviços:", err);
            } finally {
                setFetching(false);
            }
        };
        loadServices();
    }, []);

    const handleAddService = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await createService({
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                durationMinutes: parseInt(formData.duration),
                category: formData.category,
            });

            if (result.success) {
                setServices([result.service, ...services]);
                setIsModalOpen(false);
                setFormData({ name: "", description: "", price: "0", duration: "30", category: "HAIR" });
            } else {
                alert(result.error || "Tente novamente.");
            }
        } catch (err) {
            console.error("Erro ao salvar serviço:", err);
            alert("Erro na conexão.");
        } finally {
            setLoading(false);
        }
    };

    const filteredServices = services.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminShell>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-display text-2xl font-bold">Serviços</h1>
                        <p className="text-zinc-500 text-sm mt-1">Configure o catálogo de serviços da sua barbearia</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-brand-gradient text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-brand-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Novo Serviço
                    </button>
                </div>

                {fetching ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-brand-400 opacity-20" />
                        <p className="text-zinc-500 text-sm">Carregando catálogo...</p>
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
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nome..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-dark-800 border border-white/8 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-brand-500/30 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredServices.map((service) => (
                                <div key={service.id} className="glass-card rounded-2xl p-6 hover:border-white/15 transition-all group relative flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                                            <Scissors className="w-5 h-5 text-brand-400" />
                                        </div>
                                        <button className="text-zinc-600 hover:text-white transition-colors">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <h3 className="text-lg font-bold font-display mb-1 truncate">{service.name}</h3>
                                    <p className="text-zinc-500 text-xs mb-6 line-clamp-2 h-8">{service.description || "Sem descrição disponível."}</p>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                                        <div className="flex items-center gap-1.5 text-zinc-400">
                                            <Clock className="w-3.5 h-3.5 opacity-50" />
                                            <span className="text-xs font-semibold">{service.durationMinutes} min</span>
                                        </div>
                                        <span className="font-bold text-xl text-green-400 font-display">
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
                onClose={() => setIsModalOpen(false)}
                title="Novo Serviço"
            >
                <form onSubmit={handleAddService} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Nome do Serviço</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ex: Corte Degradê"
                            className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 transition-all font-medium"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Descrição (Opcional)</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Descreva o que está incluso no serviço..."
                            rows={3}
                            className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 transition-all font-medium resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Preço (R$)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full bg-dark-700 border border-white/8 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-brand-500/50 transition-all font-medium"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Duração (minutos)</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input
                                    type="number"
                                    required
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    className="w-full bg-dark-700 border border-white/8 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-brand-500/50 transition-all font-medium"
                                />
                            </div>
                        </div>
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
                                    <Save className="w-4 h-4" />
                                    Salvar Serviço
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </AdminShell>
    );
}
