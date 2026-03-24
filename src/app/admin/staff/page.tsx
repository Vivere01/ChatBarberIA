"use client";

import AdminShell from "@/components/admin/admin-shell";
import { Plus, MoreVertical, UserCog, Loader2, Save, Mail, Phone } from "lucide-react";
import { EmptyState } from "@/components/admin/empty-state";
import { Modal } from "@/components/ui/modal";
import { useState, useEffect } from "react";
import { createStaff, getStaffList } from "@/app/actions/staff-actions";

export default function StaffPage() {
    const [staff, setStaff] = useState<any[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        role: "STAFF",
        commission: "50",
    });

    useEffect(() => {
        const loadStaff = async () => {
            try {
                const data = await getStaffList();
                setStaff(data || []);
            } catch (err) {
                console.error("Erro ao carregar profissionais:", err);
            } finally {
                setFetching(false);
            }
        };
        loadStaff();
    }, []);

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await createStaff({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                role: formData.role,
                commissionPercent: parseFloat(formData.commission),
            });

            if (result.success) {
                setStaff([result.staff, ...staff]);
                setIsMenuOpen(false);
                setFormData({ name: "", email: "", phone: "", role: "STAFF", commission: "50" });
            } else {
                alert(result.error || "Erro ao salvar.");
            }
        } catch (err) {
            console.error("Erro ao salvar profissional:", err);
            alert("Erro na conexão.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminShell>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-display text-2xl font-bold">Profissionais</h1>
                        <p className="text-zinc-500 text-sm mt-1">Gerencie a sua equipe e níveis de gamificação</p>
                    </div>
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="flex items-center gap-2 bg-brand-gradient text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-brand-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Adicionar Profissional
                    </button>
                </div>

                {fetching ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-brand-400 opacity-20" />
                        <p className="text-zinc-500 text-sm">Carregando sua equipe...</p>
                    </div>
                ) : staff.length === 0 ? (
                    <EmptyState
                        icon={UserCog}
                        title="Nenhum profissional cadastrado"
                        description="Adicione seus barbeiros agora. Eles terão acesso a dashboard própria e sistema de gamificação."
                        buttonText="Adicionar meu primeiro barbeiro"
                        onAction={() => setIsMenuOpen(true)}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {staff.map((member) => (
                            <div key={member.id} className="glass-card rounded-2xl p-6 relative group overflow-hidden transition-all hover:border-white/15">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-full bg-dark-600 border border-white/5 flex items-center justify-center text-xl font-bold font-display shadow-lg text-brand-400">
                                            {member.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg font-display truncate max-w-[150px]">{member.name}</h3>
                                            <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-bold">{member.role} · {member.isActive ? "Ativo" : "Inativo"}</p>
                                        </div>
                                    </div>
                                    <button className="text-zinc-600 hover:text-white transition-colors relative z-10">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                                        <Mail className="w-3.5 h-3.5 opacity-50" /> {member.email || "Sem email"}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                                        <Phone className="w-3.5 h-3.5 opacity-50" /> {member.phone || "Sem WhatsApp"}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 py-4 border-t border-b border-white/5 my-6">
                                    <div className="text-center">
                                        <p className="text-[10px] text-zinc-600 font-bold uppercase mb-1">Pontos</p>
                                        <p className="font-bold text-sm text-brand-400">{member.gamificationPoints || 0}</p>
                                    </div>
                                    <div className="text-center border-l border-r border-white/10 px-2">
                                        <p className="text-[10px] text-zinc-600 font-bold uppercase mb-1">Comissão</p>
                                        <p className="font-bold text-sm text-green-400">{member.commissionPercent}%</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] text-zinc-600 font-bold uppercase mb-1">Status</p>
                                        <div className="flex justify-center">
                                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] mt-1.5" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full text-white badge-prata`}>
                                        🥈 {member.gamificationLevel}
                                    </span>
                                    <button className="text-xs text-brand-400 hover:text-brand-300 transition-colors font-medium">
                                        Ver histórico →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                title="Novo Profissional"
            >
                <form onSubmit={handleAddStaff} className="space-y-5">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Nome Completo</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Rodrigo Santos"
                                className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 transition-all font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Email (Login)</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="rodrigo@exemplo.com"
                                className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 transition-all font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">WhatsApp</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="(11) 90000-0000"
                                className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Cargo</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50 transition-all font-medium"
                            >
                                <option value="STAFF">Barbeiro</option>
                                <option value="MANAGER">Gerente</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Comissão (%)</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={formData.commission}
                                onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
                                className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/50 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-6 border-t border-white/5 mt-8">
                        <button
                            type="button"
                            onClick={() => setIsMenuOpen(false)}
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
                                    Salvar Profissional
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </AdminShell>
    );
}
