import { ModulePlaceholder } from "@/components/patterns/module-placeholder";

export const metadata = {
  title: "Organizations",
};

export default function Page() {
  return (
    <ModulePlaceholder
      href="/organizations"
      willContain={[
        "Institutions, outlets, agencies and regulatory bodies",
        "The roles people have held in them, with dates",
        "Relationships between organizations",
        "Links to systems, laws and policies they operate",
        "Conflict-of-interest and disclosure records",
      ]}
    />
  );
}
