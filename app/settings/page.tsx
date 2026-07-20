import { ModulePlaceholder } from "@/components/patterns/module-placeholder";

export const metadata = {
  title: "Settings",
};

export default function Page() {
  return (
    <ModulePlaceholder
      href="/settings"
      purpose={
        "Administer the workspace — who has access, which integrations are connected, and what the audit trail shows — without exposing secrets."
      }
      caption={"How the workspace is governed"}
      chain={[
        { label: "Workspace", holds: "profile and members" },
        { label: "Roles", holds: "who may do what" },
        { label: "Integrations", holds: "Drive, Notion, AI" },
        { label: "Security", holds: "audit log, retention" },
      ]}
    />
  );
}
