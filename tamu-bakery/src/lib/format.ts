// src/lib/format.ts
// Small text helpers that are safe to use in the browser as well as on the server.

export const kes = (n: number) => "KES " + Math.round(n).toLocaleString("en-KE");

export const leadText = (days: number) =>
  days === 0 ? "Ready the same day" : "Order " + days + " day" + (days > 1 ? "s" : "") + " ahead";
