import { NextResponse } from "next/server";
import { syncAllGroupsToDb } from "@/lib/syncResponses";

export async function POST() {
    try {
        const result = await syncAllGroupsToDb();

        return NextResponse.json({
            success: true,
            ...result,
            syncedAt: new Date().toISOString(),
        });
    } catch (error: unknown) {
        console.error("Sync API error:", error);

        const err = error as { message?: string };

        return NextResponse.json(
            {
                success: false,
                error: err?.message || "Failed to sync responses",
            },
            { status: 500 }
        );
    }
}