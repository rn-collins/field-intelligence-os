import { ModulePlaceholder } from "@/components/patterns/module-placeholder";

export const metadata = {
  title: "Settings",
};

export default function Page() {
  return (
    <ModulePlaceholder
      href="/settings"
      willContain={[
        "Workspace, profile and role administration",
        "Google Drive and Notion connection state",
        "AI and transcription provider configuration",
        "Controlled vocabularies and retention rules",
        "Audit log and sync conflict resolution",
      ]}
    />
  );
}
