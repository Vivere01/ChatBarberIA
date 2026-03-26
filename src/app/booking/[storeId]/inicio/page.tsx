"use client";

import { 
    Calendar, Trophy, ArrowRight, Plus, 
    Zap, Star, ShieldCheck, MapPin, 
    Phone, Clock as ClockIcon, Loader2,
    Scissors
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getStoreForBooking } from "@/app/actions/booking-actions";
import { useSession } from "next-auth/react";

export default function BookingHomePage({ params }: { params: { storeId: string } }) {
    const storeId = params.storeId;
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(true);
    const [store, setStore] = useState<any>(null);

    useEffect(() => {
        const fetchStore = async () => {
            setIsLoading(true);
            const data = await getStoreForBooking(storeId);
            if (data) setStore(data);
            setIsLoading(false);
        };
        fetchStore();
    }, [storeId]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
        );
    }

    if (!store) return <div className="text-center py-20 text-zinc-500">Barbearia não encontrada.</div>;

    const banners = store.banners || [];

    return (
        <div className="space-y-8 pb-24">
            {/* Banner Section */}
            {banners.length > 0 ? (
                <div className="relative group">
                    <div className="aspect-[21/9] md:aspect-[3/1] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl shadow-zinc-200 bg-zinc-200">
                        <img 
                            src={banners[0].imageUrl} 
                            alt={banners[0].title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-10">
                            <h2 className="text-white text-xl md:text-3xl font-black max-w-lg leading-tight drop-shadow-lg">
                                {banners[0].title}
                            </h2>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-orange-600 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden group">
                    <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/10 skew-x-[-20deg] translate-x-10 group-hover:translate-x-0 transition-transform duration-700" />
                    <div className="relative z-10 max-w-lg">
                        <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter leading-none mb-4">
                            Sua experiência <br /> premium na <br /> {store.name}
                        </h2>
                        <p className="text-orange-100/80 font-medium">Agende seu horário com os melhores profissionais da região.</p>
                    </div>
                    <Scissors className="absolute right-8 bottom-8 w-24 h-24 text-white/10 rotate-12" />
                </div>
            )}

            {/* User Greeting */}
            <div className="px-2">
                <h3 className="text-2xl font-black text-zinc-900 tracking-tight leading-none italic uppercase">
                    Olá, <span className="text-orange-600">{session?.user?.name?.split(' ')[0] || "Cliente"}</span>!
                </h3>
                <p className="text-zinc-500 text-sm font-medium mt-1">Pronto para dar um trato no visual hoje?</p>
            </div>

            {/* Plan Status */}
            <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 border border-zinc-100 shadow-sm transition-all hover:shadow-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0">
                            <Zap className="w-6 h-6 fill-current" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-zinc-900">
                                Seu plano atual
                            </h3>
                            <p className="text-zinc-500 text-sm mt-1 max-w-md">
                                Você ainda não possui uma assinatura ativa. Aproveite cortes ilimitados e benefícios exclusivos!
                            </p>
                        </div>
                    </div>
                    <Link 
                        href={`/booking/${storeId}/plano`}
                        className="flex items-center justify-center h-12 px-6 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl transition-all active:scale-95 text-sm"
                    >
                        Conhecer Planos
                    </Link>
                </div>
            </div>

            {/* Club Banner */}
            <Link 
                href={`/booking/${storeId}/clube`}
                className="block bg-amber-400 hover:bg-amber-400/90 rounded-2xl md:rounded-3xl p-6 md:p-8 transition-all relative overflow-hidden group shadow-xl shadow-amber-400/10 hover:-translate-y-1"
            >
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/10 skew-x-[-20deg] translate-x-10 group-hover:translate-x-0 transition-transform duration-700" />
                <div className="relative flex items-center justify-between">
                    <div>
                        <h3 className="text-zinc-900 text-lg md:text-xl font-black uppercase italic tracking-tighter">
                            Clube do assinante
                        </h3>
                        <p className="text-zinc-800 text-sm font-medium">Troque seus pontos por benefícios exclusivos</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform shadow-lg">
                        <Trophy className="w-6 h-6" />
                    </div>
                </div>
            </Link>

            {/* Next Appointments Section */}
            <div>
                <div className="flex items-center justify-between mb-6 px-2">
                    <h3 className="font-black text-zinc-900 text-lg uppercase italic tracking-tight">Próximos agendamentos</h3>
                    <Link href={`/booking/${storeId}/agendamentos`} className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-orange-600 transition-colors">
                        Ver tudo
                    </Link>
                </div>

                <div className="flex flex-col items-center justify-center py-12 md:py-20 bg-zinc-100/50 rounded-[2.5rem] border border-dashed border-zinc-200">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                        <Calendar className="w-8 h-8 text-zinc-300" />
                    </div>
                    <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-[0.2em] text-center px-6">
                        Você não tem agendamentos marcados
                    </p>
                </div>
            </div>

            {/* Fixed Action Button */}
            <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-10 md:bottom-10 z-50">
                <Link 
                    href={`/booking/${storeId}/agendar`}
                    className="flex items-center justify-center gap-3 w-full md:w-auto md:px-12 h-20 bg-orange-600 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[2rem] shadow-2xl shadow-orange-600/30 transition-all hover:scale-[1.05] active:scale-95 border-4 border-white"
                >
                    <Plus className="w-6 h-6" /> Novo agendamento
                </Link>
            </div>
        </div>
    );
}
