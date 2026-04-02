"use client";

import { Calendar, Trophy, Plus, Zap, Loader2, Scissors } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getStoreForBooking } from "@/app/actions/booking-actions";
import { useSession } from "next-auth/react";

export default function BookingHomePage({ params }: { params: { storeId: string } }) {
    const storeId = params.storeId;
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(true);
    const [store, setStore] = useState<any>(null);
    const [storeColor, setStoreColor] = useState("#ea580c");

    useEffect(() => {
        const fetchStore = async () => {
            const data = await getStoreForBooking(storeId);
            if (data) {
                setStore(data);
                setStoreColor(data.primaryColor || "#ea580c");
            }
            setIsLoading(false);
        };
        fetchStore();
    }, [storeId]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-5 h-5 animate-spin text-zinc-300" />
            </div>
        );
    }

    if (!store) return <div className="text-center py-20 text-zinc-400 text-sm">Barbearia não encontrada.</div>;

    const banners = store.banners || [];
    const firstName = session?.user?.name?.split(' ')[0] || "Cliente";

    return (
        <div className="space-y-5">
            {/* Banner */}
            {banners.length > 0 ? (
                <div className="rounded-2xl overflow-hidden h-36">
                    <img
                        src={banners[0].imageUrl}
                        alt={banners[0].title}
                        className="w-full h-full object-cover"
                    />
                </div>
            ) : (
                <div
                    className="rounded-2xl p-5 text-white relative overflow-hidden"
                    style={{ backgroundColor: storeColor }}
                >
                    <Scissors className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 text-white/10" />
                    <p className="text-xs font-medium text-white/70 mb-1">{store.name}</p>
                    <h2 className="text-lg font-semibold leading-snug">
                        Agende seu horário com os melhores profissionais
                    </h2>
                </div>
            )}

            {/* Saudação */}
            <div>
                <h3 className="text-base font-semibold text-zinc-900">
                    Olá, <span style={{ color: storeColor }}>{firstName}</span>
                </h3>
                <p className="text-sm text-zinc-400 mt-0.5">Pronto para dar um trato no visual hoje?</p>
            </div>

            {/* Botão de Agendar */}
            <Link
                href={`/booking/${storeId}/agendar`}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-white text-sm font-semibold transition-all active:scale-95"
                style={{ backgroundColor: storeColor }}
            >
                <Plus className="w-4 h-4" />
                Novo agendamento
            </Link>

            {/* Plano */}
            <div className="bg-white rounded-xl p-4 border border-zinc-100">
                <div className="flex items-center gap-3">
                    <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${storeColor}15`, color: storeColor }}
                    >
                        <Zap className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900">Seu plano atual</p>
                        <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                            Você ainda não possui uma assinatura ativa.
                        </p>
                    </div>
                    <Link
                        href={`/booking/${storeId}/clube`}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-all whitespace-nowrap flex-shrink-0"
                    >
                        Ver planos
                    </Link>
                </div>
            </div>

            {/* Clube do Assinante */}
            <Link
                href={`/booking/${storeId}/clube`}
                className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4 transition-all active:scale-[0.98]"
            >
                <div className="w-9 h-9 rounded-lg bg-amber-400 flex items-center justify-center flex-shrink-0 text-white">
                    <Trophy className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900">Clube do assinante</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Veja os benefícios exclusivos dos planos</p>
                </div>
                <span className="text-zinc-300 text-sm">›</span>
            </Link>

            {/* Próximos Agendamentos */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-zinc-900">Próximos agendamentos</h3>
                    <Link
                        href={`/booking/${storeId}/agendamentos`}
                        className="text-xs font-medium"
                        style={{ color: storeColor }}
                    >
                        Ver tudo
                    </Link>
                </div>

                <div className="flex flex-col items-center justify-center py-10 bg-white rounded-xl border border-zinc-100">
                    <Calendar className="w-8 h-8 text-zinc-200 mb-2" />
                    <p className="text-xs text-zinc-400">Nenhum agendamento marcado</p>
                </div>
            </div>
        </div>
    );
}
