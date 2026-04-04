"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
    Scissors, LayoutDashboard, Users, UserCog, Wrench, Package,
    Calendar, BarChart3, DollarSign, TrendingDown, CreditCard,
    Trophy, Percent, Image, Megaphone, Star, Bot, Settings,
    LogOut, ChevronLeft, ChevronRight, Store, BadgePercent, Gift, PiggyBank, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatbarberLogo } from "@/components/logo";

const navGroups = [
    {
        label: "Principal",
        items: [
            { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
            { href: "/admin/appointments", icon: Calendar, label: "Agenda" },
        ],
    },
    {
        label: "Cadastros",
        items: [
            { href: "/admin/clients", icon: Users, label: "Clientes" },
            { href: "/admin/staff", icon: UserCog, label: "Profissionais" },
            { href: "/admin/services", icon: Wrench, label: "Serviços" },
            { href: "/admin/products", icon: Package, label: "Produtos" },
        ],
    },
    {
        label: "Financeiro",
        items: [
            { href: "/admin/financial", icon: BarChart3, label: "Dashboard Financeiro" },
            { href: "/admin/cashier", icon: DollarSign, label: "Caixa" },
            { href: "/admin/costs", icon: TrendingDown, label: "Custos" },
            { href: "/admin/subscriptions", icon: CreditCard, label: "Assinaturas" },
            { href: "/admin/commissions", icon: Percent, label: "Comissões" },
            { href: "/admin/financial/pot", icon: PiggyBank, label: "Pote de Comissões" },
        ],
    },
    {
        label: "Relatórios",
        items: [
            { href: "/admin/reports", icon: BarChart3, label: "Relatórios" },
        ],
    },
    {
        label: "Marketing",
        items: [
            { href: "/admin/campaigns", icon: Trophy, label: "Campanhas" },
            { href: "/admin/marketing/indica-ai", icon: Gift, label: "IndicaAí" },
            { href: "/admin/banners", icon: Image, label: "Banners" },
        ],
    },
    {
        label: "Configurações",
        items: [
            { href: "/admin/stores", icon: Store, label: "Lojas" },
            { href: "/admin/settings", icon: Settings, label: "Configurações" },
            { href: "/admin/ai", icon: Bot, label: "IA & API" },
        ],
    },
];

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={cn(
                "fixed inset-y-0 left-0 lg:relative z-50 flex flex-col bg-dark-800 border-r border-white/5 transition-all duration-300 ease-in-out flex-shrink-0",
                collapsed ? "w-16" : "w-64",
                isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}
        >
            {/* Logo */}
            <div className={cn("flex items-center h-16 border-b border-white/5 px-4", collapsed ? "justify-center" : "gap-3")}>
                <div className="flex-shrink-0">
                    <ChatbarberLogo className="w-8 h-8" fill="white" />
                </div>
                {!collapsed && (
                    <span className="font-display font-bold text-lg">
                        Chat<span className="brand-gradient-text">Barber</span>
                    </span>
                )}
                
                {/* Mobile Close Button */}
                <button onClick={onClose} className="lg:hidden ml-auto p-2 text-zinc-400 hover:text-white">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Collapse button (Desktop only) */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-dark-600 border border-white/10 items-center justify-center hover:bg-dark-500 transition-colors z-10"
            >
                {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </button>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6 scrollbar-hide">
                {navGroups.map((group) => (
                    <div key={group.label}>
                        {!collapsed && (
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 px-3 mb-2">
                                {group.label}
                            </p>
                        )}
                        <div className="space-y-0.5">
                            {group.items.map((item) => {
                                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={onClose}
                                        title={collapsed ? item.label : undefined}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                                            active
                                                ? "nav-item-active"
                                                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5",
                                            collapsed && "justify-center"
                                        )}
                                    >
                                        <item.icon className={cn("w-4 h-4 flex-shrink-0", active && "text-brand-400")} />
                                        {!collapsed && <span>{item.label}</span>}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Logout */}
            <div className="border-t border-white/5 p-3">
                <button
                    onClick={async () => {
                        await signOut({ redirect: false });
                        window.location.href = window.location.origin;
                    }}
                    className={cn(
                        "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-all",
                        collapsed && "justify-center"
                    )}
                >
                    <LogOut className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span>Sair</span>}
                </button>
            </div>
        </aside>
    );
}
