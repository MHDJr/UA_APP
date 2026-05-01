"use client";

import { format, isSameDay, isToday, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar, Users, DollarSign, AlertTriangle } from "lucide-react";

type LoadStatus = "idle" | "healthy" | "near-capacity" | "overloaded";

interface CalendarDayCellProps {
    date: Date;
    selectedDate: Date | undefined;
    onSelect: (date: Date) => void;
    programCount: number;
    meetingCount: number;
    staffUtilization: number; // 0-100
    hasRevenueEvent: boolean;
    isCurrentMonth: boolean;
}

const loadConfig = {
    idle: {
        bg: "bg-white/[0.02]",
        border: "border-white/5",
        text: "text-white/30",
        dot: "bg-white/20",
    },
    healthy: {
        bg: "bg-exec-success/[0.08]",
        border: "border-exec-success/20",
        text: "text-exec-success",
        dot: "bg-exec-success",
    },
    "near-capacity": {
        bg: "bg-exec-warning/[0.08]",
        border: "border-exec-warning/20",
        text: "text-exec-warning",
        dot: "bg-exec-warning",
    },
    overloaded: {
        bg: "bg-exec-alert/[0.08]",
        border: "border-exec-alert/20",
        text: "text-exec-alert",
        dot: "bg-exec-alert",
    },
};

function getLoadStatus(programCount: number, meetingCount: number): LoadStatus {
    const total = programCount + meetingCount;
    if (total === 0) return "idle";
    if (total <= 2) return "healthy";
    if (total <= 4) return "near-capacity";
    return "overloaded";
}

export function CalendarDayCell({
    date,
    selectedDate,
    onSelect,
    programCount,
    meetingCount,
    staffUtilization,
    hasRevenueEvent,
    isCurrentMonth,
}: CalendarDayCellProps) {
    const isSelected = selectedDate && isSameDay(date, selectedDate);
    const today = isToday(date);
    const loadStatus = getLoadStatus(programCount, meetingCount);
    const config = loadConfig[loadStatus];

    const totalEvents = programCount + meetingCount;

    return (
        <button
            onClick={() => onSelect(date)}
            className={cn(
                "relative w-full min-h-[60px] p-1.5 rounded border text-left transition-all",
                "hover:bg-white/5",
                isSelected && "ring-1 ring-primary",
                !isCurrentMonth && "opacity-30",
                config.bg,
                config.border,
                today && "ring-1 ring-white/30",
            )}
        >
            {/* Date Number */}
            <div
                className={cn(
                    "text-[10px] font-medium mb-1",
                    today ? "text-primary font-bold" : config.text,
                )}
            >
                {format(date, "d")}
            </div>

            {/* Load Indicator & Metrics */}
            <div className="space-y-1">
                {/* Event Count + Dot */}
                {totalEvents > 0 && (
                    <div className="flex items-center gap-1">
                        <span
                            className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                config.dot,
                            )}
                        />
                        <span
                            className={cn("text-[9px] font-mono", config.text)}
                        >
                            {totalEvents}
                        </span>
                    </div>
                )}

                {/* Staff Utilization Bar (tiny) */}
                {totalEvents > 0 && (
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full transition-all",
                                staffUtilization >= 90
                                    ? "bg-exec-alert"
                                    : staffUtilization >= 70
                                      ? "bg-exec-warning"
                                      : "bg-exec-success",
                            )}
                            style={{
                                width: `${Math.min(100, staffUtilization)}%`,
                            }}
                        />
                    </div>
                )}

                {/* Revenue Event Indicator */}
                {hasRevenueEvent && (
                    <div className="flex items-center gap-0.5">
                        <DollarSign className="h-2.5 w-2.5 text-exec-gold" />
                        <span className="text-[8px] text-exec-gold font-medium">
                            REV
                        </span>
                    </div>
                )}
            </div>

            {/* Today indicator */}
            {today && (
                <div className="absolute top-1 right-1">
                    <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                </div>
            )}
        </button>
    );
}

interface WeekRowProps {
    dates: Date[];
    selectedDate: Date | undefined;
    onSelect: (date: Date) => void;
    getDayData: (date: Date) => {
        programCount: number;
        meetingCount: number;
        staffUtilization: number;
        hasRevenueEvent: boolean;
    };
    isCurrentMonth: boolean;
}

export function WeekRow({
    dates,
    selectedDate,
    onSelect,
    getDayData,
    isCurrentMonth,
}: WeekRowProps) {
    return (
        <div className="grid grid-cols-7 gap-1">
            {dates.map((date) => {
                const dayData = getDayData(date);
                return (
                    <CalendarDayCell
                        key={date.toISOString()}
                        date={date}
                        selectedDate={selectedDate}
                        onSelect={onSelect}
                        programCount={dayData.programCount}
                        meetingCount={dayData.meetingCount}
                        staffUtilization={dayData.staffUtilization}
                        hasRevenueEvent={dayData.hasRevenueEvent}
                        isCurrentMonth={isCurrentMonth}
                    />
                );
            })}
        </div>
    );
}
