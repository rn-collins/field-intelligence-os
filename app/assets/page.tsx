import { ModulePlaceholder } from "@/components/patterns/module-placeholder";

export const metadata = {
  title: "Media & assets",
};

export default function Page() {
  return (
    <ModulePlaceholder
      href="/assets"
      willContain={[
        "Photo, video, audio and document records",
        "Google Drive master locations and checksums",
        "Capture metadata, and links to people, places and claims",
        "Consent, restrictions and derivative lineage",
        "Usage history and permitted future uses",
      ]}
    />
  );
}
