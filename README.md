# Gadgeon Sports Day 2026

Production website for Gadgeon Sports Day 2026, built with React, TypeScript, Vite, Framer Motion, and Tailwind CSS.

## Local development

```bash
npm install
npm run dev
```

Open the Vite local URL shown in the terminal.

## Production verification

```bash
npm run lint
npm run build
npm run preview
```

The production build is written to `dist/`.

## Deploy to GitHub and Vercel

### GitHub

```bash
git init
git add .
git commit -m "Prepare Gadgeon Sports Day 2026 for production"
git branch -M main
git remote add origin <YOUR_GITHUB_REPOSITORY_URL>
git push -u origin main
```

### Vercel dashboard

1. Import the GitHub repository.
2. Framework Preset: **Vite**.
3. Root Directory: repository root.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Install Command: `npm install`.
7. No environment variables are currently required.
8. Deploy the `main` branch.

A `vercel.json` file is included to configure SPA routing and image caching.

## Supabase registration setup

Copy the environment template and add the Supabase project values:

```bash
cp .env.example .env.local
```

Configure:

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
```

Restart the Vite development server after changing environment variables. Configure the same two variables in Vercel under **Project Settings → Environment Variables**.

The form inserts only these columns into `sports_day_registrations`:

```text
email, name, business_unit, event_name
```

The database must generate `id` and `created_at`. Keep Row Level Security enabled and provide a public INSERT policy for registration submissions only. Do not create public SELECT, UPDATE, or DELETE policies or use the `service_role` key in the frontend.

For duplicate detection, the database should have a unique constraint on `(email, event_name)`, for example:

```sql
create unique index if not exists sports_day_registration_unique
on public.sports_day_registrations (email, event_name);
```

Email values are normalized to lowercase before insertion.

## Cloudflare Turnstile and Supabase registration security

Registration no longer inserts directly from the browser. The frontend calls the `register-sports-day` Supabase Edge Function, which verifies Turnstile and then inserts through the server-side service role.

### Frontend environment variables

Copy `.env.example` to `.env.local` and configure:

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
VITE_TURNSTILE_SITE_KEY=YOUR_CLOUDFLARE_TURNSTILE_SITE_KEY
```

Set the same public variables in Vercel. Configure the Cloudflare widget domain to include `localhost` for local testing and the Vercel production domain.

### Cloudflare setup

1. Create a Turnstile widget in the Cloudflare dashboard.
2. Choose the Widget Type required by your site.
3. Add local and production hostnames.
4. Copy the **Site Key** into `VITE_TURNSTILE_SITE_KEY`.
5. Copy the **Secret Key** only into Supabase Edge Function secrets.

### Deploy the Edge Function

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
npx supabase functions deploy register-sports-day --no-verify-jwt
npx supabase secrets set TURNSTILE_SECRET_KEY=YOUR_TURNSTILE_SECRET_KEY SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

Only `TURNSTILE_SECRET_KEY` and `SUPABASE_SERVICE_ROLE_KEY` belong on the backend. Never add either value to Vite environment variables or frontend source files.

The migration removes INSERT policies for browser roles, revokes direct INSERT access from `anon` and `authenticated`, enables RLS, and creates a unique `(email, event_name)` index. Do not restore a public INSERT policy.

### Security verification

- Browser requests can only invoke the Edge Function path; direct table inserts are revoked.
- Turnstile tokens are verified server-side before database insertion.
- Cloudflare rejects invalid, expired, and reused tokens.
- The edge function rejects duplicate registrations through the database unique index.
- No public SELECT, UPDATE, or DELETE policy is created.

Re-enable rate limiting/CAPTCHA policies or a CAPTCHA challenge policy before high-volume public launch if your Turnstile configuration requires additional protection.

## Test registration

```bash
npm run dev
```

Open the website, select `REGISTER`, validate empty and invalid submissions, and submit a valid registration. Test duplicate email/event combinations through the existing database constraint, database permission failures, and network unavailable mode using browser developer tools.

## Updating the event

- Event date, location, registration link, and branding: `src/config/event.ts`
- Hero scene images: `src/config/heroScenes.ts`
- Schedule, gaming, athletics, gallery, and demo leaderboard data: `src/data/tournament.ts`
- Keep event and team data clearly marked as placeholders until officially confirmed.

## Assets

Sports images and the Gadgeon icon are served from `public/` and use deployment-safe paths beginning with `/`.
