import { afterEach, describe, expect, it, vi } from "vitest";

import { APP_TIME_ZONE } from "../config/application";
import { formatRelativeTime, formatTimestamp, getDeadlineInfo } from "./date-time";

const now = "2026-10-23T12:00:00Z";
afterEach(() => vi.useRealTimers());

describe("formatTimestamp", () => {
  it("uses the configured application timezone rather than the host timezone", () => {
    expect(APP_TIME_ZONE).toBe("Asia/Kolkata");
    const text = formatTimestamp("2026-10-23T18:45:00Z");
    expect(text).toContain("24 Oct 2026");
    expect(text).toContain("00:15");
    expect(text).toMatch(/GMT\+5:30|IST/);
  });

  it("formats the same instant on different local dates with explicit zones", () => {
    const instant = "2026-01-01T01:00:00Z";
    expect(formatTimestamp(instant, { timeZone: "UTC" })).toContain("1 Jan 2026");
    const pacific = formatTimestamp(instant, { timeZone: "America/Los_Angeles" });
    expect(pacific).toContain("31 Dec 2025");
    expect(pacific).toContain("17:00");
  });

  it("accepts Date objects, epoch milliseconds, and equivalent ISO offsets", () => {
    const date = new Date(now);
    const expected = formatTimestamp(now);
    expect(formatTimestamp(date)).toBe(expected);
    expect(formatTimestamp(date.getTime())).toBe(expected);
    expect(formatTimestamp("2026-10-23T17:30:00+05:30")).toBe(expected);
    expect(date.toISOString()).toBe("2026-10-23T12:00:00.000Z");
    expect(formatTimestamp(0, { timeZone: "UTC" })).toContain("1 Jan 1970");
  });

  it("accepts leap days and timestamps with minute precision", () => {
    expect(formatTimestamp("2028-02-29T12:00Z")).toContain("29 Feb 2028");
  });
});

describe("missing and invalid input", () => {
  it.each([undefined, null, "", "   "])("returns readable missing-value text for %s", (value) => {
    expect(formatTimestamp(value)).toBe("No date provided");
    expect(formatRelativeTime(value, { now })).toBe("No date provided");
    expect(getDeadlineInfo(value, { now })).toEqual({ state: "missing", label: "No deadline" });
  });

  it.each([
    "not a date", new Date(NaN), NaN, Infinity, -Infinity,
    "2026-10-23", "2026-10-23T12:00:00", "10/23/2026",
    "2026-02-30T12:00:00Z", "2025-02-29T12:00:00Z", "2100-02-29T12:00:00Z",
    "2026-04-31T12:00:00Z", "2026-13-01T12:00:00Z", "2026-10-00T12:00:00Z",
    "2026-10-23T24:00:00Z", "2026-10-23T12:60:00Z", "2026-10-23T12:00:60Z",
    "2026-10-23T12:00:00+25:00",
  ])("rejects invalid or ambiguous input %s without throwing", (value) => {
    expect(formatTimestamp(value)).toBe("Invalid date");
    expect(formatRelativeTime(value, { now })).toBe("Invalid date");
    expect(getDeadlineInfo(value, { now })).toEqual({ state: "invalid", label: "Invalid deadline" });
  });

  it("surfaces an invalid reference clock or timezone as a configuration error", () => {
    expect(() => getDeadlineInfo(now, { now: "bad" })).toThrow(RangeError);
    expect(() => formatRelativeTime(now, { now: null })).toThrow(RangeError);
    expect(() => formatTimestamp(now, { timeZone: "Not/AZone" })).toThrow(RangeError);
    expect(() => getDeadlineInfo(now, { now, timeZone: "Not/AZone" })).toThrow(RangeError);
    expect(() => formatRelativeTime(now, { now, timeZone: "Not/AZone" })).toThrow(RangeError);
  });
});

