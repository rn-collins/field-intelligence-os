import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { AlertIcon, CheckIcon, CircleIcon, DisputedIcon, LockIcon } from "./icons";

/**
 * The five states every feature must implement, per
 * `docs/standards/UI_STANDARD.md`: loading, empty, error, restricted, success.
 *
 * They live together in one file because they are one design decision, not
 * five. Each carries a heading, an explanation, and — where the user can act —
 * exactly one next step.
 *
 * "Restricted" is a first-class state rather than a variant of "error": being
 * denied access to a protected record is correct system behavior, and telling
 * the user their permissions are broken would be both wrong and, in a
 * source-protection context, actively misleading.
 *
 * The full taxonomy, including states that are specified but not yet built
 * (offline, syncing, queued, sync conflict), is in `docs/ux/STATE_TAXONOMY.md`.
 */

/**
 * Heading level for the state's title.
 *
 * Configurable because these blocks appear at different depths: directly under
 * a page `h1` (needs `h2`), or inside a titled card (needs `h3` or lower). A
 * hard-coded `h3` produced a skipped level wherever the surrounding context did
 * not happen to match, which is a real screen-reader navigation defect rather
 * than a cosmetic one. Default stays `3` so existing call sites are unchanged.
 */
export type HeadingLevel = 2 | 3 | 4 | 5 | 6;

type StateBlockProps = {
  title: string;
  description: ReactNode;
  action?: ReactNode;
  className?: string;
  headingLevel?: HeadingLevel;
};

function StateBlock({
  icon,
  iconClassName,
  title,
  description,
  action,
  className,
  role,
  headingLevel = 3,
}: StateBlockProps & { icon: ReactNode; iconClassName?: string; role?: "status" | "alert" }) {
  const Heading = `h${headingLevel}` as const;

  return (
    <div
      {...(role ? { role } : {})}
      className={cn(
        "border-border bg-surface flex flex-col items-start gap-3 rounded-lg border border-dashed px-5 py-8",
        className,
      )}
    >
      <span className={cn("shrink-0", iconClassName)}>{icon}</span>
      <div className="space-y-1.5">
        <Heading className="text-ink text-base font-semibold">{title}</Heading>
        <div className="text-ink-muted max-w-prose text-sm leading-relaxed">{description}</div>
      </div>
      {action}
    </div>
  );
}

export function EmptyState(props: StateBlockProps) {
  return (
    <StateBlock
      icon={<CircleIcon width={20} height={20} />}
      iconClassName="text-ink-subtle"
      {...props}
    />
  );
}

export function ErrorState(props: StateBlockProps) {
  return (
    <StateBlock
      role="alert"
      icon={<DisputedIcon width={20} height={20} />}
      iconClassName="text-status-disputed"
      {...props}
    />
  );
}

/**
 * Shown when a record exists but the current role may not see it.
 *
 * The copy must not confirm or deny anything about the record's contents —
 * "restricted" is itself information, and over-explaining it can leak the shape
 * of protected material.
 */
export function RestrictedState(props: StateBlockProps) {
  return (
    <StateBlock
      icon={<LockIcon width={20} height={20} />}
      iconClassName="text-status-restricted"
      {...props}
    />
  );
}

/**
 * Confirms a completed action.
 *
 * `role="status"` rather than `alert`: success is not urgent and should not
 * interrupt a screen reader mid-sentence. The check icon plus the heading text
 * carry the meaning, so the state survives greyscale — success and error must
 * never be distinguishable by color alone.
 */
export function SuccessState(props: StateBlockProps) {
  return (
    <StateBlock
      role="status"
      icon={<CheckIcon width={20} height={20} />}
      iconClassName="text-status-verified"
      {...props}
    />
  );
}

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="border-border bg-surface flex items-center gap-3 rounded-lg border px-5 py-8"
    >
      <span className="border-border-strong border-t-action h-4 w-4 animate-spin rounded-full border-2" />
      <span className="text-ink-muted text-sm">{label}…</span>
    </div>
  );
}

/** A non-blocking notice. Used for scope and limitation statements. */
export function Callout({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-border bg-surface-sunken flex items-start gap-2.5 rounded-md border px-4 py-3",
        className,
      )}
    >
      <AlertIcon className="text-attention mt-0.5 shrink-0" />
      <div className="space-y-1 text-sm">
        <p className="text-ink font-semibold">{title}</p>
        <div className="text-ink-muted leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
