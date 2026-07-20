import { ModulePlaceholder } from "@/components/patterns/module-placeholder";

export const metadata = {
  title: "Ingest",
};

export default function Page() {
  return (
    <ModulePlaceholder
      href="/assets/ingest"
      purpose={
        "Move raw capture off a card safely: detect duplicates, name consistently, verify every copy, and never delete the original."
      }
      caption={"How raw media is protected"}
      chain={[
        { label: "Card session", holds: "files as captured" },
        { label: "Duplicate check", holds: "before any copy" },
        { label: "Vault destination", holds: "named, structured" },
        { label: "Verification", holds: "checksummed copies" },
        { label: "Queue", holds: "transcript and proxy" },
      ]}
    />
  );
}
