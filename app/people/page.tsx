import { ModulePlaceholder } from "@/components/patterns/module-placeholder";

export const metadata = {
  title: "People",
};

export default function Page() {
  return (
    <ModulePlaceholder
      href="/people"
      purpose={
        "Keep one record per person across every trip: who they are, how they are connected, what they agreed to, and what you promised them."
      }
      caption={"How a person connects to the work"}
      chain={[
        { label: "Person", holds: "identity, pronunciation" },
        { label: "Role", holds: "held over time" },
        { label: "Organization", holds: "where the role sits" },
        { label: "Relationship history", holds: "every contact" },
        { label: "Commitments", holds: "what you owe" },
      ]}
    />
  );
}
