# Fennec Scheduler 🦊 (FennSched / Fenny)

> An open-source, mobile-friendly personal scheduling web application loosely based on Calendly. Hosted on **Cloudflare Workers** with **Cloudflare D1** database at the edge.

![Fennec Scheduler Theme](https://raw.githubusercontent.com/FriendlyFennec/fennec-scheduler/main/public/fennec-logo.svg)

> [!TIP]
> **New to web hosting or non-technical?** Read our **[Beginner's Step-by-Step Setup Guide](SETUP_GUIDE.md)** for a complete start-to-finish walkthrough with zero IT experience required!

---


## Features

- **Mobile-First Calendly Alternative**: Clean, fast, and responsive user experience on smartphones, tablets, and desktops.
- **30-Minute Time Slot Picker**: Auto-calculates available slots based on host weekly hours and date-specific overrides.
- **Visitor Timezone Auto-Detection**: Converts time slots dynamically into the visitor's local browser timezone with manual timezone selector.
- **Host Confirm / Deny Approval Workflow**: Optional setting to manually approve or decline incoming meeting requests.
- **Double-Booking Protection**: Atomic D1 database unique constraint on `(start_time_utc, status)` to prevent race conditions.
- **Calendar Exports & Live iCal Feed**: Instant `.ics` file downloads, Add-to-Google-Calendar links, and a `/api/ical` webcal feed URL for live sync with Google, Apple, and Outlook Calendar.
- **First-Run Onboarding Wizard**: Zero setup complexity. Visiting `/admin` on a fresh install prompts a clean 1-minute onboarding wizard to set up your password.
- **Custom Theme Palette Customizer**: Friendly Fennec Warm Desert Amber theme with custom accent color settings (Emerald, Sapphire, Violet, Rose, Custom Hex).
- **Self-Service Rescheduling & Cancellation**: Tokenized `/cancel/[token]` and `/reschedule/[token]` links included in email confirmation invites.

---

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router) with [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare)
- **Hosting**: [Cloudflare Workers](https://workers.cloudflare.com/) (Edge Serverless Environment)
- **Database & ORM**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite at the Edge) & [Drizzle ORM](https://orm.drizzle.team/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + Custom CSS Variable Engine
- **Calendar & Invites**: [date-fns](https://date-fns.org/), `date-fns-tz`, and standard RFC 5545 iCalendar format
- **Notifications**: Resend API integration with zero-config console fallback mode

---

## Quick Start / Local Development

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/fennec-scheduler.git
   cd fennec-scheduler
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Generate Database Schema**:
   ```bash
   npm run db:generate
   ```

4. **Run Local Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deploying to Cloudflare Workers

For a beginner-friendly, click-by-click walkthrough (forking the repo, creating the D1 database, and connecting Cloudflare Workers Builds so every push auto-deploys), see [SETUP_GUIDE.md](SETUP_GUIDE.md).

### 1. Create a Cloudflare D1 Database
```bash
npx wrangler d1 create fennec-db
```
Copy the `database_id` returned by Wrangler and update your `wrangler.jsonc`:
```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "fennec-db",
    "database_id": "YOUR_ACTUAL_D1_DATABASE_ID",
    "migrations_dir": "drizzle/migrations"
  }
]
```

### 2. Apply Database Migrations to D1
```bash
npx wrangler d1 migrations apply fennec-db --remote
```

### 3. Deploy to Cloudflare Workers
```bash
npm run deploy
```

For automatic deploys on every `git push`, connect the repo via **Compute (Workers) → Create → Import a repository** in the Cloudflare dashboard (Workers Builds), using build command `npx opennextjs-cloudflare build` and deploy command `npx wrangler deploy`.

---

## License

This project is open-source under the [MIT License](LICENSE).
