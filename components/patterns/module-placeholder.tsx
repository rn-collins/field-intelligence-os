import { PageBody, PageHeader } from "@/components/layout/app-shell";
import { PreviewBadge } from "@/components/ui/preview-badge";
import { findNavItem } from "@/features/navigation/nav-model";
import { StructurePreview, type StructureNode } from "./structure-preview";

/**
 * A module that is designed but not yet active.
 *
 * Three rules, each fixing a defect found in audit:
 *
 * 1. **No fake data.** The module shows its record *structure*, never sample
 *    records. See `StructurePreview`.
 * 2. **No fake controls.** A disabled "New person" button implies the feature is
 *    one permission away from working, which is a lie.
 * 3. **No engineering metadata in the product UI.** Phase numbers and SCR
 *    identifiers describe the build, not the user's work. They are emitted as
 *    `data-*` attributes for the developer route and tests to read, and are no
 *    longer rendered as user-facing text.
 */
export function ModulePlaceholder({
  href,
  purpose,
  caption,
  chain,
}: {
  href: string;
  /** What this module will let the user do, in their language. */
  purpose: string;
  /** One line describing the structure diagram. */
  caption: string;
  /** The record types this module connects. */
  chain: readonly StructureNode[];
}) {
  const item = findNavItem(href);

  if (!item) {
    throw new Error(
      `ModulePlaceholder received "${href}", which is not in the navigation model. Add it to features/navigation/nav-model.ts.`,
    );
  }

  return (
    <div data-module={href} data-activates-in={item.activatesIn} data-screen-id={item.screenId}>
      <PageHeader
        title={item.label}
        description={item.summary}
        meta={
          <div className="pt-1">
            <PreviewBadge>Not built yet</PreviewBadge>
          </div>
        }
      />

      <PageBody>
        <div className="border-border bg-surface space-y-6 rounded-lg border border-dashed px-5 py-6">
          <div className="space-y-1.5">
            <h2 className="text-ink text-base font-semibold">What this will do</h2>
            <p className="text-ink-muted max-w-prose text-sm leading-relaxed">{purpose}</p>
          </div>

          <StructurePreview caption={caption} chain={chain} />

          <p className="text-ink-subtle text-xs">
            Preview only. This workflow is not active yet, and nothing here is saved.
          </p>
        </div>
      </PageBody>
    </div>
  );
}
