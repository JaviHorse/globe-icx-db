import type { SheetRowsResult } from "@/lib/googleSheets";
import { stripHeaderSuffix } from "@/lib/googleSheets";
import type { ResponseRow } from "@/lib/groupResponses";

export type NormalizeResult = {
  question: string;
  rows: ResponseRow[];
};

function cleanQuestionHeader(header: string) {
  return stripHeaderSuffix(header).replace(/^\[|\]$/g, "").trim();
}

function findQuestionHeader(headers: string[]) {
  return headers.find((header) => {
    const normalized = stripHeaderSuffix(header).toLowerCase();
    return normalized.includes("overall") && normalized.includes("collaboration");
  });
}

function findHeaderIgnoreCase(headers: string[], target: string) {
  const normalizedTarget = target.trim().toLowerCase();
  return headers.find(
    (header) => stripHeaderSuffix(header).trim().toLowerCase() === normalizedTarget
  );
}

export function normalizeResponses(
  group: string,
  sheetData: SheetRowsResult
): NormalizeResult {
  const headers = sheetData.headers;
  const rows = sheetData.rows;

  if (!headers.length || !rows.length) {
    return {
      question: `Overall, how would you rate your collaboration with ${group}?`,
      rows: [],
    };
  }

  const questionHeader = findQuestionHeader(headers);

  if (!questionHeader) {
    return {
      question: `Overall, how would you rate your collaboration with ${group}?`,
      rows: [],
    };
  }

  const emailHeader = findHeaderIgnoreCase(headers, "Email Address") || "Email Address";
  const timestampHeader = findHeaderIgnoreCase(headers, "Timestamp") || "Timestamp";
  const question = cleanQuestionHeader(questionHeader);

  const normalizedRows = rows
    .map((row, index) => {
      const answer = row[questionHeader] || "";
      const employeeId = row[emailHeader] || "";
      const timestamp = row[timestampHeader] || "";

      const extraFields: Record<string, string> = {};

      headers.forEach((header) => {
        if (!header.trim()) return;
        if (header === questionHeader) return;
        if (header === emailHeader) return;
        if (header === timestampHeader) return;

        extraFields[header] = row[header] || "";
      });

      const hasAnyExtraField = Object.values(extraFields).some((value) => value.trim());

      const isCompletelyBlank =
        !answer.trim() &&
        !employeeId.trim() &&
        !timestamp.trim() &&
        !hasAnyExtraField;

      if (isCompletelyBlank) {
        return null;
      }

      return {
        id: `${group}-${index + 1}-${employeeId || timestamp || "row"}`,
        group,
        question,
        answer,
        employeeId,
        timestamp,
        extraFields,
      };
    })
    .filter((row): row is ResponseRow => row !== null);

  return {
    question,
    rows: normalizedRows,
  };
}