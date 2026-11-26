import { runDueDraws } from "@/lib/service";

// Called daily by Vercel Cron (see vercel.json). Vercel sends the CRON_SECRET
// as a bearer token; anything else is rejected.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const summary = await runDueDraws();
  console.log("Cron draw run", JSON.stringify(summary));
  return Response.json(summary);
}
