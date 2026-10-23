# Date and deadline utilities (SIG-003)

Import `formatTimestamp`, `formatRelativeTime`, and `getDeadlineInfo` from
`@/utils/date-time`. They are pure formatting/state helpers, independent of React
and deadline extraction. They do not mutate inputs or require a date library.

`src/config/application.ts` defines the application's default IANA timezone
(`Asia/Kolkata`) and display locale (`en-GB`). There was no existing timezone
setting in the scaffold. Server and client use the same config; the machine's
timezone is never used for formatting or deciding whether a deadline is today.
Each helper also accepts `{ timeZone: "America/New_York" }` for explicit overrides.

## Inputs and API

All three helpers accept `Date | string | number | null | undefined`. Numbers are
epoch **milliseconds**. Strings must be ISO timestamps with an explicit zone
(e.g. `2026-10-23T17:30:00+05:30` or `2026-10-23T12:00:00Z`). Date-only strings,
zone-less timestamps, impossible calendar dates, and invalid Date objects return
readable invalid-value text rather than guessing the timezone or rolling dates
forward. Convert date-only source text into an explicit deadline instant in the
extractor; these helpers deliberately do not guess an end-of-day cutoff.

```ts
const options = { now: "2026-10-23T12:00:00Z" };

formatTimestamp("2026-10-23T12:00:00Z");
// "23 Oct 2026, 17:30 GMT+5:30" (zone abbreviation may vary by Intl runtime)
formatRelativeTime("2026-10-23T11:58:00Z", options);
// "2 minutes ago"
getDeadlineInfo("2026-10-23T12:01:00Z", options);
// { state: "today", label: "Due today (23 Oct 2026, 17:31 GMT+5:30)" }
```

`getDeadlineInfo` returns `{ state, label }`. States are `future`, `today`,
`overdue`, `missing`, and `invalid`. Use the label as visible text, not color
alone. Labels include the absolute timestamp and timezone for valid deadlines.
Missing values produce `No deadline`; invalid values produce `Invalid deadline`.
The two other formatters return `No date provided` / `Invalid date` respectively.

Exact instants are compared **before** local calendar dates. A past time today
is overdue; a later time today is not. Equality means `today` with a `Due now`
label. The deadline becomes overdue one millisecond after it passes.

`formatRelativeTime` uses seconds/minutes/hours on the same local calendar date,
and calendar-day wording (`yesterday`, `tomorrow`, `in 2 days`) across midnight.
Thus one minute across midnight is `tomorrow`, not `in 1 minute`. Calendar days
are counted in the configured timezone, including daylight-saving transitions.

The relative/deadline helpers accept an optional `now` instant. Capture it once
for an entire list or server/client render to keep output consistent. It defaults
to the current clock. Invalid `now` and invalid IANA timezone configuration throw
`RangeError`; they indicate caller/configuration errors rather than absent data.

## Validation

Run `npm test -- src/utils/date-time.test.ts` for timezone/midnight, invalid input,
exact deadline, offset, leap-year, DST, and controlled-clock tests. Run
`npm run check` for the repository's complete lint, type, and test checks.
