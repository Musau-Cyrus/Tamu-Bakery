# Tamu Bakery
 
A fast, mobile-first online bakery for Kenya. Customers browse birthday cakes, bridal cakes, cupcakes, pastries and bread, choose a size and flavour, pick delivery or pickup, and pay with **M-Pesa**.
 
"Tamu" means *sweet* in Swahili.
 
> **Status:** in development. A static starter page and full Figma designs (mobile and desktop) exist. The Astro build follows the schedule in [Roadmap](#roadmap).
 
---
 
## Contents
 
- [Goals](#goals)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Ordering and payment flow](#ordering-and-payment-flow)
- [Business rules](#business-rules)
- [Design system](#design-system)
- [Performance and accessibility targets](#performance-and-accessibility-targets)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Reusing this project for other businesses](#reusing-this-project-for-other-businesses)
- [Contributing](#contributing)
- [License](#license)
---
 
## Goals
 
1. **Load fast on mid-range phones and mobile data.** Most customers arrive from Instagram, TikTok or WhatsApp.
2. **Make ordering easy.** From choosing a cake to paying should take about a minute.
3. **Fit how Kenyans buy.** M-Pesa STK push, WhatsApp for custom requests, delivery zones, and lead times for celebration cakes.
4. **Be easy for the bakery to run.** Staff can see orders, change statuses and mark items sold out without touching code.
## Features
 
**Customer site**
- Shop by occasion: Birthday, Bridal, Cupcakes, Pastries, Bread
- Product pages with sizes, flavours and a message or design note for cakes
- Cart drawer with quantity changes and a saved cart
- Checkout with delivery or pickup, delivery area, address, date and time slot
- Earliest-date check based on each product's lead time (for example, bridal cakes need 7 days)
- **M-Pesa STK push** payment, with a 50% deposit option for bridal cakes
- Custom cake request form that opens WhatsApp with the details filled in
- Delivery fees, pickup details and notice times page
- Order confirmation by email and WhatsApp or SMS
**Bakery admin**
- Password-protected orders list
- Order statuses: pending, paid, baking, ready, delivered, cancelled
- Sold-out toggle for products
## Tech stack
 
| Layer | Choice |
|---|---|
| Framework | [Astro](https://astro.build) (static pages, small interactive islands) |
| Styling | [Tailwind CSS](https://tailwindcss.com) with theme tokens from the design system |
| Interactive parts | Preact or plain TypeScript (cart, checkout) |
| Content | Astro Content Collections (`src/content/products`) |
| Server endpoints | Astro API routes on Cloudflare Pages Functions |
| Database | Supabase (Postgres) or Cloudflare D1 |
| Payments | Safaricom Daraja API (Lipa na M-Pesa Online / STK push) |
| Email | Resend |
| Hosting and CDN | Cloudflare Pages |
| Design | Figma (Playfair Display and Poppins) |
 
## Project structure
 
```
tamu-bakery/
├─ public/                 Static files, favicon, manifest
├─ src/
│  ├─ components/          Button, Chip, Input, ProductCard, CartDrawer, Header, Footer
│  ├─ content/
│  │  └─ products/         One JSON file per product
│  ├─ layouts/
│  │  └─ BaseLayout.astro  Head tags, announcement bar, header, footer
│  ├─ lib/
│  │  ├─ cart.ts           Cart store and saving
│  │  ├─ pricing.ts        Subtotal, delivery fee, deposit
│  │  ├─ dates.ts          Lead time and earliest delivery date
│  │  └─ mpesa.ts          Daraja helpers (token, password, STK push)
│  ├─ pages/
│  │  ├─ index.astro
│  │  ├─ shop/[category].astro
│  │  ├─ product/[slug].astro
│  │  ├─ custom-cakes.astro
│  │  ├─ delivery.astro
│  │  ├─ admin/            Orders dashboard
│  │  └─ api/
│  │     ├─ orders.ts
│  │     └─ mpesa/
│  │        ├─ stk-push.ts
│  │        ├─ callback.ts
│  │        └─ status.ts
│  └─ styles/global.css    Tailwind import and theme tokens
├─ astro.config.mjs
├─ package.json
└─ README.md
```
 
## Getting started
 
**Requirements:** a current Node.js LTS release and npm.
 
```bash
# 1. Create the project
npm create astro@latest tamu-bakery
cd tamu-bakery
 
# 2. Add Tailwind CSS (follow Astro's current guide for the exact steps)
# 3. Add the Cloudflare adapter
npx astro add cloudflare
 
# 4. Install dependencies and run
npm install
npm run dev
```
 
The dev server runs at `http://localhost:4321`.
 
| Command | What it does |
|---|---|
| `npm run dev` | Start the local dev server |
| `npm run build` | Build the production site |
| `npm run preview` | Preview the production build locally |
 
## Environment variables
 
Copy `.env.example` to `.env` and fill in the values. **Never commit `.env`.** In production, store these as Cloudflare secrets.
 
```bash
# Site
PUBLIC_SITE_URL=https://your-domain.co.ke
PUBLIC_WHATSAPP_NUMBER=2547XXXXXXXX
 
# M-Pesa (Daraja)
MPESA_ENV=sandbox                 # sandbox or production
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=                  # Paybill or Till number
MPESA_PASSKEY=
MPESA_CALLBACK_URL=https://your-domain.co.ke/api/mpesa/callback
 
# Database
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
 
# Email
RESEND_API_KEY=
ORDER_ALERT_EMAIL=
 
# Admin
ADMIN_PASSWORD_HASH=
```
 
Only variables starting with `PUBLIC_` are exposed to the browser. Daraja keys must stay on the server.
 
## Ordering and payment flow
 
1. The customer adds items to the cart and opens checkout.
2. The browser sends the cart to `POST /api/orders`.
3. The server **recalculates all prices from its own menu** (it never trusts totals from the browser), checks the delivery date against lead times, and saves the order as `pending`.
4. The browser calls `POST /api/mpesa/stk-push` with the phone number and the amount due. Phone numbers are normalised to `2547XXXXXXXX`.
5. The customer receives the M-Pesa prompt and enters their PIN.
6. Safaricom calls `POST /api/mpesa/callback`. The server records the result and marks the order `paid` or `failed`.
7. The browser polls `GET /api/mpesa/status` and shows the confirmed, failed or timed-out screen.
8. On success, the customer gets a confirmation email, and the bakery gets an alert by email and WhatsApp or SMS.
Each payment request uses one unique order reference, so double taps don't create double charges. A scheduled check reconciles orders still pending against Daraja's status query.
 
## Business rules
 
These live in `src/lib` and the product JSON files, so they're easy to change.
 
| Rule | Default |
|---|---|
| Bread and mandazi | Same day |
| Cupcakes and pastries | 1 day notice |
| Birthday cakes | 2 days notice |
| Bridal cakes | 7 days notice, 50% deposit paid now |
| Delivery, Nairobi central | KES 350 |
| Delivery, Greater Nairobi | KES 700 |
| Delivery, nearby towns | KES 1,200 |
| Time slots | Morning 8am to 12pm, Afternoon 12pm to 4pm, Evening 4pm to 7pm |
 
Prices, zones and notice times in this README are **sample values**. Replace them with the bakery's real ones.
 
### Product file example
 
```json
{
  "slug": "classic-birthday-cake",
  "name": "Classic Birthday Cake",
  "category": "birthday",
  "description": "Soft sponge layered with buttercream, finished with your message.",
  "leadDays": 2,
  "deposit": false,
  "flavours": ["Vanilla", "Chocolate", "Red velvet", "Black forest", "Lemon"],
  "sizes": [
    { "label": "1 kg, serves 10", "price": 3500 },
    { "label": "2 kg, serves 20", "price": 6500 },
    { "label": "3 kg, serves 30", "price": 9200 }
  ],
  "note": { "label": "Message on the cake (optional)", "maxLength": 40 },
  "image": "./images/classic-birthday-cake.jpg"
}
```
 
## Design system
 
Designs are in Figma (file: *Tamu Bakery*), with a mobile home page, a desktop set of drawers and menus, and a mobile set of drawers and menus. Tablet designs are planned.
 
**Colours**
 
| Token | Hex | Use |
|---|---|---|
| `bg` | `#FDEEF1` | Page background |
| `surface` | `#FFFFFF` | Cards, forms |
| `blush` | `#F8D9E0` | Hero arch, custom cake section |
| `rose` | `#D98695` | Accents |
| `btn` | `#A94A5F` | Primary buttons |
| `deep` | `#8E3B4F` | Announcement bar, footer |
| `gold` | `#C9A24D` | Outlines, highlights, custom cake button |
| `ink` | `#3B2A26` | Text |
| `muted` | `#7A6762` | Secondary text |
| `line` | `#EFCBD3` | Borders |
| `mpesa` | `#2E9D4A` | M-Pesa badge and success states |
 
**Typography:** *Playfair Display* for headings and *Poppins* for body text. Fonts are self-hosted.
 
**Shape language:** arch-topped image panels, fully rounded buttons, soft rounded cards.
 
**Breakpoints:** mobile up to 699 px (design at 360), tablet 700 to 1023 px (768), desktop 1024 px and up (1440).
 
## Performance and accessibility targets
 
- Lighthouse mobile performance of **90 or higher** on throttled 4G
- Lighthouse accessibility of **95 or higher**
- Under about 150 KB of JavaScript per page
- Images in WebP or AVIF, sized for phones, lazy-loaded below the first screen
- Keyboard-friendly cart and menus, visible focus states, labelled form fields
- Tap targets at least 44 px tall
- Respects reduced-motion settings
## Deployment
 
The site deploys to **Cloudflare Pages**.
 
1. Push the repository to GitHub.
2. Create a Cloudflare Pages project connected to the repository.
3. Set the build command to `npm run build` and the output directory to `dist`.
4. Add the environment variables as secrets.
5. Connect the domain and confirm HTTPS.
6. Switch `MPESA_ENV` from `sandbox` to `production` only after Safaricom approves your Daraja go-live request, and test with small real payments first.
## Roadmap
 
| Phase | Focus | Timing |
|---|---|---|
| 0 | Scope, assets, accounts, Daraja go-live request | Days 1 to 3 |
| 1 | Astro and Tailwind setup, design tokens, layout, components | Week 1 |
| 2 | Static pages and product content | Week 2 |
| 3 | Cart and checkout interface | Week 3 |
| 4 | Back end, M-Pesa and orders | Week 4 |
| 5 | Custom cake form, admin, accessibility and performance | Week 5 |
| 6 | Testing, legal pages, production switch, launch | Week 6 |
 
**Later ideas:** discount codes, loyalty points, customer accounts, subscription boxes, multi-language support (English and Swahili), and a headless CMS for menu editing.
 
## Reusing this project for other businesses
 
The structure suits any business that takes orders by WhatsApp and M-Pesa: restaurants, florists, boutiques, and booking-based businesses such as clinics, salons and private schools. To adapt it, change the product content, delivery rules and brand tokens, and swap in the forms the business needs (for example, an admissions form for a school).
 
## Contributing
 
1. Create a branch from `main`.
2. Keep changes small and focused.
3. Run `npm run build` before opening a pull request.
4. Describe what changed and include screenshots for visual changes.
## License
 
Add a license before publishing (for example, MIT for open source, or "All rights reserved" for client work).
 
 ## Links
 - <a href="https://www.figma.com/design/Tic6IbsolxTQxUtgF0PtTe/My--Projects?node-id=361-1144&t=WC9GFpBUoULqxS8e-0">Figma<a/>
 - <a href="https://github.com/Musau-Cyrus/Tamu-Bakery.git">Github<a>