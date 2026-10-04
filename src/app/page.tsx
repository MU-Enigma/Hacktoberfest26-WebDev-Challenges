import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { mockComplaints, mockMail } from "@/data/mock-data";

const modules = [
  {
    id: "ANNOUNCE.EXE",
    title: "Announcements",
    description: "Important updates, deadlines, and required actions.",
    href: "/announcements",
    icon: "A",
  },
  {
    id: "REPORT.EXE",
    title: "Complaints",
    description: "Routine campus reports and status tracking.",
    href: "/complaints",
    icon: "C",
  },
] as const;

export default function Home() {
  const openComplaints = mockComplaints.filter(
    (item) => item.status !== "resolved",
  ).length;

  return (
    <AppShell activePath="/" pageLabel="Overview">
      <section className="welcome-dialog">
        <div className="welcome-copy">
          <p className="eyebrow">SIGNAL CONTROL CENTRE</p>
          <h1>CAMPUS WORKSPACE READY</h1>
          <p>
            Important announcements and everyday campus reports are organized
            here. Select a module below to continue.
          </p>
        </div>
        <div className="welcome-logo" aria-hidden="true">
          <span><i /><i /><i /></span>
          <strong>SIGNAL</strong>
          <small>CAMPUS UTILITY</small>
        </div>
      </section>

      <div className="overview-grid">
        <fieldset className="group-box module-launcher">
          <legend>Installed modules</legend>
          <div className="program-grid">
            {modules.map((module) => (
              <Link className="program-item" href={module.href} key={module.id}>
                <span className="program-icon" aria-hidden="true">{module.icon}</span>
                <div>
                  <strong>{module.title}</strong>
                  <small>{module.description}</small>
                  <code>{module.id}</code>
                </div>
              </Link>
            ))}
          </div>
        </fieldset>

        <section className="status-window">
          <header className="window-titlebar inner-titlebar">
            <span>Workspace Status</span>
            <span className="window-controls" aria-hidden="true">
              <i>_</i><i>[]</i><i>x</i>
            </span>
          </header>
          <div className="status-window-body">
            <h2>SYSTEM ONLINE</h2>
            <dl>
              <div>
                <dt>Announcements indexed</dt>
                <dd>{String(mockMail.length).padStart(2, "0")}</dd>
              </div>
              <div>
                <dt>Open complaints</dt>
                <dd>{String(openComplaints).padStart(2, "0")}</dd>
              </div>
              <div>
                <dt>Data source</dt>
                <dd>LOCAL</dd>
              </div>
            </dl>
            <button className="classic-button" type="button">Refresh</button>
          </div>
        </section>
      </div>

      <fieldset className="group-box privacy-notice">
        <legend>Privacy notice</legend>
        <span className="notice-icon" aria-hidden="true">i</span>
        <p>
          This starter workspace uses synthetic records only. No mailbox
          account, personal email, or real complaint information is connected.
        </p>
      </fieldset>
    </AppShell>
  );
}
