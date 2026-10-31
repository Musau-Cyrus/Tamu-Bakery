import { persistentAtom } from "@nanostores/persistent";

export type CartItem = {
  productId: string;
  sizeIndex: number;
  flavour: string;
  note: string;
  qty: number;
};

// Saved in the browser (localStorage), so the cart survives a refresh.
export const cart = persistentAtom<CartItem[]>("tamu-cart", [], {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export function addItem(item: CartItem) {
  const items = cart.get().map((i) => ({ ...i }));
  const same = items.find(
    (i) =>
      i.productId === item.productId &&
      i.sizeIndex === item.sizeIndex &&
      i.flavour === item.flavour &&
      i.note === item.note
  );
  if (same) same.qty += item.qty;
  else items.push(item);
  cart.set(items);
}

export function changeQty(index: number, delta: number) {
  const items = cart.get().map((i) => ({ ...i }));
  if (!items[index]) return;
  items[index].qty = Math.min(20, items[index].qty + delta);
  if (items[index].qty < 1) items.splice(index, 1);
  cart.set(items);
}

export function removeItem(index: number) {
  cart.set(cart.get().filter((_, i) => i !== index));
}

export function clearCart() {
  cart.set([]);
}
