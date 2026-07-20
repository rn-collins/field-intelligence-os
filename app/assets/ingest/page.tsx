import { ModulePlaceholder } from "@/components/patterns/module-placeholder";

export const metadata = {
  title: "Ingest",
};

export default function Page() {
  return (
    <ModulePlaceholder
      href="/assets/ingest"
      willContain={[
        "Device and card session selection with a file manifest",
        "Duplicate detection before anything is copied",
        "Drive destination folders and naming preview",
        "Checksum verification and protection status",
        "Transcription and proxy queues, with resumable failures",
      ]}
    />
  );
}
