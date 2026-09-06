import { cn } from "@/lib/utils/cn";
import { FlaskIcon } from "./icons";

/**
 * The preview notice.
 *
 * `AGENTS.md` requires demonstration records to be clearly labeled, and the
 * difference between a real record and a sample one is the single most
 * important thing on screen in an evidentiary system. So this is not
 * dismissible: a marker the operator can turn off is one they will eventually
 * turn off and then forget.
 *
 * Deliberately compact. An earlier revision paired this with a multi-sentence
 * "this is a foundation, not a product" callout explaining routed-but-inert
 * modules — engineering status addressed to the wrong audience, occupying the
 * top of the operational screen. Build status belongs in documentation; the
 * operator needs one line telling them nothing here is saved.
 */
export function DemoDataBanner({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "bg-preview-bg text-preview border-border-strong flex items-center gap-2 rounded-md border border-dashed px-3 py-2 text-xs",
        className,
      )}
    >
      <FlaskIcon className="shrink-0" width={14} height={14} />
      <span>
        <strong className="font-semibold">Phase 00 preview</strong> · demonstration data · changes
        are not saved
      </span>
    </p>
  );
}
