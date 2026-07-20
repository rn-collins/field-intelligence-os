import Link from "next/link";
import type { ReactNode } from "react";
import { FieldIcon } from "@/components/ui/icons";
import { MobileTabBar } from "./mobile-tab-bar";
import { SidebarNav } from "./sidebar-nav";

/**
 * The application shell: a persistent desktop sidebar, a mobile bottom tab bar,
 * and a single `<main>` landmark that every page fills.
 *
 * Kept as a server component — only the two navigation components need the
 * current pathname — so no page ships JavaScript it does not use.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only-focusable bg-accent text-accent-contrast focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
      >
        Skip to main content
      </a>

      <div className="lg:flex">
        <header className="border-border bg-surface hidden shrink-0 border-r lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-64 lg:flex-col">
          <div className="border-border border-b px-5 py-4">
            <Link href="/" className="block">
              <span className="text-ink block text-sm font-semibold tracking-tight">
                Field Intelligence OS
              </span>
              <span className="text-ink-subtle block font-mono text-[0.6875rem]">
                Phase 00 · foundation
              </span>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-4">
            <SidebarNav />
          </div>

          <div className="border-border border-t p-3">
            <Link
              href="/field"
              className="border-border hover:bg-surface-sunken text-ink flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium"
            >
              <FieldIcon className="text-accent" />
              Field Mode
            </Link>
          </div>
        </header>

        {/* Mobile header: the sidebar is replaced by the bottom tab bar. */}
        <div className="border-border bg-surface sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3 lg:hidden">
          <Link href="/" className="text-ink text-sm font-semibold tracking-tight">
            Field Intelligence OS
          </Link>
          <span className="text-ink-subtle font-mono text-[0.6875rem]">Phase 00</span>
        </div>

        <main id="main" tabIndex={-1} className="min-w-0 flex-1 pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      <MobileTabBar />
    </div>
  );
}

/** Standard page frame: heading, optional description, then content. */
export function PageHeader({
  title,
  description,
  meta,
}: {
  title: string;
  description?: string;
  meta?: ReactNode;
}) {
  return (
    <div className="border-border border-b px-5 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-5xl space-y-2">
        <h1 className="text-ink text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {description && (
          <p className="text-ink-muted max-w-prose text-sm sm:text-base">{description}</p>
        )}
        {meta}
      </div>
    </div>
  );
}

export function PageBody({ children }: { children: ReactNode }) {
  return (
    <div className="px-5 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-5xl space-y-6">{children}</div>
    </div>
  );
}
