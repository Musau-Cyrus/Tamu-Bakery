export type CatalogProduct = {
  id: string;
  name: string;
  category: string;
  description: string;
  leadDays: number;
  deposit: boolean;
  optionLabel: string;
  flavours: string[];
  sizes: { label: string; price: number }[];
  note: { label: string; placeholder?: string; maxLength: number } | null;
  soldOut: boolean;
};

let cached: Record<string, CatalogProduct> | null = null;

export function getCatalog(): Record<string, CatalogProduct> {
  if (!cached) {
    const el = document.getElementById("catalog-data");
    cached = el ? JSON.parse(el.textContent || "{}") : {};
  }
  return cached!;
}
