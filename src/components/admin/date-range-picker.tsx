"use client";

import { useState, useRef, useEffect } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";

const MONTHS_PT = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const DAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export interface DateRange {
    start: Date | null;
    end: Date | null;
}

interface Props {
    value: DateRange;
    onChange: (range: DateRange) => void;
}

function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();
}

function isBetween(date: Date, start: Date, end: Date) {
    const d = date.getTime();
    const s = Math.min(start.getTime(), end.getTime());
    const e = Math.max(start.getTime(), end.getTime());
    return d > s && d < e;
}

function formatRange(range: DateRange): string {
    if (!range.start && !range.end) return "Selecionar período";
    const fmt = (d: Date) =>
        d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
    if (range.start && !range.end) return fmt(range.start);
    if (range.start && range.end) {
        if (isSameDay(range.start, range.end)) return fmt(range.start);
        return `${fmt(range.start)} → ${fmt(range.end)}`;
    }
    return "Selecionar período";
}

export default function DateRangePicker({ value, onChange }: Props) {
    const [open, setOpen] = useState(false);
    const [hoverDate, setHoverDate] = useState<Date | null>(null);
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    function prevMonth() {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    }

    function nextMonth() {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    }

    function handleDayClick(date: Date) {
        if (!value.start || (value.start && value.end)) {
            // Start new selection
            onChange({ start: date, end: null });
        } else {
            // End selection
            const start = value.start;
            if (isSameDay(date, start)) {
                onChange({ start: date, end: date });
            } else if (date < start) {
                onChange({ start: date, end: start });
            } else {
                onChange({ start, end: date });
            }
            setOpen(false);
        }
    }

    function clearRange() {
        onChange({ start: null, end: null });
        setOpen(false);
    }

    // Build calendar days grid
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));

    function getDayClasses(date: Date): string {
        const base = "w-8 h-8 flex items-center justify-center rounded-full text-sm cursor-pointer select-none transition-all ";

        const isStart = value.start && isSameDay(date, value.start);
        const isEnd = value.end && isSameDay(date, value.end);
        const isToday = isSameDay(date, today);
        const inRange = value.start && value.end && isBetween(date, value.start, value.end);
        const inHover = value.start && !value.end && hoverDate && isBetween(date, value.start, hoverDate);

        if (isStart || isEnd) return base + "bg-brand-500 text-white font-bold ring-2 ring-brand-400/40";
        if (inRange) return base + "bg-brand-500/20 text-brand-200 rounded-none";
        if (inHover) return base + "bg-brand-500/10 text-brand-300 rounded-none";
        if (isToday) return base + "border border-brand-500/40 text-brand-300 hover:bg-white/5";
        return base + "text-zinc-300 hover:bg-white/8";
    }

    function getRowClasses(week: (Date | null)[]): string {
        return "flex";
    }

    return (
        <div className="relative" ref={ref}>
            {/* Trigger button */}
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 bg-dark-800 border border-white/8 rounded-xl px-3 py-2 text-sm text-zinc-300 hover:border-white/20 hover:bg-dark-700 transition-all focus:outline-none"
            >
                <CalendarDays className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span className="max-w-[220px] truncate">{formatRange(value)}</span>
                {(value.start || value.end) && (
                    <span
                        onClick={(e) => { e.stopPropagation(); clearRange(); }}
                        className="ml-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                        <X className="w-3 h-3" />
                    </span>
                )}
            </button>

            {/* Calendar dropdown */}
            {open && (
                <div className="absolute right-0 top-full mt-2 z-50 bg-dark-800 border border-white/10 rounded-2xl shadow-2xl p-4 w-72 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={prevMonth}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/8 text-zinc-400 hover:text-white transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-semibold text-white">
                            {MONTHS_PT[viewMonth]} {viewYear}
                        </span>
                        <button
                            onClick={nextMonth}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/8 text-zinc-400 hover:text-white transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Day names */}
                    <div className="grid grid-cols-7 mb-1">
                        {DAYS_PT.map(d => (
                            <div key={d} className="text-center text-[10px] font-medium text-zinc-600 py-1">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Days grid */}
                    <div className="grid grid-cols-7 gap-y-0.5">
                        {cells.map((date, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-center"
                                onMouseEnter={() => date && setHoverDate(date)}
                                onMouseLeave={() => setHoverDate(null)}
                            >
                                {date ? (
                                    <div
                                        className={getDayClasses(date)}
                                        onClick={() => handleDayClick(date)}
                                    >
                                        {date.getDate()}
                                    </div>
                                ) : (
                                    <div className="w-8 h-8" />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Footer hint */}
                    <div className="mt-3 pt-3 border-t border-white/5">
                        <p className="text-[10px] text-zinc-600 text-center">
                            {!value.start
                                ? "Clique para selecionar a data inicial"
                                : !value.end
                                    ? "Clique para selecionar a data final"
                                    : `${value.start.toLocaleDateString("pt-BR")} → ${value.end.toLocaleDateString("pt-BR")}`}
                        </p>
                    </div>

                    {/* Quick presets */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {[
                            { label: "Hoje", fn: () => { const d = new Date(); onChange({ start: d, end: d }); setOpen(false); } },
                            { label: "7 dias", fn: () => { const e = new Date(); const s = new Date(); s.setDate(s.getDate() - 6); onChange({ start: s, end: e }); setOpen(false); } },
                            { label: "Este mês", fn: () => { const now = new Date(); const s = new Date(now.getFullYear(), now.getMonth(), 1); const e = new Date(now.getFullYear(), now.getMonth() + 1, 0); onChange({ start: s, end: e }); setOpen(false); } },
                            { label: "Mês passado", fn: () => { const now = new Date(); const s = new Date(now.getFullYear(), now.getMonth() - 1, 1); const e = new Date(now.getFullYear(), now.getMonth(), 0); onChange({ start: s, end: e }); setOpen(false); } },
                            { label: "30 dias", fn: () => { const e = new Date(); const s = new Date(); s.setDate(s.getDate() - 29); onChange({ start: s, end: e }); setOpen(false); } },
                            { label: "90 dias", fn: () => { const e = new Date(); const s = new Date(); s.setDate(s.getDate() - 89); onChange({ start: s, end: e }); setOpen(false); } },
                        ].map(p => (
                            <button
                                key={p.label}
                                onClick={p.fn}
                                className="text-[11px] px-2 py-1 rounded-lg bg-white/5 hover:bg-brand-500/20 hover:text-brand-300 text-zinc-400 transition-all"
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
