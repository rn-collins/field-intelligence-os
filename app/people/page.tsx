import { ModulePlaceholder } from "@/components/patterns/module-placeholder";

export const metadata = {
  title: "People",
};

export default function Page() {
  return (
    <ModulePlaceholder
      href="/people"
      willContain={[
        "Identity, pronunciation, roles and organizations over time",
        "Contact routes and relationship history",
        "Consent preferences, restrictions and do-not-contact status",
        "Links to interactions, claims, evidence and outputs",
        "Duplicate prevention across deployments",
      ]}
    />
  );
}
