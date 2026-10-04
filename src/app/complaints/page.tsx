import { AppShell, UnderConstructionBoard } from "@/components/app-shell";

const plannedFeatures = [
  "Guided complaint submission",
  "Public-safe status tracking",
  "Duplicate report suggestions",
  "Private reporter updates",
] as const;

export default function ComplaintsPage() {
  return (
    <AppShell activePath="/complaints" pageLabel="Complaints">
      <section className="page-heading module-heading">
        <div>
          <p className="overline">Module 02</p>
          <h1>Complaints</h1>
        </div>
        <p className="heading-copy">
          Report routine campus problems, follow their progress, and keep
          reporter details protected.
        </p>
      </section>

      <UnderConstructionBoard
        code="COMPLAINT WORKSPACE / V0.1"
        title="A clearer route to resolution."
        description="This area will help students report operational problems and follow public-safe updates from submission through resolution."
        items={plannedFeatures}
        tone="purple"
      />
    </AppShell>
  );
}
