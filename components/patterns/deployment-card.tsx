import {
  calculateReadiness,
  daysUntilStart,
  durationInDays,
} from "@/features/deployments/readiness";
import type { Deployment, PrerequisiteStatus } from "@/features/deployments/types";
import { Card, CardBody, CardFooter, CardHeader } from "@/components/ui/card";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import { ReadinessMeter } from "./readiness-meter";

const STATUS_TONE: Record<PrerequisiteStatus, StatusTone> = {
  complete: "verified",
  "in-progress": "in-progress",
  "not-started": "neutral",
  blocked: "blocked",
};

const STATUS_LABEL: Record<PrerequisiteStatus, string> = {
  complete: "Complete",
  "in-progress": "In progress",
  "not-started": "Not started",
  blocked: "Blocked",
};

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
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
 * One deployment as it appears on the Command Center.
 *
 * Everything rendered here is derived from the seed record — readiness, the day
 * count, the outstanding list. There are no decorative statistics: SCR-01
 * requires that "no count is displayed without queryable underlying records",
 * and a Phase 00 shell is exactly where that discipline is easiest to abandon.
 */
export function DeploymentCard({ deployment, asOf }: { deployment: Deployment; asOf: string }) {
  const readiness = calculateReadiness(deployment);
  const days = daysUntilStart(deployment, asOf);
  const duration = durationInDays(deployment);

  return (
    <Card as="article" className="flex flex-col">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="space-y-0.5">
            <h3 className="text-ink text-lg font-semibold tracking-tight">{deployment.city}</h3>
            <p className="text-ink-muted text-sm">
              {formatRange(deployment)} · {duration} days
            </p>
          </div>
          <StatusBadge tone="neutral">Planning</StatusBadge>
        </div>

        <p className="text-ink-subtle font-mono text-xs">
          {deployment.timezone} · {deployment.id}
        </p>
      </CardHeader>

      <CardBody className="flex-1 space-y-4">
        <p className="text-ink-muted text-sm leading-relaxed">{deployment.mission}</p>

        <ul className="flex flex-wrap gap-1.5">
          {deployment.lanes.map((lane) => (
            <li
              key={lane}
              className="border-border bg-surface-sunken text-ink-muted rounded-sm border px-2 py-0.5 text-xs"
            >
              {lane}
            </li>
          ))}
        </ul>

        <ReadinessMeter readiness={readiness} />

        {readiness.outstanding.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-ink-muted text-xs font-medium tracking-wide uppercase">
              Outstanding prerequisites
            </h4>
            <ul className="space-y-2">
              {readiness.outstanding.map((item) => (
                <li key={item.id} className="flex flex-wrap items-start gap-2 text-sm">
                  <StatusBadge tone={STATUS_TONE[item.status]}>
                    {STATUS_LABEL[item.status]}
                  </StatusBadge>
                  <span className="text-ink min-w-0 flex-1">
                    {item.label}
                    {item.note && (
                      <span className="text-ink-subtle block text-xs">{item.note}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardBody>

      <CardFooter>
        <p className="text-ink-muted text-sm">
          {days > 0
            ? `Starts in ${days} days.`
            : days === 0
              ? "Starts today."
              : `Started ${Math.abs(days)} days ago.`}{" "}
          <span className="text-ink-subtle">Deployment workspaces open in Phase 02.</span>
        </p>
      </CardFooter>
    </Card>
  );
}
