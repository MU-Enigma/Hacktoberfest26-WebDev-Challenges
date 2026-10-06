export interface MailAttachment {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  url?: string;
}

export const attachmentFixtures: readonly MailAttachment[] = [
  {
    id: "att-pdf-001",
    filename: "mid-semester-syllabus.pdf",
    mimeType: "application/pdf",
    sizeBytes: 204_800, // this is to show how the attachment row reacts to pdfs
  },
  {
    id: "att-img-001",
    filename: "campus-map.png",
    mimeType: "image/png",
    sizeBytes: 1_048_576, // this is to show how the attachment row reacts to images
  },
  {
    id: "att-unknown-001",
    filename: "dataset.xyz",
    mimeType: "application/octet-stream",
    sizeBytes: 512, // this is to show how the attachment row reacts to unknown file types
  },
  {
    id: "att-long-001",
    filename:
      "this-is-an-extremely-long-filename-kajdsfjjksdahfhsjdkfhsjadhfjkhaskdhfkjasjdfkhsajkdlfhthat-keeps-going-and-going-to-verify-the-layout-does-not-break-when-a-student-uploads-something-ridiculously-named.docx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    sizeBytes: 3_145_728, // this is to show how the attachment row reacts to long filenames
  },
  {
    id: "att-unsafe-001",
    filename: "totally-legit.html",
    mimeType: "text/html",
    sizeBytes: 1_024,
    url: "javascript:alert('xss')", // this is to show how the attachment row reacts to unsafe urls
  },
] as const;
