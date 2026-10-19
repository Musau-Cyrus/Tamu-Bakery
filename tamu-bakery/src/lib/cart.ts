export interface CartItem {
  productId: string;
  sizeIndex: number;
  flavour: string;
  note: string;
  qty: number;
}

const CART_KEY = "tamu-bakery-cart";

export const addItem = (item: CartItem) => {
  const existing = window.localStorage.getItem(CART_KEY);
  const items: CartItem[] = existing ? JSON.parse(existing) : [];
  items.push(item);
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
};