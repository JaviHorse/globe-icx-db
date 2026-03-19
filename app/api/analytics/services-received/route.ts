import { NextRequest, NextResponse } from "next/server";
import { ensureResponsesTable, sql } from "@/lib/db";

type ReceivedRow = {
    source_group: string;
    division_supporting: string | null;
    service_received: string | null;
    strategic_imperatives: string | null;
    rating: string | null;
};

function splitMulti(value: string | null) {
    if (!value) return [];
    return value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
}

export async function GET(request: NextRequest) {
    try {
        await ensureResponsesTable();

        const { searchParams } = new URL(request.url);
        const group = searchParams.get("group");

        const rows = (
            group && group !== "All Groups"
                ? await sql`
            SELECT source_group, division_supporting, service_received, strategic_imperatives, rating
            FROM icx_service_received_entries
            WHERE source_group = ${group}
          `
                : await sql`
            SELECT source_group, division_supporting, service_received, strategic_imperatives, rating
            FROM icx_service_received_entries
          `
        ) as ReceivedRow[];

        const byDivision = new Map<string, number>();
        const byService = new Map<string, number>();
        const byRating = new Map<string, number>();
        const byStrategic = new Map<string, number>();
        const ratingByDivision = new Map<string, { favorable: number; total: number }>();

        rows.forEach((row) => {
            const division = (row.division_supporting || "Unspecified").trim();
            const service = (row.service_received || "Unspecified").trim();
            const rating = (row.rating || "Unspecified").trim();

            byDivision.set(division, (byDivision.get(division) ?? 0) + 1);
            byService.set(service, (byService.get(service) ?? 0) + 1);
            byRating.set(rating, (byRating.get(rating) ?? 0) + 1);

            splitMulti(row.strategic_imperatives).forEach((item) => {
                byStrategic.set(item, (byStrategic.get(item) ?? 0) + 1);
            });

            const favorable = ["EXCEPTIONAL", "UPLIFTED"].includes(rating.toUpperCase()) ? 1 : 0;
            const current = ratingByDivision.get(division) ?? { favorable: 0, total: 0 };
            current.favorable += favorable;
            current.total += 1;
            ratingByDivision.set(division, current);
        });

        return NextResponse.json({
            success: true,
            totalEntries: rows.length,
            byDivision: Array.from(byDivision.entries()).map(([name, value]) => ({ name, value })),
            topServices: Array.from(byService.entries())
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 10),
            ratingDistribution: Array.from(byRating.entries()).map(([name, value]) => ({ name, value })),
            strategicDistribution: Array.from(byStrategic.entries())
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value),
            ratingByDivision: Array.from(ratingByDivision.entries()).map(([name, data]) => ({
                name,
                favorablePct: data.total ? Math.round((data.favorable / data.total) * 100) : 0,
                total: data.total,
            })),
            qualitativePlaceholder: {
                strengths: "TBD by manual coding",
                blockers: "TBD by manual coding",
                suggestions: "TBD by manual coding",
            },
        });
    } catch (error: unknown) {
        const err = error as { message?: string };
        return NextResponse.json(
            { success: false, error: err?.message || "Failed to load service-received analytics" },
            { status: 500 }
        );
    }
}