import { getCollection, type CollectionEntry } from "astro:content";

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

// All products in the order you set with the "order" number in each JSON file.
// (getCollection returns them in file-name order, which is why they looked alphabetical.)
export async function getProducts(): Promise<Product[]> {
  const all = await getCollection("products");
  return all.sort((a, b) => a.data.order - b.data.order);
}

// The plain data the browser needs for the options popup and the cart.
export function toCatalog(products: Product[]) {
  return Object.fromEntries(
    products.map((p) => [
      p.id,
      {
        id: p.id,
        name: p.data.name,
        category: p.data.category,
        description: p.data.description,
        leadDays: p.data.leadDays,
        deposit: p.data.deposit,
        optionLabel: p.data.optionLabel,
        flavours: p.data.flavours,
        sizes: p.data.sizes,
        note: p.data.note ?? null,
        soldOut: p.data.soldOut,
      },
    ])
  );
}
