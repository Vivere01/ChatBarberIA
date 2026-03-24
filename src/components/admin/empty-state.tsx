import { LucideIcon, Plus } from "lucide-react";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    buttonText: string;
    onAction?: () => void;
    actionHref?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    buttonText,
    onAction,
    actionHref
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 glass-card rounded-2xl border-dashed border-white/10 bg-transparent">
            <div className="w-16 h-16 rounded-2xl bg-dark-800 border border-white/5 flex items-center justify-center mb-6 shadow-brand-sm">
                <Icon className="w-8 h-8 text-brand-400 opacity-50" />
            </div>
            <h3 className="text-xl font-display font-bold text-white mb-2">{title}</h3>
            <p className="text-zinc-500 text-sm max-w-xs text-center mb-8">
                {description}
            </p>

            {actionHref ? (
                <a
                    href={actionHref}
                    className="flex items-center gap-2 bg-brand-gradient text-white px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-brand"
                >
                    <Plus className="w-4 h-4" />
                    {buttonText}
                </a>
            ) : (
                <button
                    onClick={onAction}
                    className="flex items-center gap-2 bg-brand-gradient text-white px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-brand"
                >
                    <Plus className="w-4 h-4" />
                    {buttonText}
                </button>
            )}
        </div>
    );
}
