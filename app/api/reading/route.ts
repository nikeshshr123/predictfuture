import { getDb } from "../../../db";
import { readings } from "../../../db/schema";
import { forecast, validate } from "../../../lib/oracle";

export async function POST(request: Request) {
  const data = await request.json().catch(() => null);
  const a = validate(data);
  if (!a || !data || typeof data !== "object" || !("entryKey" in data) || typeof data.entryKey !== "string" || !/^[0-9a-f-]{36}$/i.test(data.entryKey)) {
    return Response.json({error:"Please complete all six answers with a valid age, sign and date of birth."}, {status:400});
  }
  await getDb().insert(readings).values({...a, age:Number(a.age), entryKey:data.entryKey, created:Date.now()}).onConflictDoNothing();
  return Response.json(forecast(a), {headers:{"Cache-Control":"no-store"}});
}

