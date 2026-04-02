"use client";

import { Sidebar } from "@/components/admin/sidebar";
import { Topbar } from "@/components/admin/topbar";
import { ReactNode, useState, Suspense } from "react";
import { cn } from "@/lib/utils";

export default function AdminShell({ children }: { children: ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen w-full bg-dark-900 overflow-hidden">
            {/* Sidebar with mobile Drawer logic */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Suspense fallback={<div className="h-16 border-b border-white/5 bg-dark-800 flex items-center justify-between px-4" />}>
                    <Topbar onMenuClick={() => setSidebarOpen(true)} />
                </Suspense>
                <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-dark-900 relative">
                    <div className="w-full animate-fade-in pb-20 md:pb-6">
                        <Suspense fallback={<div className="flex items-center justify-center h-full text-zinc-500 text-xs uppercase font-black uppercase tracking-widest">Carregando painel...</div>}>
                            {children}
                        </Suspense>
                    </div>
                </main>
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden animate-in fade-in duration-300"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}
