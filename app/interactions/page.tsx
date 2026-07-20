import { ModulePlaceholder } from "@/components/patterns/module-placeholder";

export const metadata = {
  title: "Interactions",
};

export default function Page() {
  return (
    <ModulePlaceholder
      href="/interactions"
      willContain={[
        "Scheduled and spontaneous interactions with sources",
        "Ground rules and versioned consent records",
        "Question trees and live timestamped notes",
        "On-record and off-record segment boundaries",
        "Promises made, and the cognition update afterwards",
      ]}
    />
  );
}
