"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { User, Lock, Save, Camera, Scissors, Loader2 } from "lucide-react";
import { getClientProfile, updateClientProfile, updateClientPassword } from "@/app/actions/client-actions";
import { getStoreForBooking } from "@/app/actions/booking-actions";

export default function ClientProfilePage() {
    const { storeId } = useParams() as { storeId: string };
    const { data: session } = useSession();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [pwdSaving, setPwdSaving] = useState(false);
    
    const [storeColor, setStoreColor] = useState("#ea580c");

    const [profile, setProfile] = useState({
        name: "",
        email: "",
        phone: "",
        avatarUrl: ""
    });

    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    useEffect(() => {
        const load = async () => {
            const [store, data] = await Promise.all([
                getStoreForBooking(storeId),
                getClientProfile()
            ]);
            
            if (store) {
                setStoreColor(store.primaryColor || "#ea580c");
            }

            if (data) {
                setProfile({
                    name: data.name || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    avatarUrl: data.avatarUrl || ""
                });
            }
            setLoading(false);
        };
        load();
    }, [storeId]);

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const res = await updateClientProfile(profile);
        if (res.error) {
            alert(res.error);
        } else {
            alert("Perfil atualizado com sucesso!");
        }
        setSaving(false);
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            return alert("As senhas não coincidem!");
        }
        if (passwords.newPassword.length < 6) {
            return alert("A nova senha deve ter no mínimo 6 caracteres.");
        }

        setPwdSaving(true);
        const res = await updateClientPassword({
            currentPassword: passwords.currentPassword,
            newPassword: passwords.newPassword
        });
        
        if (res.error) {
            alert(res.error);
        } else {
            alert("Senha atualizada com sucesso!");
            setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
        }
        setPwdSaving(false);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: storeColor }} />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-6 md:py-10 space-y-8 pb-32 relative">
            <header className="flex items-center justify-between px-2">
                <div>
                    <h1 className="text-2xl font-black italic uppercase tracking-tight text-zinc-900 flex items-center gap-2">
                        Meu <span style={{ color: storeColor }}>Perfil</span>
                    </h1>
                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">Gerencie seus dados e senha</p>
                </div>
            </header>

            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-zinc-100">
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-20 h-20 rounded-2xl bg-zinc-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-zinc-200 relative group">
                            {profile.avatarUrl ? (
                                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-8 h-8 text-zinc-300" />
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-zinc-900 uppercase">Foto de Perfil</p>
                            <p className="text-[10px] text-zinc-400 font-medium mt-1">Clique na foto para alterar (em breve)</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Nome Completo</label>
                            <input
                                required
                                value={profile.name}
                                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:ring-2 focus:outline-none transition-all"
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Email</label>
                                <input
                                    required
                                    type="email"
                                    value={profile.email}
                                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:ring-2 focus:outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Telefone</label>
                                <input
                                    type="tel"
                                    value={profile.phone}
                                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                                    className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:ring-2 focus:outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="text-white px-8 py-3.5 rounded-xl font-black italic uppercase tracking-widest text-[11px] transition-all shadow-lg hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                            style={{ backgroundColor: storeColor, boxShadow: `0 10px 15px -3px ${storeColor}33` }}
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? "Salvando..." : "Salvar Dados"}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-zinc-100">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-zinc-100">
                    <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                        <Lock className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black italic uppercase tracking-tight text-zinc-900">Alterar Senha</h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Proteja sua conta</p>
                    </div>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Senha Atual</label>
                        <input
                            type="password"
                            required
                            value={passwords.currentPassword}
                            onChange={(e) => setPasswords(prev => ({ ...prev, currentPassword: e.target.value }))}
                            className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:ring-2 focus:outline-none transition-all"
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Nova Senha</label>
                            <input
                                type="password"
                                required
                                value={passwords.newPassword}
                                onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
                                className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:ring-2 focus:outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Confirmar Nova Senha</label>
                            <input
                                type="password"
                                required
                                value={passwords.confirmPassword}
                                onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:ring-2 focus:outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={pwdSaving}
                            className="bg-zinc-900 text-white px-8 py-3.5 rounded-xl font-black italic uppercase tracking-widest text-[11px] transition-all shadow-lg hover:bg-zinc-800 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                        >
                            {pwdSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                            {pwdSaving ? "Atualizando..." : "Atualizar Senha"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
