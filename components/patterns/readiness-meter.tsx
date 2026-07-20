import type { Readiness } from "@/features/deployments/types";
import { cn } from "@/lib/utils/cn";

/**
 * Deployment readiness.
 *
 * SCR-03 requires readiness to "identify exact missing prerequisites", so the
 * number is never shown alone — the outstanding items sit directly beneath it.
 * The bar is `role="img"` with a full text alternative rather than a
 * `progressbar`: it reports a completed measurement, not an operation in flight.
 */
export function ReadinessMeter({
  readiness,
  className,
}: {
  readiness: Readiness;
  className?: string;
}) {
  const { percentage, completed, requiredTotal, isReady, blocked } = readiness;

  const tone = isReady
    ? "bg-status-verified"
    : blocked.length > 0
      ? "bg-status-disputed"
      : "bg-attention";

  const summary = `${completed} of ${requiredTotal} required prerequisites complete (${percentage}%)`;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-ink-muted text-xs font-medium tracking-wide uppercase">
          Readiness
        </span>
        <span className="text-ink font-mono text-xs">
          {completed}/{requiredTotal}
        </span>
      </div>

      <div
        role="img"
        aria-label={summary}
        className="bg-surface-sunken border-border h-2 w-full overflow-hidden rounded-full border"
      >
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
