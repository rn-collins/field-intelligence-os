import type { SVGProps } from "react";

/**
 * Minimal inline icon set.
 *
 * Hand-written rather than pulled from an icon package: Phase 00 needs eight
 * glyphs, and the status icons must be distinguishable by *shape* alone for the
 * non-colour-only requirement in `docs/standards/UI_STANDARD.md`. A stock set
 * optimised for visual consistency tends to work against that.
 *
 * All icons are decorative — they always sit beside a text label — so they are
 * `aria-hidden` and contribute nothing to the accessibility tree.
 */

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

/** Verified — a check. */
export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 8.5 6.2 11.7 13 4.9" />
    </Icon>
  );
}

/** Pending or needs attention — an exclamation in a triangle. */
export function AlertIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8 2.2 14.6 13.4H1.4z" />
      <path d="M8 6.4v3.1" />
      <path d="M8 11.6h.01" />
    </Icon>
  );
}

/** Disputed — crossed lines. */
export function DisputedIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="8" cy="8" r="6.2" />
      <path d="M5.8 5.8 10.2 10.2" />
      <path d="M10.2 5.8 5.8 10.2" />
    </Icon>
  );
}

/** Restricted — a closed padlock. */
export function LockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.2" y="7.2" width="9.6" height="6.6" rx="1.2" />
      <path d="M5.6 7.2V5.2a2.4 2.4 0 0 1 4.8 0v2" />
    </Icon>
  );
}

/** Neutral or draft — a hollow circle. */
export function CircleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="8" cy="8" r="5.4" />
    </Icon>
  );
}

/** Blocked — a horizontal bar. */
export function BlockedIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="8" cy="8" r="6.2" />
      <path d="M4.6 8h6.8" />
    </Icon>
  );
}

/** In progress — a half-filled ring. */
export function ProgressIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="8" cy="8" r="5.4" />
      <path d="M8 2.6A5.4 5.4 0 0 1 8 13.4z" fill="currentColor" stroke="none" />
    </Icon>
  );
}

/** Demonstration data marker — a flask. */
export function FlaskIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6.4 2v4.2L2.9 12.2A1.2 1.2 0 0 0 3.95 14h8.1a1.2 1.2 0 0 0 1.05-1.8L9.6 6.2V2" />
      <path d="M5.4 2h5.2" />
      <path d="M4.8 10.2h6.4" />
    </Icon>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2.4 4.4h11.2" />
      <path d="M2.4 8h11.2" />
      <path d="M2.4 11.6h11.2" />
    </Icon>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 4l8 8" />
      <path d="M12 4l-8 8" />
    </Icon>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 8h10" />
      <path d="M9.2 4.2 13 8l-3.8 3.8" />
    </Icon>
  );
}

/** Field Mode — a signal/antenna mark. */
export function FieldIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="8" cy="8" r="1.6" />
      <path d="M4.8 4.8a4.5 4.5 0 0 0 0 6.4" />
      <path d="M11.2 11.2a4.5 4.5 0 0 0 0-6.4" />
      <path d="M2.6 2.6a7.6 7.6 0 0 0 0 10.8" />
      <path d="M13.4 13.4a7.6 7.6 0 0 0 0-10.8" />
    </Icon>
  );
}
