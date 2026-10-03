import { ModulePlaceholder } from "@/components/module-placeholder";
import mailFixtures from "@/data/fixtures/mail.json";

export default function AnnouncementsPage() {
  return (
    <ModulePlaceholder
      eyebrow="Module 01 / Announcements"
      title="A clean feed begins here."
      description="Normalize announcement-style email, identify what needs action, and keep the original mailbox read-only."
      issueIds="SIG-101—109"
      fixtureCount={mailFixtures.length}
    />
  );
}
