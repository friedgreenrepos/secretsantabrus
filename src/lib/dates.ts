const TZ = "Europe/Rome";

/** Today's calendar date in Rome as YYYY-MM-DD. */
export function todayInRome(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(now);
}

/** "domenica 30 novembre 2026" */
export function formatDateIt(isoDate: string): string {
  return new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T12:00:00Z`));
}

/** Whole days from today (Rome) until the given date; 0 means today. */
export function daysUntil(isoDate: string, now = new Date()): number {
  const today = Date.parse(`${todayInRome(now)}T00:00:00Z`);
  const target = Date.parse(`${isoDate}T00:00:00Z`);
  return Math.round((target - today) / 86_400_000);
}

export function formatEuro(amount: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}
