"use client";

import Link from "next/link";
import { Scissors, BarChart3, Users, Calendar, Star, Shield, Zap, ArrowRight, CheckCircle } from "lucide-react";
import { ChatbarberLogo } from "@/components/logo";
import { motion, Variants } from "framer-motion";
import { ThreeDScene } from "@/components/landing/ThreeDScene";

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

const fadeIn: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

export default function HomePage() {
    return (
        <div className="min-h-screen bg-dark-900 overflow-x-hidden">
            {/* ── Header ── */}
            <motion.header 
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-dark-900/60 backdrop-blur-xl"
            >
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
            </motion.header>

            {/* ── Hero ── */}
            <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
                <ThreeDScene />
                
                {/* Background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-brand-600/15 rounded-full blur-[150px] pointer-events-none" />

                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="max-w-5xl mx-auto px-6 text-center relative z-10"
                >
                    <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-sm mb-8 backdrop-blur-md">
                        <Zap className="w-3.5 h-3.5" />
                        <span>A primeira IA com visão 3D do seu salão</span>
                    </motion.div>
                    
                    <motion.h1 variants={fadeIn} className="font-display text-5xl md:text-8xl font-bold leading-[1.05] tracking-tight mb-8">
                        A evolução da sua{" "}
                        <span className="brand-gradient-text">barbearia</span>{" "}
                    </motion.h1>
                    
                    <motion.p variants={fadeIn} className="text-xl md:text-2xl text-zinc-300/80 leading-relaxed max-w-3xl mx-auto mb-12">
                        Gestão completa, agendamentos ilimitados e uma IA que 
                        transforma o WhatsApp na sua recepcionista 24 horas.
                    </motion.p>
                    
                    <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link href="/register" className="group relative flex items-center gap-2 bg-brand-gradient text-white px-8 py-4 rounded-full font-semibold text-lg overflow-hidden shadow-[0_0_40px_rgba(139,92,246,0.3)] hover:shadow-[0_0_60px_rgba(139,92,246,0.5)] transition-all hover:scale-105">
                            <span className="relative z-10 flex items-center gap-2">
                                Experimentar Grátis
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                        </Link>
                        <Link href="#features" className="flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-lg text-zinc-300 hover:text-white hover:bg-white/5 transition-colors">
                            Ver Funcionalidades
                        </Link>
                    </motion.div>
                    <motion.p variants={fadeIn} className="mt-8 text-sm text-zinc-500">14 dias grátis · Sem cartão de crédito</motion.p>
                </motion.div>
                
                {/* Scroll indicator */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-500"
                >
                    <span className="text-xs uppercase tracking-widest">Role para baixo</span>
                    <motion.div 
                        animate={{ y: [0, 8, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        className="w-5 h-8 border-2 border-zinc-700 rounded-full flex justify-center p-1"
                    >
                        <div className="w-1 h-2 bg-zinc-500 rounded-full" />
                    </motion.div>
                </motion.div>
            </section>

            {/* ── Features ── */}
            <section id="features" className="py-32 px-6 relative z-10 bg-dark-900">
                <div className="max-w-7xl mx-auto">
                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeIn}
                        className="text-center mb-20"
                    >
                        <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">Tudo que você precisa em um só lugar</h2>
                        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto">
                            Esqueça planilhas e sistemas complicados. Nossa plataforma foi desenhada
                            para barbearias modernas e exigentes.
                        </p>
                    </motion.div>

                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {features.map((f, i) => (
                            <motion.div
                                key={i}
                                variants={fadeIn}
                                className="group relative glass-card rounded-3xl p-8 hover:bg-white/[0.02] transition-colors overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                    <f.icon className="w-7 h-7 text-brand-400" />
                                </div>
                                <h3 className="font-display font-semibold text-xl mb-3 text-white">{f.title}</h3>
                                <p className="text-zinc-400 text-base leading-relaxed group-hover:text-zinc-300 transition-colors">{f.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ── AI Section ── */}
            <section id="ai" className="py-32 px-6 relative overflow-hidden bg-zinc-950">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-600/10 rounded-full blur-[120px] pointer-events-none" />
                
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs mb-6">
                            <Zap className="w-3 h-3" />
                            IA Vertical para Barbearias
                        </motion.div>
                        <motion.h2 variants={fadeIn} className="font-display text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            A inteligência que{" "}
                            <span className="brand-gradient-text">escuta os seus clientes</span>
                        </motion.h2>
                        <motion.p variants={fadeIn} className="text-zinc-400 text-lg leading-relaxed mb-8">
                            Nossa IA atende seus clientes no WhatsApp, entende o estilo de corte,
                            oferece produtos complementares e agenda horários perfeitamente, sem erros ou conflitos.
                        </motion.p>
                        <motion.ul variants={staggerContainer} className="space-y-4">
                            {["Treinamento automático com seus dados reais", "Integração nativa de WhatsApp sem custo extra", "Respostas empáticas e contextualizadas", "Vendas cruzadas automáticas"].map((item) => (
                                <motion.li key={item} variants={fadeIn} className="flex items-center gap-3 text-base text-zinc-300 group">
                                    <CheckCircle className="w-5 h-5 text-brand-400 group-hover:scale-110 transition-transform" />
                                    {item}
                                </motion.li>
                            ))}
                        </motion.ul>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="glass-card rounded-3xl p-8 border border-purple-500/20 shadow-2xl shadow-purple-900/20 relative"
                    >
                        <div className="absolute -top-4 -right-4 w-20 h-20 bg-brand-500 rounded-full blur-[40px] opacity-50" />
                        
                        <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                            </div>
                            <div className="ml-4 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-xs font-medium text-zinc-400">ChatBarber AI - Online</span>
                            </div>
                        </div>
                        
                        <div className="space-y-6">
                            {[
                                { role: "client", msg: "Oi! Tem horário pro sábado à tarde?" },
                                { role: "ai", msg: "Olá, Pedro! Tudo bom? 😊 Temos sim! No sábado o João tem horários às 14h, 15:30h e 17h. Quer que eu reserve o de 15:30h para o seu Degradê de sempre?" },
                                { role: "client", msg: "Isso mesmo, valeu!" },
                                { role: "ai", msg: "Agendado, Pedro! ✅ Sábado às 15:30 com o João. Te mando um lembrete no dia. Pode confirmar?" },
                            ].map((m, i) => (
                                <motion.div 
                                    key={i} 
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 + i * 0.2 }}
                                    className={`flex ${m.role === "ai" ? "justify-start" : "justify-end"}`}
                                >
                                    <div className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${m.role === "ai"
                                        ? "bg-dark-600 border border-white/5 text-zinc-200 rounded-tl-sm"
                                        : "bg-brand-gradient text-white rounded-tr-sm"
                                        }`}>
                                        {m.msg}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── Plans ── */}
            <section id="plans" className="py-32 px-6 bg-dark-900">
                <div className="max-w-6xl mx-auto">
                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeIn}
                        className="text-center mb-20"
                    >
                        <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">Planos que acompanham seu crescimento</h2>
                        <p className="text-zinc-400 text-lg">Sem taxas escondidas. Cancele quando quiser.</p>
                    </motion.div>
                    
                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center"
                    >
                        {plans.map((plan, index) => (
                            <motion.div 
                                key={plan.name} 
                                variants={fadeIn}
                                className={`glass-card rounded-3xl p-8 relative transition-all duration-300 hover:-translate-y-2 ${plan.highlight ? "border-brand-500/50 shadow-[0_0_50px_rgba(139,92,246,0.15)] md:-mt-8 md:mb-8" : "border-white/5"}`}
                            >
                                {plan.highlight && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-gradient text-white text-xs px-4 py-1.5 rounded-full font-bold uppercase tracking-wider shadow-lg">
                                        Mais Popular
                                    </div>
                                )}
                                <h3 className="font-display font-bold text-2xl mb-2">{plan.name}</h3>
                                <p className="text-zinc-500 text-sm mb-6 h-10">{plan.desc}</p>
                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-4xl md:text-5xl font-bold">{plan.price}</span>
                                    <span className="text-zinc-500 text-sm font-medium">/mês</span>
                                </div>
                                <ul className="space-y-4 mb-10 h-64">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-start gap-3 text-sm text-zinc-300">
                                            <CheckCircle className="w-5 h-5 text-brand-400 flex-shrink-0" />
                                            <span className="leading-tight">{f}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/register" className={`block text-center py-4 rounded-xl font-semibold text-base transition-all ${plan.highlight
                                    ? "bg-brand-gradient text-white hover:opacity-90 shadow-lg shadow-brand-500/25"
                                    : "bg-white/5 text-white hover:bg-white/10"
                                    }`}>
                                    Assinar {plan.name}
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="border-t border-white/5 py-12 px-6 bg-zinc-950">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <ChatbarberLogo className="w-7 h-7" fill="white" />
                        <span className="font-display font-bold text-lg">
                            Chat<span className="brand-gradient-text">Barber</span>
                        </span>
                    </div>
                    <p className="text-zinc-500 text-sm">© 2026 ChatBarber. Feito para barbeiros de elite.</p>
                </div>
            </footer>
        </div>
    );
}
