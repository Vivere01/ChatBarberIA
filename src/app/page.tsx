import Link from "next/link";
import { Scissors, BarChart3, Users, Calendar, Star, Shield, Zap, ArrowRight, CheckCircle } from "lucide-react";
import { ChatbarberLogo } from "@/components/logo";

const features = [
    { icon: Calendar, title: "Agenda Inteligente", desc: "Grade de horários em tempo real. Clientes agendam 24h por dia pelo mini-site da sua barbearia." },
    { icon: BarChart3, title: "Dashboard Financeiro", desc: "Visibilidade total: receitas, custos, comissões e fluxo de caixa num só lugar." },
    { icon: Users, title: "Gestão de Clientes", desc: "Histórico completo, planos de assinatura, ranking de maiores gastadores e clientes ausentes." },
    { icon: Star, title: "Gamificação", desc: "Ranking de barbeiros com níveis Bronze → Rubi. Engaje sua equipe com campanhas de vendas." },
    { icon: Shield, title: "Multi-loja", desc: "Gerencie todas as suas unidades com dados unificados e relatórios consolidados." },
    { icon: Zap, title: "IA & WhatsApp", desc: "IA treinada com os dados da sua barbearia integrada ao WhatsApp para atendimento automático." },
];

const plans = [
    { name: "Starter", price: "R$ 97", desc: "Ideal para barbearias independentes", features: ["1 loja", "até 200 clientes", "Agenda online", "Financeiro básico"] },
    { name: "Pro", price: "R$ 197", desc: "Para barbearias em crescimento", features: ["3 lojas", "clientes ilimitados", "Tudo do Starter", "Gamificação", "IndicaAí", "Relatórios avançados"], highlight: true },
    { name: "Enterprise", price: "R$ 397", desc: "Para redes e franquias", features: ["Lojas ilimitadas", "IA + WhatsApp", "MCP Server", "API pública", "Suporte prioritário"] },
];

