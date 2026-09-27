# 🦊 Fennec Scheduler - Beginner's Complete Setup Guide

> **Welcome!** This guide is designed for complete beginners with **zero prior technical or IT experience**. By following these simple step-by-step instructions, you will have your own personal scheduling web application (like Calendly) up and running on Cloudflare Workers for free on your own registered domain.

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
6. Once created, you will see a **Database ID** (a long code like `8e23e2f6-8fb2-4305-b20f-7ed99a79d2c2`). Copy this ID to your notes—you will need it in the next step!

---

## Step 3: Point Your Fork at Your Own Database

The repository ships with `wrangler.jsonc`, a config file that tells Cloudflare which D1 database to connect to. It currently points at the original project's database, so you need to swap in your own database's ID:

1. On your forked repository's GitHub page, open `wrangler.jsonc`.
2. Click the **pencil (edit)** icon.
3. Find the line that looks like:
   ```jsonc
   "database_id": "8e23e2f6-8fb2-4305-b20f-7ed99a79d2c2",
   ```
4. Replace that ID with the **Database ID** you copied in Step 2.
5. Scroll down and click **Commit changes...** &rarr; **Commit changes**.

---

## Step 4: Connect Your Fork to Cloudflare Workers (Auto Deploy on Every Push)

Now let's deploy your web application to Cloudflare Workers so it is live on the internet, and set it up so every future GitHub push rebuilds and redeploys automatically.

1. In your Cloudflare Dashboard left sidebar, click **Compute (Workers)**.
2. Click **Create** &rarr; select **Import a repository**.
3. Select your GitHub account and choose the `fennec-scheduler` repository you forked in Step 1.
4. Click **Begin setup** (or **Continue**).

### Configure Build Settings:
Fill in the deployment options on the setup screen:

- **Project name**: `fennec-scheduler` (or your preferred name)
- **Production branch**: `main`
- **Build command**: `npx opennextjs-cloudflare build`
- **Deploy command**: `npx wrangler deploy`

Click **Save and Deploy**. Cloudflare will build and deploy your site, reading the D1 database binding straight from `wrangler.jsonc` — no manual binding step needed. From now on, every push to `main` automatically rebuilds and redeploys your site.

---

## Step 5: Create Your Admin Account (First-Time Setup)

Once your site finishes building, Cloudflare will give you a live Web address ending in `.workers.dev` (for example: `https://fennec-scheduler.your-subdomain.workers.dev`).

1. Open your browser and go to your site's admin URL:
   ```text
   https://YOUR-SITE-NAME.your-subdomain.workers.dev/admin/login
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

## Step 6: Connect a Subdomain on Your Custom Domain in Cloudflare

If you own a domain (for example, `yourdomain.com`) managed in Cloudflare, you can easily connect Fennec Scheduler to a custom subdomain like **`schedule.yourdomain.com`**, **`calendar.yourdomain.com`**, or **`fennec.yourdomain.com`**.

### 🌐 Step-by-Step Instructions:

1. **Log in to Cloudflare**:
   Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and log in.

2. **Navigate to your Worker**:
   On the left sidebar, click **Compute (Workers)** &rarr; click on your `fennec-scheduler` Worker.

3. **Open Triggers**:
   Click the **Settings** tab near the top of the page, then find **Domains & Routes**.

4. **Add Custom Domain**:
   Click **Add** &rarr; select **Custom Domain**.

5. **Enter Your Subdomain**:
   In the Domain name box, type your full subdomain.
   - Example: `schedule.yourdomain.com` (replace `yourdomain.com` with your actual domain).
   - Click **Add Domain**.

6. **Automatic 1-Click DNS Record Setup**:
   Because your domain is managed in Cloudflare, Cloudflare will automatically create the DNS record pointing `schedule.yourdomain.com` to your Worker.

7. **Automatic SSL / HTTPS Security**:
   Cloudflare will automatically issue a **free SSL certificate** for your new subdomain (`https://schedule.yourdomain.com`). This usually takes 30 to 60 seconds.
   - Once you see a green **Active** badge next to your subdomain name, your web app is live on your custom domain!

---


## Step 7: Enable Email Confirmations with Resend (Optional)

Fennec Scheduler works out-of-the-box with browser `.ics` calendar downloads. If you also want to send automated email confirmations:

1. Create a free account at [Resend.com](https://resend.com).
2. Get your free **API Key** from the Resend Dashboard.
3. Go to your Cloudflare Worker &rarr; **Settings** &rarr; **Variables and Secrets**.
4. Click **Add**:
   - **Variable name**: `RESEND_API_KEY`
   - **Type**: Secret
   - **Value**: Paste your Resend API Key.
5. Click **Save and Deploy**.

---

## ❓ Frequently Asked Questions (FAQ)

### How do I change my available hours?
Log in to `https://your-site.workers.dev/admin/login`, click **Schedule** in the top navigation, and check/uncheck days or change your start and end times. Click **Save Schedule**.

### How do I block out a specific date (like a holiday)?
In your Admin dashboard under **Schedule**, scroll down to **Date-Specific Overrides**, select the date on the calendar, check **Block out whole day**, and click **Add Override**.

### How do visitors book time with me?
Simply send visitors your main link: `https://your-site.workers.dev`. Visitors will see your calendar, auto-detect their timezone, pick a 30-minute time slot, and submit their request!
