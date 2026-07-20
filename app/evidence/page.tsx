import { ModulePlaceholder } from "@/components/patterns/module-placeholder";

export const metadata = {
  title: "Evidence & law",
};

export default function Page() {
  return (
    <ModulePlaceholder
      href="/evidence"
      willContain={[
        "Documents, datasets, records and published sources",
        "Laws and policies with jurisdiction and effective dates",
        "Method, population, comparator and metric where applicable",
        "Stated limitations and fitness for a specific purpose",
        "Superseding versions that never overwrite the original",
      ]}
    />
  );
}
