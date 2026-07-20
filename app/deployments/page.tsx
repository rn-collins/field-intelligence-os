import { ModulePlaceholder } from "@/components/patterns/module-placeholder";

export const metadata = {
  title: "Deployments",
};

export default function Page() {
  return (
    <ModulePlaceholder
      href="/deployments"
      willContain={[
        "Deployment records with mission, dates, city, timezone and credentials",
        "Readiness scoring against explicit prerequisites",
        "Targets, schedule and route for each trip",
        "Daily logs, capture packages and completeness audits",
        "An immutable summary when a deployment is closed",
      ]}
    />
  );
}
