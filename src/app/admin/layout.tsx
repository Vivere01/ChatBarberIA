import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex h-screen bg-dark-900 overflow-hidden">
            {children}
        </div>
    );
}
