# Tanne Hub

Tanne Hub is a Vite + TypeScript storefront for game accounts, with Raid Shadow Legends listings, news posts, an admin dashboard, Supabase auth, and Supabase-backed content sync.

## Requirements

- Node.js 20+
- npm
- A Supabase project if you want login, admin, posts, storage uploads, and remote account listings

## Local Development

Install dependencies:

```bash
npm install
```

Create `.env` from `.env.example` and check the Supabase values:

```bash
cp .env.example .env
```

Run the dev server:

```bash
npm run dev
```

Vite uses port `5173` by default. If that port is busy, Vite will choose another available port.

## Verification

Run TypeScript checking:

```bash
npm run typecheck
```

Build for production:

```bash
npm run build
```

Run both checks:

```bash
npm run check
```

## Supabase Setup

The app expects these tables and buckets:

- `admins`
- `profiles`
- `posts`
- `raid_accounts`
- `raid_champions`
- Storage bucket `post-images`
- Storage bucket `raid-portraits`

Apply the SQL files in `supabase/migrations/` to create the schema and RLS policies.

To make a user an admin, create the user through Supabase Auth first, then insert their auth user ID with a service role:

```sql
insert into public.admins (user_id)
values ('<auth.users.id>');
```

Do not expose the service role key in the browser. Only use it locally for scripts such as champion sync.

## Data Scripts

Fetch Raid champion data:

```bash
npm run fetch:champions
```

Sync champion data to Supabase:

```bash
npm run sync:champions
```

Sync champion data and portrait URLs:

```bash
npm run sync:champions:portraits
```

Mirror Raid portraits to Supabase Storage:

```bash
npm run mirror:raid-portraits
```

These sync scripts may require `SUPABASE_SERVICE_ROLE_KEY` in your local `.env`.
