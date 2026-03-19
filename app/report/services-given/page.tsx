"use client";

import { useEffect, useState } from "react";
import { GROUP_TABS } from "@/lib/groups";
import {
    InsightPanel,
    KpiCard,
    SectionCard,
    SimpleBarChartCard,
} from "@/components/report/ReportPrimitives";

type ServicesGivenResponse = {
    success: boolean;
    totalEntries: number;
    byDivision: { name: string; value: number }[];
    topServices: { name: string; value: number }[];
    ratingDistribution: { name: string; value: number }[];
    strategicDistribution: { name: string; value: number }[];
    ratingByDivision: { name: string; favorablePct: number; total: number }[];
    qualitativePlaceholder: {
        strengths: string;
        blockers: string;
        suggestions: string;
    };
    error?: string;
};

export default function ServicesGivenPage() {
    const [group, setGroup] = useState("All Groups");
    const [data, setData] = useState<ServicesGivenResponse | null>(null);

    useEffect(() => {
        const query =
            group === "All Groups"
                ? "/api/analytics/services-given"
                : `/api/analytics/services-given?group=${encodeURIComponent(group)}`;

        fetch(query, { cache: "no-store" })
            .then((res) => res.json())
            .then(setData);
    }, [group]);

    if (!data) {
        return <div className="animate-pulse text-[#8da0c2]">Loading services-given analytics...</div>;
    }

    if (!data.success) {
        return <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">{data.error || "Failed to load services-given analytics."}</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-bold text-white">Services Given</h2>
                    <p className="mt-2 text-[#8da0c2]">
                        What services are being provided, where they go, and how they are rated.
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

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <KpiCard label="Total Service-Given Entries" value={data.totalEntries} tone="blue" />
                <KpiCard label="Selected Group" value={group} tone="purple" />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <SectionCard
                    title="Service-Given Entries by Division Supported"
                    subtitle="Where support volume is concentrated."
                >
                    <SimpleBarChartCard data={data.byDivision} horizontal />
                </SectionCard>

                <SectionCard
                    title="Top Services Provided"
                    subtitle="Most frequently provided service categories."
                >
                    <SimpleBarChartCard data={data.topServices} horizontal color="#22c55e" />
                </SectionCard>

                <SectionCard
                    title="Rating Distribution"
                    subtitle="How service-given entries are rated."
                >
                    <SimpleBarChartCard data={data.ratingDistribution} color="#a855f7" />
                </SectionCard>

                <SectionCard
                    title="Strategic Imperative Distribution"
                    subtitle="How provided services map to strategic priorities."
                >
                    <SimpleBarChartCard data={data.strategicDistribution} horizontal color="#38bdf8" />
                </SectionCard>
            </div>

            <SectionCard
                title="Rating by Division Supported"
                subtitle="Executive ranking view of favorable percentage by supported division."
            >
                <div className="max-h-[340px] overflow-auto rounded-2xl border border-white/8">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-[#0e1729]">
                            <tr>
                                <th className="px-4 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#8da0c2]">
                                    Division
                                </th>
                                <th className="px-4 py-4 text-right text-sm font-semibold uppercase tracking-[0.14em] text-[#8da0c2]">
                                    Favorable %
                                </th>
                                <th className="px-4 py-4 text-right text-sm font-semibold uppercase tracking-[0.14em] text-[#8da0c2]">
                                    n
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.ratingByDivision.map((row) => (
                                <tr key={row.name} className="border-t border-white/6">
                                    <td className="px-4 py-4 text-[#dbe7f6]">{row.name}</td>
                                    <td className="px-4 py-4 text-right font-semibold text-emerald-300">{row.favorablePct}%</td>
                                    <td className="px-4 py-4 text-right text-white">{row.total}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </SectionCard>

            <div className="grid gap-6 xl:grid-cols-3">
                <InsightPanel title="What is Working Well" value={data.qualitativePlaceholder.strengths} />
                <InsightPanel title="Recurring Blockers" value={data.qualitativePlaceholder.blockers} />
                <InsightPanel title="Suggested Improvements" value={data.qualitativePlaceholder.suggestions} />
            </div>
        </div>
    );
}