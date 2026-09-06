import { ModulePlaceholder } from "@/components/patterns/module-placeholder";

export const metadata = {
  title: "Claims",
};

export default function Page() {
  return (
    <ModulePlaceholder
      href="/claims"
      purpose={
        "Hold one exact assertion per record, in its original wording, kept separate from whatever supports or challenges it."
      }
      caption={"How a claim earns its status"}
      chain={[
        { label: "Exact assertion", holds: "original wording" },
        { label: "Claimant", holds: "who, when, context" },
        { label: "Support and challenge", holds: "evidence both ways" },
        { label: "Verification", holds: "audited status history" },
      ]}
    />
  );
}
