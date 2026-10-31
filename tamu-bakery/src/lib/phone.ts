// Accepts 0712345678, 0112345678, +254712345678 or 254712345678.
// Returns 2547XXXXXXXX, or null if it is not a valid Kenyan mobile number.
export function normalisePhone(input: string): string | null {
  const m = /^(?:\+?254|0)([17]\d{8})$/.exec(input.replace(/[\s-]/g, ""));
  return m ? "254" + m[1] : null;
}
