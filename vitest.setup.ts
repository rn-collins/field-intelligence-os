import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
});

/**
 * jsdom does not implement `matchMedia`. The application shell reads it for
 * `prefers-reduced-motion` and `prefers-color-scheme`, so component tests need
 * a stub. Defaults to "does not match" — i.e. motion allowed, light scheme.
 */
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});
