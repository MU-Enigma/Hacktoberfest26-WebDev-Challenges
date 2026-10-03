import { describe, expect, it } from "vitest";

import { mockComplaints, mockMail } from "./mock-data";

describe("starter mock data", () => {
  it("contains examples for both parts of SIGNAL", () => {
    expect(mockMail.length).toBeGreaterThan(0);
    expect(mockComplaints.length).toBeGreaterThan(0);
  });

  it("uses clearly fake email addresses", () => {
    expect(mockMail.every((message) => message.from.endsWith("@example.edu"))).toBe(
      true,
    );
  });
});
