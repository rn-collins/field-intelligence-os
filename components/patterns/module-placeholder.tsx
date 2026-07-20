import { PageBody, PageHeader } from "@/components/layout/app-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/states";
import { findNavItem, phaseLabel } from "@/features/navigation/nav-model";

/**
 * The honest empty state for a module that does not exist yet.
 *
 * `docs/build/PHASE-00-CODEX-FOUNDATION.md` requires "purposeful empty states"
 * and forbids pretending to be a finished product. So a placeholder says three
 * things and nothing more: what this module is for, which phase builds it, and
 * what it will contain. No disabled buttons, no skeleton rows, no sample
 * records — a greyed-out control implies the feature is one permission away
 * from working, which would be a lie.
 *
 * Copy is read from `features/navigation/nav-model.ts`, so a module's stated
 * purpose and its navigation entry cannot drift apart.
 */
export function ModulePlaceholder({
  href,
  willContain,
}: {
  href: string;
  /** The records this module will hold, in the operator's language. */
  willContain: readonly string[];
}) {
  const item = findNavItem(href);

  if (!item) {
    throw new Error(
      `ModulePlaceholder received "${href}", which is not in the navigation model. Add it to features/navigation/nav-model.ts.`,
    );
  }

  return (
    <>
      <PageHeader
        title={item.label}
        description={item.summary}
        meta={
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <StatusBadge tone="pending">Not yet built</StatusBadge>
            <span className="text-ink-subtle font-mono text-xs">
              {phaseLabel(item.activatesIn)} · {item.screenId}
            </span>
          </div>
        }
      />

      <PageBody>
        <EmptyState
          title="This module activates in a later phase."
          description={
            <div className="space-y-3">
              <p>
                Phase 00 establishes the foundation only: the shell, the design system, the testing
                and CI apparatus, and a static Command Center that proves the information
                architecture. This route exists so that structure is visible and navigable now,
                rather than appearing later as a surprise.
              </p>
              <div>
                <p className="text-ink font-medium">When built, this module will hold:</p>
                <ul className="mt-1.5 list-disc space-y-1 pl-5">
                  {willContain.map((entry) => (
                    <li key={entry}>{entry}</li>
                  ))}
                </ul>
              </div>
            </div>
          }
        />
      </PageBody>
    </>
  );
}
