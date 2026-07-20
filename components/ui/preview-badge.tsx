import { cn } from "@/lib/utils/cn";
import { FlaskIcon } from "./icons";

/**
 * Marks a surface as product-preview state — "not built yet", "demonstration
 * data", "not saved".
 *
 * Deliberately NOT a `StatusBadge` tone. Those describe *records*: a claim is
 * pending verification, a consent record is restricted, a deployment is
 * blocked. Using the same vocabulary for "this feature does not exist yet"
 * conflated two unrelated axes — an earlier revision rendered "Not yet built"
 * with the `pending` tone, which in this product means a record awaiting a
 * decision. A reader could not tell whether the *data* or the *software* was
 * incomplete.
 *
 * Its own token (`--color-preview`) keeps it visually outside the record-status
 * palette entirely.
 */
export function PreviewBadge({
  children = "Preview",
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "bg-preview-bg text-preview border-border-strong inline-flex items-center gap-1.5 rounded-sm border border-dashed px-2 py-0.5 text-xs font-medium",
        className,
      )}
    >
      <FlaskIcon className="shrink-0" width={12} height={12} />
      {children}
    </span>
  );
}