export default function HomePage() {
    return (
        <div className="min-h-screen bg-dark-900 overflow-x-hidden">
            {/* ── Header ── */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-dark-900/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ChatbarberLogo className="w-8 h-8" fill="white" />
                        <span className="font-display font-bold text-xl">
                            Chat<span className="brand-gradient-text">Barber</span>
                        </span>
                    </div>
                    <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
                        <a href="#features" className="hover:text-white transition-colors">Funcionalidades</a>
                        <a href="#plans" className="hover:text-white transition-colors">Planos</a>
                        <a href="#ai" className="hover:text-white transition-colors">IA</a>
                    </nav>
                    <div className="flex items-center gap-3">
                        <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors px-4 py-2">
                            Entrar
                        </Link>
                        <Link href="/register" className="text-sm bg-brand-gradient text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">
                            Começar Grátis
                        </Link>
                    </div>
                </div>
            </header>

            {/* ── Hero ── */}
            <section className="pt-32 pb-24 px-6 relative">
                {/* Background glow */}
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-4xl mx-auto text-center relative">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-400 text-sm mb-8 animate-fade-in">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Com IA integrada ao WhatsApp</span>
                    </div>
                    <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6 animate-slide-up">
                        A plataforma que sua{" "}
                        <span className="brand-gradient-text">barbearia</span>{" "}
                        merecia
                    </h1>
                    <p className="text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto mb-10">
                        Gestão completa de agendamentos, financeiro, clientes e equipe.
                        Com IA treinada nos dados da sua barbearia e integração nativa ao WhatsApp.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/register" className="group flex items-center gap-2 bg-brand-gradient text-white px-8 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-all hover:scale-105 shadow-brand">
                            Começar Agora
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link href="/login" className="flex items-center gap-2 border border-white/10 text-zinc-300 px-8 py-4 rounded-xl font-semibold text-lg hover:border-white/20 hover:text-white transition-all">
                            Fazer Login
                        </Link>
                    </div>
                    <p className="mt-6 text-sm text-zinc-500">14 dias grátis · Sem cartão · Cancele quando quiser</p>
                </div>
            </section>

            {/* ── Features ── */}
            <section id="features" className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-4xl font-bold mb-4">Tudo que você precisa</h2>
                        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                            De agendamentos a IA — um ecossistema completo para barbearias modernas.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <div
                                key={i}
                                className="glass-card rounded-2xl p-6 hover:border-brand-500/20 transition-all duration-300 hover:-translate-y-1 group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-4 group-hover:bg-brand-500/15 transition-colors">
                                    <f.icon className="w-6 h-6 text-brand-400" />
                                </div>
                                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── AI Section ── */}
            <section id="ai" className="py-24 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-500/3 to-transparent pointer-events-none" />
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs mb-6">
                            <Zap className="w-3 h-3" />
                            IA Vertical para Barbearias
                        </div>
                        <h2 className="font-display text-4xl font-bold mb-6">
                            IA que conhece{" "}
                            <span className="brand-gradient-text">cada detalhe</span>{" "}
                            da sua barbearia
                        </h2>
                        <p className="text-zinc-400 leading-relaxed mb-8">
                            Conecte o WhatsApp da sua barbearia ao nosso CRM inteligente. A IA aprende automaticamente
                            com os dados dos seus clientes — agendamentos, preferências, histórico — e atende com precisão
                            e personalização que antes exigia uma recepcionista dedicada.
                        </p>
                        <ul className="space-y-3">
                            {["Treinamento automático com dados reais da sua barbearia", "Integração WhatsApp via Evolution API", "MCP Server para comunicação precisa com a IA", "API pública para integrações personalizadas"].map((item) => (
                                <li key={item} className="flex items-center gap-3 text-sm text-zinc-300">
                                    <CheckCircle className="w-4 h-4 text-brand-400 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="glass-card rounded-2xl p-6 border border-purple-500/20">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-xs text-zinc-400">IA Online · Treinada com seus dados</span>
                        </div>
                        <div className="space-y-3">
                            {[
                                { role: "client", msg: "Oi! Quero agendar um corte pro sábado" },
                                { role: "ai", msg: "Olá! 😊 Temos horários disponíveis no sábado: 09h, 11h e 15h com o João. Qual prefere?" },
                                { role: "client", msg: "15h tá ótimo!" },
                                { role: "ai", msg: "Perfeito! Agendei o corte + barba pra você às 15h de sábado com o João. Confirmação enviada! ✅" },
                            ].map((m, i) => (
                                <div key={i} className={`flex ${m.role === "ai" ? "justify-start" : "justify-end"}`}>
                                    <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${m.role === "ai"
                                        ? "bg-dark-600 text-zinc-200 rounded-tl-sm"
                                        : "bg-brand-gradient text-white rounded-tr-sm"
                                        }`}>
                                        {m.msg}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Plans ── */}
            <section id="plans" className="py-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-4xl font-bold mb-4">Planos simples e transparentes</h2>
                        <p className="text-zinc-400">Sem surpresas. Cancele quando quiser.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <div key={plan.name} className={`glass-card rounded-2xl p-6 relative ${plan.highlight ? "border-brand-500/40 shadow-brand" : ""}`}>
                                {plan.highlight && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-gradient text-white text-xs px-3 py-1 rounded-full font-semibold">
                                        Mais Popular
                                    </div>
                                )}
                                <h3 className="font-display font-bold text-xl mb-1">{plan.name}</h3>
                                <p className="text-zinc-500 text-sm mb-4">{plan.desc}</p>
                                <div className="text-3xl font-bold mb-1">{plan.price}</div>
                                <div className="text-zinc-500 text-sm mb-6">/mês</div>
                                <ul className="space-y-2.5 mb-8">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                                            <CheckCircle className="w-4 h-4 text-brand-400 flex-shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/register" className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${plan.highlight
                                    ? "bg-brand-gradient text-white hover:opacity-90"
                                    : "border border-white/10 text-zinc-300 hover:border-white/20 hover:text-white"
                                    }`}>
                                    Começar Grátis
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="border-t border-white/5 py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 mb-4">
                        <ChatbarberLogo className="w-6 h-6" fill="white" />
                        <span className="font-display font-bold">
                            Chat<span className="brand-gradient-text">Barber</span>
                        </span>
                    </div>
                    <p className="text-zinc-500 text-sm">© 2026 ChatBarber. Todos os direitos reservados.</p>
                </div>
            </footer>
        </div>
    );
}
