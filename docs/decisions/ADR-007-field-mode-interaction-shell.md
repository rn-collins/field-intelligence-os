# ADR-007: Field Mode is a distinct interaction shell

- Status: Accepted (architecture direction; implementation is Phase 04)
- Date: 2026-07-20

## Context

Phase 00 renders Field Mode inside the standard application shell — the same
sidebar, the same chrome, the same layout as the desktop research surface. That
is correct for a static entry point whose only job is to prove the route and the
touch-target sizing exist.

It would be wrong as the real thing. Field Mode is used in conditions the
research surface never sees: one hand, direct sunlight or near-darkness,
gloves, a moving vehicle, no signal, and no time. A dashboard shell optimized
for depth is the opposite of what that moment needs.

## Decision

**Field Mode will not reuse the standard dashboard shell.** It is a separate
interaction surface with its own layout, chrome and interaction rules.

Required properties of the Phase 04 implementation:

- **Minimal chrome** — the capture action dominates; navigation recedes.
- **One-handed operation** — primary actions within thumb reach, bottom-weighted.
- **Immediate record-now action** — the first and largest control captures now;
  everything else is secondary.
- **Audio-first capture** — speaking is faster than typing in the field, so
  voice is a first-class input, not a fallback.
- **Visible sync and connection state** — the operator always knows whether they
  are online and whether their work has left the device.
- **Unsynced-record count** — a persistent, honest count of what is captured but
  not yet synchronized. Never zero by omission.
- **Offline queue** — capture works with no connectivity and queues locally.
- **Conflict-safe sync** — on reconnect, conflicts preserve both versions and
  surface a decision. A field capture is never silently overwritten or dropped,
  because it usually cannot be recreated.
- **High-glare / daylight mode** — maximum contrast for direct sun.
- **Low-light mode** — dark, dim, red-shifted where possible for night use.
- **Large controls** — well above the 44px baseline; usable with gloves.
- **Haptic and audio confirmation** — where the platform supports it, so the
  operator knows a capture registered without looking.
- **Preserved deployment context** — the active deployment, target and consent
  state travel into Field Mode; the operator does not re-establish context.
- **Classify-later workflow** — capture first, tag and link afterward. The field
  is for capture; classification is desk work.

## Consequences

- Field Mode gets its own layout, not the `AppShell`. The Phase 00 page will be
  replaced, not extended.
- Theme support must include high-glare and low-light as real modes, not just
  light/dark. Recorded in `docs/design/VISUAL_LANGUAGE.md` (F7).
- The offline queue and conflict resolution are a significant subsystem; they
  are Phase 04+ and depend on the schema from Phase 01.
- The minimum capture package (`docs/phases/PHASE-04-MINIMUM-CAPTURE-PACKAGE.md`)
  is the content this shell presents.

## Alternatives rejected

- **Reuse the dashboard shell with responsive tweaks.** Rejected: the operating
  conditions differ in kind, not degree. Sunlight legibility and one-handed
  reach are not media queries on a research layout.
- **A separate native app.** Rejected for now: the stack is a web app (per
  `AGENTS.md`), and a well-built offline-capable web surface meets the Phase 04
  need without a second codebase. Revisit only if a hard device capability
  (background audio, reliable offline media handling) proves unmet.
