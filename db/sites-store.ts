import { env } from "cloudflare:workers";
import { and, desc, eq, gt, lt } from "drizzle-orm";
import { getDb } from "./index";
import { readings, sessions } from "./schema";
import type { Answers } from "../lib/oracle";

export function adminPassword() {
  return (env as Cloudflare.Env & { ADMIN_PASSWORD?: string }).ADMIN_PASSWORD;
}

export function attemptBucket(request: Request) {
  return request.headers.get("cf-connecting-ip") || "local";
}

export async function saveReading(a: Answers, entryKey: string) {
  await getDb().insert(readings).values({ ...a, age: Number(a.age), entryKey, created: Date.now() }).onConflictDoNothing();
}

export async function sessionValid(value: string) {
  const [session] = await getDb().select().from(sessions)
    .where(and(eq(sessions.token, value), gt(sessions.expires, Date.now()))).limit(1);
  return Boolean(session);
}

export function listReadings(before: number) {
  return getDb().select().from(readings).where(before > 0 ? lt(readings.id, before) : undefined)
    .orderBy(desc(readings.id)).limit(51);
}

export async function countAttempt(bucket: string, now: number) {
  const db = env.DB!;
  await db.prepare("DELETE FROM login_attempts WHERE expires <= ?").bind(now).run();
  const row = await db.prepare("INSERT INTO login_attempts (bucket,count,expires) VALUES (?,1,?) ON CONFLICT(bucket) DO UPDATE SET count=count+1 RETURNING count")
    .bind(bucket, now + 600000).first<{ count: number }>();
  return row!.count;
}

export async function startSession(bucket: string, value: string, now: number) {
  const db = env.DB!;
  await db.batch([
    db.prepare("DELETE FROM login_attempts WHERE bucket=?").bind(bucket),
    db.prepare("DELETE FROM admin_sessions WHERE expires <= ?").bind(now),
    db.prepare("INSERT INTO admin_sessions (token,expires) VALUES (?,?)").bind(value, now + 3600000)
  ]);
}

export async function endSession(value: string) {
  await getDb().delete(sessions).where(eq(sessions.token, value));
}
