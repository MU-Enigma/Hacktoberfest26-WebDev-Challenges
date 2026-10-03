import { ModulePlaceholder } from "@/components/module-placeholder";
import complaintFixtures from "@/data/fixtures/complaints.json";

export default function ComplaintsPage() {
  return (
    <ModulePlaceholder
      eyebrow="Module 02 / Operational complaints"
      title="Visible progress, protected reporters."
      description="Give routine campus maintenance problems a clear route from report to verified resolution."
      issueIds="SIG-201—208"
      fixtureCount={complaintFixtures.length}
    />
  );
}
