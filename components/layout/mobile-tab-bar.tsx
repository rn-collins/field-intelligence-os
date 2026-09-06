"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FieldIcon } from "@/components/ui/icons";
import { isActiveRoute, MOBILE_PRIMARY } from "@/features/navigation/nav-model";
import { cn } from "@/lib/utils/cn";
import { ModuleMenu } from "./module-menu";

/**
 * Mobile navigation: Home · Deployments · Capture · Search · More.
 *
 * `docs/standards/UI_STANDARD.md` requires one-handed use within two to three
 * taps, so navigation sits at the bottom of the viewport rather than behind a
 * top-corner menu.
 *
 * The fifth slot is a menu rather than a fifth module. An earlier revision put
 * five modules here and left the other eight with no mobile route at all —
 * Claims, Evidence, Systems, Assets, Outputs, Organizations, Canon and Settings
 * were simply unreachable on a phone. Every module is now within two taps.
 *
 * "Capture" is Field Mode, kept to one tap: it is the thing you need while
 * standing in the cold, and it must never be behind a menu.
 *
 * Targets are 56px tall — above the WCAG 2.2 AA 24px minimum and the 44px
 * commonly used for touch, because the realistic operating condition is a
 * moving vehicle or a cold street, not a desk.
 */
export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      data-fixed-root=""
      className="border-border bg-surface fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="flex">
        {MOBILE_PRIMARY.map((item) => {
          if (item.kind === "menu") {
            return (
              <li key={item.label} className="min-w-0 flex-1">
                <ModuleMenu label={item.label} />
              </li>
            );
          }

          const href = item.href!;
          const active = isActiveRoute(href, pathname);

          return (
            <li key={item.label} className="min-w-0 flex-1">
              <Link
                href={href}
                {...(active ? { "aria-current": "page" as const } : {})}
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-1 px-1 text-center text-[0.6875rem] leading-tight",
                  active ? "text-nav-active font-semibold" : "text-ink-muted",
                )}
              >
                {href === "/field" && <FieldIcon width={18} height={18} />}
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
