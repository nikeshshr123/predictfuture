import postgres from "postgres";
import type { Answers } from "../lib/oracle";

let pool: ReturnType<typeof postgres> | undefined;

function database() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  return pool ??= postgres(process.env.DATABASE_URL, { max: 5, connect_timeout: 10 });
}

export function adminPassword() {
  return process.env.ADMIN_PASSWORD;
}

export function attemptBucket(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() || "local";
}

export async function saveReading(a: Answers, entryKey: string) {
  const sql = database();
  await sql`INSERT INTO readings (entry_key, name, age, job, love, sign, dob, created)
    VALUES (${entryKey}, ${a.name}, ${Number(a.age)}, ${a.job}, ${a.love}, ${a.sign}, ${a.dob}, ${Date.now()})
    ON CONFLICT (entry_key) DO NOTHING`;
}

export async function sessionValid(value: string) {
  const sql = database();
  const rows = await sql`SELECT 1 FROM admin_sessions WHERE token = ${value} AND expires > ${Date.now()}`;
  return rows.length > 0;
}

export async function listReadings(before: number) {
  const sql = database();
  const rows = await sql`SELECT id, name, age, job, love, sign, dob, created
    FROM readings ${before > 0 ? sql`WHERE id < ${before}` : sql``} ORDER BY id DESC LIMIT 51`;
  return rows.map(row => ({ ...row, created: Number(row.created) }));
}

export async function countAttempt(bucket: string, now: number) {
  const sql = database();
  await sql`DELETE FROM login_attempts WHERE expires <= ${now}`;
  const [row] = await sql`INSERT INTO login_attempts (bucket, count, expires)
    VALUES (${bucket}, 1, ${now + 600000})
    ON CONFLICT (bucket) DO UPDATE SET count = login_attempts.count + 1 RETURNING count`;
  return Number(row.count);
}

export async function startSession(bucket: string, value: string, now: number) {
  const sql = database();
  await sql.begin(tx => [
    tx`DELETE FROM login_attempts WHERE bucket = ${bucket}`,
    tx`DELETE FROM admin_sessions WHERE expires <= ${now}`,
    tx`INSERT INTO admin_sessions (token, expires) VALUES (${value}, ${now + 3600000})`
  ]);
}

export async function endSession(value: string) {
  const sql = database();
  await sql`DELETE FROM admin_sessions WHERE token = ${value}`;
}
