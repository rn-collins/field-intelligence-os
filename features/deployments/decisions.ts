import { overlaps } from "./readiness";
import {
  isCommitted,
  type Deployment,
  type DeploymentDecision,
  type ScheduleConflict,
} from "./types";

/**
 * Distinguishing an open decision from a scheduling error.
 *
 * These look identical in the data — two deployments, same dates — and mean
 * opposite things. Treating a deliberate either/or as a clash would tell the
 * operator to "fix" a decision they were still weighing; treating a genuine
 * clash as a decision would let two committed trips sit unresolved. The
 * difference is declared on the record via `competesWith`, never inferred from
 * the dates.
 */

/** What must be known before a September-style either/or can be settled. */
export type DecisionInputResolver = (candidates: readonly Deployment[]) => readonly string[];

/**
 * Groups candidate deployments into the decisions they belong to.
 *
 * Exclusivity is treated as symmetric: declaring it on either record is enough,
 * so a half-updated pair still surfaces rather than silently disappearing.
 */
export function findPendingDecisions(
  deployments: readonly Deployment[],
  resolveInputs: DecisionInputResolver = () => [],
): readonly DeploymentDecision[] {
  const byId = new Map(deployments.map((deployment) => [deployment.id, deployment]));
  const seen = new Set<string>();
  const decisions: DeploymentDecision[] = [];

  for (const deployment of deployments) {
    if (deployment.status !== "candidate") continue;
    if (seen.has(deployment.id)) continue;

    const group = collectExclusiveGroup(deployment, byId);
    if (group.length < 2) continue;

    for (const member of group) seen.add(member.id);

    const ids = group.map((member) => member.id).toSorted();

    decisions.push({
      id: ids.join("--"),
      candidates: group,
      sharesWindow: group.some((a, index) => group.slice(index + 1).some((b) => overlaps(a, b))),
      outstandingInputs: resolveInputs(group),
    });
  }

  return decisions;
}

/**
 * Walks the mutual-exclusion graph from one deployment, so a three-way choice
 * surfaces as one decision rather than three pairs.
 */
function collectExclusiveGroup(
  start: Deployment,
  byId: ReadonlyMap<string, Deployment>,
): readonly Deployment[] {
  const group = new Map<string, Deployment>([[start.id, start]]);
  const queue: Deployment[] = [start];

  while (queue.length > 0) {
    const current = queue.shift()!;

    const linked = [
      ...(current.competesWith ?? []),
      // Symmetric: pick up records that name `current` without being named by it.
      ...[...byId.values()]
        .filter((other) => other.competesWith?.includes(current.id))
        .map((other) => other.id),
    ];

    for (const id of linked) {
      const candidate = byId.get(id);
      if (!candidate || group.has(id) || candidate.status !== "candidate") continue;
      group.set(id, candidate);
      queue.push(candidate);
    }
  }

  return [...group.values()];
}

/**
 * Committed deployments whose dates collide.
 *
 * Candidates are excluded: competing options are *expected* to share a window,
 * and reporting that as a conflict would be noise on exactly the screen that
 * must stay trustworthy.
 */
export function findScheduleConflicts(
  deployments: readonly Deployment[],
): readonly ScheduleConflict[] {
  const committed = deployments.filter(isCommitted);

  return committed.flatMap((a, index) =>
    committed
      .slice(index + 1)
      .filter((b) => overlaps(a, b))
      .map((b) => ({
        id: [a.id, b.id].toSorted().join("--"),
        deployments: [a, b] as const,
      })),
  );
}
