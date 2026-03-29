"use client";

import { Sidebar } from "@/components/admin/sidebar";
import { Topbar } from "@/components/admin/topbar";
import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

export default function AdminShell({ children }: { children: ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-dark-900 overflow-hidden">
            {/* Sidebar with mobile Drawer logic */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Topbar onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-dark-900 relative">
                    <div className="max-w-7xl mx-auto animate-fade-in pb-20 md:pb-6">
                        {children}
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
