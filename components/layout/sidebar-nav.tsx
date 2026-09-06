"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActiveRoute, NAV_SECTIONS } from "@/features/navigation/nav-model";
import { cn } from "@/lib/utils/cn";

/**
 * Desktop navigation.
 *
 * A client component only because the active route must be highlighted;
 * everything else in the shell stays on the server.
 *
 * `aria-current="page"` carries the active state for assistive technology, and
 * a left rule plus a weight change carry it visually, so the state does not
 * depend on the background tint alone.
 */
export function SidebarNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className={className}>
      <ul className="space-y-6">
        {NAV_SECTIONS.map((section) => (
          <li key={section.id}>
            <h2 className="text-ink-subtle px-3 pb-1.5 text-[0.6875rem] font-semibold tracking-[0.08em] uppercase">
              {section.label}
            </h2>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActiveRoute(item.href, pathname);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      {...(active ? { "aria-current": "page" as const } : {})}
                      className={cn(
                        "block rounded-md border-l-2 py-1.5 pr-3 pl-2.5 text-sm transition-colors",
                        active
                          ? "border-l-nav-active bg-surface-sunken text-ink font-semibold"
                          : "text-ink-muted hover:bg-surface-sunken hover:text-ink border-l-transparent",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}
