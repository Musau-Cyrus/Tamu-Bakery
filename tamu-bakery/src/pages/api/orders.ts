import type { APIRoute } from "astro";
import { getDb } from "../../lib/db";

type OrderRequest = {
  ref: string;
  customerName: string;
  phone: string;
  fulfilment: "delivery" | "pickup";
  zone: string | null;
  address: string | null;
  deliveryDate: string;
  timeSlot: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  amountDue: number;
  items: Array<{
    productId: string;
    name: string;
    sizeLabel: string;
    flavour: string;
    note: string | null;
    qty: number;
    unitPrice: number;
  }>;
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as OrderRequest;
    if (
      !body.ref ||
      !body.customerName ||
      !/^254[17]\d{8}$/.test(body.phone) ||
      !body.deliveryDate ||
      !body.timeSlot ||
      !Array.isArray(body.items) ||
      body.items.length === 0
    ) {
      return Response.json({ error: "Invalid order details" }, { status: 400 });
    }

    const db = getDb();
    const { data: order, error: orderError } = await db
      .from("orders")
      .insert({
        ref: body.ref,
        customer_name: body.customerName.trim(),
        phone: body.phone,
        fulfilment: body.fulfilment,
        zone: body.zone,
        address: body.address,
        delivery_date: body.deliveryDate,
        time_slot: body.timeSlot,
        subtotal: body.subtotal,
        delivery_fee: body.deliveryFee,
        total: body.total,
        amount_due: body.amountDue,
        status: "pending",
      })
      .select("id, ref, status")
      .single();

    if (orderError || !order) {
      console.error("Could not save order", orderError);
      return Response.json({ error: "Could not save order" }, { status: 500 });
    }

    const { error: itemsError } = await db.from("order_items").insert(
      body.items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        name: item.name,
        size_label: item.sizeLabel,
        flavour: item.flavour,
        note: item.note,
        qty: item.qty,
        unit_price: item.unitPrice,
      })),
    );

    if (itemsError) {
      await db.from("orders").delete().eq("id", order.id);
      console.error("Could not save order items", itemsError);
      return Response.json({ error: "Could not save order items" }, { status: 500 });
    }

    return Response.json({ order });
  } catch (error) {
    console.error("Invalid order request", error);
    return Response.json({ error: "Could not save order" }, { status: 500 });
  }
};