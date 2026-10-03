import Link from "next/link";

type ModulePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  issueIds: string;
  fixtureCount: number;
};

export function ModulePlaceholder({
  eyebrow,
  title,
  description,
  issueIds,
  fixtureCount,
}: ModulePlaceholderProps) {
  return (
    <main className="placeholder shell">
      <Link className="wordmark" href="/" aria-label="Back to SIGNAL home">
        <span className="wordmark-mark" aria-hidden="true" />
        SIGNAL
      </Link>
      <section>
        <p className="kicker">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="placeholder-copy">{description}</p>
        <div className="placeholder-status">
          <span>Scaffold ready</span>
          <span>{fixtureCount} synthetic fixtures</span>
          <span>{issueIds}</span>
        </div>
        <p className="placeholder-note">
          This route is intentionally unfinished. Claim the matching challenge
          before implementing it; the fixture data is here so work can begin
          without private campus or mailbox data.
        </p>
        <Link className="primary-link" href="/#contribute">
          Read the contribution flow <span aria-hidden="true">↖</span>
        </Link>
      </section>
    </main>
  );
}
