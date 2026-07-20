import { PageBody, PageHeader } from "@/components/layout/app-shell";
import { DeploymentCard } from "@/components/patterns/deployment-card";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { DemoDataBanner } from "@/components/ui/demo-data-banner";
import { StatusBadge } from "@/components/ui/status-badge";
import { Callout } from "@/components/ui/states";
import { calculateReadiness, overlaps } from "@/features/deployments/readiness";
import { NAV_SECTIONS, phaseLabel } from "@/features/navigation/nav-model";
import { SEED_AS_OF, SEED_DEPLOYMENTS } from "@/lib/seed/deployments";

export const metadata = {
  title: "Command Center",
};

/**
 * SCR-01 — the Command Center.
 *
 * In Phase 00 this is the one screen with real content, and its job is to prove
 * the information architecture: that a deployment resolves into prerequisites,
 * that prerequisites resolve into blockers, and that a blocker names its cause.
 *
 * Everything below is computed from `lib/seed/deployments.ts`. Nothing is
 * hard-coded for effect, which is why the numbers are unflattering — both
 * deployments are early in planning, and they collide on the calendar. That
 * collision is real: it is what `PROJECT_MEMORY.md` records, and surfacing it
 * is exactly what this screen is for.
 */
export default function CommandCenterPage() {
  const deployments = SEED_DEPLOYMENTS;

  const conflicts = deployments.flatMap((a, index) =>
    deployments
      .slice(index + 1)
      .filter((b) => overlaps(a, b))
      .map((b) => [a, b] as const),
  );

  const blockedCount = deployments.reduce(
    (total, deployment) => total + calculateReadiness(deployment).blocked.length,
    0,
  );

  const moduleCount = NAV_SECTIONS.reduce((total, section) => total + section.items.length, 0);

  return (
    <>
      <PageHeader
        title="Command Center"
        description="What matters now across every active deployment."
        meta={
          <p className="text-ink-subtle pt-1 font-mono text-xs">
            {phaseLabel("00")} · showing state as of {SEED_AS_OF}
          </p>
        }
      />

      <PageBody>
        <DemoDataBanner />

        <Callout title="This is a foundation, not a product.">
          Phase 00 delivers the application shell, the design system, the testing and CI apparatus,
          and this static proof of the information architecture. {moduleCount} modules are routed
          and navigable, but none of them read or write data yet. Each one states the phase that
          activates it.
        </Callout>

        {conflicts.length > 0 && (
          <Card as="section" aria-labelledby="alerts-heading">
            <CardHeader className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="alerts-heading" className="text-ink text-base font-semibold">
                Needs a decision
              </h2>
              <StatusBadge tone="blocked">
                {blockedCount} blocked {blockedCount === 1 ? "prerequisite" : "prerequisites"}
              </StatusBadge>
            </CardHeader>
            <CardBody>
              <ul className="space-y-3">
                {conflicts.map(([a, b]) => (
                  <li key={`${a.id}-${b.id}`} className="text-sm">
                    <p className="text-ink font-medium">
                      {a.city} and {b.city} overlap on the calendar.
                    </p>
                    <p className="text-ink-muted mt-0.5 leading-relaxed">
                      {a.city} runs {a.startsOn} to {a.endsOn}; {b.city} runs {b.startsOn} to{" "}
                      {b.endsOn}. Scheduling for both is blocked until the overlap is resolved or
                      one deployment is reassigned.
                    </p>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        )}

        <section aria-labelledby="deployments-heading" className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="deployments-heading" className="text-ink text-base font-semibold">
              Deployments in planning
            </h2>
            <span className="text-ink-subtle font-mono text-xs">{deployments.length} records</span>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            {deployments.map((deployment) => (
              <DeploymentCard key={deployment.id} deployment={deployment} asOf={SEED_AS_OF} />
            ))}
          </div>
        </section>
      </PageBody>
    </>
  );
}
