# Starling Oracle

Visitors answer six required questions to receive a personalized, just-for-fun reading. Submissions are stored in D1. Open `/admin` to sign in and view entries, newest first. The username is `admin`. Set the `ADMIN_PASSWORD` runtime secret for hosted use or in an ignored `.dev.vars` file for local use.

## Local setup

Use Node 22.13 or newer. Install dependencies with `npm ci`, then run `npm run build`. On a fresh local database, apply each SQL file in `drizzle` in filename order, replacing the placeholder below with its actual filename.

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/<migration>.sql
```

Run `npm start` and open the local URL printed by Wrangler. Hosted and local submissions use separate databases.

