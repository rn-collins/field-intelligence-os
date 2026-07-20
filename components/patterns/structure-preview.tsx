import { cn } from "@/lib/utils/cn";

/**
 * An abstract diagram of a module's record structure.
 *
 * Placeholders must show what a module *is* without inventing what it will
 * *contain*. Fake people, fake claims and fake evidence would be worse here
 * than an empty box: this is an evidentiary system, and a demonstration record
 * that looks like a source is the beginning of a provenance failure. So this
 * renders relationships between record *types* — never instances.
 *
 * The API enforces that. It accepts only strings naming types and the
 * relationships between them; there is no slot for a record, a name, a date or
 * a value, so a synthetic person cannot be passed in even by accident.
 */

export type StructureNode = {
  /** The record type, in the operator's language. */
  readonly label: string;
  /** What this type holds. Descriptive, never an example value. */
  readonly holds?: string;
};

export function StructurePreview({
  caption,
  chain,
  className,
}: {
  /** One line describing the shape, e.g. "How a claim earns its status". */
  caption: string;
  /** Record types in the order they connect. */
  chain: readonly StructureNode[];
  className?: string;
}) {
  return (
    <figure className={cn("space-y-3", className)}>
      <figcaption className="text-ink-muted text-xs font-medium tracking-wide uppercase">
        {caption}
      </figcaption>

      <ol className="flex flex-wrap items-stretch gap-2">
        {chain.map((node, index) => (
          <li key={node.label} className="flex items-stretch gap-2">
            <div className="border-border bg-surface-sunken min-w-0 rounded-md border px-3 py-2">
              <p className="text-ink text-sm font-medium">{node.label}</p>
              {node.holds && <p className="text-ink-subtle mt-0.5 text-xs">{node.holds}</p>}
            </div>

            {index < chain.length - 1 && (
              <span aria-hidden="true" className="text-ink-subtle self-center text-sm select-none">
                →
              </span>
            )}
          </li>
        ))}
      </ol>
    </figure>
  );
}
