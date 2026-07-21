import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "pgsql-parser";
import { describe, expect, it } from "vitest";

/**
 * Static validation of the SQL migrations.
 *
 * This machine has no Supabase CLI, Docker or psql, so the migrations cannot be
 * executed here — the pgTAP tests in `supabase/tests/` are the real isolation
 * gate and run against local Supabase (owner/CI). What CAN run everywhere,
 * including CI without a database, is a parse: `pgsql-parser` is the actual
 * PostgreSQL grammar compiled to WASM, so a migration that would not parse in
 * Postgres fails here first.
 *
 * This is a floor, not the gate. It proves the SQL is well-formed, not that the
 * policies isolate tenants — only pgTAP against a live database proves that.
 */

const MIGRATIONS = join(process.cwd(), "supabase/migrations");
const files = readdirSync(MIGRATIONS)
  .filter((f) => f.endsWith(".sql"))
  .sort();

describe("SQL migrations", () => {
  it("has at least the Phase 01 identity spine", () => {
    expect(files.length).toBeGreaterThanOrEqual(9);
  });

  it.each(files)("%s parses as valid PostgreSQL", (file) => {
    const sql = readFileSync(join(MIGRATIONS, file), "utf8");
    expect(() => parse(sql)).not.toThrow();
  });

  it("is timestamp-ordered and uniquely named", () => {
    const stamps = files.map((f) => f.slice(0, 14));
    expect(new Set(stamps).size).toBe(stamps.length);
    expect([...stamps].sort()).toEqual(stamps);
  });

  it("enables RLS on every table it creates", () => {
    // A created table with no matching `enable row level security` would be
    // exposed and unprotected — the exact failure DATABASE_STANDARD.md forbids.
    for (const file of files) {
      const sql = readFileSync(join(MIGRATIONS, file), "utf8").toLowerCase();
      const created = [...sql.matchAll(/create table (\w+)/g)].map((m) => m[1]);
      for (const table of created) {
        expect(
          sql.includes(`alter table ${table} enable row level security`),
          `${file}: table "${table}" is created without enabling RLS`,
        ).toBe(true);
      }
    }
  });
});
