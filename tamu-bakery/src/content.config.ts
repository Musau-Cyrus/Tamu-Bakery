import { defineCollection, z } from "astro:content";

const products = defineCollection({
  type: "data",
  schema: z.object({
    name: z.string(),
    description: z.string(),
    category: z.enum(["birthday", "bridal", "cupcakes", "pastries", "bread"]),
    image: z.string(),
    leadDays: z.number().int().nonnegative(),
    soldOut: z.boolean().default(false),
    sizes: z.array(z.object({ price: z.number().nonnegative() })),
  }),
});

export const collections = { products };
