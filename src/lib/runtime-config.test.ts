import { describe, expect, it } from "vitest";

import { getMailMode } from "./runtime-config";

describe("getMailMode", () => {
  it("defaults every contributor to the safe mock provider", () => {
    expect(getMailMode(undefined)).toBe("mock");
  });

  it.each(["mock", "microsoft", "gmail"] as const)(
    "accepts the %s provider",
    (provider) => {
      expect(getMailMode(provider)).toBe(provider);
    },
  );

  it("rejects an unknown provider instead of silently falling back", () => {
    expect(() => getMailMode("imap")).toThrow(/Unsupported MAIL_PROVIDER/);
  });
});
