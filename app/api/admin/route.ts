import { adminPassword, attemptBucket, countAttempt, endSession, listReadings, sessionValid, startSession } from "../../../db/sites-store";

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
  if (!(await sessionValid(token(request)))) return reply({error:"Sign in to view entries."},401);
  const before = Number(new URL(request.url).searchParams.get("before"));
  const rows = await listReadings(before);
  return reply({entries:rows.slice(0,50),more:rows.length>50});
}
export async function POST(request:Request) {
  const data = await request.json().catch(()=>null);
  if (!data || typeof data !== "object" || !("username" in data) || !("password" in data) || typeof data.password !== "string" || data.password.length>256) return reply({error:"Enter your credentials."},400);
  const password = adminPassword();
  if (!password) return reply({error:"Admin access needs configuration."},503);

  const now = Date.now();
  const bucket = attemptBucket(request);
  if (await countAttempt(bucket, now) > 10) return reply({error:"Too many attempts. Try again in ten minutes."},429);
  if (data.username!=="admin" || data.password!==password) return reply({error:"Incorrect username or password."},401);
  const value = crypto.randomUUID();
  await startSession(bucket, value, now);
  return reply({ok:true},200,cookie(request,value,3600));
}
export async function DELETE(request:Request) {
  await endSession(token(request));
  return reply({ok:true},200,cookie(request,"",0));
}
