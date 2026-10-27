// src/lib/delivery.ts
// Delivery zones, time slots and notice times in one place.
// The delivery page uses them now; the checkout (Part 6) will import the same lists.
// These are sample values. Replace them with the bakery's real ones.

export const ZONES = [
  { id: "central", name: "Nairobi central and Westlands", fee: 350 },
  { id: "greater", name: "Greater Nairobi (Kasarani, Rongai, Kitengela)", fee: 700 },
  { id: "nearby", name: "Nearby towns (Thika, Kiambu, Ruiru)", fee: 1200 },
];

export const SLOTS = [
  "Morning (8am to 12pm)",
  "Afternoon (12pm to 4pm)",
  "Evening (4pm to 7pm)",
];

export const NOTICE = [
  { label: "Bread and mandazi", time: "Same day" },
  { label: "Cupcakes and pastries", time: "1 day" },
  { label: "Birthday cakes", time: "2 days" },
  { label: "Bridal cakes", time: "7 days" },
];

export const PICKUP = {
  address: "Your street address, your town",
  hours: ["Monday to Saturday, 7am to 7pm", "Sunday, 9am to 4pm"],
};
