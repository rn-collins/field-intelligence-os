import Link from "next/link";
import { PageBody, PageHeader } from "@/components/layout/app-shell";
import { Card, CardBody } from "@/components/ui/card";
import { FieldIcon } from "@/components/ui/icons";
import { PreviewBadge } from "@/components/ui/preview-badge";
import { Callout, EmptyState } from "@/components/ui/states";

export const metadata = {
  title: "Field Mode",
};

/**
 * SCR-04 — the Field Mode entry point.
 *
 * Phase 00 requirement: a mobile Field Mode entry point exists and the layout
 * proves it is operable one-handed. The capture flows themselves are Phase 04.
 *
 * The list below is rendered as text rather than as disabled buttons. A
 * greyed-out "Record consent" control on a screen that cannot record consent is
 * worse than no control at all — in the field, at speed, it reads as a feature
 * that is merely failing.
 *
 * Ordering is the future priority from `docs/decisions/ADR-007`: the record-now
 * capture types come first, and the cognition update sits apart as an
 * after-the-fact prompt rather than a peer action.
 */

/**
 * Quick capture record types — the fast, structured records you start in the
 * field. This is NOT the minimum capture package, which is the full per-subject
 * shot/audio/record checklist specified in
 * `docs/phases/PHASE-04-MINIMUM-CAPTURE-PACKAGE.md`. Conflating the two is the
 * terminology error this page previously made.
 */
const QUICK_CAPTURE_TYPES = [
  { label: "Consent", detail: "Versioned ground rules, recorded before anything else." },
  { label: "Interview or spoken note", detail: "Say it before you lose it." },
  { label: "Photo, video or audio", detail: "Capture now; classify later." },
  { label: "Person", detail: "Name, role, how to reach them, why they matter." },
  { label: "Claim", detail: "Exact wording first; the surrounding detail later." },
  { label: "Evidence", detail: "A URL, a photograph of a document, a file reference." },
];

export default function FieldModePage() {
  return (
    <>
      <PageHeader
        title="Field Mode"
        description="One-handed capture, built for limited connectivity and very little time."
        meta={
          <div className="pt-1">
            <PreviewBadge>Not built yet</PreviewBadge>
          </div>
        }
      />

      <PageBody>
        <Callout title="Capture is not built yet.">
          This screen establishes the entry point, the touch-target sizing and the layout that a
          later release fills in. Nothing here records, stores or synchronizes anything.
        </Callout>

        <Card>
          <CardBody className="space-y-5">
            <div className="flex items-center gap-3">
              <span className="bg-surface-sunken text-action border-border flex h-11 w-11 items-center justify-center rounded-md border">
                <FieldIcon width={20} height={20} />
              </span>
              <div>
                <h2 className="text-ink text-base font-semibold">Quick capture record types</h2>
                <p className="text-ink-muted text-sm">
                  The fast records you start on the spot, in the order you usually need them.
                </p>
              </div>
            </div>

            <ol className="divide-border divide-y">
              {QUICK_CAPTURE_TYPES.map((target) => (
                <li key={target.label} className="flex min-h-14 flex-col justify-center py-3">
                  <span className="text-ink text-sm font-medium">{target.label}</span>
                  <span className="text-ink-muted text-sm">{target.detail}</span>
                </li>
              ))}
            </ol>

            <p className="text-ink-subtle border-border border-t pt-3 text-xs">
              After an interaction, Field Mode will prompt for a{" "}
              <span className="text-ink-muted font-medium">cognition update</span> — what you now
              believe that you did not believe this morning. It is a reflection, not a record type,
              so it comes after the work rather than alongside it.
            </p>
          </CardBody>
        </Card>

        <EmptyState
          title="The full minimum capture package comes later."
          description={
            <div className="space-y-3">
              <p>
                A quick record is not the same as complete coverage. The minimum capture package —
                the exact shots, audio and records that make a subject reconstructable later — is a
                per-subject checklist with a &ldquo;safe to leave?&rdquo; decision at the end. It is
                specified in full and will be built in a later release.
              </p>
              <p>
                Field Mode will also queue records offline and synchronize when connectivity
                returns, preserving both versions of any conflict — a capture made in the field is
                never silently discarded, because it usually cannot be recreated.
              </p>
              <p>
                Until then, the{" "}
                <Link href="/" className="text-link underline underline-offset-2">
                  Command Center
                </Link>{" "}
                shows the deployment state Field Mode will operate against.
              </p>
            </div>
          }
        />
      </PageBody>
    </>
  );
}
