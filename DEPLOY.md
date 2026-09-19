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
| `UPSTASH_REDIS_REST_URL` | Upstash se (neeche Step 3) | ✅ data bachane ke liye |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash se | ✅ |
| `TELEGRAM_BOT_TOKEN` | BotFather se | optional |
| `TELEGRAM_CHAT_ID` | jahan notifications chahiye | optional |
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.vercel.app` | optional |

Teeno environments (Production / Preview / Development) me tick lagao.

> Secret generate:
> ```bash
> openssl rand -base64 48
> ```

## Step 3 — Upstash Redis (data permanent karne ke liye)

Ye skip kiya to orders/visitors cold start pe **reset ho jayenge**. 2 minute ka kaam hai, free hai.

1. [console.upstash.com](https://console.upstash.com) pe signup (GitHub se ho jata hai)
2. **Create Database**
   - Name: `timepass`
   - Type: **Regional**
   - Region: **ap-south-1 (Mumbai)** ← India ke liye sabse fast
3. Database khulne ke baad neeche **REST API** section → **.env** tab dabao
4. Do lines dikhengi — dono Vercel env variables me paste karo:
   ```
   UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io
   UPSTASH_REDIS_REST_TOKEN=AXXXxxxx...
   ```

Verify: deploy ke baad `/admin/settings` kholo → **Environment Health** me
`UPSTASH_REDIS_REST_URL` **SET** aur Storage **UPSTASH REDIS · persistent** dikhna chahiye.
Agar amber warning banner dikhe to matlab env vars nahi lage.

## Step 4 — Deploy

**Deploy** dabao. ~60 second me live.

---

## Step 5 — Verify (deploy ke baad)

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

## ⚠️ Storage

App khud detect kar leta hai:

| Setup | Storage | Data bachta hai? |
|---|---|---|
| Upstash env vars set | **Upstash Redis** | ✅ hamesha |
| Env vars nahi | Memory | ❌ cold start pe reset |

Admin → **Settings → Environment Health** me live status dikhta hai.
Agar amber warning banner dikhe to Step 3 dobara check karo.

---

## Custom domain

Vercel → Project → **Settings → Domains** → domain add karo → DNS records set karo.

Phir `NEXT_PUBLIC_SITE_URL` ko naye domain pe update karke redeploy — sitemap aur OG tags sahi ho jayenge.
