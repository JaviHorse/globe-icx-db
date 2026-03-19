import { google } from "googleapis";
import { GROUP_TABS, type GroupTabName } from "@/lib/groups";

export { GROUP_TABS };
export type { GroupTabName };

export type SheetRowsResult = {
  headers: string[];
  rows: Record<string, string>[];
};

export function stripHeaderSuffix(header: string) {
  return header.replace(/__\d+$/, "").trim();
}

function makeHeadersUnique(rawHeaders: string[]) {
  const counts = new Map<string, number>();

  return rawHeaders.map((headerRaw) => {
    const header = String(headerRaw ?? "").trim();
    const count = (counts.get(header) ?? 0) + 1;
    counts.set(header, count);

    return count === 1 ? header : `${header}__${count}`;
  });
}

function getPrivateKey() {
  const directKey = process.env.GOOGLE_PRIVATE_KEY;
  const base64Key = process.env.GOOGLE_PRIVATE_KEY_BASE64;

  if (directKey) {
    return directKey.replace(/\\n/g, "\n");
  }

  if (base64Key) {
    return Buffer.from(base64Key, "base64").toString("utf8");
  }

  return undefined;
}

function getSpreadsheetId() {
  return process.env.GOOGLE_SHEETS_ID || "1S1Gca6lv1LlHx3ye5qtnYFmGRXbL9YLxwvBAKlFYXJc";
}

function getAuth() {
  const email = process.env.GOOGLE_CLIENT_EMAIL;
  const key = getPrivateKey();

  if (!email) {
    throw new Error("Missing GOOGLE_CLIENT_EMAIL.");
  }

  if (!key) {
    throw new Error("Missing GOOGLE_PRIVATE_KEY or GOOGLE_PRIVATE_KEY_BASE64.");
  }

  return new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
}

async function getSheetsClient() {
  const auth = getAuth();
  return google.sheets({ version: "v4", auth });
}

export async function getActualSheetTitles() {
  const sheets = await getSheetsClient();

  const res = await sheets.spreadsheets.get({
    spreadsheetId: getSpreadsheetId(),
    fields: "sheets.properties.title",
  });

  return (
    res.data.sheets
      ?.map((sheet) => sheet.properties?.title)
      .filter((title): title is string => Boolean(title)) ?? []
  );
}

async function resolveActualTabName(tabName: string) {
  const titles = await getActualSheetTitles();

  const exactMatch = titles.find((title) => title === tabName);
  if (exactMatch) return exactMatch;

  const normalizedTarget = tabName.replace(/\s+/g, "").toLowerCase();
  const normalizedMatch = titles.find(
    (title) => title.replace(/\s+/g, "").toLowerCase() === normalizedTarget
  );

  if (normalizedMatch) return normalizedMatch;

  throw new Error(`Sheet tab "${tabName}" was not found. Actual tabs: ${titles.join(", ")}`);
}

export async function getSheetRows(tabName: string): Promise<SheetRowsResult> {
  try {
    const sheets = await getSheetsClient();
    const actualTabName = await resolveActualTabName(tabName);

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: getSpreadsheetId(),
      range: `${actualTabName}!A:ZZ`,
    });

    const values = res.data.values || [];

    if (!values.length) {
      return {
        headers: [],
        rows: [],
      };
    }

    const rawHeaders = (values[0] || []).map((value) => String(value).trim());
    const headers = makeHeadersUnique(rawHeaders);

    const rows = values.slice(1).map((row) => {
      const obj: Record<string, string> = {};

      headers.forEach((header, i) => {
        obj[header] = String(row[i] ?? "").trim();
      });

      return obj;
    });

    return {
      headers,
      rows,
    };
  } catch (error: unknown) {
    const err = error as {
      message?: string;
      code?: number;
      status?: number;
      response?: { data?: unknown };
      errors?: unknown[];
    };

    console.error("Google Sheets error for tab:", tabName);
    console.error("message:", err?.message);
    console.error("code:", err?.code);
    console.error("status:", err?.status);
    console.error("response data:", JSON.stringify(err?.response?.data, null, 2));
    console.error("errors:", JSON.stringify(err?.errors, null, 2));
    throw error;
  }
}