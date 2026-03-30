"use client";

import AdminShell from "@/components/admin/admin-shell";
import {
    Plus, Store, Loader2, Save, MapPin, Globe, Phone, FileText,
    Trash2, Edit3, ExternalLink, Check, AlertTriangle
} from "lucide-react";
import { EmptyState } from "@/components/admin/empty-state";
import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { createStore, getOwnerStores, updateStore, deleteStore } from "@/app/actions/store-actions";
import { slugify } from "@/lib/utils";

const EMPTY_FORM = { 
    name: "", 
    slug: "", 
    address: "", 
    phone: "", 
    description: "",
    primaryColor: "#f97316",
    loginBackgroundUrl: "",
    brandingFaviconUrl: ""
};

export default function StoresPage() {
    const [stores, setStores] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingStore, setEditingStore] = useState<any>(null);
    const [storeToDelete, setStoreToDelete] = useState<any>(null);

    const [formData, setFormData] = useState(EMPTY_FORM);
    const [successMsg, setSuccessMsg] = useState("");

    const fetchStores = async () => {
        setLoading(true);
        const data = await getOwnerStores();
        setStores(data);
        setLoading(false);
    };

    useEffect(() => { fetchStores(); }, []);

    const openCreate = () => {
        setEditingStore(null);
        setFormData(EMPTY_FORM);
        setIsFormOpen(true);
    };

    const openEdit = (store: any) => {
        setEditingStore(store);
        setFormData({
            name: store.name,
            slug: store.slug,
            address: store.address || "",
            phone: store.phone || "",
            description: store.description || "",
            primaryColor: store.primaryColor || "#f97316",
            loginBackgroundUrl: store.loginBackgroundUrl || "",
            brandingFaviconUrl: store.brandingFaviconUrl || "",
        });
        setIsFormOpen(true);
    };

    const openDelete = (store: any) => {
        setStoreToDelete(store);
        setIsDeleteOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const res = editingStore
            ? await updateStore(editingStore.id, formData)
            : await createStore(formData as any);

        if (res.success) {
            await fetchStores();
            setIsFormOpen(false);
            setFormData(EMPTY_FORM as any);
            setSuccessMsg(editingStore ? "Unidade atualizada!" : "Nova unidade criada!");
            setTimeout(() => setSuccessMsg(""), 3000);
        } else {
            alert(res.error || "Erro ao salvar. Tente novamente.");
        }
        setSaving(false);
    };

    const handleDelete = async () => {
        if (!storeToDelete) return;
        setDeleting(true);
        const res = await deleteStore(storeToDelete.id);
        if (res.success) {
            setStores(stores.filter(s => s.id !== storeToDelete.id));
            setIsDeleteOpen(false);
            setStoreToDelete(null);
        } else {
            alert(res.error || "Erro ao excluir.");
        }
        setDeleting(false);
    };

    return (
        <AdminShell>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-display text-2xl font-black uppercase italic tracking-tighter text-white">
                            Minhas Lojas / Filiais
                        </h1>
                        <p className="text-zinc-500 text-sm mt-1 font-medium italic">
                            Gerencie sua rede de barbearias em um só lugar
                        </p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="bg-brand-gradient text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-brand shadow-orange-600/20 italic"
                    >
                        <Plus className="w-4 h-4" /> Adicionar Filial
                    </button>
                </div>

                {/* Success toast */}
                {successMsg && (
                    <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 text-green-400 px-5 py-4 rounded-2xl text-sm font-black uppercase tracking-widest italic animate-in fade-in slide-in-from-top-2">
                        <Check className="w-5 h-5" /> {successMsg}
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-brand-400 animate-spin opacity-40" />
                    </div>
                ) : stores.length === 0 ? (
                    <EmptyState
                        icon={Store}
                        title="Nenhuma unidade cadastrada"
                        description="Crie sua primeira filial e comece a gerenciar sua barbearia de forma profissional."
                        buttonText="Criar primeira unidade"
                        onAction={openCreate}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stores.map((store) => (
                            <div
                                key={store.id}
                                className="glass-card rounded-[2.5rem] p-8 group hover:border-white/15 transition-all relative overflow-visible flex flex-col bg-dark-800/20 border border-white/5"
                            >
                                {/* Status badge */}
                                <div className="flex items-center justify-between mb-6">
                                    <div 
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center border group-hover:scale-110 transition-transform duration-500 shadow-lg"
                                        style={{ backgroundColor: `${store.primaryColor}20`, borderColor: `${store.primaryColor}40` }}
                                    >
                                        <Store className="w-6 h-6" style={{ color: store.primaryColor }} />
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${store.isActive
                                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                                            : "bg-red-500/10 text-red-400 border-red-500/20"
                                        }`}>
                                        {store.isActive ? "● Ativa" : "● Suspensa"}
                                    </span>
                                </div>

                                {/* Info */}
                                <div className="flex-1 mb-6">
                                    <h3 className="text-xl font-black font-display italic uppercase tracking-tighter text-white mb-3 line-clamp-2">
                                        {store.name}
                                    </h3>
                                    <div className="space-y-2">
                                        <a
                                            href={`/${store.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-xs text-zinc-500 hover:opacity-80 transition-opacity group/link"
                                        >
                                            <Globe className="w-3.5 h-3.5 shrink-0" style={{ color: store.primaryColor }} />
                                            <span className="truncate italic">chatbarber.com.br/{store.slug}</span>
                                            <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0" />
                                        </a>
                                        {store.address && (
                                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                <MapPin className="w-3.5 h-3.5 shrink-0 text-zinc-600" />
                                                <span className="truncate italic">{store.address}</span>
                                            </div>
                                        )}
                                        {store.phone && (
                                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                <Phone className="w-3.5 h-3.5 shrink-0 text-zinc-600" />
                                                <span className="italic">{store.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-6 border-t border-white/5">
                                    <button
                                        onClick={() => openEdit(store)}
                                        className="flex-1 py-3 rounded-2xl border border-white/8 bg-dark-700/50 text-xs font-black text-zinc-400 hover:text-white hover:bg-dark-700 hover:border-white/20 transition-all uppercase tracking-widest flex items-center justify-center gap-2 italic"
                                    >
                                        <Edit3 className="w-4 h-4" style={{ color: store.primaryColor }} /> Editar
                                    </button>
                                    <button
                                        onClick={() => openDelete(store)}
                                        className="w-12 h-12 rounded-2xl border border-white/8 bg-dark-700/50 flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
                                        title="Excluir unidade"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Create / Edit Modal ── */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => !saving && setIsFormOpen(false)}
                title={editingStore ? "Editar Unidade" : "Nova Filial / Unidade"}
                maxWidth="3xl"
            >
                <form onSubmit={handleSave} className="space-y-8 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Coluna 1: Dados Básicos */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[3px] text-brand-400 mb-2">Informações Gerais</h3>
                            
                            {/* Nome */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Nome da Unidade *</label>
                                <div className="relative">
                                    <Store className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => {
                                            const name = e.target.value;
                                            setFormData({ ...formData, name, slug: slugify(name) } as any);
                                        }}
                                        placeholder="Ex: Cartel Barbearia — Matriz"
                                        className="w-full bg-dark-700 border border-white/5 rounded-2xl pl-12 pr-5 h-16 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-bold italic tracking-tight uppercase"
                                    />
                                </div>
                            </div>

                            {/* Slug */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Link do Site *</label>
                                <div className="relative flex items-center bg-dark-700 border border-white/5 rounded-2xl h-16 px-5 gap-2">
                                    <Globe className="w-4 h-4 text-zinc-600 shrink-0" />
                                    <span className="text-zinc-600 font-black text-[10px] italic shrink-0">chatbarber.com.br/</span>
                                    <input
                                        type="text"
                                        required
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) } as any)}
                                        placeholder="nome-da-barbearia"
                                        className="flex-1 bg-transparent text-white focus:outline-none font-black italic tracking-tight text-xs"
                                    />
                                </div>
                            </div>

                            {/* Telefone + Endereço */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">WhatsApp</label>
                                <div className="relative">
                                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value } as any)}
                                        placeholder="(11) 99999-9999"
                                        className="w-full bg-dark-700 border border-white/5 rounded-2xl pl-12 pr-5 h-16 text-white placeholder-zinc-600 focus:outline-none font-bold italic"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Endereço</label>
                                <div className="relative">
                                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value } as any)}
                                        placeholder="Rua, Número, Bairro"
                                        className="w-full bg-dark-700 border border-white/5 rounded-2xl pl-12 pr-5 h-16 text-white placeholder-zinc-600 focus:outline-none font-bold italic"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Coluna 2: IDENTIDADE VISUAL */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[3px] text-brand-400 mb-2">Identidade Visual</h3>
                            
                            {/* Cor Primária */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Cor Primária do App</label>
                                <div className="flex gap-4">
                                    <input
                                        type="color"
                                        value={(formData as any).primaryColor || "#f97316"}
                                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value } as any)}
                                        className="w-16 h-16 bg-dark-700 border border-white/5 rounded-2xl p-1 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={(formData as any).primaryColor || "#f97316"}
                                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value } as any)}
                                        placeholder="#000000"
                                        className="flex-1 bg-dark-700 border border-white/5 rounded-2xl px-5 h-16 text-white font-black uppercase tracking-widest text-xs"
                                    />
                                </div>
                            </div>

                            {/* Background Login */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Imagem de Fundo (Login)</label>
                                <input
                                    type="text"
                                    value={(formData as any).loginBackgroundUrl || ""}
                                    onChange={(e) => setFormData({ ...formData, loginBackgroundUrl: e.target.value } as any)}
                                    placeholder="https://suaimagem.com/fundo.jpg"
                                    className="w-full bg-dark-700 border border-white/5 rounded-2xl px-5 h-16 text-white placeholder-zinc-600 focus:outline-none font-medium text-xs tabular-nums"
                                />
                                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest ml-1 italic">* URL de uma imagem de alta resolução</p>
                            </div>

                            {/* Favicon */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Ícone da Aba (Favicon)</label>
                                <input
                                    type="text"
                                    value={(formData as any).brandingFaviconUrl || ""}
                                    onChange={(e) => setFormData({ ...formData, brandingFaviconUrl: e.target.value } as any)}
                                    placeholder="https://suaimagem.com/favicon.png"
                                    className="w-full bg-dark-700 border border-white/5 rounded-2xl px-5 h-16 text-white placeholder-zinc-600 focus:outline-none font-medium text-xs"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Descrição */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Descrição</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value } as any)}
                            placeholder="Apresente sua unidade aos clientes..."
                            rows={3}
                            className="w-full bg-dark-700 border border-white/5 rounded-[2rem] px-6 py-5 text-white placeholder-zinc-600 focus:outline-none font-medium italic resize-none text-sm"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="pt-6 flex gap-4">
                        <button
                            type="button"
                            disabled={saving}
                            onClick={() => setIsFormOpen(false)}
                            className="flex-1 h-16 text-zinc-500 font-black uppercase tracking-widest text-[10px] hover:bg-white/5 rounded-2xl transition-all italic disabled:opacity-40"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-[2] h-16 bg-brand-gradient text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:opacity-90 shadow-brand shadow-orange-600/20 active:scale-95 transition-all italic disabled:opacity-60"
                        >
                            {saving
                                ? <Loader2 className="w-5 h-5 animate-spin" />
                                : <Save className="w-5 h-5 text-white/40" />
                            }
                            {editingStore ? "Salvar Alterações" : "Criar Unidade"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ── Delete Confirmation Modal ── */}
            <Modal
                isOpen={isDeleteOpen}
                onClose={() => !deleting && setIsDeleteOpen(false)}
                title="Confirmar Exclusão"
            >
                <div className="py-4 space-y-6">
                    <div className="flex gap-4 bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
                        <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-black text-red-100 uppercase tracking-tight italic mb-1">
                                Ação Irreversível
                            </p>
                            <p className="text-xs text-red-200/60 leading-relaxed font-medium">
                                Tem certeza que deseja excluir a unidade{" "}
                                <span className="text-red-100 font-black">"{storeToDelete?.name}"</span>?{" "}
                                Todos os profissionais, serviços e agendamentos vinculados a esta filial serão removidos permanentemente.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            disabled={deleting}
                            onClick={() => setIsDeleteOpen(false)}
                            className="flex-1 h-14 text-zinc-500 font-black uppercase tracking-widest text-[10px] hover:bg-white/5 rounded-2xl transition-all italic disabled:opacity-40"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            disabled={deleting}
                            onClick={handleDelete}
                            className="flex-[2] h-14 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all active:scale-95 italic disabled:opacity-60"
                        >
                            {deleting
                                ? <Loader2 className="w-5 h-5 animate-spin" />
                                : <Trash2 className="w-5 h-5" />
                            }
                            Excluir Permanentemente
                        </button>
                    </div>
                </div>
            </Modal>
        </AdminShell>
    );
}
