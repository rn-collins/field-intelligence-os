import { ModulePlaceholder } from "@/components/patterns/module-placeholder";

export const metadata = {
  title: "Outputs",
};

export default function Page() {
  return (
    <ModulePlaceholder
      href="/outputs"
      purpose={
        "Turn a locked set of sources into something publishable, with every claim and asset cleared before it ships."
      }
      caption={"How an output reaches publication"}
      chain={[
        { label: "Source lock", holds: "fixed set of records" },
        { label: "Assembly", holds: "structure and draft" },
        { label: "Review", holds: "fact, legal, editorial" },
        { label: "Publication", holds: "versions and corrections" },
      ]}
    />
  );
}
