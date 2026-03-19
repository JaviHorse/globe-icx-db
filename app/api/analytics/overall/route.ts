import { NextRequest, NextResponse } from "next/server";
import { ensureResponsesTable, sql } from "@/lib/db";

type DbRow = {
    source_group: string;
    answer: string | null;
    extra_fields: Record<string, string> | null;
};

function stripSuffix(key: string) {
    return key.replace(/__\d+$/, "");
}

export async function GET(request: NextRequest) {
    try {
        await ensureResponsesTable();

        const { searchParams } = new URL(request.url);
        const group = searchParams.get("group");

        const rows = (
            group && group !== "All Groups"
                ? await sql`
            SELECT source_group, answer, extra_fields
            FROM icx_group_responses
            WHERE source_group = ${group}
          `
                : await sql`
            SELECT source_group, answer, extra_fields
            FROM icx_group_responses
          `
        ) as DbRow[];

        const ratingMap = new Map<string, number>();
        const interactionMap = new Map<string, number>();

        rows.forEach((row) => {
            const rating = (row.answer || "").trim() || "No Answer";
            ratingMap.set(rating, (ratingMap.get(rating) ?? 0) + 1);

            const extra = row.extra_fields || {};
            const interactionKey = Object.keys(extra).find((key) =>
                stripSuffix(key).toLowerCase().includes("which statement best describes your interaction")
            );

            const interaction = interactionKey ? extra[interactionKey]?.trim() || "No Answer" : "No Answer";
            interactionMap.set(interaction, (interactionMap.get(interaction) ?? 0) + 1);
        });

        const ratingDistribution = Array.from(ratingMap.entries()).map(([name, value]) => ({
            name,
            value,
        }));

        const interactionDistribution = Array.from(interactionMap.entries()).map(([name, value]) => ({
            name,
            value,
        }));

        const favorableSet = new Set(["EXCEPTIONAL", "UPLIFTED"]);
        const favorableCount = ratingDistribution.reduce(
            (sum, item) => sum + (favorableSet.has(item.name.toUpperCase()) ? item.value : 0),
            0
        );

        const total = rows.length;

        return NextResponse.json({
            success: true,
            totalResponses: total,
            favorablePct: total ? Math.round((favorableCount / total) * 100) : 0,
            ratingDistribution,
            interactionDistribution,
            qualitativePlaceholder: {
                strengths: "TBD by manual coding",
                painPoints: "TBD by manual coding",
                suggestions: "TBD by manual coding",
            },
        });
    } catch (error: unknown) {
        const err = error as { message?: string };
        return NextResponse.json(
            { success: false, error: err?.message || "Failed to load overall analytics" },
            { status: 500 }
        );
    }
}