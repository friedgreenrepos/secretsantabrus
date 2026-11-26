import { redirect } from "next/navigation";
import { markConfirmed } from "@/lib/service";

export async function GET(_: Request, ctx: RouteContext<"/api/conferma/[token]">) {
  const { token } = await ctx.params;
  await markConfirmed(token);
  redirect(`/p/${token}?confermato=1`);
}
