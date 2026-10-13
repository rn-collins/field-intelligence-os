import { ModulePlaceholder } from "@/components/patterns/module-placeholder";

export const metadata = {
  title: "Interactions",
};

export default function Page() {
  return (
    <ModulePlaceholder
      href="/interactions"
      purpose={
        "Prepare, run and close a conversation with a source — with consent recorded before anything else, and the questions it raised captured before you forget them."
      }
      caption={"How an interaction is conducted"}
      chain={[
        { label: "Preparation", holds: "questions, context" },
        { label: "Consent", holds: "versioned, before recording" },
        { label: "Recording", holds: "on and off record" },
        { label: "Transcript", holds: "exact wording preserved" },
        { label: "Follow-up", holds: "promises, next source" },
      ]}
    />
  );
}
