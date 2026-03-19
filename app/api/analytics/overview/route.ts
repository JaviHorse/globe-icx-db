import { NextResponse } from "next/server";
import { ensureResponsesTable, sql } from "@/lib/db";
import { GROUP_TABS } from "@/lib/groups";

type CountRow = {
    source_group: string;
    count: number;
};

export async function GET() {
    try {
        await ensureResponsesTable();

        const rows = (await sql`
      SELECT source_group, COUNT(*)::int AS count
      FROM icx_group_responses
      GROUP BY source_group
      ORDER BY source_group ASC;
    `) as CountRow[];

        const counts = new Map(rows.map((r) => [r.source_group, Number(r.count)]));

        const byGroup = GROUP_TABS.map((group) => ({
            group,
            responses: counts.get(group) ?? 0,
        }));

        const totalRespondents = byGroup.reduce((sum, row) => sum + row.responses, 0);

        return NextResponse.json({
            success: true,
            totalRespondents,
            totalPopulation: null,
            responseRate: null,
            byGroup,
            lastRefreshedAt: new Date().toISOString(),
        });
    } catch (error: unknown) {
        const err = error as { message?: string };
        return NextResponse.json(
            { success: false, error: err?.message || "Failed to load overview analytics" },
            { status: 500 }
        );
    }
}