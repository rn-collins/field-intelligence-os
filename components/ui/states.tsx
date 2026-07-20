import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { AlertIcon, CircleIcon, DisputedIcon, LockIcon } from "./icons";

/**
 * The five states every feature must implement, per
 * `docs/standards/UI_STANDARD.md`: loading, empty, error, restricted, success.
 *
 * They live together in one file because they are one design decision, not
 * four. Each carries a heading, an explanation, and — where the user can act —
 * exactly one next step. "Restricted" is a first-class state rather than a
 * variant of "error": being denied access to a protected record is correct
 * system behaviour, and telling the user their permissions are broken would be
 * both wrong and, in a source-protection context, actively misleading.
 */

type StateBlockProps = {
  title: string;
  description: ReactNode;
  action?: ReactNode;
  className?: string;
};

function StateBlock({
  icon,
  iconClassName,
  title,
  description,
  action,
  className,
  role,
}: StateBlockProps & { icon: ReactNode; iconClassName?: string; role?: "status" | "alert" }) {
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
        <h3 className="text-ink text-base font-semibold">{title}</h3>
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

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="border-border bg-surface flex items-center gap-3 rounded-lg border px-5 py-8"
    >
      <span className="border-border-strong border-t-accent h-4 w-4 animate-spin rounded-full border-2" />
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
      <AlertIcon className="text-accent mt-0.5 shrink-0" />
      <div className="space-y-1 text-sm">
        <p className="text-ink font-semibold">{title}</p>
        <div className="text-ink-muted leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
