import { Scissors, Star, Calendar, Clock, Crown, Gift, LogOut } from "lucide-react";
import { ChatbarberLogo } from "@/components/logo";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

const pastAppointments = [
    { service: "Corte Clássico", date: "10 de Fev, 15:00", staff: "Carlos B.", rating: 5, value: 45 },
    { service: "Barba Completa", date: "15 de Jan, 10:30", staff: "Rodrigo S.", rating: null, value: 35 },
];

export default function ClientDashboard({ params }: { params: { slug: string } }) {
    return (
        <div className="min-h-screen bg-dark-900 pb-20">
            {/* Header */}
            <header className="bg-dark-800 border-b border-white/5 sticky top-0 z-50">
                <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href={`/${params.slug}`} className="flex items-center gap-2">
                        <ChatbarberLogo className="w-8 h-8" fill="white" />
                        <span className="font-display font-bold text-lg">Área do Cliente</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-brand-500/20 text-brand-400 rounded-full flex items-center justify-center text-sm font-bold">JD</span>
                        <Link href={`/${params.slug}/login`} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:text-red-400 transition-colors">
                            <LogOut className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-8 space-y-8 animate-fade-in">

                {/* Welcome Section */}
                <section>
                    <h1 className="text-2xl font-display font-bold mb-1">Olá, John Doe</h1>
                    <p className="text-sm text-zinc-500">Bem-vindo(a) de volta à Barbearia Royal!</p>

                    {/* Subscription Banner */}
                    <div className="mt-6 glass-card rounded-2xl p-5 border border-yellow-500/20 bg-gradient-to-r from-yellow-500/5 to-transparent relative overflow-hidden">
                        <div className="absolute right-0 bottom-0 opacity-10">
                            <Crown className="w-32 h-32 rotate-12" />
                        </div>
                        <div className="flex items-start justify-between relative">
                            <div>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full mb-2">
                                    <Crown className="w-3 h-3" /> Assinante Pro
                                </span>
                                <p className="font-semibold text-lg text-white mb-2">Cortes ilimitados + Barba</p>
                                <div className="flex items-center gap-4 text-sm font-medium text-zinc-400">
                                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Renova em 05/04</span>
                                </div>
                            </div>
                            <p className="text-xl font-bold text-yellow-500">R$ 97<span className="text-xs text-yellow-500/70 font-normal">/mês</span></p>
                        </div>
                    </div>
                </section>

                {/* Next Appointment */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-zinc-300">Próximo Agendamento</h2>
                    </div>

                    <div className="glass-card rounded-2xl p-6 border border-brand-500/20 bg-brand-500/5 relative">
                        <div className="absolute top-0 right-0 w-1 rounded-bl-xl h-full bg-brand-gradient" />

                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 rounded-xl bg-brand-gradient text-white flex flex-col items-center justify-center font-bold">
                                <span className="text-sm leading-none mb-0.5">MAR</span>
                                <span className="text-xl leading-none">24</span>
                            </div>
                            <div>
                                <p className="text-xl font-bold text-white mb-1">15:00</p>
                                <p className="text-sm font-medium text-zinc-300">Corte + Barba com Carlos B.</p>
                            </div>
                        </div>

                        <div className="flex gap-2 w-full pt-4 border-t border-white/5">
                            <button className="flex-1 text-center text-sm font-medium text-zinc-400 py-2 hover:bg-white/5 rounded-lg transition-colors">
                                Reagendar
                            </button>
                            <button className="flex-1 text-center text-sm font-medium text-red-400 py-2 hover:bg-red-500/10 rounded-lg transition-colors">
                                Cancelar
                            </button>
                        </div>
                    </div>

                    <Link href={`/${params.slug}/booking`} className="block text-center mt-3 text-sm font-semibold text-brand-400 hover:text-brand-300 pb-2">
                        + Fazer novo agendamento
                    </Link>
                </section>

                {/* IndicaAí Section */}
                <section>
                    <div className="glass-card rounded-2xl p-6 border border-purple-500/20">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                                <Gift className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-lg text-white">Programa IndicaAí</h2>
                                <p className="text-xs text-zinc-400">Convide amigos e ganhe prêmios</p>
                            </div>
                        </div>

                        <p className="text-sm text-zinc-300 mt-4 mb-3">Seu link de indicação:</p>
                        <div className="flex items-center gap-2 mb-4">
                            <code className="flex-1 bg-dark-600 px-3 py-3 rounded-xl font-mono text-sm text-brand-400 border border-white/10 truncate">
                                chatbarber.com.br/{params.slug}?ref=JOH123
                            </code>
                            <button className="bg-brand-gradient text-white font-bold text-sm px-4 py-3 rounded-xl hover:opacity-90">
                                Copiar
                            </button>
                        </div>
                        <div className="flex justify-between items-center text-sm font-medium text-zinc-400">
                            <span>Amigos indicados: <strong className="text-white">3</strong></span>
                            <span>Bônus acumulado: <strong className="text-green-400">R$ 60,00</strong></span>
                        </div>
                    </div>
                </section>

                {/* History & NPS */}
                <section>
                    <h2 className="font-semibold text-zinc-300 mb-4">Histórico e Avaliações</h2>
                    <div className="space-y-3">
                        {pastAppointments.map((apt, i) => (
                            <div key={i} className="glass-card rounded-xl p-4 flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-sm text-white mb-1">{apt.service}</p>
                                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> {apt.date} · {apt.staff}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="font-bold text-sm text-white mb-2">{formatCurrency(apt.value)}</span>
                                    {apt.rating ? (
                                        <div className="flex items-center gap-0.5 text-yellow-400">
                                            {[1, 2, 3, 4, 5].map(n => <Star key={n} className="w-3 h-3 fill-current" />)}
                                        </div>
                                    ) : (
                                        <button className="text-xs font-semibold text-brand-400 border border-brand-400/30 bg-brand-500/10 px-2 py-1 rounded hover:bg-brand-500/20 transition-colors">
                                            Avaliar (NPS)
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
