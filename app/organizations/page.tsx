import { ModulePlaceholder } from "@/components/patterns/module-placeholder";

export const metadata = {
  title: "Organizations",
};

export default function Page() {
  return (
    <ModulePlaceholder
      href="/organizations"
      purpose={
        "Track institutions, outlets, agencies and regulators — the people inside them, the rules they run, and the claims that touch them."
      }
      caption={"How an institution is documented"}
      chain={[
        { label: "Organization", holds: "body, outlet, agency" },
        { label: "People", holds: "roles over time" },
        { label: "Systems", holds: "rules it operates" },
        { label: "Claims", holds: "assertions about it" },
        { label: "Deployments", holds: "where it appeared" },
      ]}
    />
  );
}
