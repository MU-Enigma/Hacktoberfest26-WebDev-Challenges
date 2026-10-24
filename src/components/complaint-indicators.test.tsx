import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { mockComplaints } from "../data/mock-data";
import { ComplaintCategoryIndicator, ComplaintStatusIndicator } from "./complaint-indicators";

describe("ComplaintCategoryIndicator", () => {
  it.each([
    ["wifi", "Wi-Fi"], ["water", "Water"], ["electricity", "Electricity"],
    ["washrooms", "Washrooms"], ["laundry", "Laundry"], ["cleanliness", "Cleanliness"],
    ["broken_facility", "Broken facility"], ["hostel_maintenance", "Hostel maintenance"],
    ["queues", "Queues"],
  ])("labels approved category %s as readable text", (category, label) => {
    const html = renderToStaticMarkup(<ComplaintCategoryIndicator category={category} />);
    expect(html).toContain(label);
    expect(html).toContain("Category: ");
    expect(html).not.toContain("Unknown category");
  });

  it.each([undefined, null, "", "new-category", "medical", "__proto__", "constructor", "toString"])(
    "uses a neutral fallback for missing or unknown category %s", (category) => {
      const html = renderToStaticMarkup(<ComplaintCategoryIndicator category={category} />);
      expect(html).toContain("Unknown category");
      expect(html).toContain('data-tone="neutral"');
    },
  );
});

describe("ComplaintStatusIndicator", () => {
  it.each([
    ["submitted", "Submitted"], ["acknowledged", "Acknowledged"],
    ["in_progress", "In progress"], ["resolved", "Resolved"], ["closed", "Closed"],
  ])("renders accessible text for workflow state %s", (status, label) => {
    const html = renderToStaticMarkup(<ComplaintStatusIndicator status={status} />);
    expect(html).toContain(label);
    expect(html).toContain("Status: ");
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain("Unknown status");
  });

  it.each([undefined, null, "", "future-state", "__proto__", "constructor", "toString"])(
    "uses a neutral fallback for missing or unknown status %s", (status) => {
      const html = renderToStaticMarkup(<ComplaintStatusIndicator status={status} />);
      expect(html).toContain("Unknown status");
      expect(html).toContain('data-tone="neutral"');
    },
  );

  it("displays the existing legacy in_review fixture without inventing a transition", () => {
    const html = renderToStaticMarkup(<ComplaintStatusIndicator status="in_review" />);
    expect(html).toContain("In review");
    expect(html).toContain('data-tone="neutral"');
    expect(html).not.toContain("Acknowledged");
  });
});

describe("safe, reusable presentation", () => {
  it.each(mockComplaints)("accepts the existing synthetic fixture $id", (complaint) => {
    const html = renderToStaticMarkup(<>
      <ComplaintCategoryIndicator category={complaint.category} />
      <ComplaintStatusIndicator status={complaint.status} />
    </>);
    expect(html).not.toContain("Unknown");
    expect(html).not.toContain(complaint.location);
    expect(html).not.toContain(complaint.title);
  });

  it("never renders unknown raw strings, including markup", () => {
    const unsafe = '<img src=x onerror="alert(1)">';
    const html = renderToStaticMarkup(<>
      <ComplaintCategoryIndicator category={unsafe} />
      <ComplaintStatusIndicator status={unsafe} />
    </>);
    expect(html).not.toContain("img");
    expect(html).not.toContain("onerror");
    expect(html).toContain("Unknown category");
    expect(html).toContain("Unknown status");
  });

  it("keeps static indicators out of the tab order and avoids live announcements", () => {
    const html = renderToStaticMarkup(<>
      <ComplaintCategoryIndicator category="hostel_maintenance" />
      <ComplaintStatusIndicator status="in_progress" />
    </>);
    expect(html).toContain("Hostel maintenance");
    expect(html).toContain("In progress");
    expect(html).not.toMatch(/tabindex|<button|<a\b|role="status"|aria-live/);
  });
});
