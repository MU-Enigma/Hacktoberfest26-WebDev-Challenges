"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { Announcement, AnnouncementFeed } from "@/components/announcement-feed";
import {
  isAnnouncementMail,
  mockAnnouncementsFixture,
  normalizeMailToAnnouncement,
  rawMockMessages,
} from "@/data/announcement-fixtures";

import { groupRevisions } from "@/announcements/revisions";
import {
  AnnouncementRevisionHistory,
  RevisionSuggestions,
} from "@/components/announcement-revisions";
import { revisionDemoMessages } from "@/data/revision-fixtures";
const sourceMessages = [...rawMockMessages, ...revisionDemoMessages];

export default function AnnouncementsPage() {
  const [confirmedRevisions, setConfirmedRevisions] = useState<Set<string>>(
    new Set(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<Announcement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("id") || null;
    }
    return null;
  });
  const [error, setError] = useState<unknown>(null);

  // Initial check on mount: brief loading skeleton settling on simulated or empty state
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        setSelectedId(params.get("id") || null);
      }
    };
    window.addEventListener("popstate", handlePopState);

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
          // Ingest raw mail messages, filtering out unrelated conversations
          const announcementMail = sourceMessages
            .filter(isAnnouncementMail)
            .map(normalizeMailToAnnouncement);
          setItems(announcementMail);
          setIsLoading(false);
          return;
        }
      }

      setIsLoading(false);
    }, 600);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const handleSelectAnnouncement = (announcement: Announcement | null) => {
    const nextId = announcement ? announcement.id : null;
    setSelectedId(nextId);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (nextId) {
        url.searchParams.set("id", nextId);
      } else {
        url.searchParams.delete("id");
      }
      window.history.replaceState({}, "", url.toString());
    }
  };

  const handleLoadMockMailbox = () => {
    setIsLoading(true);
    setError(null);

    // Filter raw messages so announcement mail appears, while unrelated mock conversations do not
    setTimeout(() => {
      const announcementMail = sourceMessages
        .filter(isAnnouncementMail)
        .map(normalizeMailToAnnouncement);
      setItems(
        announcementMail.length > 0
          ? announcementMail
          : [...mockAnnouncementsFixture],
      );
      setIsLoading(false);
    }, 500);
  };

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);

    // If error was simulated via query parameter, clear the parameter on retry
    if (typeof window !== "undefined" && window.location.search) {
      const url = new URL(window.location.href);
      url.searchParams.delete("simulate");
      url.searchParams.delete("state");
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url.toString());
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
        setError(
          new Error(
            "Network connection offline: unable to reach mailbox server",
          ),
        );
      } else if (items.length === 0) {
        // Mailbox is checked but empty
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    }, 600);
  };

  const loadedIds = new Set(items.map((item) => item.id));
  const revisions = groupRevisions(
    sourceMessages.filter((message) => loadedIds.has(message.id)),
    confirmedRevisions,
  );
  const groupedItems = revisions.groups
    .map((group) => items.find((item) => item.id === group.latest.id)!)
    .filter(Boolean);
  const selectedGroup = revisions.groups.find((group) =>
    group.messages.some((message) => message.id === selectedId),
  );

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

      <RevisionSuggestions
        suggestions={revisions.suggestions}
        onConfirm={(key) =>
          setConfirmedRevisions((previous) => new Set([...previous, key]))
        }
      />
      <div className="announcement-workspace-container">
        {/* Natural Announcement Feed with loading, empty, and error states */}
        <AnnouncementFeed
          status={
            isLoading
              ? "loading"
              : error
                ? "error"
                : items.length === 0
                  ? "empty"
                  : "ready"
          }
          items={groupedItems}
          renderControls={(item) => {
            const group = revisions.groups.find(
              (group) => group.latest.id === item.id,
            );
            return group ? <AnnouncementRevisionHistory group={group} /> : null;
          }}
          selectedId={selectedGroup?.latest.id ?? selectedId}
          onSelectAnnouncement={handleSelectAnnouncement}
          pageSize={5}
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
            SIGNAL connects to university email accounts using delegated,
            read-only OAuth permissions. Messages are analyzed locally; mailbox
            contents are never modified or stored on external servers.
          </p>
          <button
            type="button"
            className="classic-button"
            onClick={handleSync}
            style={{
              marginLeft: "auto",
              alignSelf: "center",
              whiteSpace: "nowrap",
            }}
          >
            Check Mailbox
          </button>
        </fieldset>
      </div>
    </AppShell>
  );
}
