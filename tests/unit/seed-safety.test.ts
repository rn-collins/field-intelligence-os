import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { calculateReadiness } from "@/features/deployments/readiness";
import { SEED_AS_OF, SEED_DEPLOYMENTS } from "@/lib/seed/deployments";

/**
 * Guards on the demonstration data.
 *
 * `AGENTS.md` requires seed data to contain no secrets or sensitive personal
 * data, and requires the Manhattan and Reykjavík records to be clearly
 * labelled. These checks catch the mechanical failures — an email address, a
 * phone number, a missing provenance flag. They cannot catch a judgement
 * failure, such as a target name that happens to look like ordinary prose, so
 * changes to the seed still need a human read against
 * `docs/standards/SECURITY_PRIVACY_STANDARD.md`.
 */

const SEED_SOURCE = readFileSync(join(process.cwd(), "lib/seed/deployments.ts"), "utf8");

/**
 * UUIDs and ISO dates are long digit-and-dash runs, so they trip the telephone
 * heuristic. They are removed before that check rather than the pattern being
 * loosened — a looser pattern would also stop matching real phone numbers.
 */
const SEED_SOURCE_WITHOUT_IDENTIFIERS = SEED_SOURCE.replace(
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
  "<uuid>",
).replace(/\b\d{4}-\d{2}-\d{2}\b/g, "<date>");

describe("seed data safety", () => {
  it("labels every record as demonstration data", () => {
    for (const deployment of SEED_DEPLOYMENTS) {
      expect(deployment.provenance).toBe("demonstration");
    }
  });

  it("contains no email addresses", () => {
    expect(SEED_SOURCE).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.]+/);
  });

  it("contains no telephone numbers", () => {
    expect(SEED_SOURCE_WITHOUT_IDENTIFIERS).not.toMatch(/\+?\d[\d\s()-]{8,}\d/);
  });

  it("contains no credential-shaped strings", () => {
    expect(SEED_SOURCE).not.toMatch(/\b(sk|pk|eyJ)[A-Za-z0-9_-]{16,}/);
    expect(SEED_SOURCE).not.toMatch(/service_role/i);
  });

  it("uses a placeholder workspace rather than a real tenant", () => {
    for (const deployment of SEED_DEPLOYMENTS) {
      expect(deployment.workspaceId).toBe("00000000-0000-0000-0000-000000000000");
    }
  });
});

describe("seed data shape", () => {
  it("covers the two documented first deployments", () => {
    expect(SEED_DEPLOYMENTS.map((deployment) => deployment.city).toSorted()).toEqual([
      "Manhattan",
      "Reykjavík",
    ]);
  });

  it("matches the dates recorded in PROJECT_MEMORY.md", () => {
    const byCity = Object.fromEntries(SEED_DEPLOYMENTS.map((d) => [d.city, d]));

    expect(byCity["Manhattan"]?.startsOn).toBe("2026-09-20");
    expect(byCity["Manhattan"]?.endsOn).toBe("2026-09-22");
    expect(byCity["Reykjavík"]?.startsOn).toBe("2026-09-20");
    expect(byCity["Reykjavík"]?.endsOn).toBe("2026-09-26");
  });

  it("pins the reference date so rendering is deterministic", () => {
    expect(SEED_AS_OF).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("gives every deployment scoreable prerequisites", () => {
    for (const deployment of SEED_DEPLOYMENTS) {
      const readiness = calculateReadiness(deployment);

      expect(readiness.requiredTotal).toBeGreaterThan(0);
      expect(readiness.percentage).toBeGreaterThanOrEqual(0);
      expect(readiness.percentage).toBeLessThanOrEqual(100);
    }
  });

  it("gives every prerequisite a unique id within its deployment", () => {
    for (const deployment of SEED_DEPLOYMENTS) {
      const ids = deployment.prerequisites.map((item) => item.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("explains every blocked prerequisite", () => {
    // A blocker with no stated cause is an unactionable dashboard number,
    // which docs/standards/UI_STANDARD.md rules out.
    for (const deployment of SEED_DEPLOYMENTS) {
      for (const item of deployment.prerequisites) {
        if (item.status === "blocked") {
          expect(item.note, `${deployment.id}/${item.id} is blocked without a note`).toBeDefined();
        }
      }
    }
  });
});
