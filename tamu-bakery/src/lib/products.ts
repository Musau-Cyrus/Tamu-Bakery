// src/lib/products.ts
// Small helpers shared by the home, shop and product pages.

import type { CollectionEntry } from "astro:content";

export type Product = CollectionEntry<"products">;

export const CATEGORIES = [
  { id: "birthday", label: "Birthday cakes", short: "Birthday", tint: "pink" },
  { id: "bridal", label: "Bridal cakes", short: "Bridal", tint: "pink" },
  { id: "cupcakes", label: "Cupcakes", short: "Cupcakes", tint: "peach" },
  { id: "pastries", label: "Pastries", short: "Pastries", tint: "butter" },
  { id: "bread", label: "Bread", short: "Bread", tint: "cream" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const tintFor = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!.tint;

export const kes = (n: number) => "KES " + n.toLocaleString("en-KE");

export const fromPrice = (p: Product) => Math.min(...p.data.sizes.map((s) => s.price));

export const leadText = (days: number) =>
  days === 0 ? "Ready the same day" : "Order " + days + " day" + (days > 1 ? "s" : "") + " ahead";