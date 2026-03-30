"use client";

import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full";
}

export function Modal({ isOpen, onClose, title, children, maxWidth = "lg" }: ModalProps) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            window.addEventListener("keydown", handleEsc);
            document.body.style.overflow = "hidden";
        }
        return () => {
            window.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    const maxWidthClasses = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
        "3xl": "max-w-3xl",
        "4xl": "max-w-4xl",
        "5xl": "max-w-5xl",
        "6xl": "max-w-6xl",
        "7xl": "max-w-7xl",
        full: "max-w-full",
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-dark-950/90 backdrop-blur-md animate-fade-in"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={`relative w-full ${maxWidthClasses[maxWidth]} bg-dark-800 border border-white/10 rounded-[32px] shadow-2xl animate-scale-in overflow-hidden shadow-brand/20`}>
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.02]">
                    <h2 className="text-xl font-display font-bold text-white tracking-tight">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-xl text-zinc-500 hover:bg-white/5 hover:text-white transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 max-h-[85vh] overflow-y-auto custom-scrollbar scroll-smooth">
                    {children}
                </div>
            </div>
        </div>
    );
}
