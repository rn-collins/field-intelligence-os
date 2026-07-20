import Link from "next/link";
import { PageBody, PageHeader } from "@/components/layout/app-shell";
import { Card, CardBody } from "@/components/ui/card";
import { FieldIcon } from "@/components/ui/icons";
import { PreviewBadge } from "@/components/ui/preview-badge";
import { Callout, EmptyState } from "@/components/ui/states";
import { phaseLabel } from "@/features/navigation/nav-model";

export const metadata = {
  title: "Field Mode",
};

/**
 * SCR-04 — the Field Mode entry point.
 *
 * Phase 00 requirement: a mobile Field Mode entry point exists and the layout
 * proves it is operable one-handed. The capture flows themselves are Phase 04.
 *
 * The capture list below is rendered as text rather than as disabled buttons.
 * A greyed-out "Record consent" control on a screen that cannot record consent
 * is worse than no control at all — in the field, at speed, it reads as a
 * feature that is merely failing.
 */

const CAPTURE_TARGETS = [
  { label: "Quick person", detail: "Name, role, how to reach them, why they matter." },
  { label: "Quick interaction", detail: "Who, where, when, and what was said." },
  { label: "Consent", detail: "Versioned ground rules, recorded before anything else." },
  { label: "Claim", detail: "Exact wording first; the surrounding detail later." },
  { label: "Evidence", detail: "A URL, a photograph of a document, a file reference." },
  { label: "Asset", detail: "Register the file now, add metadata when there is time." },
  { label: "Spoken field note", detail: "Say it before you lose it." },
  {
    label: "Cognition update",
    detail: "What you now believe that you did not believe this morning.",
  },
];

export default function FieldModePage() {
  return (
    <>
      <PageHeader
        title="Field Mode"
        description="One-handed capture, built for limited connectivity and very little time."
        meta={
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <PreviewBadge>Not built yet</PreviewBadge>
            <span className="text-ink-subtle font-mono text-xs">{phaseLabel("04")} · SCR-04</span>
          </div>
        }
      />

      <PageBody>
        <Callout title="Capture is not implemented in Phase 00.">
          This screen establishes the entry point, the touch-target sizing and the layout that Phase
          04 fills in. Nothing here records, stores or synchronises anything yet.
        </Callout>

        <Card>
          <CardBody className="space-y-5">
            <div className="flex items-center gap-3">
              <span className="bg-surface-sunken text-action border-border flex h-11 w-11 items-center justify-center rounded-md border">
                <FieldIcon width={20} height={20} />
              </span>
              <div>
                <h2 className="text-ink text-base font-semibold">The minimum capture package</h2>
                <p className="text-ink-muted text-sm">
                  What must exist before you leave a location.
                </p>
              </div>
            </div>

            <ul className="divide-border divide-y">
              {CAPTURE_TARGETS.map((target) => (
                <li key={target.label} className="flex min-h-14 flex-col justify-center py-3">
                  <span className="text-ink text-sm font-medium">{target.label}</span>
                  <span className="text-ink-muted text-sm">{target.detail}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <EmptyState
          title="Offline capture arrives with Phase 04."
          description={
            <div className="space-y-3">
              <p>
                Field Mode will queue records locally and synchronise when connectivity returns.
                Conflicts will preserve both versions and ask for a decision — a capture made in the
                field is never silently discarded, because it usually cannot be recreated.
              </p>
              <p>
                Until then, the{" "}
                <Link href="/" className="text-link underline underline-offset-2">
                  Command Center
                </Link>{" "}
                shows the deployment state that Field Mode will operate against.
              </p>
            </div>
          }
        />
      </PageBody>
    </>
  );
}
