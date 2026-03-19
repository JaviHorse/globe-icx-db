import { NextRequest, NextResponse } from "next/server";
import { GROUP_TABS } from "@/lib/googleSheets";
import { ensureResponsesTable, sql } from "@/lib/db";
import type { GroupedResponse, ResponseRow } from "@/lib/groupResponses";

type DbRow = {
  id: number;
  source_group: string;
  question: string;
  answer: string | null;
  employee_id: string | null;
  timestamp_text: string | null;
  extra_fields: Record<string, string> | null;
};

export async function GET(request: NextRequest) {
  try {
    await ensureResponsesTable();

    const { searchParams } = new URL(request.url);
    const selectedGroup = searchParams.get("group");

    if (
      selectedGroup &&
      selectedGroup !== "All Groups" &&
      !GROUP_TABS.some((group) => group === selectedGroup)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid group: ${selectedGroup}`,
        },
        { status: 400 }
      );
    }

    const groupsToLoad =
      selectedGroup && selectedGroup !== "All Groups"
        ? [selectedGroup]
        : [...GROUP_TABS];

    const groupedEntries = await Promise.all(
      groupsToLoad.map(async (group) => {
        const rows = (await sql`
          SELECT
            id,
            source_group,
            question,
            answer,
            employee_id,
            timestamp_text,
            extra_fields
          FROM icx_group_responses
          WHERE source_group = ${group}
          ORDER BY id DESC;
        `) as DbRow[];

        const mappedRows: ResponseRow[] = rows.map((row) => ({
          id: String(row.id),
          group: row.source_group,
          question: row.question,
          answer: row.answer || "",
          employeeId: row.employee_id || "",
          timestamp: row.timestamp_text || "",
          extraFields: row.extra_fields || {},
        }));

        const question =
          mappedRows[0]?.question ||
          `Overall, how would you rate your collaboration with ${group}?`;

        return [
          group,
          {
            question,
            rows: mappedRows,
          },
        ] as const;
      })
    );

    const groupedResponses: Record<string, GroupedResponse> =
      Object.fromEntries(groupedEntries);

    const totalResponses = Object.values(groupedResponses).reduce(
      (sum, group) => sum + group.rows.length,
      0
    );

    return NextResponse.json({
      success: true,
      totalResponses,
      groups: [...GROUP_TABS],
      groupedResponses,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error("Responses API error:", error);

    const err = error as { message?: string };

    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Failed to fetch responses",
      },
      { status: 500 }
    );
  }
}