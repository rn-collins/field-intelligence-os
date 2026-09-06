/**
 * The single source of truth for application navigation.
 *
 * Sidebar, mobile tab bar, breadcrumbs, page headings and every module
 * placeholder read from this model, so a route cannot exist in the navigation
 * without a page, or carry a stale "activates in Phase N" label. Both of those
 * invariants are asserted in `tests/unit/nav-model.test.ts`.
 *
 * Route vocabulary follows the canonical entity nouns in `PROJECT_MEMORY.md`
 * (Organization, Interaction, Asset) rather than the v1.0 screen inventory's
 * `/institutions`, `/archive/ingest`. See `docs/decisions/ADR-005-route-vocabulary.md`
 * and `docs/build/OPEN_QUESTIONS.md` #10.
 *
 * Phase numbers follow `docs/BUILD_ORDER.md`, which agrees with
 * `PROJECT_MEMORY.md`. See `docs/build/OPEN_QUESTIONS.md` #11.
 */

export const BUILD_PHASES = {
  "00": "Foundation",
  "01": "Auth, schema and RLS",
  "02": "Command Center and deployments",
  "03": "People, organizations and relationships",
  "04": "Interviews, consent and Field Mode",
  "05": "Claims, evidence, law and systems",
  "06": "Assets, Drive links and ingest",
  "07": "Search, retrieval and reviewed AI",
  "08": "Outputs, mirror and launch hardening",
} as const;

export type PhaseId = keyof typeof BUILD_PHASES;

export type NavItem = {
  /** Route path. Must correspond to a real page. */
  readonly href: string;
  /** Sidebar and heading label. */
  readonly label: string;
  /** One line describing what the module is for, shown on its placeholder. */
  readonly summary: string;
  /** The phase in which this module becomes functional. */
  readonly activatesIn: PhaseId;
  /** Screen ID from the v1.0 spec, kept for traceability. */
  readonly screenId: string;
};

export type NavSection = {
  readonly id: string;
  readonly label: string;
  readonly items: readonly NavItem[];
};

/**
 * `docs/ux/NAVIGATION_AND_SCREEN_MAP.md` lists eleven primary destinations as a
 * flat list. Grouping them into five sections keeps the sidebar scannable and
 * keeps every destination within two taps on mobile, which the flat list would
 * not at this count. The destinations themselves are unchanged.
 */
export const NAV_SECTIONS: readonly NavSection[] = [
  {
    id: "operations",
    label: "Operations",
    items: [
      {
        href: "/",
        label: "Command Center",
        summary: "What matters now across every active deployment.",
        activatesIn: "02",
        screenId: "SCR-01",
      },
      {
        href: "/deployments",
        label: "Deployments",
        summary: "Plan, run and close field deployments from one workspace.",
        activatesIn: "02",
        screenId: "SCR-02",
      },
    ],
  },
  {
    id: "field-record",
    label: "Field record",
    items: [
      {
        href: "/people",
        label: "People",
        summary: "Sources, participants and collaborators, with relationship history.",
        activatesIn: "03",
        screenId: "SCR-05",
      },
      {
        href: "/organizations",
        label: "Organizations",
        summary: "Institutions, outlets and bodies, and the roles people hold in them.",
        activatesIn: "03",
        screenId: "SCR-05",
      },
      {
        href: "/interactions",
        label: "Interactions",
        summary: "Interviews and encounters, with ground rules, consent and cognition updates.",
        activatesIn: "04",
        screenId: "SCR-06",
      },
    ],
  },
  {
    id: "verification",
    label: "Verification",
    items: [
      {
        href: "/claims",
        label: "Claims",
        summary: "One exact assertion per record, held separately from its support.",
        activatesIn: "05",
        screenId: "SCR-07",
      },
      {
        href: "/evidence",
        label: "Evidence & law",
        summary: "Sources that support or challenge a claim, with limitations preserved.",
        activatesIn: "05",
        screenId: "SCR-08",
      },
      {
        href: "/systems",
        label: "Systems",
        summary: "Reconstructed workflows: actors, rules, handoffs, exceptions, consequences.",
        activatesIn: "05",
        screenId: "SCR-09",
      },
    ],
  },
  {
    id: "archive",
    label: "Archive and output",
    items: [
      {
        href: "/assets",
        label: "Media & assets",
        summary: "Provenance, permissions and context for every captured file.",
        activatesIn: "06",
        screenId: "SCR-11",
      },
      {
        href: "/outputs",
        label: "Outputs",
        summary: "Turn a locked source set into a controlled publication.",
        activatesIn: "08",
        screenId: "SCR-13",
      },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    items: [
      {
        href: "/search",
        label: "Search",
        summary: "Retrieval across structured, textual, graph and geographic records.",
        activatesIn: "07",
        screenId: "SCR-12",
      },
      {
        href: "/library",
        label: "Canon & standards",
        summary: "The field manual, capture cards and consent language, kept inside the product.",
        activatesIn: "08",
        screenId: "SCR-14",
      },
      {
        href: "/settings",
        label: "Settings",
        summary: "Workspace, roles and integrations, without exposing secrets.",
        activatesIn: "01",
        screenId: "SCR-15",
      },
    ],
  },
] as const;

/** Routes that exist as pages but are reached from within a module, not the nav. */
export const SUB_ROUTES: readonly NavItem[] = [
  {
    href: "/assets/ingest",
    label: "Ingest",
    summary: "Protect and convert raw field media into searchable records.",
    activatesIn: "06",
    screenId: "SCR-10",
  },
  {
    href: "/field",
    label: "Field Mode",
    summary: "One-handed capture for use in the field, on limited connectivity.",
    activatesIn: "04",
    screenId: "SCR-04",
  },
] as const;

export const ALL_NAV_ITEMS: readonly NavItem[] = NAV_SECTIONS.flatMap((section) => section.items);

export const ALL_ROUTES: readonly NavItem[] = [...ALL_NAV_ITEMS, ...SUB_ROUTES];

/**
 * Mobile primary navigation: Home · Deployments · Capture · Search · More.
 *
 * An earlier revision exposed five modules in the tab bar and left the other
 * eight unreachable from mobile entirely — Claims, Evidence, Systems, Assets,
 * Outputs, Organizations, Canon and Settings simply could not be opened on a
 * phone. Five slots cannot hold thirteen destinations, so the fifth is a menu
 * rather than a thirteenth compromise.
 *
 * "Capture" routes to Field Mode, keeping it one tap (B2).
 */
export type MobilePrimaryItem = {
  readonly label: string;
  /** Absent for the menu trigger, which opens a sheet rather than navigating. */
  readonly href?: string;
  readonly kind: "route" | "menu";
};

export const MOBILE_PRIMARY: readonly MobilePrimaryItem[] = [
  { label: "Home", href: "/", kind: "route" },
  { label: "Deployments", href: "/deployments", kind: "route" },
  { label: "Capture", href: "/field", kind: "route" },
  { label: "Search", href: "/search", kind: "route" },
  { label: "More", kind: "menu" },
] as const;

/** Every module reachable from the "More" sheet, grouped as on desktop. */
export const MOBILE_MENU_SECTIONS: readonly NavSection[] = NAV_SECTIONS;

export function findNavItem(href: string): NavItem | undefined {
  return ALL_ROUTES.find((item) => item.href === href);
}

/** True when `href` is the active route, treating "/" as exact-match only. */
export function isActiveRoute(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function phaseLabel(phase: PhaseId): string {
  return `Phase ${phase} — ${BUILD_PHASES[phase]}`;
}
