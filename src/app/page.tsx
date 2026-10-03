import Link from "next/link";

const tracks = [
  {
    code: "01",
    title: "Announcements",
    detail: "Turn noisy mailbox traffic into a useful, private action feed.",
    href: "/announcements",
    range: "SIG-001 · SIG-101—109",
  },
  {
    code: "02",
    title: "Operational complaints",
    detail: "Report everyday campus problems and follow their resolution.",
    href: "/complaints",
    range: "SIG-005—006 · SIG-201—208",
  },
  {
    code: "03",
    title: "Mail providers",
    detail: "Add safe Outlook-first OAuth and reliable mailbox sync.",
    href: "/#contribute",
    range: "SIG-301—307",
  },
  {
    code: "04",
    title: "Release quality",
    detail:
      "Make the shared product accessible, tested, secure, and shippable.",
    href: "/#contribute",
    range: "SIG-007—008 · SIG-401—404",
  },
];

export default function Home() {
  return (
    <main>
      <header className="site-header shell">
        <Link className="wordmark" href="/" aria-label="SIGNAL home">
          <span className="wordmark-mark" aria-hidden="true" />
          SIGNAL
        </Link>
        <nav aria-label="Primary navigation">
          <a href="#product">Product</a>
          <a href="#contribute">Contribute</a>
          <a href="https://github.com/MU-Enigma" rel="noreferrer">
            MU Enigma
          </a>
        </nav>
      </header>

      <section className="hero shell" aria-labelledby="hero-title">
        <div className="eyebrow">
          <span>Hacktoberfest &apos;26</span>
          <span>Open source campus utility</span>
        </div>
        <div className="hero-grid">
          <div>
            <p className="kicker">One shared product. Many focused PRs.</p>
            <h1 id="hero-title">
              Make campus signals
              <span> easier to act on.</span>
            </h1>
          </div>
          <div className="hero-aside">
            <p>
              SIGNAL brings important email announcements and everyday campus
              maintenance complaints into two calm, trackable workflows.
            </p>
            <a className="primary-link" href="#contribute">
              Find your challenge <span aria-hidden="true">↘</span>
            </a>
          </div>
        </div>
        <div className="signal-line" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </section>

      <section
        className="section shell"
        id="product"
        aria-labelledby="tracks-title"
      >
        <div className="section-heading">
          <p className="section-index">01 / PRODUCT MAP</p>
          <div>
            <h2 id="tracks-title">Build a feature, strengthen the whole.</h2>
            <p>
              Challenges are GitHub issues with a goal, observable acceptance
              criteria, required evidence, and a deliberately narrow scope.
            </p>
          </div>
        </div>
        <div className="track-grid">
          {tracks.map((track) => (
            <Link className="track-card" href={track.href} key={track.code}>
              <div className="track-meta">
                <span>{track.code}</span>
                <span>{track.range}</span>
              </div>
              <h3>{track.title}</h3>
              <p>{track.detail}</p>
              <span className="card-arrow" aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section
        className="section shell contribute"
        id="contribute"
        aria-labelledby="contribute-title"
      >
        <div className="section-heading">
          <p className="section-index">02 / START HERE</p>
          <div>
            <h2 id="contribute-title">Claim. Build. Prove. Review.</h2>
            <p>
              Start in mock mode—no mailbox account, real email, or student data
              is needed. Every contribution stays focused on one assigned issue.
            </p>
          </div>
        </div>
        <ol className="steps">
          <li>
            <span>01</span>
            <div>
              <strong>Choose an available issue</strong>
              <p>Comment /claim and wait for a maintainer to assign it.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <strong>Work in a focused branch</strong>
              <p>
                Use challenge/SIG-###-short-name and keep the change scoped.
              </p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <strong>Open an evidence-backed PR</strong>
              <p>
                Link the issue, add tests, and disclose material AI assistance.
              </p>
            </div>
          </li>
        </ol>
        <div className="boundary-note">
          <span className="status-dot" aria-hidden="true" />
          <p>
            <strong>Privacy boundary:</strong> use synthetic fixtures only.
            Never commit tokens, passwords, raw personal email, or real
            complaint data.
          </p>
        </div>
      </section>

      <footer className="shell">
        <span>SIGNAL / MU Enigma</span>
        <span>Built in the open · 2026</span>
      </footer>
    </main>
  );
}
