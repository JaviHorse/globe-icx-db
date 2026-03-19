"use client";

import { useEffect, useMemo, useState } from "react";
import { KpiCard, MiniTrendArea, SectionCard } from "@/components/report/ReportPrimitives";

type OverviewResponse = {
    success: boolean;
    totalRespondents: number;
    totalPopulation: number | null;
    responseRate: number | null;
    byGroup: { group: string; responses: number }[];
    lastRefreshedAt: string;
    error?: string;
};

export default function OverviewPage() {
    const [data, setData] = useState<OverviewResponse | null>(null);

    useEffect(() => {
        fetch("/api/analytics/overview", { cache: "no-store" })
            .then((res) => res.json())
            .then(setData);
    }, []);

    const trendData = useMemo(() => {
        if (!data?.success) return [];
        return data.byGroup.map((row) => ({
            name: row.group,
            value: row.responses,
        }));
    }, [data]);

    if (!data) {
        return <div className="animate-pulse text-[#8da0c2]">Loading overview analytics...</div>;
    }

    if (!data.success) {
        return <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">{data.error || "Failed to load overview analytics."}</div>;
    }

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-4xl font-bold text-white">Response Overview</h2>
                <p className="mt-2 text-[#8da0c2]">
                    High-level participation metrics and group distribution.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <KpiCard label="Total Respondents" value={data.totalRespondents} tone="blue" />
                <KpiCard label="Total Population" value={data.totalPopulation ?? "TBD"} tone="purple" />
                <KpiCard
                    label="Response Rate"
                    value={data.responseRate != null ? `${data.responseRate}%` : "TBD"}
                    tone="green"
                />
                <KpiCard
                    label="Last Refreshed"
                    value={new Date(data.lastRefreshedAt).toLocaleTimeString()}
                    tone="blue"
                />
            </div>

            <SectionCard
                title="Response Count Overview"
                subtitle="Quick visual of how response volume is distributed across groups."
            >
                <MiniTrendArea data={trendData} />
            </SectionCard>

            <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
                <SectionCard
                    title="Response Count by Group"
                    subtitle="This shows where participation is concentrated."
                >
                    <MiniTrendArea data={trendData} />
                </SectionCard>

                <SectionCard
                    title="Ranked Response Table"
                    subtitle="Exact counts by group for quick executive reading."
                >
                    <div className="max-h-[340px] overflow-auto rounded-2xl border border-white/8">
                        <table className="w-full text-left">
                            <thead className="sticky top-0 bg-[#0e1729]">
                                <tr>
                                    <th className="px-4 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#8da0c2]">
                                        Group
                                    </th>
                                    <th className="px-4 py-4 text-right text-sm font-semibold uppercase tracking-[0.14em] text-[#8da0c2]">
                                        Respondents
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.byGroup.map((row) => (
                                    <tr key={row.group} className="border-t border-white/6">
                                        <td className="px-4 py-4 text-[#dbe7f6]">{row.group}</td>
                                        <td className="px-4 py-4 text-right font-semibold text-white">{row.responses}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </SectionCard>
            </div>
        </div>
    );
}