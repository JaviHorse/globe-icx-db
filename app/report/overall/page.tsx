"use client";

import { useEffect, useState } from "react";
import { GROUP_TABS } from "@/lib/groups";
import {
    DonutChartCard,
    InsightPanel,
    KpiCard,
    MiniTrendArea,
    SectionCard,
    SimpleBarChartCard,
    LegendTable,
} from "@/components/report/ReportPrimitives";

type OverallResponse = {
    success: boolean;
    totalResponses: number;
    favorablePct: number;
    ratingDistribution: { name: string; value: number }[];
    interactionDistribution: { name: string; value: number }[];
    qualitativePlaceholder: {
        strengths: string;
        painPoints: string;
        suggestions: string;
    };
    error?: string;
};

export default function OverallPage() {
    const [group, setGroup] = useState("All Groups");
    const [data, setData] = useState<OverallResponse | null>(null);

    useEffect(() => {
        const query =
            group === "All Groups"
                ? "/api/analytics/overall"
                : `/api/analytics/overall?group=${encodeURIComponent(group)}`;

        fetch(query, { cache: "no-store" })
            .then((res) => res.json())
            .then(setData);
    }, [group]);

    if (!data) {
        return <div className="animate-pulse text-[#8da0c2]">Loading overall analytics...</div>;
    }

    if (!data.success) {
        return <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">{data.error || "Failed to load overall analytics."}</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-bold text-white">Overall Collaboration</h2>
                    <p className="mt-2 text-[#8da0c2]">
                        Topline health view of collaboration sentiment across the selected group.
                    </p>
                </div>

                <div className="rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3">
                    <select
                        value={group}
                        onChange={(e) => setGroup(e.target.value)}
                        className="bg-transparent text-sm font-semibold text-white outline-none"
                    >
                        <option className="text-black" value="All Groups">
                            All Groups
                        </option>
                        {GROUP_TABS.map((item) => (
                            <option className="text-black" key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <KpiCard label="Total Responses" value={data.totalResponses} tone="blue" />
                <KpiCard label="Favorable %" value={`${data.favorablePct}%`} tone="green" />
                <KpiCard label="Selected Group" value={group} tone="purple" />
            </div>

            <SectionCard 
                title="Interaction Model Breakdown" 
                subtitle="Scrollable list of interaction types described by respondents."
            >
                <LegendTable 
                    data={data.interactionDistribution} 
                    colors={["#3b82f6", "#22c55e", "#a855f7", "#38bdf8", "#f59e0b", "#ef4444"]} 
                />
            </SectionCard>

            <div className="grid gap-6 xl:grid-cols-2">
                <SectionCard
                    title="Overall Rating Distribution"
                    subtitle="Distribution of overall collaboration ratings across the selected base."
                >
                    <SimpleBarChartCard data={data.ratingDistribution} />
                </SectionCard>

                <SectionCard title="Interaction Type Distribution">
                    <DonutChartCard data={data.interactionDistribution} hideLegend />
                    <p className="mt-4 text-center text-xs text-[#8da0c2] italic">
                        Hover over a section to see which specific group response counts
                    </p>
                </SectionCard>
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
                <InsightPanel title="Top Strengths" value={data.qualitativePlaceholder.strengths} />
                <InsightPanel title="Top Pain Points" value={data.qualitativePlaceholder.painPoints} />
                <InsightPanel title="Top Suggestions" value={data.qualitativePlaceholder.suggestions} />
            </div>
        </div>
    );
}