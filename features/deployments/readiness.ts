import type { Deployment, Prerequisite, PrerequisiteStatus, Readiness } from "./types";

/**
 * Worst-first ordering, so the deployment card surfaces the thing most likely
 * to stop the trip rather than the first item that happens to be incomplete.
 */
const SEVERITY: Record<PrerequisiteStatus, number> = {
  blocked: 0,
  "not-started": 1,
  "in-progress": 2,
  complete: 3,
};

/**
 * Computes deployment readiness from its prerequisites.
 *
 * SCR-03 requires that "readiness identifies exact missing prerequisites", so
 * this returns the outstanding records themselves rather than only a score. A
 * percentage with no attached cause is exactly the kind of unactionable
 * dashboard number that `docs/standards/UI_STANDARD.md` warns against.
 *
 * Optional prerequisites are deliberately excluded from the score: letting
 * nice-to-haves drag readiness down teaches the operator to ignore the number.
 */
export function calculateReadiness(deployment: Deployment): Readiness {
  const required = deployment.prerequisites.filter((item) => item.required);
  const completed = required.filter((item) => item.status === "complete").length;

  const outstanding = required
    .filter((item) => item.status !== "complete")
    .toSorted(bySeverityThenLabel);

  const blocked = outstanding.filter((item) => item.status === "blocked");

  // An empty prerequisite list means "nothing is known to be missing", not
  // "ready" — a deployment with no checks defined has not been planned yet.
  const percentage = required.length === 0 ? 0 : Math.round((completed / required.length) * 100);

  return {
    completed,
    requiredTotal: required.length,
    percentage,
    outstanding,
    blocked,
    isReady: required.length > 0 && outstanding.length === 0,
  };
}

function bySeverityThenLabel(a: Prerequisite, b: Prerequisite): number {
  const bySeverity = SEVERITY[a.status] - SEVERITY[b.status];
  return bySeverity !== 0 ? bySeverity : a.label.localeCompare(b.label);
}

/**
 * Whole days from `asOf` to `startsOn`. Negative once the deployment has begun.
 *
 * Both arguments are ISO dates rather than `Date.now()` so that the static
 * Command Center renders identically in every build, test run and screenshot.
 */
export function daysUntilStart(deployment: Deployment, asOf: string): number {
  const MS_PER_DAY = 86_400_000;
  const start = Date.parse(`${deployment.startsOn}T00:00:00Z`);
  const now = Date.parse(`${asOf}T00:00:00Z`);

  if (Number.isNaN(start) || Number.isNaN(now)) {
    throw new Error(`Invalid ISO date supplied to daysUntilStart: ${deployment.startsOn}, ${asOf}`);
  }

  return Math.round((start - now) / MS_PER_DAY);
}

/** Inclusive duration in days. A single-day deployment is 1, not 0. */
export function durationInDays(deployment: Deployment): number {
  const MS_PER_DAY = 86_400_000;
  const start = Date.parse(`${deployment.startsOn}T00:00:00Z`);
  const end = Date.parse(`${deployment.endsOn}T00:00:00Z`);

  if (Number.isNaN(start) || Number.isNaN(end)) {
    throw new Error(`Invalid ISO date range: ${deployment.startsOn} to ${deployment.endsOn}`);
  }

  if (end < start) {
    throw new Error(
      `Deployment ends before it starts: ${deployment.startsOn} to ${deployment.endsOn}`,
    );
  }

  return Math.round((end - start) / MS_PER_DAY) + 1;
}

/**
 * True when two deployments overlap in calendar time. The operator can only be
 * in one place at once, so an overlap is something the Command Center should
 * say out loud rather than leave for the user to notice.
 */
export function overlaps(a: Deployment, b: Deployment): boolean {
  return a.startsOn <= b.endsOn && b.startsOn <= a.endsOn;
}
