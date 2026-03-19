import crypto from "crypto";
import { ensureResponsesTable, sql } from "@/lib/db";
import { GROUP_TABS, getSheetRows, stripHeaderSuffix } from "@/lib/googleSheets";
import { normalizeResponses } from "@/lib/normalizeResponses";
import type { ResponseRow } from "@/lib/groupResponses";

type ServiceGivenEntry = {
    sourceRowKey: string;
    respondentKey: string;
    sourceGroup: string;
    employeeId: string;
    timestampText: string;
    divisionSupported: string;
    departmentSupported: string;
    teamSupported: string;
    serviceProvided: string;
    strategicImperatives: string;
    rating: string;
    comment: string;
    rawPayload: Record<string, string>;
};

type ServiceReceivedEntry = {
    sourceRowKey: string;
    respondentKey: string;
    sourceGroup: string;
    employeeId: string;
    timestampText: string;
    divisionSupporting: string;
    departmentSupporting: string;
    teamSupporting: string;
    serviceReceived: string;
    strategicImperatives: string;
    rating: string;
    comment: string;
    rawPayload: Record<string, string>;
};

function hash(parts: string[]) {
    return crypto.createHash("sha256").update(parts.join("|")).digest("hex");
}

function respondentKey(question: string, row: ResponseRow) {
    return hash([row.group, question, row.employeeId || "", row.timestamp || "", row.answer || ""]);
}

function base(header: string) {
    return stripHeaderSuffix(header);
}

function findBlockStarts(headers: string[], matcher: (header: string) => boolean) {
    return headers.filter((header) => matcher(base(header)));
}

function parseServiceGivenEntries(
    group: string,
    question: string,
    headers: string[],
    row: Record<string, string>,
    normalizedRow: ResponseRow
): ServiceGivenEntry[] {
    const starts = findBlockStarts(
        headers,
        (header) => /^Which division of .* do you support\?$/i.test(header)
    );

    const out: ServiceGivenEntry[] = [];
    const rk = respondentKey(question, normalizedRow);

    starts.forEach((startHeader, idx) => {
        const startIndex = headers.indexOf(startHeader);
        if (startIndex === -1) return;

        const divisionSupported = row[headers[startIndex]] || "";
        const departmentSupported = row[headers[startIndex + 1]] || "";
        const teamSupported = row[headers[startIndex + 2]] || "";
        const serviceProvided = row[headers[startIndex + 3]] || "";
        const strategicImperatives = row[headers[startIndex + 4]] || "";
        const rating = row[headers[startIndex + 5]] || "";
        const comment = row[headers[startIndex + 6]] || "";

        const isBlank =
            !divisionSupported.trim() &&
            !departmentSupported.trim() &&
            !teamSupported.trim() &&
            !serviceProvided.trim() &&
            !strategicImperatives.trim() &&
            !rating.trim() &&
            !comment.trim();

        if (isBlank) return;

        out.push({
            sourceRowKey: hash([
                rk,
                "given",
                String(idx + 1),
                divisionSupported,
                serviceProvided,
                rating,
            ]),
            respondentKey: rk,
            sourceGroup: group,
            employeeId: normalizedRow.employeeId || "",
            timestampText: normalizedRow.timestamp || "",
            divisionSupported,
            departmentSupported,
            teamSupported,
            serviceProvided,
            strategicImperatives,
            rating,
            comment,
            rawPayload: {
                divisionSupported,
                departmentSupported,
                teamSupported,
                serviceProvided,
                strategicImperatives,
                rating,
                comment,
            },
        });
    });

    return out;
}

function parseServiceReceivedEntries(
    group: string,
    question: string,
    headers: string[],
    row: Record<string, string>,
    normalizedRow: ResponseRow
): ServiceReceivedEntry[] {
    const starts = findBlockStarts(
        headers,
        (header) => /^Which division in .* supports you\?$/i.test(header)
    );

    const out: ServiceReceivedEntry[] = [];
    const rk = respondentKey(question, normalizedRow);

    starts.forEach((startHeader, idx) => {
        const startIndex = headers.indexOf(startHeader);
        if (startIndex === -1) return;

        const divisionSupporting = row[headers[startIndex]] || "";
        const departmentSupporting = row[headers[startIndex + 1]] || "";
        const teamSupporting = row[headers[startIndex + 2]] || "";
        const serviceReceived = row[headers[startIndex + 3]] || "";
        const strategicImperatives = row[headers[startIndex + 4]] || "";
        const rating = row[headers[startIndex + 5]] || "";
        const comment = row[headers[startIndex + 6]] || "";

        const isBlank =
            !divisionSupporting.trim() &&
            !departmentSupporting.trim() &&
            !teamSupporting.trim() &&
            !serviceReceived.trim() &&
            !strategicImperatives.trim() &&
            !rating.trim() &&
            !comment.trim();

        if (isBlank) return;

        out.push({
            sourceRowKey: hash([
                rk,
                "received",
                String(idx + 1),
                divisionSupporting,
                serviceReceived,
                rating,
            ]),
            respondentKey: rk,
            sourceGroup: group,
            employeeId: normalizedRow.employeeId || "",
            timestampText: normalizedRow.timestamp || "",
            divisionSupporting,
            departmentSupporting,
            teamSupporting,
            serviceReceived,
            strategicImperatives,
            rating,
            comment,
            rawPayload: {
                divisionSupporting,
                departmentSupporting,
                teamSupporting,
                serviceReceived,
                strategicImperatives,
                rating,
                comment,
            },
        });
    });

    return out;
}

