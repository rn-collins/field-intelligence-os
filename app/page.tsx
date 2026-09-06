import Link from "next/link";
import { PageBody, PageHeader } from "@/components/layout/app-shell";
import { DeploymentCard } from "@/components/patterns/deployment-card";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { DemoDataBanner } from "@/components/ui/demo-data-banner";
import { StatusBadge } from "@/components/ui/status-badge";
import { findPendingDecisions, findScheduleConflicts } from "@/features/deployments/decisions";
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

  return (
    <>
      <PageHeader
        title="Command Center"
        description="What matters now across every active deployment."
        meta={<p className="text-ink-subtle pt-1 text-xs">State as of {SEED_AS_OF}</p>}
      />

      <PageBody>
        <DemoDataBanner />

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
                    Evidence needed before deciding
                  </h3>
                  <ul className="space-y-1.5">
                    {decision.outstandingInputs.map((input) => (
                      <li key={input} className="flex items-start gap-2 text-sm">
                        <StatusBadge tone="neutral">Missing</StatusBadge>
                        <span className="text-ink min-w-0 flex-1">{input}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-ink-subtle border-border border-t pt-3 text-xs">
                Recording the decision — and moving the selected option into planning — happens in{" "}
                <Link href="/deployments" className="text-link underline underline-offset-2">
                  Deployments
                </Link>
                . That workflow is not built yet.
              </p>
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
