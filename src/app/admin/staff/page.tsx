"use client";

import AdminShell from "@/components/admin/admin-shell";
import { Plus, MoreVertical, UserCog, Loader2, Save, Mail, Phone, Trash2, Edit2, X, Camera, Building2 } from "lucide-react";
import { EmptyState } from "@/components/admin/empty-state";
import { Modal } from "@/components/ui/modal";
import { useState, useEffect, useRef } from "react";
import { createStaff, getStaffList, updateStaff, deleteStaff } from "@/app/actions/staff-actions";
import { getOwnerStores } from "@/app/actions/store-actions";
import { cn } from "@/lib/utils";

export default function StaffPage() {
    const [staff, setStaff] = useState<any[]>([]);
    const [stores, setStores] = useState<any[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<any>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        role: "STAFF",
        commission: "50",
        avatarUrl: "",
        storeId: "",
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setFetching(true);
        try {
            const [staffData, storesData] = await Promise.all([
                getStaffList(),
                getOwnerStores()
            ]);
            setStaff(staffData || []);
            setStores(storesData || []);
            if (storesData.length > 0 && !formData.storeId) {
                setFormData(prev => ({ ...prev, storeId: storesData[0].id }));
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

        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                role: formData.role,
                commissionPercent: parseFloat(formData.commission),
                avatarUrl: formData.avatarUrl,
                storeId: formData.storeId,
            };

            const result = editingStaff
                ? await updateStaff(editingStaff.id, payload)
                : await createStaff(payload);

            if (result.success) {
                await loadData();
                closeModal();
            } else {
                alert(`Erro: ${result.error || "Tente salvar novamente."}`);
            }
        } catch (err) {
            console.error("Erro na operação:", err);
            alert("Erro na conexão.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este profissional?")) return;

        try {
            const result = await deleteStaff(id);
            if (result.success) {
                setStaff(staff.filter(s => s.id !== id));
            } else {
                alert(result.error);
            }
        } catch (err) {
            alert("Erro ao excluir.");
        }
    };

    const openEdit = (member: any) => {
        setEditingStaff(member);
        setFormData({
            name: member.name,
            email: member.email || "",
            phone: member.phone || "",
            role: member.role,
            commission: member.commissionPercent.toString(),
            avatarUrl: member.avatarUrl || "",
            storeId: member.storeId,
        });
        setIsMenuOpen(true);
        setOpenMenuId(null);
    };

    const closeModal = () => {
        setIsMenuOpen(false);
        setEditingStaff(null);
        setFormData({ 
            name: "", 
            email: "", 
            phone: "", 
            role: "STAFF", 
            commission: "50", 
            avatarUrl: "",
            storeId: stores[0]?.id || "",
        });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("A imagem é muito grande (máximo 2MB).");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <AdminShell>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-display text-2xl font-bold italic tracking-tight uppercase text-white">Equipe de Profissionais</h1>
                        <p className="text-zinc-500 text-sm mt-1 font-medium italic">Gerencie o time de todas as suas unidades em um só lugar</p>
                    </div>
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="flex items-center gap-2 bg-brand-gradient text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-brand shadow-orange-600/20"
                    >
                        <Plus className="w-4 h-4" />
                        Novo Profissional
                    </button>
                </div>

                {fetching ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-brand-400 opacity-20" />
                    </div>
                ) : staff.length === 0 ? (
                    <EmptyState
                        icon={UserCog}
                        title="Nenhum profissional cadastrado"
                        description="Comece adicionando seus profissionais e vincule-os às suas unidades."
                        buttonText="Cadastrar primeiro profissional"
                        onAction={() => setIsMenuOpen(true)}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {staff.map((member) => (
                            <div key={member.id} className="glass-card rounded-[2.5rem] p-8 relative group overflow-visible transition-all hover:border-white/15 bg-dark-800/20 border border-white/5 min-w-0 flex flex-col w-full">
                                <div className="flex items-start justify-between mb-8 w-full">
                                    <div className="flex items-center gap-4 flex-1 min-w-0 pr-2">
                                        <div className="w-20 h-20 shrink-0 rounded-[1.5rem] overflow-hidden border-2 border-white/5 relative group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                                            {member.avatarUrl ? (
                                                <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-dark-700 flex items-center justify-center text-zinc-600 font-bold font-display text-2xl">
                                                    {member.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-dark-900 rounded-full shadow-lg" />
                                        </div>
                                        <div className="flex-1 min-w-0 pr-4">
                                            <h3 className="font-black text-base font-display italic uppercase text-white block truncate w-full">{member.name}</h3>
                                            <div className="flex flex-col gap-1 mt-1">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-400">{member.role}</span>
                                                <div className="flex items-center gap-1.5 text-zinc-500">
                                                    <Building2 className="w-3 h-3 text-zinc-600" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest truncate max-w-[120px]">{member.store?.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative shrink-0 ml-2">
                                        <button
                                            onClick={() => setOpenMenuId(openMenuId === member.id ? null : member.id)}
                                            className="text-zinc-600 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5 flex items-center justify-center"
                                        >
                                            <MoreVertical className="w-5 h-5" />
                                        </button>

                                        {openMenuId === member.id && (
                                            <div className="absolute right-0 mt-2 w-44 bg-dark-800 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
                                                <button
                                                    onClick={() => openEdit(member)}
                                                    className="w-full text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:bg-white/10 hover:text-white flex items-center gap-3 transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4 text-blue-400" /> Editar Dados
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(member.id)}
                                                    className="w-full text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 flex items-center gap-3 transition-colors border-t border-white/5"
                                                >
                                                    <Trash2 className="w-4 h-4" /> Excluir Registro
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-dark-900/50 p-4 rounded-2xl border border-white/5 group-hover:bg-dark-900/80 transition-colors shadow-inner">
                                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1.5">Comissão</p>
                                        <p className="font-black text-lg text-white italic tracking-tighter">{member.commissionPercent}%</p>
                                    </div>
                                    <div className="bg-dark-900/50 p-4 rounded-2xl border border-white/5 group-hover:bg-dark-900/80 transition-colors shadow-inner">
                                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1.5">Ranking</p>
                                        <div className="flex items-center gap-1">
                                            <p className="font-black text-lg text-brand-400 italic tracking-tighter">ELITE</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-6 border-t border-white/5">
                                    <div className="flex items-center gap-3 text-xs text-zinc-400 font-bold">
                                        <div className="w-8 h-8 rounded-xl bg-dark-700 flex items-center justify-center text-zinc-500 shadow-sm border border-white/5">
                                            <Mail className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="truncate">{member.email || "Sem e-mail"}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-zinc-400 font-bold">
                                        <div className="w-8 h-8 rounded-xl bg-dark-700 flex items-center justify-center text-zinc-500 shadow-sm border border-white/5">
                                            <Phone className="w-3.5 h-3.5" />
                                        </div>
                                        <span>{member.phone || "Sem WhatsApp"}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal isOpen={isMenuOpen} onClose={closeModal} title={editingStaff ? "Editar Profissional" : "Novo Profissional"}>
                <form onSubmit={handleAction} className="space-y-6 py-4">
                    <div className="flex flex-col items-center gap-4 pb-4">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-28 h-28 rounded-[2.5rem] border-2 border-dashed border-white/10 bg-dark-700/30 relative overflow-hidden group cursor-pointer hover:bg-dark-700/50 transition-all flex items-center justify-center shadow-2xl hover:scale-105"
                        >
                            {formData.avatarUrl ? (
                                <img src={formData.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-zinc-600">
                                    <Camera className="w-8 h-8 opacity-40 animate-pulse" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Foto</span>
                                </div>
                            )}
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Unidade / Alocação</label>
                            <select 
                                required
                                value={formData.storeId}
                                onChange={(e) => setFormData({...formData, storeId: e.target.value})}
                                className="w-full bg-dark-700 border border-white/5 rounded-2xl px-5 h-16 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-black italic uppercase tracking-widest text-xs"
                            >
                                <option value="" disabled>Escolha a barbearia</option>
                                {stores.map(st => (
                                    <option key={st.id} value={st.id}>{st.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Nome Completo</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Rodrigo Santos"
                                className="w-full bg-dark-700 border border-white/5 rounded-2xl px-6 h-16 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-bold uppercase italic tracking-tight"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Email Profissional</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="rodrigo@exemplo.com"
                                    className="w-full bg-dark-700 border border-white/5 rounded-2xl px-6 h-16 text-white focus:outline-none font-bold italic tracking-tight"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">WhatsApp Celular</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="(11) 90000-0000"
                                    className="w-full bg-dark-700 border border-white/5 rounded-2xl px-6 h-16 text-white focus:outline-none font-bold tracking-tight"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Cargo / Nível</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full bg-dark-700 border border-white/5 rounded-2xl px-6 h-16 text-white focus:outline-none font-bold uppercase italic tracking-widest text-xs"
                                >
                                    <option value="STAFF">Barbeiro / Profissional</option>
                                    <option value="MANAGER">Gerente</option>
                                    <option value="STAFF_RECEPTIONIST">Recepcionista</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Comissão (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.commission}
                                    onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
                                    className="w-full bg-dark-700 border border-white/5 rounded-2xl px-6 h-16 text-white focus:outline-none font-black text-lg italic italic tracking-tight"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 flex gap-4">
                        <button type="button" onClick={closeModal} className="flex-1 h-16 text-zinc-500 font-black uppercase tracking-widest text-[10px] hover:bg-white/5 rounded-2xl transition-all italic">Cancelar</button>
                        <button type="submit" disabled={loading} className="flex-[2] h-16 bg-brand-gradient text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:opacity-90 shadow-brand active:scale-95 transition-all shadow-orange-600/20 italic">
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-5 h-5 text-white/40" />} {editingStaff ? "Salvar Alterações" : "Finalizar Cadastro"}
                        </button>
                    </div>
                </form>
            </Modal>
        </AdminShell>
    );
}
