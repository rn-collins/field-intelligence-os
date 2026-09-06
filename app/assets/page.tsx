import { ModulePlaceholder } from "@/components/patterns/module-placeholder";

export const metadata = {
  title: "Media & assets",
};

export default function Page() {
  return (
    <ModulePlaceholder
      href="/assets"
      purpose={
        "Register every file you capture with the context that makes it usable later: where it came from, who consented, and what it is allowed to be used for."
      }
      caption={"How an asset stays usable"}
      chain={[
        { label: "File", holds: "master in the vault" },
        { label: "Provenance", holds: "capture context" },
        { label: "Permission", holds: "consent and restrictions" },
        { label: "Linked subject", holds: "people, places, claims" },
        { label: "Output", holds: "where it may appear" },
      ]}
    />
  );
}
