"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CloseIcon } from "@/components/ui/icons";
import { isActiveRoute, MOBILE_MENU_SECTIONS } from "@/features/navigation/nav-model";
import { cn } from "@/lib/utils/cn";

/**
 * The "More" sheet: every module not in the mobile tab bar.
 *
 * Built on the native `<dialog>` element with `showModal()`, which the platform
 * gives focus trapping, `Escape`-to-close, background inertness and top-layer
 * rendering for free.
 *
 * That choice is deliberate. ADR-006 declined a component library for Phase 00,
 * noting that hand-rolled dialogs are exactly where accessibility breaks. Rather
 * than reverse that decision mid-phase or hand-roll a focus trap — which is
 * fiddly to get right and easy to get subtly wrong — this uses the element the
 * platform already implements correctly.
 *
 * Focus return to the trigger is the one piece `<dialog>` does not guarantee
 * across engines when closed programmatically, so it is handled explicitly.
 */
export function ModuleMenu({ label = "More" }: { label?: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  // Close on navigation: without this the sheet would stay open over the page
  // the user just asked for.
  useEffect(() => {
    close();
  }, [pathname, close]);

  const handleClose = useCallback(() => {
    setOpen(false);
    // Return focus to the trigger so keyboard users are not dropped at the top
    // of the document.
    triggerRef.current?.focus();
  }, []);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          dialogRef.current?.showModal();
          setOpen(true);
        }}
        className={cn(
          "flex h-14 w-full flex-col items-center justify-center gap-1 px-1 text-center text-[0.6875rem] leading-tight",
          open ? "text-nav-active font-semibold" : "text-ink-muted",
        )}
      >
        <span className="truncate">{label}</span>
        <span
          aria-hidden="true"
          className={cn("h-0.5 w-6 rounded-full", open ? "bg-nav-active" : "bg-transparent")}
        />
      </button>

      <dialog
        ref={dialogRef}
        aria-label="All modules"
        onClose={handleClose}
        // Clicking the backdrop closes. The dialog element itself fills only
        // part of the viewport, so a click landing on the element target rather
        // than a child means the backdrop was hit.
        onClick={(event) => {
          if (event.target === dialogRef.current) close();
        }}
        className={cn(
          "bg-surface text-ink m-0 mt-auto max-h-[85dvh] w-full max-w-none rounded-t-lg p-0",
          "backdrop:bg-ink/40",
        )}
      >
        <div className="border-border flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-ink text-sm font-semibold">All modules</h2>
          <button
            type="button"
            onClick={close}
            className="text-ink-muted hover:text-ink flex h-11 w-11 items-center justify-center rounded-md"
          >
            <CloseIcon width={18} height={18} />
            <span className="sr-only">Close menu</span>
          </button>
        </div>

        <nav
          aria-label="All modules"
          className="overflow-y-auto px-2 py-3 pb-[env(safe-area-inset-bottom)]"
        >
          <ul className="space-y-5">
            {MOBILE_MENU_SECTIONS.map((section) => (
              <li key={section.id}>
                <h3 className="text-ink-subtle px-3 pb-1.5 text-[0.6875rem] font-semibold tracking-[0.08em] uppercase">
                  {section.label}
                </h3>
                <ul>
                  {section.items.map((item) => {
                    const active = isActiveRoute(item.href, pathname);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          {...(active ? { "aria-current": "page" as const } : {})}
                          onClick={close}
                          className={cn(
                            "flex min-h-11 items-center rounded-md px-3 py-2.5 text-sm",
                            active
                              ? "bg-surface-sunken text-ink font-semibold"
                              : "text-ink-muted hover:bg-surface-sunken hover:text-ink",
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
      </dialog>
    </>
  );
}
