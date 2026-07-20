import { ModulePlaceholder } from "@/components/patterns/module-placeholder";

export const metadata = {
  title: "Claims",
};

export default function Page() {
  return (
    <ModulePlaceholder
      href="/claims"
      willContain={[
        "One exact assertion per record, stored in its original wording",
        "Claimant, context, time and claim type",
        "Supporting and challenging evidence, held separately",
        "Verification status with a full audited history",
        "Which outputs a claim is permitted to appear in",
      ]}
    />
  );
}
