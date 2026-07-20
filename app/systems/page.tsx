import { ModulePlaceholder } from "@/components/patterns/module-placeholder";

export const metadata = {
  title: "Systems",
};

export default function Page() {
  return (
    <ModulePlaceholder
      href="/systems"
      willContain={[
        "Reconstructed workflows as a graph of steps and actors",
        "Decision rules, inputs, outputs and handoffs",
        "Observed steps rendered distinctly from claimed steps",
        "Exceptions, failure modes and repair paths",
        "Comparison across jurisdictions and across time",
      ]}
    />
  );
}
