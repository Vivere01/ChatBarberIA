"use client";

import AdminShell from "@/components/admin/admin-shell";
import { Plus, Image as ImageIcon, Trash2, Save, Loader2, Building2, Upload } from "lucide-react";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { getBanners, createBanner, toggleBannerStatus, deleteBanner } from "@/app/actions/banner-actions";
import { getOwnerStores, updateStore } from "@/app/actions/store-actions";
import { toast } from "sonner";

export default function BannersPage() {
    const [activeTab, setActiveTab] = useState<"BANNERS" | "BRANDING">("BANNERS");
    const [banners, setBanners] = useState<any[]>([]);
    const [stores, setStores] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Branding State
    const [selectedStoreId, setSelectedStoreId] = useState("");
    const [brandingData, setBrandingData] = useState({
        logoUrl: "",
        primaryColor: "#f97316",
        loginBackgroundUrl: "",
    });

    const [formData, setFormData] = useState({
        title: "",
        imageUrl: "",
        linkUrl: "",
        type: "MINISITE" as "INTERNAL" | "MINISITE",
        storeId: "",
    });

    useEffect(() => {
        const loadInitialData = async () => {
            setFetching(true);
            try {
                const [bannersList, storesList] = await Promise.all([
                    getBanners(),
                    getOwnerStores()
                ]);
                setBanners(bannersList);
                setStores(storesList);
                if (storesList.length > 0) {
                    setFormData(prev => ({ ...prev, storeId: storesList[0].id }));
                    setSelectedStoreId(storesList[0].id);
                    setBrandingData({
                        logoUrl: storesList[0].logoUrl || "",
                        primaryColor: storesList[0].primaryColor || "#f97316",
                        loginBackgroundUrl: storesList[0].loginBackgroundUrl || "",
                    });
                }
            } catch (err) {
                console.error("Erro ao carregar dados:", err);
            } finally {
                setFetching(false);
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        if (selectedStoreId) {
            const store = stores.find(s => s.id === selectedStoreId);
            if (store) {
                setBrandingData({
                    logoUrl: store.logoUrl || "",
                    primaryColor: store.primaryColor || "#f97316",
                    loginBackgroundUrl: store.loginBackgroundUrl || "",
                });
            }
        }
    }, [selectedStoreId, stores]);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setBrandingData({ ...brandingData, logoUrl: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveBranding = async () => {
        if (!selectedStoreId) return;
        setLoading(true);
        try {
            const result = await updateStore(selectedStoreId, {
                logoUrl: brandingData.logoUrl || undefined,
                primaryColor: brandingData.primaryColor,
                loginBackgroundUrl: brandingData.loginBackgroundUrl || undefined,
            });
            if (result.success) {
                toast.success("Identidade visual atualizada!");
                setStores(stores.map(s => s.id === selectedStoreId ? { ...s, ...brandingData } : s));
            } else {
                toast.error("Erro ao salvar: " + result.error);
            }
        } catch (error) {
            toast.error("Erro ao salvar alterações");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
               alert("Máximo 2MB");
               return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, imageUrl: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.storeId) {
            alert("Selecione uma unidade");
            return;
        }
        setLoading(true);
        const result = await createBanner(formData);
        if (result.success) {
            setBanners([result.banner, ...banners]);
            setIsModalOpen(false);
            setLoading(false);
            setFormData({ 
                title: "", 
                imageUrl: "", 
                linkUrl: "", 
                type: "MINISITE", 
                storeId: stores.find(s => s.id === formData.storeId)?.id || stores[0]?.id || "" 
            });
            toast.success("Banner criado com sucesso!");
        } else {
            console.error("Erro ao criar banner:", result.error);
            setLoading(false);
            toast.error("Erro ao criar banner");
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        const result = await toggleBannerStatus(id, !currentStatus);
        if (result.success) {
            setBanners(banners.map(b => b.id === id ? { ...b, isActive: !currentStatus } : b));
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir?")) return;
        const result = await deleteBanner(id);
        if (result.success) {
            setBanners(banners.filter(b => b.id !== id));
        }
    };

    return (
        <AdminShell>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-display text-2xl font-bold italic tracking-tight uppercase">Marketing & Identidade</h1>
                        <p className="text-zinc-500 text-sm mt-1">Configure o visual da sua barbearia para seus clientes</p>
                    </div>
                    
                    <div className="flex bg-dark-800 p-1 rounded-xl border border-white/5">
                        <button 
                            onClick={() => setActiveTab("BANNERS")}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'BANNERS' ? 'bg-brand-500 text-white' : 'text-zinc-500 hover:text-white'}`}
                        >
                            Banners
                        </button>
                        <button 
                            onClick={() => setActiveTab("BRANDING")}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'BRANDING' ? 'bg-brand-500 text-white' : 'text-zinc-500 hover:text-white'}`}
                        >
                            Identidade Visual
                        </button>
                    </div>
                </div>

                {activeTab === "BANNERS" ? (
                    <>
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-500">Meus Banners Ativos</h2>
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="bg-brand-gradient text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-90 shadow-brand transition-all"
                            >
                                <Plus className="w-4 h-4" /> Novo Banner
                            </button>
                        </div>


                        {fetching ? (
                            <div className="py-20 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
                            </div>
                        ) : banners.length === 0 ? (
                            <div className="py-24 flex flex-col items-center border border-dashed border-white/10 rounded-[2.5rem] bg-dark-800/10">
                                <div className="w-20 h-20 rounded-2xl bg-dark-700 flex items-center justify-center mb-6 shadow-xl border border-white/5">
                                    <ImageIcon className="w-10 h-10 text-zinc-600" />
                                </div>
                                <h3 className="text-xl font-black text-zinc-300 uppercase italic tracking-tight">Nenhum banner configurado</h3>
                                <p className="text-zinc-500 text-sm mt-1 max-w-xs text-center font-medium">Os banners aparecem em destaque para o seu cliente antes dele agendar um serviço.</p>
                                <button onClick={() => setIsModalOpen(true)} className="mt-8 text-brand-400 font-black uppercase italic tracking-widest text-xs hover:text-brand-300 transition-colors">Configurar primeiro agora →</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {banners.map((banner) => (
                                    <div key={banner.id} className="glass-card rounded-[2rem] overflow-hidden group border border-white/5 bg-dark-800/20">
                                        <div className="aspect-[21/9] relative bg-dark-900 border-b border-white/5 overflow-hidden">
                                            {banner.imageUrl ? (
                                                <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 hover:rotate-1" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-dark-700"><ImageIcon className="w-10 h-10 text-white/5" /></div>
                                            )}
                                            <div className="absolute top-4 left-4">
                                                <span className={`text-[10px] font-black italic uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg ${banner.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                                    {banner.isActive ? 'ATIVO' : 'PAUSADO'}
                                                </span>
                                            </div>
                                            <div className="absolute top-4 right-4 group-hover:scale-105 transition-transform">
                                                <div className="bg-dark-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                                                    <Building2 className="w-3.5 h-3.5 text-brand-400" />
                                                    <span className="text-[10px] text-white font-bold">{stores.find(s => s.id === banner.storeId)?.name || 'Unidade'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <h3 className="font-black text-zinc-100 mb-1 text-lg italic uppercase tracking-tight">{banner.title}</h3>
                                            <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] mb-8">
                                                <div className="w-1.5 h-1.5 rounded-full bg-brand-400" /> {banner.type === 'INTERNAL' ? 'Link Interno' : 'Link no App'}
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={() => handleToggleStatus(banner.id, banner.isActive)}
                                                    className={`flex-1 h-12 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 transition-all ${
                                                        banner.isActive ? 'border-red-500/20 text-red-500 hover:bg-red-500/10' : 'border-green-500/20 text-green-500 hover:bg-green-500/10'
                                                    }`}
                                                >
                                                    {banner.isActive ? 'Pausar' : 'Ativar'}
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(banner.id)}
                                                    className="w-12 h-12 flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all border-2 border-white/5"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 space-y-6">
                            <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 bg-dark-800/20">
                                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-100 mb-6 flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-brand-400" /> Selecionar Unidade
                                </h3>
                                <div className="space-y-4">
                                    {stores.map(store => (
                                        <button
                                            key={store.id}
                                            onClick={() => setSelectedStoreId(store.id)}
                                            className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center justify-between group ${selectedStoreId === store.id ? 'bg-brand-500/10 border-brand-500/50 text-white' : 'bg-dark-900/50 border-white/5 text-zinc-500 hover:border-white/10'}`}
                                        >
                                            <span className="text-xs font-bold uppercase tracking-tight">{store.name}</span>
                                            <div className={`w-2 h-2 rounded-full ${selectedStoreId === store.id ? 'bg-brand-400 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-zinc-700'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 bg-dark-800/20">
                                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-100 mb-2">Dica de Branding</h3>
                                <p className="text-xs text-zinc-500 leading-relaxed">Sua logo e cor principal serão aplicadas na tela de login e no painel do seu cliente.</p>
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <div className="glass-card p-10 rounded-[2.5rem] border border-white/5 bg-dark-800/20 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Logo da Barbearia</label>
                                        <div className="relative group">
                                            <div className="w-32 h-32 rounded-3xl bg-dark-900 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-brand-500/50">
                                                {brandingData.logoUrl ? (
                                                    <img src={brandingData.logoUrl} className="w-full h-full object-contain p-4" />
                                                ) : (
                                                    <ImageIcon className="w-8 h-8 text-zinc-700" />
                                                )}
                                                <input type="file" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            </div>
                                            <div className="mt-4 flex items-center gap-2 text-brand-400 text-[10px] font-black uppercase tracking-widest">
                                                <Upload className="w-3 h-3" /> Alterar Logo
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Cor da Identidade</label>
                                        <div className="flex items-center gap-4">
                                            <div 
                                                className="w-16 h-16 rounded-2xl border-4 border-white/10 shadow-xl"
                                                style={{ backgroundColor: brandingData.primaryColor }}
                                            />
                                            <div className="flex-1">
                                                <input 
                                                    type="text"
                                                    value={brandingData.primaryColor}
                                                    onChange={(e) => setBrandingData({ ...brandingData, primaryColor: e.target.value })}
                                                    className="w-full bg-dark-900 border border-white/5 rounded-xl px-4 py-3 text-sm font-black tabular-nums focus:border-brand-500/50 outline-none transition-all uppercase"
                                                />
                                                <input 
                                                    type="color"
                                                    value={brandingData.primaryColor}
                                                    onChange={(e) => setBrandingData({ ...brandingData, primaryColor: e.target.value })}
                                                    className="mt-2 w-full h-8 bg-transparent cursor-pointer rounded-lg overflow-hidden"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-white/5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Fundo da Tela de Login (Opcional)</label>
                                    <div className="aspect-video w-full rounded-3xl bg-dark-900 border-2 border-dashed border-white/10 relative overflow-hidden group transition-all hover:border-brand-500/50">
                                        {brandingData.loginBackgroundUrl ? (
                                            <img src={brandingData.loginBackgroundUrl} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-700">
                                                <ImageIcon className="w-10 h-10 mb-2" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Subir Papel de Parede</span>
                                            </div>
                                        )}
                                        <input 
                                            type="file" 
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => setBrandingData({ ...brandingData, loginBackgroundUrl: reader.result as string });
                                                    reader.readAsDataURL(file);
                                                }
                                            }} 
                                            className="absolute inset-0 opacity-0 cursor-pointer" 
                                        />
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button 
                                        onClick={handleSaveBranding}
                                        disabled={loading}
                                        className="w-full h-16 bg-brand-gradient text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:opacity-90 shadow-brand transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-5 h-5 text-white/50" />} Salvar Identidade Visual
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Modal isOpen={activeTab === 'BANNERS' && isModalOpen} onClose={() => setIsModalOpen(false)} title="Configurar Novo Banner">
                <form onSubmit={handleSave} className="space-y-6 py-4">
                    <div className="aspect-[21/9] rounded-2xl border-2 border-dashed border-white/10 bg-dark-700/30 relative overflow-hidden group cursor-pointer transition-colors hover:bg-dark-700/50">
                        {formData.imageUrl ? (
                             <img src={formData.imageUrl} className="w-full h-full object-cover shadow-2xl" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600">
                                <ImageIcon className="w-12 h-12 mb-3 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Subir Arte (1200x500px)</span>
                            </div>
                        )}
                        <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Unidade / Filial</label>
                            <select 
                                required
                                value={formData.storeId}
                                onChange={(e) => setFormData({...formData, storeId: e.target.value})}
                                className="w-full bg-dark-700 border border-white/5 rounded-xl px-4 h-14 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-bold"
                            >
                                <option value="" disabled>Selecione a unidade</option>
                                {stores.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Tipo de Link</label>
                            <select 
                                value={formData.type} 
                                onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                                className="w-full bg-dark-700 border border-white/5 rounded-xl px-4 h-14 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-bold"
                            >
                                <option value="MINISITE">Agendamento (App)</option>
                                <option value="INTERNAL">CRM Interno</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Título do Banner</label>
                        <input 
                            type="text" 
                            required 
                            value={formData.title} 
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            placeholder="Ex: PROMOÇÃO DE VERÃO 20% OFF" 
                            className="w-full bg-dark-700 border border-white/5 rounded-xl px-5 h-14 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-bold uppercase" 
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Link de Destino (Opcional)</label>
                        <input 
                            type="text" 
                            value={formData.linkUrl} 
                            onChange={(e) => setFormData({...formData, linkUrl: e.target.value})}
                            placeholder="URL externa ou ID de página" 
                            className="w-full bg-dark-700 border border-white/5 rounded-xl px-5 h-14 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-bold" 
                        />
                    </div>

                    <div className="pt-8 flex gap-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-16 text-zinc-500 font-black uppercase tracking-widest text-xs hover:bg-white/5 rounded-2xl transition-all">Cancelar</button>
                        <button type="submit" disabled={loading} className="flex-[2] h-16 bg-brand-gradient text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:opacity-90 shadow-brand transition-all active:scale-95">
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-5 h-5 text-white/50" />} Salvar Banner
                        </button>
                    </div>
                </form>
            </Modal>
        </AdminShell>
    );
}

