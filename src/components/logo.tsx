import React from "react";

export function ChatbarberLogo({ className = "w-8 h-8", fill = "currentColor" }: { className?: string, fill?: string }) {
    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <rect width="100" height="100" rx="20" fill="url(#chatbarber_gradient)" />

            {/* Outer E / C Shape */}
            <path
                d="M65 25 H35 C29.477 25 25 29.477 25 35 V42 C25 43.104 25.895 44 27 44 H33 C35.761 44 38 46.239 38 49 V51 C38 53.761 35.761 56 33 56 H27 C25.895 56 25 56.895 25 58 V65 C25 70.523 29.477 75 35 75 H65 C67.761 75 70 72.761 70 70 V62 C70 59.239 67.761 57 65 57 H43 V43 H65 C67.761 43 70 40.761 70 38 V30 C70 27.239 67.761 25 65 25 Z"
                fill={fill}
            />

            {/* 3 Dots */}
            <circle cx="48" cy="50" r="5" fill={fill} />
            <circle cx="62" cy="50" r="5" fill={fill} />
            <circle cx="76" cy="50" r="5" fill={fill} />

            <defs>
                <linearGradient id="chatbarber_gradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#4c3ef5" />
                    <stop offset="1" stopColor="#3b82f6" />
                </linearGradient>
            </defs>
        </svg>
    );
}
