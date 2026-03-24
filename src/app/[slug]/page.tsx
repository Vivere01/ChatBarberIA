import { Scissors, Star, Clock, Phone, MapPin, ChevronRight } from "lucide-react";
import { ChatbarberLogo } from "@/components/logo";
import Link from "next/link";

// In production, fetch store data by slug from the DB
async function getStoreBySlug(slug: string) {
    return {
        slug,
        name: "Barbearia Royal",
        description: "A barbearia premium do seu bairro. Cortes modernos, barba e experiência de alto nível.",
        logoUrl: null,
        primaryColor: "#f97316",
        phone: "(11) 99999-0000",
        address: "Av. Paulista, 1000 — São Paulo, SP",
        rating: 4.9,
        reviewCount: 320,
        services: [
            { name: "Corte Clássico", price: 45, duration: 30, icon: "✂️" },
            { name: "Corte + Barba", price: 80, duration: 60, icon: "🪒" },
            { name: "Barba Completa", price: 35, duration: 30, icon: "🧔" },
            { name: "Corte + Sobrancelha", price: 60, duration: 45, icon: "✨" },
            { name: "Hidratação Capilar", price: 55, duration: 40, icon: "💧" },
            { name: "Platinado", price: 180, duration: 120, icon: "⚡" },
        ],
        staff: [
            { name: "Carlos Barbosa", specialty: "Cortes Clássicos & Modernos", level: "OURO", avatar: "CB" },
            { name: "Rodrigo Santos", specialty: "Barba & Degradê", level: "PRATA", avatar: "RS" },
            { name: "Marcos Oliveira", specialty: "Coloração & Platinado", level: "PLATINA", avatar: "MO" },
        ],
        banners: [
            { title: "🎉 Pacote de Verão — 20% off no platinado esse mês!", bg: "from-purple-600 to-blue-600" },
            { title: "💈 Assinatura Pro — Corte todo mês por R$ 97", bg: "from-brand-600 to-brand-800" },
        ],
    };
}

const levelConfig: Record<string, { emoji: string; class: string }> = {
    OURO: { emoji: "🥇", class: "badge-ouro" },
    PRATA: { emoji: "🥈", class: "badge-prata" },
    PLATINA: { emoji: "⚪", class: "badge-platina" },
    BRONZE: { emoji: "🥉", class: "badge-bronze" },
};

const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export default async function MiniSitePage({ params }: { params: { slug: string } }) {
    const store = await getStoreBySlug(params.slug);

    return (
        <div className="min-h-screen bg-dark-900">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-dark-900/90 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ChatbarberLogo className="w-8 h-8" fill="white" />
                        <span className="font-display font-bold">{store.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href={`/${store.slug}/login`} className="text-sm text-zinc-400 hover:text-white transition-colors">
                            Entrar
                        </Link>
                        <Link href={`/${store.slug}/booking`} className="text-sm bg-brand-gradient text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-brand-sm">
                            Agendar
                        </Link>
                    </div>
                </div>
            </header>

            {/* Banners */}
            <div className="max-w-5xl mx-auto px-4 py-4 space-y-3">
                {store.banners.map((b, i) => (
                    <div key={i} className={`rounded-xl bg-gradient-to-r ${b.bg} p-4 text-white font-semibold text-sm`}>
                        {b.title}
                    </div>
                ))}
            </div>

            {/* Hero */}
            <section className="max-w-5xl mx-auto px-4 py-12 text-center">
                <ChatbarberLogo className="w-20 h-20 mx-auto mb-6 drop-shadow-xl" fill="white" />
                <h1 className="font-display text-4xl font-bold mb-3">{store.name}</h1>
                <p className="text-zinc-400 text-lg max-w-xl mx-auto mb-4">{store.description}</p>
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-zinc-400 mb-8">
                    <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        {store.rating} ({store.reviewCount} avaliações)
                    </span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{store.address}</span>
                    <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{store.phone}</span>
                </div>
                <Link href={`/${store.slug}/booking`} className="inline-flex items-center gap-2 bg-brand-gradient text-white px-8 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-all hover:scale-105 shadow-brand">
                    Agendar Agora
                    <ChevronRight className="w-5 h-5" />
                </Link>
            </section>

            {/* Services */}
            <section className="max-w-5xl mx-auto px-4 py-12">
                <h2 className="font-display text-2xl font-bold mb-6">Nossos Serviços</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {store.services.map((s, i) => (
                        <Link href={`/${store.slug}/booking`} key={i} className="glass-card rounded-xl p-5 hover:border-brand-500/25 hover:-translate-y-0.5 transition-all group">
                            <span className="text-3xl mb-3 block">{s.icon}</span>
                            <h3 className="font-semibold mb-1">{s.name}</h3>
                            <div className="flex items-center justify-between">
                                <span className="text-brand-400 font-bold">{fmt(s.price)}</span>
                                <span className="flex items-center gap-1 text-xs text-zinc-500">
                                    <Clock className="w-3 h-3" />{s.duration}min
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Team */}
            <section className="max-w-5xl mx-auto px-4 py-12">
                <h2 className="font-display text-2xl font-bold mb-6">Nossa Equipe</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {store.staff.map((s, i) => {
                        const lv = levelConfig[s.level];
                        return (
                            <div key={i} className="glass-card rounded-xl p-6 text-center">
                                <div className="w-16 h-16 rounded-full bg-brand-gradient mx-auto mb-3 flex items-center justify-center text-xl font-bold">
                                    {s.avatar}
                                </div>
                                <h3 className="font-semibold mb-1">{s.name}</h3>
                                <p className="text-zinc-500 text-xs mb-3">{s.specialty}</p>
                                {lv && (
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full text-white ${lv.class}`}>
                                        {lv.emoji} {s.level}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* CTA Footer */}
            <section className="max-w-5xl mx-auto px-4 py-12 text-center border-t border-white/5">
                <p className="text-zinc-500 text-sm mb-2">
                    Powered by <span className="brand-gradient-text font-semibold">ChatBarber</span>
                </p>
                <p className="text-zinc-600 text-xs">chatbarber.com.br/{store.slug}</p>
            </section>
        </div>
    );
}
