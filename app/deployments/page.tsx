import { ModulePlaceholder } from "@/components/patterns/module-placeholder";

export const metadata = {
  title: "Deployments",
};

export default function Page() {
  return (
    <ModulePlaceholder
      href="/deployments"
      purpose={
        "Plan a trip end to end: what it is for, who you need to reach, what must be ready before you travel, and what you owe people afterward."
      }
      caption={"How a deployment becomes ready"}
      chain={[
        { label: "Deployment", holds: "mission, city, dates" },
        { label: "Prerequisites", holds: "what must be true first" },
        { label: "Targets", holds: "who you need" },
        { label: "Schedule", holds: "route and day plan" },
        { label: "Close-out", holds: "promises, restrictions" },
      ]}
    />
  );
}
