"use client";

import { 
    MapPin, Users, Scissors, Calendar, 
    ArrowRight, Check, ChevronRight, X, User,
    Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { getStoreForBooking } from "@/app/actions/booking-actions";
import { getStoreBranches } from "@/app/actions/store-actions";
import { createAppointment } from "@/app/actions/appointment-actions";

export default function BookingFlowPage({ params }: { params: { storeId: string } }) {
    const router = useRouter();
    const storeId = params.storeId;
    const [isLoading, setIsLoading] = useState(true);
    const [store, setStore] = useState<any>(null);
    const [branches, setBranches] = useState<any[]>([]);
    
    const [selection, setSelection] = useState({
        branch: null as any | null,
        staff: null as any | null,
        services: [] as any[],
        date: null as string | null,
        time: null as string | null,
    });

    const [modalOpen, setModalOpen] = useState({
        branch: false,
        staff: false,
        services: false,
        date: false
    });

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const storeData = await getStoreForBooking(storeId) as any;
            if (storeData) {
                setStore(storeData);
                setSelection(prev => ({ ...prev, branch: storeData }));
                
                // Fetch other branches
                const branchList = await getStoreBranches(storeData.ownerId);
                setBranches(branchList);
            }
            setIsLoading(false);
        };
        fetchData();
    }, [storeId]);

    const steps = [
        { 
            id: 1, 
            label: selection.branch?.name || "Selecione a filial", 
            icon: MapPin, 
            onClick: () => setModalOpen({ ...modalOpen, branch: true }),
            enabled: true
        },
        { 
            id: 2, 
            label: selection.staff?.name || "Selecione um profissional", 
            icon: Users, 
            onClick: () => setModalOpen({ ...modalOpen, staff: true }),
            enabled: true
        },
        { 
            id: 3, 
            label: selection.services.length > 0 
                ? `${selection.services.length} serviço(s) selecionado(s)` 
                : "Selecione os serviços", 
            icon: Scissors,
            onClick: () => {
                if (!selection.staff) return;
                setModalOpen({ ...modalOpen, services: true });
            },
            enabled: !!selection.staff
        },
        { 
            id: 4, 
            label: selection.date ? `${selection.date} às ${selection.time}` : "Selecione um horário", 
            icon: Calendar,
            onClick: () => {
                if (!selection.staff || selection.services.length === 0) return;
                setModalOpen({ ...modalOpen, date: true });
            },
            enabled: !!selection.staff && selection.services.length > 0
        },
    ];

    const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30"];
    
    const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return {
            full: d.toLocaleDateString('pt-BR'),
            day: d.getDate(),
            weekday: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
        };
    });

    const [bookingLoading, setBookingLoading] = useState(false);

    const handleBooking = async () => {
        if (!selection.staff || selection.services.length === 0 || !selection.date || !selection.time) return;
        
        setBookingLoading(true);
        try {
            // Parse date "DD/MM/YYYY" and time "HH:MM" to Date object
            const [day, month, year] = selection.date.split('/').map(Number);
            const [hour, minute] = selection.time.split(':').map(Number);
            const scheduledAt = new Date(year, month - 1, day, hour, minute);

            const result = await createAppointment({
                storeId,
                staffId: selection.staff.id,
                scheduledAt,
                serviceIds: selection.services.map(s => s.id),
            });

            if (result.success) {
                router.push(`/booking/${storeId}/agendamentos`);
            } else {
                alert("Erro ao realizar agendamento: " + result.error);
            }
        } catch (err) {
            console.error(err);
            alert("Ocorreu um erro inesperado.");
        } finally {
            setBookingLoading(false);
        }
    };

    if (isLoading || !store) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto py-4 md:py-10 space-y-6 pb-32 md:pb-10">
            <h1 className="text-center text-sm font-black uppercase tracking-widest text-zinc-400 mb-8">
                Selecione os detalhes do seu agendamento
            </h1>

            <div className="space-y-4">
                {/* ... existing steps map ... */}
                {steps.map((s) => {
                    const isSelected = (s.id === 1 && selection.branch) || 
                                     (s.id === 2 && selection.staff) || 
                                     (s.id === 3 && selection.services.length > 0) ||
                                     (s.id === 4 && selection.date && selection.time);

                    return (
                        <button
                            key={s.id}
                            onClick={s.onClick}
                            className={cn(
                                "w-full flex items-center justify-between p-6 rounded-2xl border transition-all text-left group",
                                isSelected ? "bg-white border-zinc-200 shadow-sm" : "bg-zinc-50 border-zinc-100",
                                !s.enabled && "opacity-50 cursor-not-allowed grayscale"
                            )}
                            disabled={!s.enabled}
                        >
                            <div className="flex items-center gap-5">
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                                    isSelected
                                        ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20 rotate-3" 
                                        : "bg-white text-zinc-400 border border-zinc-100"
                                )}>
                                    <s.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">passo 0{s.id}</p>
                                    <span className={cn(
                                        "text-base font-bold tracking-tight",
                                        isSelected ? "text-zinc-900" : "text-zinc-500"
                                    )}>
                                        {s.label}
                                    </span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-orange-50 group-hover:translate-x-1 transition-all" />
                        </button>
                    );
                })}
            </div>

            <div className="fixed bottom-6 left-4 right-4 md:static md:mt-12">
                <button
                    onClick={handleBooking}
                    disabled={!selection.staff || selection.services.length === 0 || !selection.date || !selection.time || bookingLoading}
                    className="w-full h-16 bg-orange-600 disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-orange-600/20 active:scale-95 transition-all text-xs flex items-center justify-center gap-3"
                >
                    {bookingLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Finalizando...
                        </>
                    ) : (
                        "Finalizar Agendamento"
                    )}
                </button>
            </div>

            {/* Date/Time Modal */}
            <Modal isOpen={modalOpen.date} onClose={() => setModalOpen({ ...modalOpen, date: false })} title="Selecione o horário">
                <div className="py-6 space-y-8">
                    {/* Date Selector */}
                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                        {dates.map((d, i) => (
                            <button
                                key={i}
                                onClick={() => setSelection({ ...selection, date: d.full })}
                                className={cn(
                                    "flex flex-col items-center justify-center min-w-[70px] h-24 rounded-2xl border transition-all",
                                    selection.date === d.full ? "bg-orange-600 border-orange-600 text-white shadow-lg" : "bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200"
                                )}
                            >
                                <span className="text-[10px] font-black uppercase opacity-60 mb-1">{d.weekday}</span>
                                <span className="text-xl font-black">{d.day}</span>
                            </button>
                        ))}
                    </div>

                    {/* Time Selector */}
                    {selection.date && (
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Horários disponíveis</p>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {timeSlots.map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => {
                                            setSelection({ ...selection, time: t });
                                            setModalOpen({ ...modalOpen, date: false });
                                        }}
                                        className={cn(
                                            "h-12 flex items-center justify-center rounded-xl border text-sm font-bold transition-all",
                                            selection.time === t ? "bg-orange-600 border-orange-600 text-white" : "bg-white border-zinc-100 text-zinc-900 hover:border-zinc-200"
                                        )}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Branch Selection Modal */}
            <Modal isOpen={modalOpen.branch} onClose={() => setModalOpen({ ...modalOpen, branch: false })} title="Selecione a Filial">
                <div className="space-y-3 py-6 max-h-[60vh] overflow-y-auto">
                    {branches.map((branch: any) => (
                        <button
                            key={branch.id}
                            onClick={() => {
                                if (branch.id !== storeId) {
                                    window.location.href = `/booking/${branch.id}/agendar`;
                                } else {
                                    setSelection({ ...selection, branch });
                                    setModalOpen({ ...modalOpen, branch: false });
                                }
                            }}
                            className={cn(
                                "w-full flex items-center justify-between p-4 rounded-2xl border transition-all",
                                selection.branch?.id === branch.id ? "bg-orange-50 border-orange-200" : "bg-white border-zinc-100 hover:border-zinc-200"
                            )}
                        >
                            <div className="flex items-center gap-4 text-left font-bold text-zinc-900">
                                <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md">
                                    {branch.logoUrl ? (
                                        <img src={branch.logoUrl} alt={branch.name} className="w-full h-full object-cover rounded-xl" />
                                    ) : (
                                        <Scissors className="w-6 h-6" />
                                    )}
                                </div>
                                <div>
                                    <p>{branch.name}</p>
                                    <p className="text-xs text-zinc-400 font-medium">{branch.address || "Endereço não informado"}</p>
                                </div>
                            </div>
                            {selection.branch?.id === branch.id && (
                                <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white">
                                    <Check className="w-4 h-4" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </Modal>

            {/* Staff Selection Modal */}
            <Modal isOpen={modalOpen.staff} onClose={() => setModalOpen({ ...modalOpen, staff: false })} title="Selecione o profissional">
                <div className="grid grid-cols-2 gap-4 py-6">
                    {store.staff?.map((staff: any) => (
                        <button
                            key={staff.id}
                            onClick={() => {
                                setSelection({ ...selection, staff });
                                setModalOpen({ ...modalOpen, staff: false });
                            }}
                            className={cn(
                                "flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all group",
                                selection.staff?.id === staff.id ? "bg-orange-50 border-orange-200" : "bg-white border-zinc-100 hover:border-zinc-200"
                            )}
                        >
                            <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md group-hover:scale-105 transition-transform relative">
                                {staff.avatarUrl ? (
                                    <img src={staff.avatarUrl} alt={staff.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-zinc-100 flex items-center justify-center"><User className="w-10 h-10 text-zinc-300" /></div>
                                )}
                                {selection.staff?.id === staff.id && (
                                    <div className="absolute inset-0 bg-orange-600/20 flex items-center justify-center backdrop-blur-[1px]">
                                        <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white shadow-lg">
                                            <Check className="w-4 h-4" />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <span className="text-sm font-bold text-center leading-tight text-zinc-900 capitalize">
                                {staff.name.split(' ')[0]}
                            </span>
                        </button>
                    ))}
                    
                    <button
                        onClick={() => {
                            setSelection({ ...selection, staff: { name: "Qualquer um", id: "any" } });
                            setModalOpen({ ...modalOpen, staff: false });
                        }}
                        className={cn(
                            "flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all",
                            selection.staff?.id === "any" ? "bg-orange-50 border-orange-200" : "bg-white border-zinc-100"
                        )}
                    >
                        <div className="w-20 h-20 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 relative">
                            <Users className="w-10 h-10" />
                             {selection.staff?.id === "any" && (
                                <div className="absolute inset-0 bg-orange-600/20 flex items-center justify-center">
                                    <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white shadow-lg">
                                        <Check className="w-4 h-4" />
                                    </div>
                                </div>
                            )}
                        </div>
                        <span className="text-sm font-bold text-center text-zinc-900">
                            Qualquer um
                        </span>
                    </button>
                </div>
            </Modal>

            {/* Services Selection Modal */}
            <Modal isOpen={modalOpen.services} onClose={() => setModalOpen({ ...modalOpen, services: false })} title="Selecione os serviços">
                <div className="space-y-3 py-6 max-h-[60vh] overflow-y-auto px-1">
                    {store.services?.map((service: any) => {
                        const isSelected = selection.services.some(s => s.id === service.id);
                        return (
                            <button
                                key={service.id}
                                onClick={() => {
                                    if (isSelected) {
                                        setSelection({ ...selection, services: selection.services.filter(s => s.id !== service.id) });
                                    } else {
                                        setSelection({ ...selection, services: [...selection.services, service] });
                                    }
                                }}
                                className={cn(
                                    "w-full flex items-center justify-between p-4 rounded-2xl border transition-all",
                                    isSelected ? "bg-orange-50 border-orange-200 shadow-sm" : "bg-white border-zinc-100 hover:border-zinc-200"
                                )}
                            >
                                <div className="flex items-center gap-4 text-left">
                                    <div className="w-14 h-14 rounded-xl bg-zinc-100 overflow-hidden flex-shrink-0">
                                        {service.imageUrl ? (
                                            <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                                <Scissors className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-zinc-900">{service.name}</p>
                                        <p className="text-xs text-zinc-500 font-medium">{service.durationMinutes} min • R$ {service.price.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className={cn(
                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                    isSelected ? "bg-orange-600 border-orange-600 text-white" : "border-zinc-200"
                                )}>
                                    {isSelected && <Check className="w-4 h-4" />}
                                </div>
                            </button>
                        );
                    })}
                    
                    {store.services?.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Nenhum serviço disponível</p>
                        </div>
                    )}
                </div>
                <div className="pt-4 border-t border-zinc-100">
                    <button 
                        onClick={() => setModalOpen({ ...modalOpen, services: false })}
                        className="w-full h-14 bg-zinc-900 text-white font-black uppercase tracking-widest rounded-2xl text-xs"
                    >
                        Confirmar ({selection.services.length})
                    </button>
                </div>
            </Modal>
        </div>
    );
}
