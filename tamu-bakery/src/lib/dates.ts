// src/lib/dates.ts
export function addDays(days: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
}

export function toISODate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
}

// The earliest date allowed is today plus the longest notice in the cart.
export function earliestDate(leadDays: number[]): Date {
  return addDays(Math.max(0, ...leadDays));
}
