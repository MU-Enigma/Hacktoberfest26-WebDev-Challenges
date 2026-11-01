import React, { useState } from "react";
import {
  AnnouncementPriorityBadge,
  PRIORITY_CONFIG,
} from "../../src/components/announcement-priority-badge";
import { mockAnnouncementsFixture } from "../../src/data/announcement-fixtures";

const priorities = [
  "urgent",
  "action_required",
  "upcoming",
  "informational",
] as const;

const fallbackExamples = [
  { label: "Undefined value", val: undefined },
  { label: "Null value", val: null },
  { label: "Empty string", val: "" },
  { label: "Unknown string ('emergency')", val: "emergency" },
  { label: "Unknown string ('critical')", val: "critical" },
  { label: "Inherited key ('constructor')", val: "constructor" },
];

const rowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  alignItems: "center",
  marginTop: 8,
};

/**
 * Local review gallery demonstrating AnnouncementPriorityBadge across:
 * - Canonical priorities (urgent, action_required, upcoming, informational)
 * - Safe neutral fallback for unknown, missing, and invalid values
 * - Light selected surface (#edf5fc) and white surface (#ffffff)
 * - Dark base surface (#050505) and dark shadow surface (#151515)
 * - Explicit focus and hover behaviors with interactive testing controls
 * - Real synthetic announcement fixtures
 *
 * No permanent route or production navigation is added.
 */
