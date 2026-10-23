import {
  ComplaintCategoryIndicator,
  ComplaintStatusIndicator,
} from "../../src/components/complaint-indicators";
import { mockComplaints } from "../../src/data/mock-data";

const categories = [
  "wifi", "water", "electricity", "washrooms", "laundry", "cleanliness",
  "broken_facility", "hostel_maintenance", "queues",
];
const statuses = ["submitted", "acknowledged", "in_progress", "resolved", "closed", "unknown"];
const row = { display: "flex", flexWrap: "wrap", gap: 8 } as const;

/** Local review gallery; no route or production navigation is added. */
export default function ComplaintIndicatorExamples() {
  return (
    <main style={{ maxWidth: 920, margin: "24px auto", padding: 20, background: "#c0c0c0", color: "#111" }}>
      <h1>Complaint indicators</h1>
      <p>Readable categories and status updates. All examples use synthetic data.</p>

      <section aria-labelledby="light-heading" style={{ background: "#fff", padding: 16, marginBlock: 16 }}>
        <h2 id="light-heading">Statuses · light surface</h2>
        <div style={row}>
          {statuses.map((status) => <ComplaintStatusIndicator key={status} status={status} />)}
        </div>
      </section>

      <section aria-labelledby="dark-heading" style={{ background: "#151515", color: "#fff", padding: 16, marginBlock: 16 }}>
        <h2 id="dark-heading">Statuses · dark surface</h2>
        <div style={row}>
          {statuses.map((status) => <ComplaintStatusIndicator key={status} status={status} />)}
        </div>
      </section>

      <section aria-labelledby="categories-heading" style={{ padding: 16, border: "1px solid #555", marginBlock: 16 }}>
        <h2 id="categories-heading">Operational categories</h2>
        <div style={row}>
          {categories.map((category) => <ComplaintCategoryIndicator key={category} category={category} />)}
          <ComplaintCategoryIndicator category="unknown" />
        </div>
      </section>

      <section aria-labelledby="fixtures-heading">
        <h2 id="fixtures-heading">Starter complaint examples</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {mockComplaints.map((complaint) => (
            <li key={complaint.id} style={{ background: "#fff", padding: 12, marginBlock: 8 }}>
              <p style={{ marginTop: 0 }}>{complaint.title}</p>
              <div style={row}>
                <ComplaintCategoryIndicator category={complaint.category} />
                <ComplaintStatusIndicator status={complaint.status} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
