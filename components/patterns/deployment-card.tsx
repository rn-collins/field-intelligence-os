import Link from "next/link";
import { Card, CardBody, CardFooter, CardHeader } from "@/components/ui/card";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import type { HeadingLevel } from "@/components/ui/states";
import {
  calculateReadiness,
  daysUntilStart,
  durationInDays,
} from "@/features/deployments/readiness";
import type {
  Deployment,
  DeploymentStatus,
  PrerequisiteStatus,
} from "@/features/deployments/types";
import { ReadinessMeter } from "./readiness-meter";

const STATUS_TONE: Record<PrerequisiteStatus, StatusTone> = {
  complete: "verified",
  "in-progress": "in-progress",
  "not-started": "neutral",
  blocked: "blocked",
};

/**
 * Deployment status is rendered from the record, never assumed. An earlier
 * revision hard-coded "Planning" here, which asserted a commitment the operator
 * had not made — the precise error this component now exists to avoid.
 *
 * Labels are short (C5). "Candidate — not selected yet" wrapped onto two lines
 * inside a badge; the qualifier now sits in supporting text where it has room.
 */
const DEPLOYMENT_STATUS_TONE: Record<DeploymentStatus, StatusTone> = {
  candidate: "pending",
  "not-selected": "neutral",
  planning: "neutral",
  ready: "verified",
  active: "verified",
  processing: "in-progress",
  closed: "neutral",
  cancelled: "neutral",
};

const DEPLOYMENT_STATUS_LABEL: Record<DeploymentStatus, string> = {
  candidate: "Candidate",
  "not-selected": "Not selected",
  planning: "Planning",
  ready: "Ready",
  active: "Active",
  processing: "Processing",
  closed: "Closed",
  cancelled: "Canceled",
};

/** Supporting text shown beneath the badge, where there is room to be clear. */
const DEPLOYMENT_STATUS_DETAIL: Partial<Record<DeploymentStatus, string>> = {
  candidate: "Not selected yet",
  "not-selected": "Another option was chosen",
};

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatRange(deployment: Deployment): string {
  const start = DATE_FORMAT.format(new Date(`${deployment.startsOn}T00:00:00Z`));
  const end = DATE_FORMAT.format(new Date(`${deployment.endsOn}T00:00:00Z`));
  return `${start} – ${end}`;
}

/**
 * A deployment as it appears on the Command Center: a **summary**, not a record.
 *
 * Scope is deliberate. An earlier revision rendered the full prerequisite list,
 * every subject lane, every note and the raw record ID on the home screen, which
 * `docs/standards/UI_STANDARD.md` warns against directly — dense dashboards that
 * hide the next action. The summary answers four questions: where, when, how
 * ready, and what is stopping it. Everything else belongs to the deployment
 * detail page in Phase 02.
 *
 * Nothing is deleted to achieve this. The full prerequisite list, lanes, notes
 * and identifiers remain on the `Deployment` record, unrendered here.
 *
 * Everything shown is derived from the record — readiness, the day count, the
 * top blocker. SCR-01 requires that "no count is displayed without queryable
 * underlying records", and a Phase 00 shell is where that discipline is easiest
 * to abandon.
 */
export function DeploymentCard({
  deployment,
  asOf,
  headingLevel = 3,
}: {
  deployment: Deployment;
  asOf: string;
  /**
   * The card's title level. Configurable so the card can sit under a page `h1`
   * (level 2) or inside a titled section (level 3+) without skipping a level.
   */
  headingLevel?: HeadingLevel;
}) {
  const Heading = `h${headingLevel}` as const;
  const readiness = calculateReadiness(deployment);
  const days = daysUntilStart(deployment, asOf);
  const duration = durationInDays(deployment);

  // The single most important outstanding item. `outstanding` is already sorted
  // worst-first, so the head of the list is the thing most likely to stop the trip.
  const topBlocker = readiness.outstanding[0];
  const remaining = Math.max(readiness.outstanding.length - 1, 0);
  const statusDetail = DEPLOYMENT_STATUS_DETAIL[deployment.status];

  return (
    <Card as="article" className="flex flex-col">
      <CardHeader className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="space-y-0.5">
          <Heading className="text-ink text-lg font-semibold tracking-tight">
            {deployment.city}
          </Heading>
          <p className="text-ink-muted text-sm">
            {formatRange(deployment)} · {duration} days
          </p>
        </div>

        <div className="text-right">
          <StatusBadge tone={DEPLOYMENT_STATUS_TONE[deployment.status]}>
            {DEPLOYMENT_STATUS_LABEL[deployment.status]}
          </StatusBadge>
          {statusDetail && <p className="text-ink-subtle mt-1 text-xs">{statusDetail}</p>}
        </div>
      </CardHeader>

      <CardBody className="flex-1 space-y-4">
        <ReadinessMeter readiness={readiness} />

        {topBlocker ? (
          <div className="space-y-1.5">
            <p className="text-ink-muted text-xs font-medium tracking-wide uppercase">
              Biggest blocker
            </p>
            <div className="flex flex-wrap items-start gap-2 text-sm">
              <StatusBadge tone={STATUS_TONE[topBlocker.status]}>
                {topBlocker.status === "blocked" ? "Blocked" : "Not started"}
              </StatusBadge>
              <span className="text-ink min-w-0 flex-1">
                {topBlocker.label}
                {topBlocker.note && (
                  <span className="text-ink-subtle block text-xs">{topBlocker.note}</span>
                )}
              </span>
            </div>
            {remaining > 0 && (
              <p className="text-ink-subtle text-xs">
                {remaining} other prerequisite{remaining === 1 ? "" : "s"} outstanding.
              </p>
            )}
          </div>
        ) : (
          <p className="text-ink-muted text-sm">Every required prerequisite is complete.</p>
        )}
      </CardBody>

      <CardFooter className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-ink-muted text-sm">
          {deployment.status === "candidate"
            ? `Would start in ${days} days if selected`
            : days > 0
              ? `Starts in ${days} days`
              : days === 0
                ? "Starts today"
                : `Started ${Math.abs(days)} days ago`}
        </p>
        <Link
          href="/deployments"
          className="text-link text-sm underline underline-offset-2"
          aria-label={`Open deployments to see full detail for ${deployment.city}`}
        >
          Full detail
        </Link>
      </CardFooter>
    </Card>
  );
}
