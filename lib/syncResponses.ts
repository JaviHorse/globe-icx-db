import crypto from "crypto";
import { ensureResponsesTable, sql } from "@/lib/db";
import { GROUP_TABS, getSheetRows } from "@/lib/googleSheets";
import { normalizeResponses } from "@/lib/normalizeResponses";
import type { ResponseRow } from "@/lib/groupResponses";

function makeSourceRowKey(question: string, row: ResponseRow) {
    const rawKey = [
        row.group,
        question,
        row.employeeId,
        row.timestamp,
        row.answer,
    ].join("|");

    return crypto.createHash("sha256").update(rawKey).digest("hex");
}

export async function syncAllGroupsToDb() {
    await ensureResponsesTable();

    const perGroup: Record<string, number> = {};
    let totalUpserts = 0;

    for (const group of GROUP_TABS) {
        const sheetData = await getSheetRows(group);
        const normalized = normalizeResponses(group, sheetData);

        perGroup[group] = normalized.rows.length;

        for (const row of normalized.rows) {
            const sourceRowKey = makeSourceRowKey(normalized.question, row);

            await sql`
        INSERT INTO icx_group_responses (
          source_row_key,
          source_group,
          question,
          answer,
          employee_id,
          timestamp_text,
          extra_fields,
          raw_payload,
          updated_at
        )
        VALUES (
          ${sourceRowKey},
          ${row.group},
          ${normalized.question},
          ${row.answer || null},
          ${row.employeeId || null},
          ${row.timestamp || null},
          ${JSON.stringify(row.extraFields || {})}::jsonb,
          ${JSON.stringify(row)}::jsonb,
          NOW()
        )
        ON CONFLICT (source_row_key)
        DO UPDATE SET
          source_group = EXCLUDED.source_group,
          question = EXCLUDED.question,
          answer = EXCLUDED.answer,
          employee_id = EXCLUDED.employee_id,
          timestamp_text = EXCLUDED.timestamp_text,
          extra_fields = EXCLUDED.extra_fields,
          raw_payload = EXCLUDED.raw_payload,
          updated_at = NOW();
      `;

            totalUpserts += 1;
        }
    }

    return {
        groups: [...GROUP_TABS],
        totalUpserts,
        perGroup,
    };
}