import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
const publishable = process.env.SUPABASE_PUBLISHABLE_KEY;

let failed = false;
const ok = (msg) => console.log("  OK   " + msg);
const bad = (msg, detail) => {
  failed = true;
  console.log("  FAIL " + msg + (detail ? "\n         " + detail : ""));
};

if (!url || !secret) {
  console.log("Add SUPABASE_URL and SUPABASE_SECRET_KEY to your .env file first.");
  process.exit(1);
}

const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
const admin = createClient(url, secret, options);
const ref = "TEST-" + Date.now();
let orderId;

console.log("Checking " + url + "\n");

// 1. Save a test order, item and payment
{
  const { data, error } = await admin
    .from("orders")
    .insert({
      ref,
      customer_name: "Test Customer",
      phone: "254712345678",
      fulfilment: "delivery",
      zone: "central",
      address: "Test address",
      delivery_date: new Date(Date.now() + 8 * 864e5).toISOString().slice(0, 10),
      time_slot: "Morning (8am to 12pm)",
      subtotal: 24000,
      delivery_fee: 350,
      total: 24350,
      amount_due: 12175,
    })
    .select()
    .single();

  if (error) {
    bad("Could not save an order", error.message + (error.code === "42501" ? "  (run the grant lines at the bottom of supabase/schema.sql)" : ""));
  } else {
    orderId = data.id;
    ok("Saved an order (" + data.ref + ", status " + data.status + ")");
  }
}

if (orderId) {
  const item = await admin.from("order_items").insert({
    order_id: orderId, product_id: "two-tier-bridal-cake", name: "Two-Tier Bridal Cake",
    size_label: "Serves 50", flavour: "Vanilla bean", note: "Blush and gold", qty: 1, unit_price: 24000,
  });
  item.error ? bad("Could not save an order item", item.error.message) : ok("Saved an order item");

  const pay = await admin.from("payments").insert({
    order_id: orderId, checkout_request_id: "ws_CO_TEST_" + Date.now(), amount: 12175,
  });
  pay.error ? bad("Could not save a payment", pay.error.message) : ok("Saved a payment");

  // 2. Read it back, with its items and payments
  const read = await admin.from("orders").select("ref, total, order_items(name, qty), payments(amount, status)").eq("id", orderId).single();
  if (read.error) bad("Could not read the order back", read.error.message);
  else if (read.data.order_items?.length === 1 && read.data.payments?.length === 1) ok("Read the order back with its item and payment");
  else bad("The order came back without its item or payment", JSON.stringify(read.data));

  // The database should refuse nonsense
  const wrongPhone = await admin.from("orders").insert({
    ref: ref + "-X", customer_name: "x", phone: "0712345678", fulfilment: "pickup",
    delivery_date: "2030-01-01", time_slot: "x", subtotal: 1, total: 1, amount_due: 1,
  });
  wrongPhone.error ? ok("Refused a phone number not in 2547XXXXXXXX form") : bad("Accepted a badly formatted phone number");
}

// 3. The public key must not be able to see orders
if (publishable) {
  const anon = createClient(url, publishable, options);
  const { data, error } = await anon.from("orders").select("ref").limit(5);
  if (error || !data || data.length === 0) {
    ok("The public key cannot read orders" + (error ? " (" + error.message + ")" : ""));
  } else {
    bad("The PUBLIC key could read orders. Do not go live until this is fixed.", "Check that Row Level Security is on for every table.");
  }
} else {
  console.log("  skip The public key check (add SUPABASE_PUBLISHABLE_KEY to .env to run it)");
}

// 4. Clean up (items and payments are deleted with the order)
if (orderId) {
  const del = await admin.from("orders").delete().eq("id", orderId);
  del.error ? bad("Could not delete the test order", del.error.message) : ok("Deleted the test order");
}

console.log(failed ? "\nSomething needs fixing (see FAIL above)." : "\nAll good. Your database is ready for Part 8.");
process.exit(failed ? 1 : 0);