import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const syne = Syne({
    subsets: ["latin"],
    variable: "--font-syne",
    display: "swap",
});

export const metadata: Metadata = {
    title: "ChatBarber — Gestão Inteligente de Barbearias",
    description:
        "Plataforma completa de gestão para barbearias. Agendamentos, financeiro, gestão de clientes, comissões e muito mais.",
    keywords: ["barbearia", "gestão", "agendamento", "barbeiro", "chatbarber"],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR" className={`${inter.variable} ${syne.variable}`}>
            <body className="bg-dark-900 text-white antialiased font-sans">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
