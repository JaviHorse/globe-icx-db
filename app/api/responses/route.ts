import { NextRequest, NextResponse } from "next/server";
import { GROUP_TABS, getSheetRows } from "@/lib/googleSheets";
import { normalizeResponses } from "@/lib/normalizeResponses";
import type { GroupedResponse } from "@/lib/groupResponses";

interface APIError {
  message?: string;
  code?: number;
  response?: {
    data?: {
      error?: {
        message?: string;
      };
    };
  };
}

export async function GET(request: NextRequest) {
  try {
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
        const sheetData = await getSheetRows(group);
        const normalized = normalizeResponses(group, sheetData);

        return [
          group,
          {
            question: normalized.question,
            rows: normalized.rows,
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
    console.error("API error:", error);

    const err = error as APIError; // Use the defined interface
    const rawMessage =
      err?.response?.data?.error?.message ||
      err?.message ||
      "Failed to fetch responses";

    let message = rawMessage;

    if (
      rawMessage.includes("has not been used in project") ||
      rawMessage.includes("SERVICE_DISABLED") ||
      rawMessage.includes("accessNotConfigured")
    ) {
      message =
        "Google Sheets API is disabled for the service account project. Enable the Google Sheets API in Google Cloud Console, wait a few minutes, then try again.";
    } else if (err?.code === 403) { // Use err.code directly
      message =
        "Google Sheets access denied. Check that the spreadsheet is shared with the service account email and that the correct Google Cloud APIs are enabled.";
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}