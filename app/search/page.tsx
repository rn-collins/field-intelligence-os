import { ModulePlaceholder } from "@/components/patterns/module-placeholder";

export const metadata = {
  title: "Search",
};

export default function Page() {
  return (
    <ModulePlaceholder
      href="/search"
      willContain={[
        "Retrieval across structured, textual, graph and geographic records",
        "Permission-aware results that filter before retrieval, not after",
        "Why each result matched, with source excerpts",
        "A research canvas for pinning and comparing sources",
        "Saved queries and exportable source sets",
      ]}
    />
  );
}
