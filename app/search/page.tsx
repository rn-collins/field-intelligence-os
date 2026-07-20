import { ModulePlaceholder } from "@/components/patterns/module-placeholder";

export const metadata = {
  title: "Search",
};

export default function Page() {
  return (
    <ModulePlaceholder
      href="/search"
      purpose={
        "Find anything across the whole record — by word, by connection, by place, by time — without ever surfacing what you are not cleared to see."
      }
      caption={"How retrieval is scoped"}
      chain={[
        { label: "Query", holds: "words or question" },
        { label: "Permissions", holds: "applied before retrieval" },
        { label: "Graph and place", holds: "connections, geography" },
        { label: "Time", holds: "when it was true" },
        { label: "Source set", holds: "exportable, cited" },
      ]}
    />
  );
}