export default function AnnouncementPriorityBadgeExamples() {
  const [activeItem, setActiveItem] = useState<string>("None");
  const [clickCount, setClickCount] = useState<number>(0);

  const handleBadgeClick = (name: string) => {
    setActiveItem(name);
    setClickCount((c) => c + 1);
  };

  return (
    <main
      style={{
        maxWidth: 960,
        margin: "24px auto",
        padding: 24,
        background: "#c0c0c0",
        color: "#111",
        fontFamily: 'Tahoma, "MS Sans Serif", "Segoe UI", sans-serif',
      }}
    >
      <header
        style={{
          borderBottom: "2px solid #808080",
          paddingBottom: 12,
          marginBottom: 20,
        }}
      >
        <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 700 }}>
          Announcement Priority Badges (SIG-001)
        </h1>
        <p style={{ margin: 0, color: "#333", fontSize: 13 }}>
          Reusable priority badges with dual-signal text and iconography,
          resilient fallbacks, multi-surface contrast, and accessible
          focus/hover specifications. Synthetic data only.
        </p>
      </header>

      {/* Section 1: Canonical priorities & Fallback Overview */}
      <section
        aria-labelledby="overview-heading"
        style={{
          background: "#dfdfdf",
          border: "2px solid #fff",
          borderRightColor: "#808080",
          borderBottomColor: "#808080",
          padding: 16,
          marginBottom: 20,
        }}
      >
        <h2 id="overview-heading" style={{ margin: "0 0 8px", fontSize: 16 }}>
          1. Canonical Priorities & Fallbacks
        </h2>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "#444" }}>
          Each priority pairs distinctive text with an icon/shape so color is
          never the only signal (WCAG 1.4.1).
        </p>

        <div style={rowStyle}>
          {priorities.map((p) => (
            <div
              key={p}
              style={{ display: "flex", flexDirection: "column", gap: 4 }}
            >
              <span style={{ fontSize: 11, color: "#555" }}>{p}</span>
              <AnnouncementPriorityBadge priority={p} />
            </div>
          ))}
        </div>

        <h3 style={{ margin: "16px 0 6px", fontSize: 13 }}>
          Safe Fallbacks (Unknown, Missing, Inherited Keys)
        </h3>
        <p style={{ margin: "0 0 8px", fontSize: 12, color: "#555" }}>
          Unknown priorities fall back safely to <code>informational</code> (INFO
          / ℹ). Raw strings are never reflected.
        </p>
        <div style={rowStyle}>
          {fallbackExamples.map((ex, idx) => (
            <div
              key={idx}
              style={{ display: "flex", flexDirection: "column", gap: 4 }}
            >
              <span style={{ fontSize: 11, color: "#555" }}>{ex.label}</span>
              <AnnouncementPriorityBadge priority={ex.val} />
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Light Selected Surface */}
      <section
        aria-labelledby="light-surface-heading"
        style={{
          background: "#edf5fc",
          border: "2px solid #000080",
          padding: 16,
          marginBottom: 20,
        }}
      >
        <h2
          id="light-surface-heading"
          style={{ margin: "0 0 8px", fontSize: 16, color: "#000080" }}
        >
          2. Light Selected Surface (<code>#edf5fc</code>)
        </h2>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "#333" }}>
          Used when an announcement row is selected in the master-detail feed.
          Solid opaque backgrounds, high-contrast text, and defined borders
          ensure clear readability against light blue and white surfaces.
        </p>
        <div style={rowStyle}>
          {priorities.map((p) => (
            <AnnouncementPriorityBadge key={p} priority={p} />
          ))}
          <AnnouncementPriorityBadge priority="unrecognized-priority" />
        </div>
      </section>

      {/* Section 3: Dark Base Surface */}
      <section
        aria-labelledby="dark-surface-heading"
        style={{
          background: "#050505",
          color: "#ffffff",
          border: "2px solid #808080",
          padding: 16,
          marginBottom: 20,
        }}
      >
        <h2
          id="dark-surface-heading"
          style={{ margin: "0 0 8px", fontSize: 16, color: "#fff" }}
        >
          3. Dark Base Surface (<code>#050505</code>)
        </h2>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "#aaa" }}>
          Matches the desktop black canvas and dark modal titlebars. 1px
          perimeter box-shadow ensures the dark navy and informational badges
          maintain clear perimeter boundaries without blending into black.
        </p>
        <div style={rowStyle}>
          {priorities.map((p) => (
            <AnnouncementPriorityBadge key={p} priority={p} />
          ))}
          <AnnouncementPriorityBadge priority="unrecognized-priority" />
        </div>
      </section>

      {/* Section 4: Focus and Hover Behavior Documentation */}
      <section
        aria-labelledby="focus-hover-heading"
        style={{
          background: "#ffffff",
          border: "1px solid #777",
          padding: 16,
          marginBottom: 20,
        }}
      >
        <h2 id="focus-hover-heading" style={{ margin: "0 0 8px", fontSize: 16 }}>
          4. Focus and Hover Behavior
        </h2>

        <div
          style={{
            fontSize: 12,
            lineHeight: 1.6,
            color: "#222",
            marginBottom: 16,
          }}
        >
          <p style={{ margin: "0 0 8px" }}>
            <strong>Static Badges (Default):</strong> When rendered without{" "}
            <code>interactive</code> or <code>onClick</code>, badges render as
            static <code>&lt;span&gt;</code> elements. They are intentionally{" "}
            <em>not</em> in the tab sequence (no <code>tabindex</code>) to
            prevent creating noisy tab stops for keyboard and screen-reader
            users.
          </p>
          <p style={{ margin: "0 0 8px" }}>
            <strong>Hover Behavior:</strong> Hovering elevates brightness via{" "}
            <code>filter: brightness(1.15)</code>, providing responsive visual
            feedback without altering the priority&apos;s semantic color.
          </p>
          <p style={{ margin: "0 0 8px" }}>
            <strong>Interactive Mode (Buttons / Filter Chips):</strong> When given{" "}
            <code>interactive</code> or <code>onClick</code>, the badge receives{" "}
            <code>role=&quot;button&quot;</code>, <code>tabIndex={0}</code>, and
            keyboard activation listeners (<code>Enter</code> and{" "}
            <code>Space</code>).
          </p>
          <p style={{ margin: 0 }}>
            <strong>Keyboard Focus Outline:</strong> On <code>:focus-visible</code>
            , badges show a dual high-contrast ring:{" "}
            <code>outline: 2px solid #ffffff</code> with{" "}
            <code>box-shadow: 0 0 0 4px #000080</code>. This dual-ring technique
            guarantees high visibility against both pure white and dark
            backgrounds.
          </p>
        </div>

        <div
          style={{
            background: "#f5f5f5",
            padding: 12,
            border: "1px solid #ccc",
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              display: "block",
              marginBottom: 6,
            }}
          >
            Interactive Focus &amp; Hover Playground (Press Tab to focus,
            Space/Enter to activate):
          </span>
          <div style={rowStyle}>
            {priorities.map((p) => (
              <AnnouncementPriorityBadge
                key={p}
                priority={p}
                interactive
                onClick={() => handleBadgeClick(PRIORITY_CONFIG[p].label)}
              />
            ))}
            <AnnouncementPriorityBadge
              priority="fallback"
              interactive
              onClick={() => handleBadgeClick("FALLBACK (INFO)")}
            />
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: "#555" }}>
            Status: <strong>Last activated: {activeItem}</strong> (Total clicks:{" "}
            {clickCount})
          </div>
        </div>
      </section>

      {/* Section 5: Real Announcement Fixtures */}
      <section aria-labelledby="fixtures-heading">
        <h2 id="fixtures-heading" style={{ margin: "0 0 8px", fontSize: 16 }}>
          5. Synthetic Announcement Fixtures
        </h2>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "#444" }}>
          Live fixtures from <code>src/data/announcement-fixtures.ts</code> rendered
          inside unselected and selected row containers.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {mockAnnouncementsFixture.map((ann, idx) => (
            <div
              key={ann.id}
              style={{
                background: idx === 0 ? "#edf5fc" : "#ffffff",
                border: "1px solid #808080",
                borderLeft:
                  idx === 0 ? "5px solid #a80000" : "1px solid #808080",
                padding: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 4,
                }}
              >
                <AnnouncementPriorityBadge priority={ann.priority} />
                <span style={{ fontSize: 11, color: "#666" }}>{ann.from}</span>
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 11,
                    fontFamily: "monospace",
                    color: "#888",
                  }}
                >
                  {ann.id}
                </span>
              </div>
              <strong
                style={{ fontSize: 13, display: "block", marginBottom: 2 }}
              >
                {ann.subject}
              </strong>
              <p style={{ margin: 0, fontSize: 12, color: "#444" }}>
                {ann.preview}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

