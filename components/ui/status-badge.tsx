import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import {
  AlertIcon,
  BlockedIcon,
  CheckIcon,
  CircleIcon,
  DisputedIcon,
  LockIcon,
  ProgressIcon,
} from "./icons";

/**
 * A verification, consent, restriction or progress state.
 *
 * `docs/standards/UI_STANDARD.md`: "Verification, consent and restriction
 * states must be visible and never color-only."
 *
 * The API enforces that rule rather than documenting it. There is no way to
 * render a badge without a text label — the label is a required child, and each
 * tone carries a distinct icon *shape*, so the badge survives greyscale,
 * color-blindness and low-quality projection.
 */

export type StatusTone =
  "verified" | "pending" | "disputed" | "restricted" | "neutral" | "blocked" | "in-progress";

const TONE_STYLES: Record<StatusTone, { className: string; Icon: typeof CheckIcon }> = {
  verified: {
    className: "bg-status-verified-bg text-status-verified",
    Icon: CheckIcon,
  },
  pending: {
    className: "bg-status-pending-bg text-status-pending",
    Icon: AlertIcon,
  },
  disputed: {
    className: "bg-status-disputed-bg text-status-disputed",
    Icon: DisputedIcon,
  },
  restricted: {
    className: "bg-status-restricted-bg text-status-restricted",
    Icon: LockIcon,
  },
  neutral: {
    className: "bg-status-neutral-bg text-status-neutral",
    Icon: CircleIcon,
  },
  blocked: {
    className: "bg-status-disputed-bg text-status-disputed",
    Icon: BlockedIcon,
  },
  "in-progress": {
    className: "bg-status-pending-bg text-status-pending",
    Icon: ProgressIcon,
  },
};

export type StatusBadgeProps = {
  tone: StatusTone;
  /** Required. A badge without a readable label is not a permitted state. */
  children: ReactNode;
  className?: string;
};

export function StatusBadge({ tone, children, className }: StatusBadgeProps) {
  const { className: toneClassName, Icon } = TONE_STYLES[tone];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-medium",
        toneClassName,
        className,
      )}
    >
      <Icon className="shrink-0" width={12} height={12} />
      {children}
    </span>
  );
}
