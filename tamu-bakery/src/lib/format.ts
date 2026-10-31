export const kes = (n: number) => "KES " + Math.round(n).toLocaleString("en-KE");

export const leadText = (days: number) =>
  days === 0 ? "Ready the same day" : "Order " + days + " day" + (days > 1 ? "s" : "") + " ahead";
