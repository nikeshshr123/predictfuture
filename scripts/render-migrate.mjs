import postgres from "postgres";

if (!process.env.ADMIN_PASSWORD || !process.env.DATABASE_URL) {
  throw new Error("Set ADMIN_PASSWORD and DATABASE_URL before starting the Render service.");
}
const sql = postgres(process.env.DATABASE_URL, { max: 1, connect_timeout: 15 });
try {
  await sql.begin(async tx => {
    await tx`SELECT pg_advisory_xact_lock(7312054)`;
    await tx`CREATE TABLE IF NOT EXISTS readings (
      id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY, entry_key text NOT NULL UNIQUE,
      name text NOT NULL, age integer NOT NULL, job text NOT NULL, love text NOT NULL,
      sign text NOT NULL, dob text NOT NULL, created bigint NOT NULL
    )`;
    await tx`CREATE TABLE IF NOT EXISTS admin_sessions (token text PRIMARY KEY, expires bigint NOT NULL)`;
    await tx`CREATE TABLE IF NOT EXISTS login_attempts (bucket text PRIMARY KEY, count integer NOT NULL, expires bigint NOT NULL)`;
  });
} finally {
  await sql.end();
}
