// src/lib/pricing.ts
import { ZONES } from "./delivery";

export const DEPOSIT_RATE = 0.5; // bridal cakes: share paid now

export type PriceLine = { unitPrice: number; qty: number; deposit: boolean };

export function priceCart(lines: PriceLine[], opts: { method: "delivery" | "pickup"; zoneId: string }) {
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0);
  const zone = ZONES.find((z) => z.id === opts.zoneId);
  const deliveryFee = opts.method === "delivery" && lines.length > 0 ? (zone ? zone.fee : 0) : 0;
  const total = subtotal + deliveryFee;
  const needsDeposit = lines.some((l) => l.deposit);
  const dueNow = needsDeposit ? Math.ceil(total * DEPOSIT_RATE) : total;
  return { subtotal, deliveryFee, total, needsDeposit, dueNow, balance: total - dueNow };
}
