import { ModulePlaceholder } from "@/components/patterns/module-placeholder";

export const metadata = {
  title: "Evidence & law",
};

export default function Page() {
  return (
    <ModulePlaceholder
      href="/evidence"
      purpose={
        "Store what a claim rests on — documents, data, records, statutes — with the limits of each source recorded alongside it."
      }
      caption={"How a source is evaluated"}
      chain={[
        { label: "Source", holds: "document, dataset, statute" },
        { label: "Authority", holds: "jurisdiction, effective dates" },
        { label: "Limitation", holds: "what it cannot show" },
        { label: "Linked claim", holds: "what it supports" },
      ]}
    />
  );
}
