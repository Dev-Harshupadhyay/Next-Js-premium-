# 🚢 Deploy Guide

## Step 1 — Vercel pe import

1. [vercel.com/new](https://vercel.com/new) kholo
2. **Import Git Repository** → `Dev-Harshupadhyay/Next-Js-premium-` select karo
3. Framework preset: **Next.js** (auto-detect ho jayega)
4. Root directory: `./` (default)
5. Build command / Output: **change mat karo**

## Step 2 — Environment variables

Deploy button dabane se pehle **Environment Variables** section kholo:

| Name | Value | Zaroori? |
|---|---|---|
| `ADMIN_PASSWORD` | apna strong password | ✅ |
| `ADMIN_JWT_SECRET` | `openssl rand -base64 48` ka output | ✅ |
| `TELEGRAM_BOT_TOKEN` | BotFather se | optional |
| `TELEGRAM_CHAT_ID` | jahan notifications chahiye | optional |
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.vercel.app` | optional |

Teeno environments (Production / Preview / Development) me tick lagao.

> Secret generate:
> ```bash
> openssl rand -base64 48
> ```

## Step 3 — Deploy

**Deploy** dabao. ~60 second me live.

---

## Step 4 — Verify (deploy ke baad)

```bash
SITE=https://your-domain.vercel.app

curl -o /dev/null -w "home: %{http_code}\n"     $SITE/
curl -o /dev/null -w "checkout: %{http_code}\n" $SITE/checkout/combo
curl -o /dev/null -w "admin: %{http_code}\n"    $SITE/admin          # 307 → /admin/login
curl -o /dev/null -w "api: %{http_code}\n"      $SITE/api/orders     # 401
curl -w "\n" $SITE/robots.txt
```

Phir browser me:
- `/admin/login` → password daalo → dashboard khulna chahiye
- `/admin/settings` → **Environment Health** card sab green dikhna chahiye

---

## Telegram bot setup (optional)

1. Telegram pe [@BotFather](https://t.me/BotFather) → `/newbot`
2. Token copy karo → `TELEGRAM_BOT_TOKEN`
3. Chat ID nikalne ke liye: bot ko apne channel me admin banao, phir
   ```
   https://api.telegram.org/bot<TOKEN>/getUpdates
   ```
   Response me `"chat":{"id":-100…}` → wo `TELEGRAM_CHAT_ID`
4. Vercel me dono add karke **Redeploy**

Notifications jo aayengi:
- 🧾 New order
- 💰 Payment claimed
- ✅/❌ Order status change
- ⚡ New visitor (landing page)
- 🔓 Admin login
- 🚨 Failed admin login attempt

---

## ⚠️ Storage note

Vercel serverless ka filesystem read-only hai → orders/visitors **memory me** rehte hain aur cold start (~15 min idle) pe reset ho jate hain.

Admin panel amber banner dikhayega jab aisa ho.

**Permanent karne ke liye:** README ka *"Database upgrade"* section — Upstash Redis 2 minute me lag jata hai aur `lib/db.ts` ke alawa kuch change nahi karna padta.

---

## Custom domain

Vercel → Project → **Settings → Domains** → domain add karo → DNS records set karo.

Phir `NEXT_PUBLIC_SITE_URL` ko naye domain pe update karke redeploy — sitemap aur OG tags sahi ho jayenge.
