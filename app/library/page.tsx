import { ModulePlaceholder } from "@/components/patterns/module-placeholder";

export const metadata = {
  title: "Canon & standards",
};

export default function Page() {
  return (
    <ModulePlaceholder
      href="/library"
      purpose={
        "Keep the method inside the product: the manual, the capture cards, the consent language, and which version governed a given record."
      }
      caption={"How the method stays current"}
      chain={[
        { label: "Manual", holds: "the method itself" },
        { label: "Field cards", holds: "what to capture" },
        { label: "Standards", holds: "the governing rule" },
        { label: "Version history", holds: "what applied when" },
      ]}
    />
  );
}
