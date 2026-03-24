"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock, Sparkles } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

const services = [
    { id: "1", name: "Corte Clássico", price: 45, duration: 30, icon: "✂️" },
    { id: "2", name: "Barba", price: 35, duration: 30, icon: "🧔" },
    { id: "3", name: "Corte + Barba", price: 80, duration: 60, icon: "🪒" },
    { id: "4", name: "Platinado", price: 180, duration: 120, icon: "⚡" },
];

const staff = [
    { id: "1", name: "Qualquer profissional", avatar: "QA" },
    { id: "2", name: "Carlos Barbosa", avatar: "CB" },
    { id: "3", name: "Rodrigo Santos", avatar: "RS" },
];

const dates = [
    { day: "Ter", num: "24", month: "Mar" },
    { day: "Qua", num: "25", month: "Mar" },
    { day: "Qui", num: "26", month: "Mar" },
    { day: "Sex", num: "27", month: "Mar" },
    { day: "Sáb", num: "28", month: "Mar" },
];

const times = ["09:00", "09:30", "10:00", "11:30", "14:00", "14:30", "15:00", "16:00", "16:30"];

export default function BookingPage({ params }: { params: { slug: string } }) {
    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState("");
    const [selectedStaff, setSelectedStaff] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    return (
        <div className="min-h-screen bg-dark-900 flex flex-col items-center py-10 px-4">
            <div className="w-full max-w-lg">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href={`/${params.slug}`} className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center hover:bg-dark-700 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="font-display font-bold text-xl">Agendamento</h1>
                        <p className="text-zinc-500 text-sm">Passo {step} de 4</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-dark-700 rounded-full mb-10 overflow-hidden">
                    <div className="h-full bg-brand-gradient rounded-full transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }} />
                </div>

                {/* Step 1: Services */}
                {step === 1 && (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold mb-6">O que vamos fazer hoje?</h2>
                        <div className="space-y-3">
                            {services.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => setSelectedService(s.id)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all ${selectedService === s.id
                                        ? "bg-brand-500/10 border-brand-500"
                                        : "bg-dark-800 border-white/5 hover:border-white/20"
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold flex items-center gap-2">
                                            <span>{s.icon}</span> {s.name}
                                        </span>
                                        <span className="font-bold text-brand-400">{formatCurrency(s.price)}</span>
                                    </div>
                                    <div className="text-xs text-zinc-500 flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" /> Duração: {s.duration} min
                                    </div>
                                </button>
                            ))}
                        </div>
                        <button
                            disabled={!selectedService}
                            onClick={handleNext}
                            className="w-full mt-8 bg-brand-gradient text-white py-4 rounded-xl font-bold disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                        >
                            Escolher Profissional <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Step 2: Staff */}
                {step === 2 && (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold mb-6">Com quem?</h2>
                        <div className="space-y-3">
                            {staff.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => setSelectedStaff(s.id)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${selectedStaff === s.id
                                        ? "bg-brand-500/10 border-brand-500"
                                        : "bg-dark-800 border-white/5 hover:border-white/20"
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${s.id === "1" ? "bg-dark-600 border border-white/10" : "bg-brand-gradient text-white"
                                        }`}>
                                        {s.avatar}
                                    </div>
                                    <span className="font-semibold text-lg">{s.name}</span>
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button onClick={handleBack} className="flex-1 py-4 rounded-xl border border-white/10 font-bold hover:bg-white/5 transition-colors">Voltar</button>
                            <button disabled={!selectedStaff} onClick={handleNext} className="flex-[2] bg-brand-gradient text-white py-4 rounded-xl font-bold disabled:opacity-50 transition-opacity">
                                Escolher Horário
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Date & Time */}
                {step === 3 && (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold mb-6">Quando?</h2>

                        <div className="mb-8">
                            <label className="text-sm font-semibold text-zinc-400 mb-3 block flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Dias Disponíveis
                            </label>
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                {dates.map((d, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedDate(d.num)}
                                        className={`flex-shrink-0 w-20 py-3 rounded-xl border text-center transition-all ${selectedDate === d.num
                                            ? "bg-brand-500/10 border-brand-500 text-brand-400"
                                            : "bg-dark-800 border-white/5 text-zinc-400 hover:border-white/20"
                                            }`}
                                    >
                                        <span className="block text-xs uppercase mb-1">{d.day}</span>
                                        <span className="block text-2xl font-bold text-white mb-1">{d.num}</span>
                                        <span className="block text-xs">{d.month}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {selectedDate && (
                            <div className="animate-fade-in">
                                <label className="text-sm font-semibold text-zinc-400 mb-3 block flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Horários
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {times.map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setSelectedTime(t)}
                                            className={`py-3 rounded-xl border text-center font-semibold transition-all ${selectedTime === t
                                                ? "bg-brand-gradient border-transparent text-white shadow-brand-sm"
                                                : "bg-dark-800 border-white/5 text-zinc-300 hover:border-white/20 hover:text-white"
                                                }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 mt-8">
                            <button onClick={handleBack} className="flex-1 py-4 rounded-xl border border-white/10 font-bold hover:bg-white/5 transition-colors">Voltar</button>
                            <button disabled={!selectedTime} onClick={handleNext} className="flex-[2] bg-brand-gradient text-white py-4 rounded-xl font-bold disabled:opacity-50 transition-opacity">
                                Revisar
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Confirm */}
                {step === 4 && (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold mb-6">Confirme os detalhes</h2>

                        <div className="glass-card rounded-2xl p-6 mb-8 border border-brand-500/20">
                            <div className="border-b border-white/10 pb-4 mb-4">
                                <p className="text-xs text-brand-400 font-bold uppercase tracking-wider mb-1">Serviço</p>
                                <div className="flex justify-between items-center text-lg font-semibold">
                                    <span>Corte + Barba</span>
                                    <span>R$ 80,00</span>
                                </div>
                            </div>

                            <div className="flex justify-between text-sm mb-3">
                                <span className="text-zinc-500">Profissional</span>
                                <span className="font-semibold text-white">Carlos Barbosa</span>
                            </div>

                            <div className="flex justify-between text-sm mb-3">
                                <span className="text-zinc-500">Data e Hora</span>
                                <span className="font-semibold text-white">24 de Mar, 15:00</span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Duração aprox.</span>
                                <span className="font-semibold text-white">60 min</span>
                            </div>
                        </div>

                        <div className="glass-card rounded-xl p-4 mb-8 flex gap-3 text-sm text-zinc-400">
                            <Sparkles className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                            <p>Ao confirmar, criaremos uma conta para você logar e acompanhar seu histórico se for sua primeira vez!</p>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={handleBack} className="flex-1 py-4 rounded-xl border border-white/10 font-bold hover:bg-white/5 transition-colors">Voltar</button>
                            <Link href={`/${params.slug}/dashboard`} className="flex-[2] bg-brand-gradient text-white py-4 rounded-xl font-bold transition-transform hover:scale-[1.02] flex items-center justify-center shadow-brand">
                                Confirmar Agendamento
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
