import { AppShell, UnderConstructionBoard } from "@/components/app-shell";

const plannedFeatures = [
  "Priority announcement feed",
  "Deadline and action extraction",
  "Search, filters, and saved items",
  "Mailbox connection and sync",
] as const;

export default function AnnouncementsPage() {
  return (
    <AppShell activePath="/announcements" pageLabel="Announcements">
      <section className="page-heading module-heading">
        <div>
          <p className="overline">Module 01</p>
          <h1>Announcements</h1>
        </div>
        <p className="heading-copy">
          Important messages, clear deadlines, and required actions without the
          noise of a full inbox.
        </p>
      </section>

      <UnderConstructionBoard
        code="ANNOUNCEMENT WORKSPACE / V0.1"
        title="A calmer inbox is taking shape."
        description="This area will turn relevant mailbox updates into a private, structured feed while keeping the original mailbox read-only."
        items={plannedFeatures}
        tone="blue"
      />
    </AppShell>
  );
}
