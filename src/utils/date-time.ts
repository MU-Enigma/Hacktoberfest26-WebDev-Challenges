import { APP_LOCALE, APP_TIME_ZONE } from "../config/application";

export type DateInput = Date | string | number | null | undefined;
export type DateTimeOptions = { timeZone?: string };
export type RelativeTimeOptions = DateTimeOptions & { now?: DateInput };
export type DeadlineState = "future" | "today" | "overdue" | "missing" | "invalid";
export type DeadlineInfo = { state: DeadlineState; label: string };

const SECOND = 1_000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function isMissing(value: DateInput): boolean {
  return value == null || (typeof value === "string" && value.trim() === "");
}

/** Only accept instants: ISO timestamps with a zone, Date objects, or epoch ms. */
function parseInstant(value: DateInput): Date | null {
  if (value == null || isMissing(value)) return null;

  if (typeof value === "string") {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/i.exec(value.trim());
    if (!match) return null;

    const [, year, month, day, hour, minute] = match.map(Number);
    const second = Number(match[6] ?? 0);
    const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    // Date.parse otherwise silently rolls dates such as February 30 into March.
    if (
      month < 1 || month > 12 || day < 1 || day > daysInMonth[month - 1] ||
      hour > 23 || minute > 59 || second > 59
    ) return null;
  }

  const date = new Date(value instanceof Date
    ? value.getTime()
    : typeof value === "string" ? value.trim() : value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function referenceDate(now: DateInput): Date {
  const date = parseInstant(now === undefined ? new Date() : now);
  if (!date) throw new RangeError("now must be a valid instant");
  return date;
}

function timestamp(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat(APP_LOCALE, {
    timeZone,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZoneName: "short",
  }).format(date);
}

// Compare calendar days in the selected zone, including 23/25-hour DST days.
function calendarDay(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat(APP_LOCALE, {
    timeZone, year: "numeric", month: "numeric", day: "numeric",
  }).formatToParts(date);
  const part = (type: string) => Number(parts.find((item) => item.type === type)!.value);
  const day = new Date(0);
  day.setUTCFullYear(part("year"), part("month") - 1, part("day"));
  return day.getTime() / DAY;
}

/** Missing/invalid values return readable text. Strings must include Z or an offset. */
export function formatTimestamp(
  value: DateInput,
  { timeZone = APP_TIME_ZONE }: DateTimeOptions = {},
): string {
  if (isMissing(value)) return "No date provided";
  const date = parseInstant(value);
  return date ? timestamp(date, timeZone) : "Invalid date";
}

/**
 * Uses calendar-day wording across local midnight, elapsed time within a day.
 * Pass a shared `now` when rendering a list or server/client snapshot.
 */
export function formatRelativeTime(
  value: DateInput,
  { timeZone = APP_TIME_ZONE, now }: RelativeTimeOptions = {},
): string {
  if (isMissing(value)) return "No date provided";
  const date = parseInstant(value);
  if (!date) return "Invalid date";
  const reference = referenceDate(now);
  const days = calendarDay(date, timeZone) - calendarDay(reference, timeZone);
  const formatter = new Intl.RelativeTimeFormat(APP_LOCALE, { numeric: "auto" });
  if (days !== 0) return formatter.format(days, "day");

  const delta = date.getTime() - reference.getTime();
  if (Math.abs(delta) < SECOND) return "now";
  const unit = Math.abs(delta) >= HOUR ? "hour" : Math.abs(delta) >= MINUTE ? "minute" : "second";
  const divisor = unit === "hour" ? HOUR : unit === "minute" ? MINUTE : SECOND;
  return formatter.format(Math.trunc(delta / divisor), unit);
}

/**
 * Compare exact instants before calendar dates. At the deadline it is due now;
 * it becomes overdue only once `now` is later. Invalid `now`/timezones throw.
 */
export function getDeadlineInfo(
  value: DateInput,
  { timeZone = APP_TIME_ZONE, now }: RelativeTimeOptions = {},
): DeadlineInfo {
  if (isMissing(value)) return { state: "missing", label: "No deadline" };
  const date = parseInstant(value);
  if (!date) return { state: "invalid", label: "Invalid deadline" };
  const reference = referenceDate(now);
  const formatted = timestamp(date, timeZone);
  if (date.getTime() < reference.getTime()) {
    return { state: "overdue", label: `Overdue since ${formatted}` };
  }
  if (date.getTime() === reference.getTime()) {
    return { state: "today", label: `Due now (${formatted})` };
  }
  if (calendarDay(date, timeZone) === calendarDay(reference, timeZone)) {
    return { state: "today", label: `Due today (${formatted})` };
  }
  return { state: "future", label: `Due ${formatted}` };
}
