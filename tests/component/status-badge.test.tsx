import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";

const TONES: StatusTone[] = [
  "verified",
  "pending",
  "disputed",
  "restricted",
  "neutral",
  "blocked",
  "in-progress",
];

describe("StatusBadge", () => {
  /**
   * `docs/standards/UI_STANDARD.md`: verification, consent and restriction
   * states "must be visible and never color-only".
   */
  it.each(TONES)("renders a readable text label for the %s tone", (tone) => {
    render(<StatusBadge tone={tone}>Verification state</StatusBadge>);

    expect(screen.getByText("Verification state")).toBeInTheDocument();
  });

  it.each(TONES)("pairs the %s tone with an icon", (tone) => {
    const { container } = render(<StatusBadge tone={tone}>State</StatusBadge>);

    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("hides the decorative icon from assistive technology", () => {
    // The icon duplicates the adjacent label; announcing it would be noise.
    const { container } = render(<StatusBadge tone="verified">Verified</StatusBadge>);
    const svg = container.querySelector("svg");

    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("distinguishes tones by icon shape, not only by colour", () => {
    const paths = TONES.map((tone) => {
      const { container, unmount } = render(<StatusBadge tone={tone}>State</StatusBadge>);
      const markup = container.querySelector("svg")?.innerHTML ?? "";
      unmount();
      return markup;
    });

    // `pending` and `in-progress` share a colour token, `disputed` and
    // `blocked` likewise — so their glyphs must differ.
    expect(new Set(paths).size).toBe(TONES.length);
  });
});
