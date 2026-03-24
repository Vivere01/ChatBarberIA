/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#4f46e5', // Principal Azul/Roxo (Indigo)
                    600: '#4338ca',
                    700: '#3730a3',
                    800: '#312e81',
                    900: '#1e1b4b',
                },
                dark: {
                    900: '#060b19', // Fundo principal super profundo
                    800: '#0c1631', // Cards um pouco mais claros
                    700: '#15244b', // Bordas e hovers
                    600: '#213565',
                },
            },
            fontFamily: {
                sans: ["var(--font-inter)", "system-ui", "sans-serif"],
                display: ["var(--font-syne)", "system-ui", "sans-serif"],
            },
            borderRadius: {
                lg: "0.75rem",
                xl: "1rem",
                "2xl": "1.25rem",
                "3xl": "1.5rem",
            },
            backgroundImage: {
                "brand-gradient": "linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)",
                "dark-gradient": "linear-gradient(180deg, #111113 0%, #0a0a0b 100%)",
                "card-gradient": "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
            },
            boxShadow: {
                brand: "0 0 30px rgba(249,115,22,0.25)",
                "brand-sm": "0 0 15px rgba(249,115,22,0.15)",
                glass: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
                card: "0 1px 3px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.3)",
            },
            animation: {
                "fade-in": "fadeIn 0.3s ease-in-out",
                "slide-up": "slideUp 0.4s ease-out",
                "pulse-brand": "pulseBrand 2s ease-in-out infinite",
                shimmer: "shimmer 2s linear infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(16px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                pulseBrand: {
                    "0%, 100%": { boxShadow: "0 0 15px rgba(249,115,22,0.15)" },
                    "50%": { boxShadow: "0 0 30px rgba(249,115,22,0.4)" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                },
            },
        },
    },
    plugins: [],
};
