import { cn } from "@/lib/utils/cn";
import { FlaskIcon } from "./icons";

/**
 * Marks a surface as showing demonstration data.
 *
 * `AGENTS.md`: "Manhattan and Reykjavík records are demonstration/seed
 * deployments and must be clearly labeled."
 *
 * Deliberately not dismissible and deliberately not styled like a status chip.
 * In a system whose purpose is evidentiary integrity, the difference between a
 * real record and a sample record is the single most important thing on screen,
 * and it must not be something the operator can turn off and later forget.
 */
export function DemoDataBanner({ className, detail }: { className?: string; detail?: string }) {
  return (
    <div
      className={cn(
        "bg-demo-bg text-demo border-border-strong flex items-start gap-2.5 rounded-md border border-dashed px-4 py-3 text-sm",
        className,
      )}
    >
      <FlaskIcon className="mt-0.5 shrink-0" />
      <p>
        <strong className="font-semibold">Demonstration data.</strong>{" "}
        {detail ??
          "These records are static Phase 00 samples, not live field records. Nothing here is stored, queried or synchronised."}
      </p>
    </div>
  );
}
