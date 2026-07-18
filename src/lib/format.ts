const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
const full = new Intl.NumberFormat('en');
const dateFormat = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' });

export function formatCount(value: number): string {
  return value >= 1000 ? compact.format(value) : full.format(value);
}

export function formatDate(value: string | Date): string {
  return dateFormat.format(typeof value === 'string' ? new Date(value) : value);
}

/** "3 days ago" — rendered at build time; the daily metrics rebuild keeps it fresh. */
export function relativeDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  const seconds = (date.getTime() - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const steps: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
  ];
  for (const [unit, size] of steps) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return 'today';
}

export function reviewAge(value: string | Date): { label: string; stale: boolean; timestamp: number } {
  const date = typeof value === 'string' ? new Date(value) : value;
  const ageInDays = (Date.now() - date.getTime()) / 86400000;
  return {
    label: `Reviewed ${relativeDate(date)}`,
    stale: ageInDays > 180,
    timestamp: date.getTime(),
  };
}

/** "2.5 years" / "8 months" since a repo's createdAt. */
export function ageSince(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  const months = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
  if (months < 12) return `${Math.max(1, Math.round(months))} months`;
  const years = months / 12;
  return `${years >= 10 ? Math.round(years) : Math.round(years * 10) / 10} years`;
}
