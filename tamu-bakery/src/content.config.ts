import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
 
const products = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/products" }),
  schema: z.object({
      name: z.string(),
      category: z.enum(["birthday", "bridal", "cupcakes", "pastries", "bread"]),
      description: z.string(),
      leadDays: z.number().int().min(0),
      deposit: z.boolean().default(false),
      flavours: z.array(z.string()).min(1),
      sizes: z.array(z.object({
        label: z.string(),
        price: z.number().int().positive(),
      })).min(1),
      note: z.object({ label: z.string(), maxLength: z.number(), placeholder: z.string() }).optional(),
      image: z.string(),
      soldOut: z.boolean().default(false),
    }),
});
 
export const collections = { products };
