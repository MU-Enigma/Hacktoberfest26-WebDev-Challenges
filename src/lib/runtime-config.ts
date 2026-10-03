const MAIL_MODES = ["mock", "microsoft", "gmail"] as const;

export type MailMode = (typeof MAIL_MODES)[number];

export function getMailMode(value: string | undefined): MailMode {
  const mode = value ?? "mock";

  if (!MAIL_MODES.includes(mode as MailMode)) {
    throw new Error(
      `Unsupported MAIL_PROVIDER "${mode}". Use mock, microsoft, or gmail.`,
    );
  }

  return mode as MailMode;
}
