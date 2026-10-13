import { ModulePlaceholder } from "@/components/patterns/module-placeholder";

export const metadata = {
  title: "Systems",
};

export default function Page() {
  return (
    <ModulePlaceholder
      href="/systems"
      purpose={
        "Reconstruct how something actually works — who decides, under which rule, what happens at each handoff, and where it fails."
      }
      caption={"How a system is reconstructed"}
      chain={[
        { label: "Actors", holds: "who acts" },
        { label: "Rules", holds: "what governs them" },
        { label: "Handoffs", holds: "where control moves" },
        { label: "Exceptions", holds: "where it deviates" },
        { label: "Consequences", holds: "who is affected" },
      ]}
    />
  );
}
