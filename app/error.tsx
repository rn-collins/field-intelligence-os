"use client";

import { useEffect } from "react";
import { PageBody, PageHeader } from "@/components/layout/app-shell";
import { ErrorState } from "@/components/ui/states";

/**
 * Global error boundary.
 *
 * `error.digest` is the only identifier shown. `docs/standards/CODING_STANDARD.md`
 * forbids logging or displaying secrets or protected content, and an error
 * message in this application can easily contain a source name or the text of
 * an unpublished claim. The digest lets an operator correlate with server logs
 * without putting any of that on screen.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled application error", error.digest ?? "(no digest)");
  }, [error]);

  return (
    <>
      <PageHeader title="Something went wrong" />
      <PageBody>
        <ErrorState
          title="This screen could not be displayed."
          description={
            <div className="space-y-3">
              <p>
                No data was changed. If this keeps happening, quote the reference below when
                reporting it.
              </p>
              {error.digest && (
                <p className="text-ink-subtle font-mono text-xs">Reference: {error.digest}</p>
              )}
            </div>
          }
          action={
            <button
              type="button"
              onClick={reset}
              className="bg-action text-action-contrast hover:bg-action-hover rounded-md px-4 py-2 text-sm font-semibold"
            >
              Try again
            </button>
          }
        />
      </PageBody>
    </>
  );
}
