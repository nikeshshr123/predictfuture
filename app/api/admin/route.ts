import { env } from "cloudflare:workers";
import { getDb } from "../../../db";
import { sessions, readings } from "../../../db/schema";
import { eq, lt, gt, and, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";
const headers = {"Cache-Control":"private, no-store","Vary":"Cookie"};
function reply(body:unknown,status=200,cookie?:string) {
  return Response.json(body,{status,headers:{...headers,...(cookie ? {"Set-Cookie":cookie} : {})}});
}
function token(request:Request) { return /(?:^|;\s*)starling_session=([0-9a-f-]{36})(?:;|$)/.exec(request.headers.get("cookie") || "")?.[1] || ""; }
function cookie(request:Request,value:string,seconds:number) {
  const local = ["localhost","127.0.0.1"].includes(new URL(request.url).hostname);
  return `starling_session=${value}; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=${seconds}${local ? "" : "; Secure"}`;
}
export async function GET(request:Request) {
  const db = getDb();
  const [session] = await db.select().from(sessions).where(and(eq(sessions.token,token(request)),gt(sessions.expires,Date.now()))).limit(1);
  if (!session) return reply({error:"Sign in to view entries."},401);
  const before = Number(new URL(request.url).searchParams.get("before"));
  const rows = await db.select().from(readings).where(before > 0 ? lt(readings.id,before) : undefined).orderBy(desc(readings.id)).limit(51);
  return reply({entries:rows.slice(0,50),more:rows.length>50});
}
export async function POST(request:Request) {
  const data = await request.json().catch(()=>null);
  if (!data || typeof data !== "object" || !("username" in data) || !("password" in data) || typeof data.password !== "string" || data.password.length>256) return reply({error:"Enter your credentials."},400);
  const password = (env as Cloudflare.Env & {ADMIN_PASSWORD?:string}).ADMIN_PASSWORD;
  if (!password) return reply({error:"Admin access needs configuration."},503);
  const db = env.DB!;
  const now = Date.now();
  const bucket = request.headers.get("cf-connecting-ip") || "local";
  await db.prepare("DELETE FROM login_attempts WHERE expires <= ?").bind(now).run();
  const row = await db.prepare("INSERT INTO login_attempts (bucket,count,expires) VALUES (?,1,?) ON CONFLICT(bucket) DO UPDATE SET count=count+1 RETURNING count").bind(bucket,now+600000).first<{count:number}>();
  if ((row?.count || 0)>10) return reply({error:"Too many attempts. Try again in ten minutes."},429);
  if (data.username!=="admin" || data.password!==password) return reply({error:"Incorrect username or password."},401);
  const value = crypto.randomUUID();
  await db.batch([db.prepare("DELETE FROM login_attempts WHERE bucket=?").bind(bucket),db.prepare("DELETE FROM admin_sessions WHERE expires <= ?").bind(now),db.prepare("INSERT INTO admin_sessions (token,expires) VALUES (?,?)").bind(value,now+3600000)]);
  return reply({ok:true},200,cookie(request,value,3600));
}
export async function DELETE(request:Request) {
  await getDb().delete(sessions).where(eq(sessions.token,token(request)));
  return reply({ok:true},200,cookie(request,"",0));
}

