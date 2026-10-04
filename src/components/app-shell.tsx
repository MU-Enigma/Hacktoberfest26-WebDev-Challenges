import Link from "next/link";
import type { ReactNode } from "react";

type AppShellProps = {
  activePath: "/" | "/announcements" | "/complaints";
  pageLabel: string;
  children: ReactNode;
};

const navigation = [
  { href: "/", label: "Overview", icon: "grid" },
  { href: "/announcements", label: "Announcements", icon: "mail" },
  { href: "/complaints", label: "Complaints", icon: "message" },
] as const;

const binaryRows = Array.from({ length: 34 }, (_, index) =>
  index % 2 === 0
    ? "0110100001110100011101000111000001110011001110100010111100101111011100110110100101100111011011100110000101101100"
    : "0011010100110001001101000011000100110101001100100011000000110010001101100011000000110100001100010011001100110001",
);

function NavigationIcon({ name }: { name: (typeof navigation)[number]["icon"] }) {
  if (name === "mail") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 6h16v12H4z" />
        <path d="m5 7 7 5 7-5" />
      </svg>
    );
  }

  if (name === "message") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 5h16v12H9l-5 3z" />
        <path d="M8 9h8M8 13h6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
    </svg>
  );
}

function WindowControls() {
  return (
    <span className="window-controls" aria-hidden="true">
      <i>_</i>
      <i>[]</i>
      <i>x</i>
    </span>
  );
}

export function AppShell({ activePath, pageLabel, children }: AppShellProps) {
  return (
    <div className="desktop">
      <div className="binary-wallpaper" aria-hidden="true">
        {binaryRows.map((row, index) => (
          <span key={`${row}-${index}`}>{row.repeat(3)}</span>
        ))}
      </div>

      <section className="workspace-window">
        <header className="window-titlebar">
          <div>
            <span className="tiny-signal" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            SIGNAL Workspace - {pageLabel}
          </div>
          <WindowControls />
        </header>

        <div className="window-menubar" aria-label="Application menu">
          <span><u>F</u>ile</span>
          <span><u>V</u>iew</span>
          <span><u>M</u>odules</span>
          <span><u>H</u>elp</span>
        </div>

        <div className="workspace-body">
          <aside className="sidebar">
            <div className="brand-panel">
              <span className="brand-mark" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <div>
                <strong>SIGNAL</strong>
                <small>Campus utility</small>
              </div>
            </div>

            <fieldset className="group-box navigation-box">
              <legend>Navigation</legend>
              <nav aria-label="Application navigation">
                {navigation.map((item) => (
                  <Link
                    className={activePath === item.href ? "nav-item active" : "nav-item"}
                    href={item.href}
                    key={item.href}
                    aria-current={activePath === item.href ? "page" : undefined}
                  >
                    <span className="nav-icon">
                      <NavigationIcon name={item.icon} />
                    </span>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </fieldset>

            <fieldset className="group-box source-box">
              <legend>Data source</legend>
              <div className="source-status">
                <span aria-hidden="true" />
                <div>
                  <strong>LOCAL</strong>
                  <small>Synthetic records</small>
                </div>
              </div>
            </fieldset>

            <button className="classic-button sidebar-help" type="button">
              About SIGNAL
            </button>
          </aside>

          <div className="app-main">
            <div className="location-bar">
              <span>Address</span>
              <div>C:\SIGNAL\{pageLabel.toUpperCase()}</div>
            </div>
            <main className="page-content">{children}</main>
          </div>
        </div>

        <footer className="window-statusbar">
          <span>System ready</span>
          <span>3 objects</span>
          <span>Local mode</span>
        </footer>
      </section>

      <section className="identity-window" aria-label="SIGNAL identity">
        <header className="window-titlebar compact">
          <span>Signal</span>
          <WindowControls />
        </header>
        <div className="identity-content">
          <span className="identity-bars" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <strong>SIGNAL</strong>
        </div>
      </section>

      <footer className="taskbar">
        <button type="button" className="start-button">
          <span aria-hidden="true">S</span> Start
        </button>
        <div className="taskbar-program">
          <span className="tiny-signal" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          SIGNAL Workspace
        </div>
        <div className="taskbar-tray">
          <span aria-hidden="true">o</span> LOCAL
        </div>
      </footer>
    </div>
  );
}

type UnderConstructionBoardProps = {
  code: string;
  title: string;
  description: string;
  items: readonly string[];
  tone: "blue" | "purple";
};

export function UnderConstructionBoard({
  code,
  title,
  description,
  items,
  tone,
}: UnderConstructionBoardProps) {
  return (
    <section className={`module-window ${tone}`}>
      <header className="window-titlebar inner-titlebar">
        <span>{code}</span>
        <WindowControls />
      </header>

      <div className="module-window-body">
        <div className="construction-message">
          <div className="construction-icon" aria-hidden="true">
            <span>!</span>
          </div>
          <div>
            <p className="status-label">BUILD STATUS</p>
            <h2>MODULE UNDER CONSTRUCTION</h2>
            <p className="module-kicker">{title}</p>
            <p>{description}</p>
          </div>
        </div>

        <fieldset className="group-box progress-box">
          <legend>Progress</legend>
          <div className="classic-progress" aria-label="Initial module scaffold complete">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <p>Initial workspace scaffold loaded. Feature modules are pending.</p>
        </fieldset>

        <fieldset className="group-box planned-box">
          <legend>Planned components</legend>
          <ul>
            {items.map((item, index) => (
              <li key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {item}
              </li>
            ))}
          </ul>
        </fieldset>

        <div className="module-actions">
          <button className="classic-button" type="button">View details</button>
          <button className="classic-button" type="button">Close</button>
        </div>
      </div>
    </section>
  );
}
