# SIG-002 Required Evidence: Announcement Loading, Empty, and Error States

**Challenge:** SIG-002 — Add announcement loading, empty, and error states  
**Branch:** `SIG-002`  
**Components:**
- [`src/components/announcement-feed.tsx`](file:///home/ehe/HacktoberFest_2026/eggspirimentations/Hacktoberfest26-WebDev-Challenges/src/components/announcement-feed.tsx)
- [`src/components/announcement-feed.test.tsx`](file:///home/ehe/HacktoberFest_2026/eggspirimentations/Hacktoberfest26-WebDev-Challenges/src/components/announcement-feed.test.tsx)
- [`src/app/announcements/page.tsx`](file:///home/ehe/HacktoberFest_2026/eggspirimentations/Hacktoberfest26-WebDev-Challenges/src/app/announcements/page.tsx)
- [`src/app/globals.css`](file:///home/ehe/HacktoberFest_2026/eggspirimentations/Hacktoberfest26-WebDev-Challenges/src/app/globals.css)

---

## Evidence Item 1: Component Tests for All Three States

All three states are implemented and covered by unit & component tests in [`src/components/announcement-feed.test.tsx`](file:///home/ehe/HacktoberFest_2026/eggspirimentations/Hacktoberfest26-WebDev-Challenges/src/components/announcement-feed.test.tsx).

### 1. Loading State Tests
- **Stable Skeleton Dimensions (Zero Layout Shift):** Verifies that [`AnnouncementSkeletonRow`](file:///home/ehe/HacktoberFest_2026/eggspirimentations/Hacktoberfest26-WebDev-Challenges/src/components/announcement-feed.tsx#L154-L173) and [`AnnouncementRow`](file:///home/ehe/HacktoberFest_2026/eggspirimentations/Hacktoberfest26-WebDev-Challenges/src/components/announcement-feed.tsx#L373-L405) share `.announcement-row` box-sizing, padding (`14px 16px`), margin (`12px`), borders, and line heights.
- **ARIA Status & Busy:** Verifies `role="status"`, `aria-busy="true"`, and `aria-label="Loading announcements"`.
- **Placeholder Accessibility:** Verifies `aria-hidden="true"` on skeleton rows to avoid screen reader clutter.
- **Dynamic Live Announcement:** Verifies that screen readers announce `"Loading announcements. Please wait..."`.
- **Skeleton Count Support:** Verifies rendering arbitrary number of skeleton placeholders (default 3).

### 2. Empty State Tests
- **Explanation of Absent Messages:** Verifies that [`AnnouncementFeedEmpty`](file:///home/ehe/HacktoberFest_2026/eggspirimentations/Hacktoberfest26-WebDev-Challenges/src/components/announcement-feed.tsx#L212-L289) explains why announcements are unpopulated (read-only delegated ingestion from university accounts).
- **Synthetic Mock Mailbox Guidance & Trigger:** Verifies instructions for Step 01 and verifies that clicking `Load Mock Mailbox` executes `onLoadMockMailbox()`.
- **Live Campus Mailbox Connection Guidance:** Verifies instructions for Step 02 explaining delegated OAuth 2.0 connection and verifies `onConnectMailbox()` execution.
- **Automatic Fallback:** Verifies that [`AnnouncementFeed`](file:///home/ehe/HacktoberFest_2026/eggspirimentations/Hacktoberfest26-WebDev-Challenges/src/components/announcement-feed.tsx#L423-L503) automatically switches to empty state when `items` is empty (`[]`).
- **Screen Reader Update:** Verifies live status message `"Announcement feed is empty. No messages available. Connect a campus mailbox or click Load Mock Mailbox to test."`.

### 3. Error State Tests
- **Clear Failure Explanation:** Verifies that [`AnnouncementFeedError`](file:///home/ehe/HacktoberFest_2026/eggspirimentations/Hacktoberfest26-WebDev-Challenges/src/components/announcement-feed.tsx#L302-L362) renders an alert panel explaining provider timeout, connectivity drop, or expired session.
- **Assertive Alert Role:** Verifies `role="alert"` and `aria-live="assertive"`.
- **Retry Action Exposer:** Verifies that `Retry Synchronization` button triggers the `onRetry()` callback.
- **Fallback Mock Action:** Verifies that `Fallback: Load Mock Mailbox` button triggers `onLoadMockMailbox()`.
- **Token & Server Error Redaction:** Verifies that [`sanitizeErrorMessage`](file:///home/ehe/HacktoberFest_2026/eggspirimentations/Hacktoberfest26-WebDev-Challenges/src/components/announcement-feed.tsx#L27-L144) redacts Bearer tokens, OAuth credentials, JWTs, SQL queries, Node stack traces, runtime exceptions (`TypeError`), and raw 500 status dumps.
- **Keyboard Auto-Focus:** Verifies `autoFocus` prop on `Retry Synchronization` button for immediate keyboard accessibility.
- **Screen Reader Guidance:** Verifies assertive announcement: `"Error: <message>. Press Retry Synchronization to attempt loading again."`.

### Test Suite Execution Output
```
$ npm run test

 RUN  v5.0.3 /home/ehe/HacktoberFest_2026/eggspirimentations/Hacktoberfest26-WebDev-Challenges

 ✓ src/data/mock-data.test.ts (2 tests) 7ms
 ✓ src/components/announcement-feed.test.tsx (23 tests) 62ms

 Test Files  2 passed (2)
      Tests  25 passed (25)
   Start at  02:05:52
   Duration  475ms
```

---

## Evidence Item 2: Keyboard Notes for the Retry Action

### 1. Navigation Flow & Key Sequences

```
[ Error State Rendered ]
          │
          ▼
   [ Tab Key Pressed ]  ──► Focus lands on <button class="retry-button">
          │
          ▼
 [ Enter / Space Pressed ] ──► Triggers onRetry() / handleRetry()
          │
          ▼
 [ Loading Skeletons ]  ──► Feed enters status="loading" (aria-busy="true")
          │
          ▼
[ Clean Feed Recovery ] ──► Settles on refreshed feed or empty standby state
```

### 2. Step-by-Step Interaction Table

| Sequence | User Key / Event | DOM Element Focused | Visual / Focus Ring Indicator | Assistive Technology & ARIA Status |
| :--- | :--- | :--- | :--- | :--- |
| **0. Initial Failure** | Page error occurs or loads with error | Document body / active viewport | Error state banner appears: `FEED STATUS: SYNC FAILURE` with red alert badge `!` | Screen reader announces immediately (`role="alert"`, `aria-live="assertive"`): *"Error: Network connection timed out while contacting announcement provider. Press Retry Synchronization to attempt loading again."* |
| **1. Focus to Retry** | <kbd>Tab</kbd> (or `autoFocusRetry={true}`) | `<button type="button" class="classic-button retry-button">` | Visible high-contrast 2px solid navy outline (`outline: 2px solid var(--navy); outline-offset: 2px;`) per WCAG 2.4.11 & 2.4.12. | Screen reader announces: *"Retry announcement synchronization, button"*. |
| **2. Button Activation** | <kbd>Enter</kbd> or <kbd>Space</kbd> | `Retry Synchronization` button | Active button state: 3D beveled border inverts (`border-top: var(--dark-shadow); border-bottom: var(--white)`). | Keyboard event triggers `handleRetry()`. |
| **3. Loading State Transition** | State updates to `isLoading = true` | Feed container (`data-status="loading"`) | Feed transitions into stable shimmer skeleton rows. Zero layout shift (height remains 122px per card). | Screen reader announces (`role="status"`, `aria-live="polite"`): *"Loading announcements. Please wait..."* with `aria-busy="true"`. |
| **4. Recovery State** | Timer/sync completes (`isLoading = false`) | Recovered feed container | Error banner is unmounted; feed renders populated announcement rows or standby empty state. Any URL query parameters cleared. | Screen reader announces: *"X announcements loaded"* or *"Announcement feed is empty. No messages available."* |
| **5. Alternative Navigation** | <kbd>Tab</kbd> from Retry button (before activation) | `<button type="button" class="classic-button secondary-action-btn">` | Focus moves to `Fallback: Load Mock Mailbox` with visible navy focus outline. | Screen reader announces: *"Switch to local mock mailbox fallback, button"*. Pressing <kbd>Enter</kbd> loads synthetic announcements immediately. |

### 3. Keyboard Verification Checklist
- [x] **Native Element:** Action uses native HTML `<button type="button">`, ensuring built-in browser keyboard activation via both <kbd>Enter</kbd> and <kbd>Space</kbd>.
- [x] **Visible Focus:** Styled with `:focus-visible` to render a prominent, high-contrast 2px outline without relying on browser default styles.
- [x] **Logical Tab Order:** Focus moves sequentially from error callout to `Retry Synchronization`, then to `Fallback: Load Mock Mailbox`.
- [x] **No Focus Traps:** Focus can freely tab backward (<kbd>Shift</kbd>+<kbd>Tab</kbd>) or forward (<kbd>Tab</kbd>).
- [x] **Immediate Screen Reader Context:** The alert region announces the retry instruction before user interaction, directing keyboard users immediately to the action.

### 4. Desktop View
![[SIG-002_desktop.png]]
