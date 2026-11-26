import Link from "next/link";
import { Elf } from "@/components/Elf";

export default function Home() {
  return (
    <div className="card text-center">
      <Elf className="mx-auto h-28 w-28" />
      <h1 className="title mt-4 text-3xl sm:text-4xl">Il Secret Santa dei Calabrus</h1>
      <p className="mx-auto mt-3 max-w-sm text-ink/75">
        Niente fogliettini nel cappello: crea il gruppo, condividi il codice e il giorno
        dell&apos;estrazione ognuno riceve un&apos;email con la persona a cui fare il regalo.
      </p>
      <div className="mt-8 flex flex-col gap-3">
        <Link href="/crea" className="btn btn-primary">
          🎄 Crea un nuovo Secret Santa
        </Link>
        <Link href="/partecipa" className="btn btn-secondary">
          🎁 Partecipa a un Secret Santa
        </Link>
      </div>
    </div>
  );
}
