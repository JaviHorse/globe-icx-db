import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing.");
}

export const sql = neon(process.env.DATABASE_URL);

export async function ensureResponsesTable() {
    await sql`
    CREATE TABLE IF NOT EXISTS icx_group_responses (
      id BIGSERIAL PRIMARY KEY,
      source_row_key TEXT NOT NULL UNIQUE,
      source_group TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT,
      employee_id TEXT,
      timestamp_text TEXT,
      extra_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
      raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

    await sql`
    CREATE INDEX IF NOT EXISTS idx_icx_group_responses_group
    ON icx_group_responses (source_group);
  `;

    await sql`
    CREATE INDEX IF NOT EXISTS idx_icx_group_responses_timestamp
    ON icx_group_responses (timestamp_text);
  `;
}