async function upsertRespondent(question: string, row: ResponseRow) {
    const sourceRowKey = respondentKey(question, row);

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
      ${question},
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
}

async function upsertServiceGiven(entry: ServiceGivenEntry) {
    await sql`
    INSERT INTO icx_service_given_entries (
      source_row_key,
      respondent_key,
      source_group,
      employee_id,
      timestamp_text,
      division_supported,
      department_supported,
      team_supported,
      service_provided,
      strategic_imperatives,
      rating,
      comment,
      raw_payload,
      updated_at
    )
    VALUES (
      ${entry.sourceRowKey},
      ${entry.respondentKey},
      ${entry.sourceGroup},
      ${entry.employeeId || null},
      ${entry.timestampText || null},
      ${entry.divisionSupported || null},
      ${entry.departmentSupported || null},
      ${entry.teamSupported || null},
      ${entry.serviceProvided || null},
      ${entry.strategicImperatives || null},
      ${entry.rating || null},
      ${entry.comment || null},
      ${JSON.stringify(entry.rawPayload)}::jsonb,
      NOW()
    )
    ON CONFLICT (source_row_key)
    DO UPDATE SET
      source_group = EXCLUDED.source_group,
      employee_id = EXCLUDED.employee_id,
      timestamp_text = EXCLUDED.timestamp_text,
      division_supported = EXCLUDED.division_supported,
      department_supported = EXCLUDED.department_supported,
      team_supported = EXCLUDED.team_supported,
      service_provided = EXCLUDED.service_provided,
      strategic_imperatives = EXCLUDED.strategic_imperatives,
      rating = EXCLUDED.rating,
      comment = EXCLUDED.comment,
      raw_payload = EXCLUDED.raw_payload,
      updated_at = NOW();
  `;
}

async function upsertServiceReceived(entry: ServiceReceivedEntry) {
    await sql`
    INSERT INTO icx_service_received_entries (
      source_row_key,
      respondent_key,
      source_group,
      employee_id,
      timestamp_text,
      division_supporting,
      department_supporting,
      team_supporting,
      service_received,
      strategic_imperatives,
      rating,
      comment,
      raw_payload,
      updated_at
    )
    VALUES (
      ${entry.sourceRowKey},
      ${entry.respondentKey},
      ${entry.sourceGroup},
      ${entry.employeeId || null},
      ${entry.timestampText || null},
      ${entry.divisionSupporting || null},
      ${entry.departmentSupporting || null},
      ${entry.teamSupporting || null},
      ${entry.serviceReceived || null},
      ${entry.strategicImperatives || null},
      ${entry.rating || null},
      ${entry.comment || null},
      ${JSON.stringify(entry.rawPayload)}::jsonb,
      NOW()
    )
    ON CONFLICT (source_row_key)
    DO UPDATE SET
      source_group = EXCLUDED.source_group,
      employee_id = EXCLUDED.employee_id,
      timestamp_text = EXCLUDED.timestamp_text,
      division_supporting = EXCLUDED.division_supporting,
      department_supporting = EXCLUDED.department_supporting,
      team_supporting = EXCLUDED.team_supporting,
      service_received = EXCLUDED.service_received,
      strategic_imperatives = EXCLUDED.strategic_imperatives,
      rating = EXCLUDED.rating,
      comment = EXCLUDED.comment,
      raw_payload = EXCLUDED.raw_payload,
      updated_at = NOW();
  `;
}

export async function syncAllGroupsToDb() {
    await ensureResponsesTable();

    const perGroup: Record<string, number> = {};
    let totalRespondentUpserts = 0;
    let totalGivenUpserts = 0;
    let totalReceivedUpserts = 0;

    for (const group of GROUP_TABS) {
        const sheetData = await getSheetRows(group);
        const normalized = normalizeResponses(group, sheetData);

        perGroup[group] = normalized.rows.length;

        for (let i = 0; i < normalized.rows.length; i++) {
            const row = normalized.rows[i];
            const rawRow = sheetData.rows[i] || {};

            await upsertRespondent(normalized.question, row);
            totalRespondentUpserts += 1;

            const givenEntries = parseServiceGivenEntries(
                group,
                normalized.question,
                sheetData.headers,
                rawRow,
                row
            );

            for (const entry of givenEntries) {
                await upsertServiceGiven(entry);
                totalGivenUpserts += 1;
            }

            const receivedEntries = parseServiceReceivedEntries(
                group,
                normalized.question,
                sheetData.headers,
                rawRow,
                row
            );

            for (const entry of receivedEntries) {
                await upsertServiceReceived(entry);
                totalReceivedUpserts += 1;
            }
        }
    }

    return {
        groups: [...GROUP_TABS],
        totalRespondentUpserts,
        totalGivenUpserts,
        totalReceivedUpserts,
        perGroup,
    };
}