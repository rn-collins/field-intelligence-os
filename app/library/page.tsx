import { ModulePlaceholder } from "@/components/patterns/module-placeholder";

export const metadata = {
  title: "Canon & standards",
};

export default function Page() {
  return (
    <ModulePlaceholder
      href="/library"
      willContain={[
        "The Field Investigation Manual, inside the product",
        "Capture taxonomy and domain fieldbooks",
        "Consent card language, with version history",
        "Standards, and the records governed by each version",
        "Superseded rules, kept readable rather than deleted",
      ]}
    />
  );
}
