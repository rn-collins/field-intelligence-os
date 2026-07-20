import { ModulePlaceholder } from "@/components/patterns/module-placeholder";

export const metadata = {
  title: "Outputs",
};

export default function Page() {
  return (
    <ModulePlaceholder
      href="/outputs"
      willContain={[
        "Articles, films, photo essays, podcasts, courses and presentations",
        "A locked source set for each output",
        "Which claims and assets are cleared for use",
        "Fact-check, legal and editorial review states",
        "Versions, publication records and corrections",
      ]}
    />
  );
}
