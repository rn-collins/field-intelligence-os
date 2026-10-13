# State Taxonomy

Every screen in Field Intelligence OS resolves to one of the states below. This
document defines each: what it means, how its copy should read, how it behaves
for assistive technology, its icon and color semantics, the next action it
offers, and — critically for this product — what it must **not** reveal.

The distinctions are not pedantic. In an evidentiary, source-protecting system,
"restricted" and "not found" and "you are not authorized" are three different
facts, and collapsing them leaks information or misleads the operator. "Missing"
and "not synchronized" are three keystrokes apart and opposite in meaning: one
says the record is gone, the other says your work is safe but still on the
device.

Components exist today for the states marked **built**. The rest are **specified**
— they require Phase 01 auth or Phase 04 sync to be meaningful, and building
them earlier would mean a control with nothing behind it.

---

## empty — built (`EmptyState`)

- **Meaning**: the query succeeded; there is nothing to show yet.
- **Copy**: name what would appear here and how it gets created. Never "no data".
- **ARIA**: none special; a normal heading and body.
- **Icon/color**: neutral (hollow circle, `ink-subtle`). Not an error color.
- **Next action**: the primary create action, if the user can create here.
- **Must not reveal**: nothing sensitive; empty is not sensitive.

## loading — built (`LoadingState`)

- **Meaning**: a request is in flight.
- **Copy**: "Loading <thing>…"; name the thing.
- **ARIA**: `role="status"`, `aria-live="polite"` — announced without interrupting.
- **Icon/color**: neutral spinner.
- **Next action**: none; do not offer retry mid-load.
- **Must not reveal**: nothing; do not preview partial protected content.

## success — built (`SuccessState`)

- **Meaning**: an action completed.
- **Copy**: state what was saved or done, plainly.
- **ARIA**: `role="status"` (polite) — success is not urgent.
- **Icon/color**: check, `status-verified`. Paired with text; never color-only.
- **Next action**: the natural next step, at most one.
- **Must not reveal**: nothing beyond confirmation.

## validation error — specified

- **Meaning**: the user's input is not acceptable; the system is fine.
- **Copy**: what is wrong and how to fix it, per field. Not "invalid input".
- **ARIA**: error text tied to the field via `aria-describedby`; `aria-invalid`.
- **Icon/color**: `status-disputed`, at the field, not the page.
- **Next action**: correct the field; nothing is lost.
- **Must not reveal**: whether a value matched an existing protected record —
  "no account with that email" is an enumeration leak.

## recoverable system error — built (`ErrorState`, global `error.tsx`)

- **Meaning**: something failed; retrying may work; no data was changed.
- **Copy**: "This could not be displayed. No data was changed." Offer a reference.
- **ARIA**: `role="alert"` — this one is urgent.
- **Icon/color**: `status-disputed`.
- **Next action**: retry, **only when retry is meaningful**. A deterministic
  failure should not offer a button that will fail identically.
- **Must not reveal**: stack traces, error messages, SQL, source content. Only an
  opaque `error.digest` for log correlation. An error string in this app can
  contain a source name or an unpublished claim.

## fatal error — specified

- **Meaning**: unrecoverable; retry will not help.
- **Copy**: say so honestly; give a way to report and a way out (home).
- **ARIA**: `role="alert"`.
- **Next action**: navigate away, not retry.
- **Must not reveal**: as recoverable error.

## unauthorized — specified (Phase 01)

- **Meaning**: you are not signed in, or your session expired.
- **Copy**: "Sign in to continue." About the session, not the record.
- **Next action**: sign in, preserving intended destination.
- **Must not reveal**: whether the target record exists. Unauthorized is about
  the viewer, and it must look identical whether or not the record is there.

## restricted — built (`RestrictedState`)

- **Meaning**: you are authenticated, but your role may not see this record.
- **Copy**: "Your role does not include access to this record." Nothing more.
- **ARIA**: not an `alert` — restriction is correct behavior, not a fault.
- **Icon/color**: lock, `status-restricted`.
- **Next action**: a request-access path if one exists; otherwise none.
- **Must not reveal**: the record's contents, size, subject, or even its precise
  existence beyond "restricted". Over-explaining leaks the shape of protected
  material. `unauthorized` and `restricted` are deliberately distinct: the first
  is about the viewer's session, the second about the record's permissions.

## missing — specified

- **Meaning**: no such record — it never existed or was removed.
- **Copy**: "There is no record at this address." Offer a safe destination.
- **Next action**: go somewhere real (Command Center).
- **Must not reveal**: whether a restricted record exists at that address. Where
  disclosing existence is itself sensitive, `missing` and `restricted` must be
  indistinguishable to an unauthorized viewer.

## offline — specified (Phase 04)

- **Meaning**: no connectivity. Distinct from a server error — the server is
  fine; the network is absent.
- **Copy**: "You are offline. Captures are saved on this device and will sync
  when you reconnect." Reassure, do not alarm.
- **ARIA**: `role="status"`; persistent, not a one-time alert.
- **Icon/color**: `sync-offline`.
- **Next action**: keep working; capture continues.
- **Must not reveal**: nothing; but must not imply work was lost.

## syncing — specified (Phase 04)

- **Meaning**: queued records are being sent.
- **Copy**: "Syncing N records…"
- **ARIA**: `role="status"`, polite.
- **Icon/color**: `sync-pending`.
- **Next action**: none required; non-blocking.
- **Must not reveal**: nothing.

## queued — specified (Phase 04)

- **Meaning**: captured, saved locally, not yet sent. The honest unsynced count.
- **Copy**: "N records waiting to sync." Never silently zero.
- **Icon/color**: `sync-pending`.
- **Next action**: sync now, if the user wants to force it.
- **Must not reveal**: nothing; the point is transparency about what has not left
  the device.

## sync conflict — specified (Phase 04)

- **Meaning**: the same record changed in two places; both versions are kept.
- **Copy**: "This record changed in two places. Both are kept — choose which to
  keep, or merge." A field capture is never silently overwritten.
- **ARIA**: `role="alert"` when it requires a decision.
- **Icon/color**: `sync-conflict`.
- **Next action**: resolve — choose or merge. Never auto-resolve destructively.
- **Must not reveal**: nothing; but must preserve both versions until resolved.

## demonstration / preview — built (`DemoDataBanner`, `PreviewBadge`)

- **Meaning**: this data is a sample, or this feature is not built. Distinct from
  every record status above — it is about the *software and data*, not a record.
- **Copy**: "Phase 00 preview · demonstration data · changes are not saved," or
  "Not built yet."
- **Icon/color**: `preview` token, deliberately outside the record-status palette.
- **Next action**: none; it is a notice.
- **Must not reveal**: nothing; but must never be dismissible, so it cannot be
  turned off and forgotten.

---

## Cross-cutting rules

1. **Color is never the only signal.** Every state pairs an icon shape and text
   with its color, per `docs/standards/UI_STANDARD.md`.
2. **Restriction is not error.** Denied access to a protected record is the
   system working correctly.
3. **Never imply lost work.** Offline and queued states must reassure that
   captures are safe on the device.
4. **Never leak existence.** Where the presence of a record is itself sensitive,
   unauthorized / restricted / missing must be indistinguishable to a viewer who
   is not entitled to know.
