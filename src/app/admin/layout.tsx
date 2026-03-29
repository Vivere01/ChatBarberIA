import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex h-screen w-full bg-dark-900 overflow-hidden">
            <div className="flex-1 flex min-w-0">
                {children}
            </div>
        </div>
    );
}
