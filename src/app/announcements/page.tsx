"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import {
  Announcement,
  AnnouncementFeed,
} from "@/components/announcement-feed";
import { mockMail } from "@/data/mock-data";

function createMockAnnouncements(): Announcement[] {
  const priorities: Announcement["priority"][] = [
    "action_required",
    "informational",
    "upcoming",
  ];
  return mockMail.map((m, index) => ({
    id: m.id,
    from: m.from,
    subject: m.subject,
    receivedAt: m.receivedAt,
    preview: m.preview,
    priority: priorities[index % priorities.length],
  }));
}

export default function AnnouncementsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<Announcement[]>([]);
  const [error, setError] = useState<unknown>(null);

  // Initial check on mount: brief loading skeleton settling on simulated or empty state
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const simulate = params.get("simulate") || params.get("state");
        const customError = params.get("error");

        if (simulate === "loading") {
          // Keep loading state active for manual or visual inspection
          return;
        }
        if (simulate === "error" || customError) {
          setIsLoading(false);
          setError(
            new Error(
              customError ||
                "Network connection timed out while contacting announcement provider.",
            ),
          );
          return;
        }
        if (simulate === "ready") {
          setItems(createMockAnnouncements());
          setIsLoading(false);
          return;
        }
      }

      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  const handleLoadMockMailbox = () => {
    setIsLoading(true);
    setError(null);

    // Simulate loading synthetic mock mailbox records
    setTimeout(() => {
      setItems(createMockAnnouncements());
      setIsLoading(false);
    }, 500);
  };

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);

    // If error was simulated via query parameter, clear the parameter on retry
    if (typeof window !== "undefined" && window.location.search) {
      window.history.replaceState({}, "", window.location.pathname);
    }

    // Simulate retrying synchronization
    setTimeout(() => {
      setIsLoading(false);
    }, 700);
  };

  const handleConnectMailbox = () => {
    alert(
      "Campus Mailbox Connection:\n\nTo link an institutional mailbox, configure delegated OAuth 2.0 in production settings. In local mode, synthetic records are loaded automatically.",
    );
  };

  const handleSync = () => {
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      // If offline or no mailbox is configured, explain what failed cleanly
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setError(new Error("Network connection offline: unable to reach mailbox server"));
      } else if (items.length === 0) {
        // Mailbox is checked but empty
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <AppShell activePath="/announcements" pageLabel="Announcements">
      <section className="page-heading module-heading">
        <div>
          <p className="overline">Module 01</p>
          <h1>Announcements</h1>
        </div>
        <p className="heading-copy">
          Important messages, clear deadlines, and required actions without the
          noise of a full inbox.
        </p>
      </section>

      <div className="announcement-workspace-container">
        {/* Natural Announcement Feed with loading, empty, and error states */}
        <AnnouncementFeed
          status={isLoading ? "loading" : error ? "error" : items.length === 0 ? "empty" : "ready"}
          items={items}
          error={error}
          onRetry={handleRetry}
          onLoadMockMailbox={handleLoadMockMailbox}
          onConnectMailbox={handleConnectMailbox}
          skeletonCount={3}
          autoFocusRetry={!!error}
        />

        {/* Informational workspace footer */}
        <fieldset className="group-box privacy-notice">
          <legend>Mailbox Sync</legend>
          <span className="notice-icon" aria-hidden="true">
            i
          </span>
          <p>
            SIGNAL connects to university email accounts using delegated, read-only
            OAuth permissions. Messages are analyzed locally; mailbox contents
            are never modified or stored on external servers.
          </p>
          <button
            type="button"
            className="classic-button"
            onClick={handleSync}
            style={{ marginLeft: "auto", alignSelf: "center", whiteSpace: "nowrap" }}
          >
            Check Mailbox
          </button>
        </fieldset>
      </div>
    </AppShell>
  );
}
