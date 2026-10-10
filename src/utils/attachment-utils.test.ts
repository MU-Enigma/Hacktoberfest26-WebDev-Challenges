import { describe, expect, it } from "vitest";

import { attachmentFixtures } from "../data/attachment-fixtures";
import { formatBytes, getSafeFileType, isSafeUrl } from "./attachment-utils";

/* ------------------------------------------------------------------ */
/*  formatBytes                                                        */
/* ------------------------------------------------------------------ */
describe("formatBytes", () => {
  it("returns '0 B' for zero bytes", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("returns '0 B' for negative values", () => {
    expect(formatBytes(-100)).toBe("0 B");
  });

  it("formats values below 1 KB as bytes", () => {
    expect(formatBytes(512)).toBe("512 B");
  });

  it("formats exactly 1 KB", () => {
    expect(formatBytes(1024)).toBe("1 KB");
  });

  it("formats the PDF fixture (200 KB)", () => {
    const pdf = attachmentFixtures.find((a) => a.id === "att-pdf-001")!;
    expect(formatBytes(pdf.sizeBytes)).toBe("200 KB");
  });

  it("formats the image fixture (1 MB)", () => {
    const img = attachmentFixtures.find((a) => a.id === "att-img-001")!;
    expect(formatBytes(img.sizeBytes)).toBe("1 MB");
  });

  it("formats the long-filename fixture (3 MB)", () => {
    const long = attachmentFixtures.find((a) => a.id === "att-long-001")!;
    expect(formatBytes(long.sizeBytes)).toBe("3 MB");
  });
});

/* ------------------------------------------------------------------ */
/*  getSafeFileType                                                    */
/* ------------------------------------------------------------------ */
describe("getSafeFileType", () => {
  it("returns 'PDF' for application/pdf", () => {
    expect(getSafeFileType("application/pdf")).toBe("PDF");
  });

  it("returns 'Image' for image/png", () => {
    expect(getSafeFileType("image/png")).toBe("Image");
  });

  it("returns 'Image' for image/jpeg", () => {
    expect(getSafeFileType("image/jpeg")).toBe("Image");
  });

  it("returns safe fallback 'File' for unknown MIME type", () => {
    const unknown = attachmentFixtures.find((a) => a.id === "att-unknown-001")!;
    expect(getSafeFileType(unknown.mimeType)).toBe("File");
  });

  it("returns safe fallback 'File' for a completely made-up type", () => {
    expect(getSafeFileType("application/x-made-up-format")).toBe("File");
  });
});

/* ------------------------------------------------------------------ */
/*  isSafeUrl                                                          */
/* ------------------------------------------------------------------ */
describe("isSafeUrl", () => {
  it("rejects undefined", () => {
    expect(isSafeUrl(undefined)).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isSafeUrl("")).toBe(false);
  });

  it("rejects javascript: protocol", () => {
    const unsafe = attachmentFixtures.find((a) => a.id === "att-unsafe-001")!;
    expect(isSafeUrl(unsafe.url)).toBe(false);
  });

  it("rejects data: protocol", () => {
    expect(isSafeUrl("data:text/html,<h1>hi</h1>")).toBe(false);
  });

  it("rejects vbscript: protocol", () => {
    expect(isSafeUrl("vbscript:MsgBox('hello')")).toBe(false);
  });

  it("rejects external https URLs", () => {
    expect(isSafeUrl("https://evil.example.com/malware.exe")).toBe(false);
  });

  it("rejects external http URLs", () => {
    expect(isSafeUrl("http://evil.example.com/malware.exe")).toBe(false);
  });

  it("allows a relative internal path", () => {
    expect(isSafeUrl("/files/syllabus.pdf")).toBe(true);
  });
});
