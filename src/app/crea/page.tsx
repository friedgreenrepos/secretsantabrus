import type { Metadata } from "next";
import { connection } from "next/server";
import { todayInRome } from "@/lib/dates";
import { CreateForm } from "./CreateForm";

export const metadata: Metadata = { title: "Crea un Secret Santa · Secret Santabrus" };

export default async function CreatePage() {
  await connection(); // "tomorrow" must be computed per request, not at build time
  const tomorrow = new Date(Date.parse(`${todayInRome()}T00:00:00Z`) + 86_400_000)
    .toISOString()
    .slice(0, 10);
  return (
    <div className="card">
      <h1 className="title mb-1 text-3xl">Crea un Secret Santa</h1>
      <p className="mb-6 text-sm text-muted">
        Il giorno dell&apos;estrazione, in mattinata, ognuno riceve via email il nome della
        persona a cui fare il regalo.
      </p>
      <CreateForm minDate={tomorrow} />
    </div>
  );
}