describe("getDeadlineInfo", () => {
  it("distinguishes a later day, later today, and an earlier time today", () => {
    expect(getDeadlineInfo("2026-10-24T12:00:00Z", { now }).state).toBe("future");
    expect(getDeadlineInfo("2026-10-23T18:00:00Z", { now }).label).toContain("Due today");
    const overdue = getDeadlineInfo("2026-10-23T11:59:00Z", { now });
    expect(overdue.state).toBe("overdue");
    expect(overdue.label).toContain("Overdue since");
  });

  it("does not mark a deadline overdue before or at its exact instant", () => {
    const deadline = Date.parse(now);
    expect(getDeadlineInfo(deadline, { now: deadline - 1 }).state).toBe("today");
    expect(getDeadlineInfo(deadline, { now: deadline })).toEqual({
      state: "today", label: `Due now (${formatTimestamp(deadline)})`,
    });
    expect(getDeadlineInfo(deadline, { now: deadline + 1 }).state).toBe("overdue");
  });

  it("compares offset timestamps by instant, not by their written clock time", () => {
    expect(getDeadlineInfo("2026-10-23T17:30:00+05:30", { now }).label).toContain("Due now");
    expect(getDeadlineInfo("2026-10-23T06:00:00-06:00", { now }).label).toContain("Due now");
  });

  it("crosses local midnight even when the UTC date does not change", () => {
    const options = { now: "2026-10-23T18:29:59Z" };
    const deadline = "2026-10-23T18:30:00Z";
    expect(getDeadlineInfo(deadline, options).state).toBe("future");
    expect(getDeadlineInfo(deadline, { ...options, timeZone: "UTC" }).state).toBe("today");
    expect(getDeadlineInfo(deadline, { now: deadline }).label).toContain("Due now");
  });

  it("keeps one local day together across UTC midnight and year boundaries", () => {
    expect(getDeadlineInfo("2027-01-01T00:15:00Z", {
      now: "2026-12-31T23:45:00Z", timeZone: "America/New_York",
    }).state).toBe("today");
  });

  it.each([
    ["2026-03-08T06:30:00Z", "2026-03-08T07:30:00Z"], // spring forward
    ["2026-11-01T05:30:00Z", "2026-11-01T06:30:00Z"], // repeated local 01:30
  ])("uses instants through DST: %s to %s", (start, end) => {
    expect(getDeadlineInfo(end, { now: start, timeZone: "America/New_York" }).state).toBe("today");
    expect(getDeadlineInfo(start, { now: end, timeZone: "America/New_York" }).state).toBe("overdue");
  });

  it("defaults to the current clock when now is omitted", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(now));
    expect(getDeadlineInfo(now).label).toContain("Due now");
    expect(formatRelativeTime(now)).toBe("now");
  });

  it("includes explicit wording and an absolute date for future deadlines", () => {
    const result = getDeadlineInfo("2026-10-24T12:00:00Z", { now });
    expect(result.label).toContain("Due 24 Oct 2026");
    expect(result.label).toContain("17:30");
  });
});

describe("formatRelativeTime", () => {
  it.each([
    [0, "now"], [500, "now"], [-30_000, "30 seconds ago"], [30_000, "in 30 seconds"],
    [-120_000, "2 minutes ago"], [120_000, "in 2 minutes"],
    [-7_200_000, "2 hours ago"], [7_200_000, "in 2 hours"],
  ])("formats an offset of %s ms as %s", (delta, text) => {
    expect(formatRelativeTime(Date.parse(now) + delta, { now })).toBe(text);
  });

  it("uses the selected timezone for calendar wording at midnight", () => {
    const options = { now: "2026-10-23T18:29:00Z" };
    const value = "2026-10-23T18:30:00Z";
    expect(formatRelativeTime(value, options)).toBe("tomorrow");
    expect(formatRelativeTime(value, { ...options, timeZone: "UTC" })).toBe("in 1 minute");
    expect(formatRelativeTime(options.now, { now: value })).toBe("yesterday");
  });

  it.each([
    ["2026-03-07T17:00:00Z", "2026-03-09T16:00:00Z"], // 47 hours, 2 local dates
    ["2026-10-31T16:00:00Z", "2026-11-02T17:00:00Z"], // 49 hours, 2 local dates
  ])("counts calendar days through DST instead of dividing elapsed hours", (start, end) => {
    expect(formatRelativeTime(end, { now: start, timeZone: "America/New_York" })).toBe("in 2 days");
    expect(formatRelativeTime(start, { now: end, timeZone: "America/New_York" })).toBe("2 days ago");
  });
});
