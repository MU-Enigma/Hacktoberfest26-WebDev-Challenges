import type { MailAttachment } from "@/data/attachment-fixtures";
import { formatBytes, getSafeFileType } from "@/utils/attachment-utils";

type AttachmentRowProps = {
  attachment: MailAttachment;
};

// displays safe and read only metadata for an attachment 
// filenames rendered as plaintext and not active links so external urls cant be triggered 
// by clicking 
export function AttachmentRow({ attachment }: AttachmentRowProps) {
  const fileType = getSafeFileType(attachment.mimeType);
  const fileSize = formatBytes(attachment.sizeBytes);

  return (
    <div className="attachment-row" role="listitem">
      <span className="attachment-icon" aria-hidden="true">
        {fileType === "PDF" && "📄"}
        {fileType === "Image" && "🖼️"}
        {fileType !== "PDF" && fileType !== "Image" && "📎"}
      </span>

      <div className="attachment-info">
        <span className={`attachment-filename${attachment.filename.length > 40 ? " marquee" : ""}`}>
          {attachment.filename.length > 40 ? (
            <span>{attachment.filename}</span>
          ) : (
            attachment.filename
          )}
        </span>
        <span className="attachment-meta">
          {fileType} &middot; {fileSize}
        </span>
      </div>
    </div>
  );
}
