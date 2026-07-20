"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FieldIcon } from "@/components/ui/icons";
import { isActiveRoute, MOBILE_TAB_ITEMS } from "@/features/navigation/nav-model";
import { cn } from "@/lib/utils/cn";

/**
 * Mobile navigation.
 *
 * `docs/standards/UI_STANDARD.md` requires one-handed use within two to three
 * taps, so navigation sits at the bottom of the viewport rather than behind a
 * top-corner menu, and Field Mode is a permanent destination rather than
 * something to be found.
 *
 * Targets are 56px tall — above the WCAG 2.2 AA 24px minimum and the 44px
 * commonly used for touch, because the realistic operating condition is a
 * moving vehicle or a cold street, not a desk.
 */
export function MobileTabBar() {
  const pathname = usePathname();

  const items = [
    ...MOBILE_TAB_ITEMS.map((item) => ({ href: item.href, label: item.label, field: false })),
    { href: "/field", label: "Field", field: true },
  ];

  return (
    <nav
      aria-label="Primary"
      className="border-border bg-surface fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="flex">
        {items.map((item) => {
          const active = isActiveRoute(item.href, pathname);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                {...(active ? { "aria-current": "page" as const } : {})}
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-1 px-1 text-center text-[0.6875rem] leading-tight",
                  active ? "text-nav-active font-semibold" : "text-ink-muted",
                )}
              >
                {item.field && <FieldIcon width={18} height={18} />}
                <span className="truncate">{item.label}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-0.5 w-6 rounded-full",
                    active ? "bg-nav-active" : "bg-transparent",
                  )}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
