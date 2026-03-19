"use client";

import {
    BarChart,
    Bar,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Area,
    AreaChart,
} from "recharts";

export function KpiCard({
    label,
    value,
    sublabel,
    tone = "blue",
}: {
    label: string;
    value: string | number;
    sublabel?: string;
    tone?: "blue" | "green" | "purple";
}) {
    const toneClasses = {
        blue: {
            glow: "shadow-[0_0_0_1px_rgba(59,130,246,0.18),0_10px_30px_rgba(15,23,42,0.35)]",
            accent: "from-[#2563eb] to-[#60a5fa]",
            badge: "bg-[#172554] text-[#93c5fd]",
        },
        green: {
            glow: "shadow-[0_0_0_1px_rgba(16,185,129,0.18),0_10px_30px_rgba(15,23,42,0.35)]",
            accent: "from-[#059669] to-[#34d399]",
            badge: "bg-[#052e2b] text-[#86efac]",
        },
        purple: {
            glow: "shadow-[0_0_0_1px_rgba(168,85,247,0.18),0_10px_30px_rgba(15,23,42,0.35)]",
            accent: "from-[#7c3aed] to-[#a78bfa]",
            badge: "bg-[#2e1065] text-[#c4b5fd]",
        },
    }[tone];

    return (
        <div
            className={`relative overflow-hidden rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_35%),linear-gradient(180deg,#0b1220_0%,#0a1020_100%)] p-4 ${toneClasses.glow}`}
        >
            <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${toneClasses.accent}`} />
            <div className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${toneClasses.badge}`}>
                {label}
            </div>
            <div className="mt-3 text-3xl font-bold leading-none text-white">{value}</div>
            {sublabel && <div className="mt-2 text-xs text-[#93a4c3]">{sublabel}</div>}
        </div>
    );
}

export function SectionCard({
    title,
    subtitle,
    children,
    action,
}: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    action?: React.ReactNode;
}) {
    return (
        <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,#0d1528_0%,#0b1220_100%)] shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_15px_40px_rgba(0,0,0,0.35)]">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/6 px-5 py-3">
                <div>
                    <div className="flex items-center gap-2.5">
                        <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#22c55e] shadow-[0_0_12px_rgba(34,197,94,0.7)]" />
                        <h3 className="text-xl font-bold text-white uppercase tracking-[0.12em]">{title}</h3>
                    </div>
                    {subtitle && <p className="mt-1 text-xs text-[#8da0c2]">{subtitle}</p>}
                </div>
                {action}
            </div>
            <div className="p-4">{children}</div>
        </div>
    );
}

export function InsightPanel({
    title,
    value,
}: {
    title: string;
    value: string;
}) {
    return (
        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
            <div className="text-lg font-semibold text-white">{title}</div>
            <p className="mt-3 text-sm leading-7 text-[#96a6c3]">{value}</p>
        </div>
    );
}

export function SimpleBarChartCard({
    data,
    dataKey,
    color = "#3b82f6",
    horizontal = false,
}: {
    data: { name: string; value: number }[];
    dataKey?: string;
    color?: string;
    horizontal?: boolean;
}) {
    return (
        <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout={horizontal ? "vertical" : "horizontal"}
                    margin={{ top: 10, right: 20, left: 10, bottom: 18 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                    {horizontal ? (
                        <>
                            <XAxis type="number" stroke="#8da0c2" tick={{ fill: "#8da0c2", fontSize: 12 }} />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={170}
                                stroke="#8da0c2"
                                tick={{ fill: "#c7d2e5", fontSize: 12 }}
                            />
                        </>
                    ) : (
                        <>
                            <XAxis
                                dataKey="name"
                                stroke="#8da0c2"
                                tick={{ fill: "#c7d2e5", fontSize: 12 }}
                                angle={-15}
                                textAnchor="end"
                                height={64}
                            />
                            <YAxis stroke="#8da0c2" tick={{ fill: "#8da0c2", fontSize: 12 }} />
                        </>
                    )}
                    <Tooltip
                        contentStyle={{
                            background: "#0f172a",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 16,
                            color: "#fff",
                        }}
                        labelStyle={{ color: "#cbd5e1" }}
                    />
                    <Bar dataKey={dataKey || "value"} fill={color} radius={[8, 8, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export function DonutChartCard({
    data,
    hideLegend = false,
}: {
    data: { name: string; value: number }[];
    hideLegend?: boolean;
}) {
    const colors = ["#3b82f6", "#22c55e", "#a855f7", "#38bdf8", "#f59e0b", "#ef4444"];

    return (
        <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Tooltip
                        contentStyle={{
                            background: "#0f172a",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 16,
                            color: "#fff",
                            fontSize: 11,
                        }}
                    />
                    {!hideLegend && (
                        <Legend 
                            layout="vertical" 
                            verticalAlign="middle" 
                            align="right"
                            wrapperStyle={{ 
                                color: "#cbd5e1", 
                                fontSize: 10,
                                paddingLeft: 10,
                                maxWidth: "45%"
                            }}
                            formatter={(value: string) => value.length > 32 ? `${value.substring(0, 32)}...` : value}
                        />
                    )}
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={hideLegend ? 60 : 50}
                        outerRadius={hideLegend ? 90 : 75}
                        paddingAngle={3}
                    >
                        {data.map((_, index) => (
                            <Cell key={index} fill={colors[index % colors.length]} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

export function LegendTable({
    data,
    colors,
}: {
    data: { name: string; value: number }[];
    colors: string[];
}) {
    return (
        <div className="max-h-[220px] overflow-auto rounded-2xl border border-white/8 bg-white/[0.02]">
            <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-[#0e1729]">
                    <tr className="border-b border-white/8">
                        <th className="px-4 py-3 font-semibold uppercase tracking-widest text-[#8da0c2]">
                            Interaction Description
                        </th>
                        <th className="px-4 py-3 text-right font-semibold uppercase tracking-widest text-[#8da0c2] w-24">
                            Count
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index} className="border-b border-white/4 last:border-0 hover:bg-white/[0.04] transition-colors">
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="h-2.5 w-2.5 shrink-0 rounded-full" 
                                        style={{ backgroundColor: colors[index % colors.length] }} 
                                    />
                                    <span className="text-[#dbe7f6] leading-tight">{row.name}</span>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-white">
                                {row.value}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function MiniTrendArea({
    data,
    color = "#3b82f6",
}: {
    data: { name: string; value: number }[];
    color?: string;
}) {
    return (
        <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="miniAreaFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.38} />
                            <stop offset="100%" stopColor={color} stopOpacity={0.04} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.10)" />
                    <XAxis dataKey="name" stroke="#8da0c2" tick={{ fill: "#8da0c2", fontSize: 12 }} />
                    <YAxis stroke="#8da0c2" tick={{ fill: "#8da0c2", fontSize: 12 }} />
                    <Tooltip
                        contentStyle={{
                            background: "#0f172a",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 16,
                            color: "#fff",
                        }}
                    />
                    <Area type="monotone" dataKey="value" stroke={color} fill="url(#miniAreaFill)" strokeWidth={3} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}