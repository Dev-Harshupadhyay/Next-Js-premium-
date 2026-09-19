# ⚡ Timepass Premium — Next.js 15 Rebuild

Market se sasta OTT subscription platform. Purani **single-file `index.html`** (74 KB, vanilla JS) ko production-grade **Next.js 15 + React 19 + TypeScript** app me rebuild kiya gaya hai — Aurora Glass design identity same rakhte hue.

---

## ✨ Kya naya hai

| | Purana (`index.html`) | Naya (Next.js) |
|---|---|---|
| **Architecture** | 1 file, 1220 lines | App Router, 40+ typed modules |
| **Routing** | `display:none` fake pages | Real URLs, shareable, SSG/SSR |
| **Type safety** | ❌ | TypeScript strict + `noUncheckedIndexedAccess` |
| **Orders** | ❌ koi record nahi | Full order lifecycle + tracking page |
| **Admin data** | `localStorage` (sirf tumhara browser) | Server-side — har device pe same |
| **Admin auth** | Password → panel HTML sabko ship hota tha | Edge middleware + httpOnly signed JWT |
| **Price integrity** | Client-side amount | **Server authoritative** — tampering block |
| **Analytics** | `ipwho.is` + `ipapi.co` (adblock = dead) | Request headers se — **adblock-proof** |
| **QR code** | `api.qrserver.com` (UPI ID 3rd party ko) | Server pe generate — koi leak nahi |
| **Rate limiting** | ❌ | Login 6/5min · Orders 12/min · Track 20/min |
| **Fonts/icons** | Google CDN + FontAwesome CDN | `next/font` self-hosted + tree-shaken icons |
| **SEO** | Basic OG tags | Sitemap, robots, JSON-LD Product + FAQ schema |
| **Security headers** | ❌ | HSTS, CSP-ready, X-Frame-Options, Permissions-Policy |

---

## 🗺 Routes

### Public
| Route | Rendering | Kaam |
|---|---|---|
| `/` | Static | Hero, plans, steps, FAQ, Telegram gate |
| `/checkout/[pack]` | SSG (3 packs) | 2-step checkout — plan select → payment |
| `/order` | Static | Order ID se status lookup |
| `/order/[id]` | Dynamic | Order status + progress tracker |

### Admin (edge-protected)
| Route | Kaam |
|---|---|
| `/admin/login` | Password gate, rate-limited |
| `/admin` | Overview — revenue, orders, visitors, 7-day chart, pipeline |
| `/admin/orders` | Filter, search, approve/reject/note, CSV export |
| `/admin/visitors` | Geo/device analytics, top locations, JSON export |
| `/admin/plans` | Live pricing catalogue + margin breakdown |
| `/admin/settings` | UPI ID, links, announcement, maintenance mode, env health |

### API
```
POST   /api/orders               order create (public, rate-limited, server pricing)
GET    /api/orders               list (admin)
GET    /api/orders/[id]          public status (safe fields only)
PATCH  /api/orders/[id]          status/note (admin)
DELETE /api/orders/[id]          delete (admin)
POST   /api/orders/[id]/claim    user "maine pay kar diya" → pending→paid only
POST   /api/track                server-side visitor log
POST   /api/admin/login          JWT cookie issue
POST   /api/admin/logout
GET    /api/admin/visitors       list (admin)
DELETE /api/admin/visitors       clear (admin)
GET    /api/admin/settings
PATCH  /api/admin/settings
```

---

## 🚀 Local setup

```bash
npm install
cp .env.example .env.local     # values bharo
npm run dev                    # http://localhost:3000
```

```bash
npm run build      # production build
npm run typecheck  # tsc --noEmit
```

---

## 🔐 Environment variables

Vercel → **Project Settings → Environment Variables** (ya Netlify → Site configuration):

| Variable | Zaroori? | Kaam |
|---|---|---|
| `ADMIN_PASSWORD` | ✅ | Admin panel login |
| `ADMIN_JWT_SECRET` | ✅ | Session cookie sign (32+ chars) |
| `TELEGRAM_BOT_TOKEN` | optional | Order/visitor notifications |
| `TELEGRAM_CHAT_ID` | optional | Kahan notification jaye |
| `NEXT_PUBLIC_SITE_URL` | optional | Canonical URL (SEO/OG) |

Secret generate karna:
```bash
openssl rand -base64 48
```

> ⚠️ Bot token **kabhi** client code me mat daalo. Sab kuch server routes se jata hai.
> Agar purana token kabhi public hua tha → BotFather `/revoke` karke naya banao.

