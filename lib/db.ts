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
    CREATE TABLE IF NOT EXISTS icx_service_given_entries (
      id BIGSERIAL PRIMARY KEY,
      source_row_key TEXT NOT NULL UNIQUE,
      respondent_key TEXT NOT NULL,
      source_group TEXT NOT NULL,
      employee_id TEXT,
      timestamp_text TEXT,
      division_supported TEXT,
      department_supported TEXT,
      team_supported TEXT,
      service_provided TEXT,
      strategic_imperatives TEXT,
      rating TEXT,
      comment TEXT,
      raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

    await sql`
    CREATE INDEX IF NOT EXISTS idx_icx_service_given_group
    ON icx_service_given_entries (source_group);
  `;

    await sql`
    CREATE TABLE IF NOT EXISTS icx_service_received_entries (
      id BIGSERIAL PRIMARY KEY,
      source_row_key TEXT NOT NULL UNIQUE,
      respondent_key TEXT NOT NULL,
      source_group TEXT NOT NULL,
      employee_id TEXT,
      timestamp_text TEXT,
      division_supporting TEXT,
      department_supporting TEXT,
      team_supporting TEXT,
      service_received TEXT,
      strategic_imperatives TEXT,
      rating TEXT,
      comment TEXT,
      raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

    await sql`
    CREATE INDEX IF NOT EXISTS idx_icx_service_received_group
    ON icx_service_received_entries (source_group);
  `;
}