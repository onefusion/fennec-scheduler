# 🦊 Fennec Scheduler - Beginner's Complete Setup Guide

> **Welcome!** This guide is designed for complete beginners with **zero prior technical or IT experience**. By following these simple step-by-step instructions, you will have your own personal scheduling web application (like Calendly) up and running on Cloudflare Pages for free on your own registered domain.

---

## 📋 What You Need Before Starting

All the services used in this guide offer generous **100% free tiers**:

1. A **Cloudflare Account** (Free) &rarr; [Sign up at cloudflare.com](https://dash.cloudflare.com/sign-up)
2. A **GitHub Account** (Free) &rarr; [Sign up at github.com](https://github.com/signup)
3. A **Registered Custom Domain** *(Optional, e.g., `yourname.com` or `schedule.yourdomain.com`)* registered anywhere (Cloudflare Registrar, Namecheap, GoDaddy, etc.).

---

## Step 1: Get the Code onto GitHub

1. Log in to your **GitHub** account.
2. Go to the **Fennec Scheduler** repository page.
3. Click the **Fork** button near the top-right corner of the page.
4. Click **Create Fork**. This creates a copy of the Fennec Scheduler project in your personal GitHub account.

---

## Step 2: Create Your Cloudflare D1 Database

Your calendar needs a lightweight database to store your schedule and bookings. Cloudflare provides this for free via Cloudflare D1.

### Option A: Using the Cloudflare Web Dashboard (Easiest for Beginners)

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. On the left sidebar menu, click **Storage & Databases** &rarr; **D1**.
3. Click **Create database**.
4. Enter `fennec-db` as the Database Name.
5. Click **Create**.
6. Once created, you will see a **Database ID** (a long code like `8e23e2f6-8fb2-4305-b20f-7ed99a79d2c2`). Copy this ID to your notes—you will need it!

---

## Step 3: Connect Cloudflare Pages to GitHub

Now, let's deploy your web application to Cloudflare Pages so it is live on the internet.

1. In your Cloudflare Dashboard left sidebar, click **Workers & Pages**.
2. Click **Create application** &rarr; select the **Pages** tab.
3. Click **Connect to Git**.
4. Select your GitHub account and choose the `fennec-scheduler` repository you forked in Step 1.
5. Click **Begin setup**.

### Configure Build Settings:
Fill in the deployment options on the setup screen:

- **Project name**: `fennec-scheduler` (or your preferred name)
- **Production branch**: `main`
- **Framework preset**: `Next.js (Static HTML Export)` or `None`
- **Build command**: `npm run pages:build`
- **Build output directory**: `.vercel/output/static`

Click **Save and Deploy**. Cloudflare will build your site for the first time.

---

## Step 4: Connect Database to Your Site (D1 Binding)

To let your site communicate with your database:

1. In your Cloudflare Dashboard, go to **Workers & Pages** &rarr; click on your `fennec-scheduler` Pages project.
2. Click the **Settings** tab at the top.
3. Click **Functions** on the left menu.
4. Scroll down to **D1 Database Bindings**.
5. Click **Add binding**.
6. Fill in the fields:
   - **Variable name**: Enter exactly `DB` (must be capital letters `DB`).
   - **D1 database**: Select `fennec-db` from the dropdown list.
7. Click **Save**.
8. Go to **Deployments** &rarr; click the `...` next to your latest deployment &rarr; click **Retry deployment** so the new database connection takes effect.

---

## Step 5: Create Your Admin Account (First-Time Setup)

Once your site finishes building, Cloudflare will give you a live Web address ending in `.pages.dev` (for example: `https://fennec-scheduler.pages.dev`).

1. Open your browser and go to your site's admin URL:
   ```text
   https://YOUR-SITE-NAME.pages.dev/admin
   ```
2. Because this is a fresh installation, you will be greeted by the **Welcome & Setup Wizard**!
3. Fill in your details:
   - **Host Display Name**: (e.g., *Friendly Fennec* or *John Smith*)
   - **Host Email Address**: (Your email where booking notifications will go)
   - **Primary Timezone**: (Select your local timezone, e.g., *Central Time*)
   - **Create Admin Password**: (Choose a secure password)
4. Click **Complete Setup & Open Dashboard**.

🎉 **Congratulations!** Your scheduling web app is live, secure, and ready to use!

---

## Step 6: Connect Your Custom Registered Domain (Optional)

If you own a custom domain name (e.g., `schedule.yourdomain.com`):

1. Go to **Workers & Pages** &rarr; click `fennec-scheduler`.
2. Click the **Custom domains** tab at the top.
3. Click **Set up a custom domain**.
4. Type your domain (e.g. `schedule.yourdomain.com`) and click **Continue**.
5. Follow the automatic Cloudflare instructions to activate your domain. Cloudflare will automatically provide a **free SSL security certificate** (https).

---

## Step 7: Enable Email Confirmations with Resend (Optional)

Fennec Scheduler works out-of-the-box with browser `.ics` calendar downloads. If you also want to send automated email confirmations:

1. Create a free account at [Resend.com](https://resend.com).
2. Get your free **API Key** from the Resend Dashboard.
3. Go to your Cloudflare Pages project &rarr; **Settings** &rarr; **Environment variables**.
4. Click **Add variable**:
   - **Variable name**: `RESEND_API_KEY`
   - **Value**: Paste your Resend API Key.
5. Click **Save**.

---

## ❓ Frequently Asked Questions (FAQ)

### How do I change my available hours?
Log in to `https://your-site.pages.dev/admin`, click **Schedule** in the top navigation, and check/uncheck days or change your start and end times. Click **Save Schedule**.

### How do I block out a specific date (like a holiday)?
In your Admin dashboard under **Schedule**, scroll down to **Date-Specific Overrides**, select the date on the calendar, check **Block out whole day**, and click **Add Override**.

### How do visitors book time with me?
Simply send visitors your main link: `https://your-site.pages.dev`. Visitors will see your calendar, auto-detect their timezone, pick a 30-minute time slot, and submit their request!
