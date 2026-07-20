import { PageBody, PageHeader } from "@/components/layout/app-shell";
import { DeploymentCard } from "@/components/patterns/deployment-card";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { DemoDataBanner } from "@/components/ui/demo-data-banner";
import { StatusBadge } from "@/components/ui/status-badge";
import { Callout } from "@/components/ui/states";
import { findPendingDecisions, findScheduleConflicts } from "@/features/deployments/decisions";
import { NAV_SECTIONS, phaseLabel } from "@/features/navigation/nav-model";
import { SEED_AS_OF, SEED_DEPLOYMENTS, SEPTEMBER_DECISION_INPUTS } from "@/lib/seed/deployments";

export const metadata = {
  title: "Command Center",
};

/**
 * SCR-01 — the Command Center.
 *
 * In Phase 00 this is the one screen with real content, and its job is to prove
 * the information architecture: that a deployment resolves into prerequisites,
 * that prerequisites resolve into a cause, and that a cause names the decision
 * behind it.
 *
 * Everything below is computed from `lib/seed/deployments.ts`. The two
 * September deployments are competing options for a single window, not two
 * trips — so the screen leads with the decision that gates both of them rather
 * than with progress bars that cannot move until it is made.
 */
export default function CommandCenterPage() {
  const deployments = SEED_DEPLOYMENTS;

  const decisions = findPendingDecisions(deployments, () => SEPTEMBER_DECISION_INPUTS);
  const conflicts = findScheduleConflicts(deployments);
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

        {decisions.map((decision) => (
          <Card as="section" key={decision.id} aria-labelledby={`decision-${decision.id}`}>
            <CardHeader className="flex flex-wrap items-center justify-between gap-2">
              <h2 id={`decision-${decision.id}`} className="text-ink text-base font-semibold">
                Decision required
              </h2>
              <StatusBadge tone="pending">
                {decision.candidates.length} competing options
              </StatusBadge>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="space-y-1">
                <p className="text-ink text-sm font-medium">
                  {decision.candidates.map((candidate) => candidate.city).join(" or ")} — one
                  September window, two options.
                </p>
                <p className="text-ink-muted text-sm leading-relaxed">
                  These are mutually exclusive alternatives, not two trips.
                  {decision.sharesWindow && " They occupy the same dates."} Every downstream
                  prerequisite — targets, consent templates, vault structure — stays deliberately
                  unstarted until one is selected, because work done against the option that is
                  dropped is work thrown away.
                </p>
              </div>

              {decision.outstandingInputs.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-ink-muted text-xs font-medium tracking-wide uppercase">
                    Waiting on
                  </h3>
                  <ul className="space-y-1.5">
                    {decision.outstandingInputs.map((input) => (
                      <li key={input} className="flex items-start gap-2 text-sm">
                        <StatusBadge tone="neutral">Needed</StatusBadge>
                        <span className="text-ink min-w-0 flex-1">{input}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardBody>
          </Card>
        ))}

        {conflicts.length > 0 && (
          <Card as="section" aria-labelledby="conflicts-heading">
            <CardHeader>
              <h2 id="conflicts-heading" className="text-ink text-base font-semibold">
                Scheduling conflict
              </h2>
            </CardHeader>
            <CardBody>
              <ul className="space-y-3">
                {conflicts.map((conflict) => {
                  const [a, b] = conflict.deployments;
                  return (
                    <li key={conflict.id} className="text-sm">
                      <p className="text-ink font-medium">
                        {a.city} and {b.city} are both committed and overlap.
                      </p>
                      <p className="text-ink-muted mt-0.5 leading-relaxed">
                        {a.city} runs {a.startsOn} to {a.endsOn}; {b.city} runs {b.startsOn} to{" "}
                        {b.endsOn}. One of them has to move.
                      </p>
                    </li>
                  );
                })}
              </ul>
            </CardBody>
          </Card>
        )}

        <section aria-labelledby="deployments-heading" className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="deployments-heading" className="text-ink text-base font-semibold">
              September options
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
