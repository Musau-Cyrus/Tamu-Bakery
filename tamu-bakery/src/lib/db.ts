import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSecret } from "astro:env/server";

// The shape of each table. Keep in step with supabase/schema.sql.
export type OrderStatus = "pending" | "paid" | "failed" | "baking" | "ready" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "cancelled";

export type OrderRow = {
  id: string;
  ref: string;
  customer_name: string;
  phone: string;
  fulfilment: "delivery" | "pickup";
  zone: string | null;
  address: string | null;
  delivery_date: string; // YYYY-MM-DD
  time_slot: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  amount_due: number;
  status: OrderStatus;
  paid_at: string | null;
  created_at: string;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  name: string;
  size_label: string;
  flavour: string;
  note: string | null;
  qty: number;
  unit_price: number;
};

export type PaymentRow = {
  id: string;
  order_id: string;
  checkout_request_id: string | null;
  merchant_request_id: string | null;
  amount: number;
  mpesa_receipt: string | null;
  result_code: number | null;
  result_desc: string | null;
  status: PaymentStatus;
  created_at: string;
};

let client: SupabaseClient | undefined;

// The client is created the first time it is needed (not when the file loads),
// because on Cloudflare the secrets are only available while a request is being handled.
export function getDb(): SupabaseClient {
  if (client) return client;

  const url = getSecret("SUPABASE_URL");
  const key = getSecret("SUPABASE_SECRET_KEY");

  if (!url || !key) {
    throw new Error(
      "Supabase is not set up. Add SUPABASE_URL and SUPABASE_SECRET_KEY to your .env file " +
        "(and to Cloudflare as secrets when you deploy)."
    );
  }

  client = createClient(url, key, {
    // This is a server, not a signed-in user, so there is no login session to keep.
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return client;
}