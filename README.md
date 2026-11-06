# Starling Oracle

Visitors answer six required questions to receive a personalized, just-for-fun reading. Submissions are stored in Postgres on Render and in D1 on Sites. Open `/admin` to sign in and view entries, newest first. The username is `admin`. Set the `ADMIN_PASSWORD` runtime secret for hosted use or in an ignored `.dev.vars` file for local use.

## Deploy on Render

[Deploy Starling Oracle on Render](https://render.com/deploy?repo=https://github.com/nikeshshr123/predictfuture). The Blueprint creates a Node web service and a private Postgres database. Enter the admin password when prompted. The service initializes its tables before listening on Render's port. Visit `/admin` on the published URL and sign in as `admin`.

The Blueprint selects free plans. Render's free Postgres database expires after 30 days. For longer-term storage, upgrade or move the data before expiry. Each host has its own database.

## Local setup

Use Node 22.13 or newer. Install dependencies with `npm ci`, then run `npm run build`. On a fresh local database, apply each SQL file in `drizzle` in filename order, replacing the placeholder below with its actual filename.

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/<migration>.sql
```

Run `npm start` and open the local URL printed by Wrangler. Hosted and local submissions use separate databases.