---

## 🚢 Vercel deploy

1. Vercel dashboard → **Add New → Project** → ye repo import karo
2. Framework **Next.js** auto-detect hoga — settings default rehne do
3. Env variables add karo (upar wali table)
4. **Deploy**

Har `git push` pe auto-deploy ho jayega.

---

## 💾 Database upgrade (important)

Abhi storage **file-backed JSON** hai (`lib/db.ts`):
- **Local dev** → `.data/store.json` me persist hota hai ✅
- **Vercel serverless** → filesystem read-only hai, isliye data **memory me** rehta hai aur cold start pe reset ho jata hai ⚠️
  (Admin panel me amber banner isi ka warning dikhata hai.)

Permanent storage ke liye `lib/db.ts` ke exported functions ka body swap kar do — baaki app ko kuch pata nahi chalega:

```
listOrders · getOrder · createOrder · updateOrder · deleteOrder
listVisitors · addVisitor · clearVisitors
getSettings · saveSettings
```

**Recommended: Upstash Redis** (free tier, 2 min setup)
```bash
npm i @upstash/redis
```
```ts
import { Redis } from "@upstash/redis";
const redis = Redis.fromEnv();  // KV_REST_API_URL + KV_REST_API_TOKEN

export async function listOrders(): Promise<Order[]> {
  return (await redis.get<Order[]>("orders")) ?? [];
}
export async function createOrder(input) {
  const orders = await listOrders();
  const order = { ...input, id: newOrderId(), status: "pending",
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString() };
  await redis.set("orders", [order, ...orders].slice(0, 1000));
  return order;
}
// …baaki functions bhi isi pattern pe
```

---

## 🛡 Security model

- **Admin gate** edge middleware pe — unauthenticated user ko panel ka HTML milta hi nahi
- **Session** httpOnly + `secure` + `sameSite=lax` signed JWT (HS256, 8h TTL) — JS se padha nahi ja sakta
- **Password compare** timing-safe
- **Order amounts** hamesha `lib/plans.ts` se — request body ki `amount` ignore hoti hai
- **Zod validation** har API input pe
- **Status transitions** — public `claim` sirf `pending → paid` kar sakta hai; `active` sirf admin
- **Rate limits** login/orders/track pe
- **`/admin`, `/api`, `/order/*`** robots.txt me disallowed + `noindex`

---

## 🎨 Design system

Aurora Glass identity preserved — purple `#8b5cf6` + cyan `#22d3ee`, glassmorphism, drifting aurora blobs, conic beam buttons.

- Tailwind CSS **v4** `@theme` tokens (`app/globals.css`)
- Reusable primitives: `Card`, `Badge`, `Button`, `BeamButton`, `StatCard`, `Toast`
- Fully responsive 320px → 4K, zero horizontal overflow
- `prefers-reduced-motion` respected
- Keyboard nav + ARIA + visible focus rings

---

## 📁 Structure

```
app/
├─ (site)/                    public layout (aurora + header + footer)
│  ├─ page.tsx                landing
│  ├─ checkout/[pack]/        SSG checkout
│  └─ order/[id]/             status tracker
├─ admin/
│  ├─ login/
│  └─ (dashboard)/            sidebar shell
│     ├─ page.tsx  orders/  visitors/  plans/  settings/
├─ api/                       route handlers
├─ sitemap.ts · robots.ts · manifest.ts
components/{ui,site,admin}/
lib/
├─ db.ts          storage adapter (swap karne layak)
├─ auth.ts        JWT + timing-safe compare
├─ plans.ts       💰 single source of truth for pricing
├─ stats.ts       dashboard aggregation
├─ telegram.ts · upi.ts · qr.ts · request.ts
├─ rate-limit.ts · validation.ts · status.ts · types.ts
middleware.ts                 /admin/* edge gate
```

---

## 💰 Prices change karna

Sirf **`lib/plans.ts`** edit karo — landing, checkout, admin, sitemap, JSON-LD sab automatically update ho jayenge.

```ts
movies: {
  items: [
    { n: "1 Month", p: 50, b: "pl_TcjHF0nZXCtlQO" },  // p = price, b = Razorpay button id
    …
  ]
}
```

Push karo → Vercel auto-deploy.

---

Made by [HARSH DEV](https://new-profotilo-flame.vercel.app/) · Telegram [@pmharsh](https://t.me/pmharsh)
