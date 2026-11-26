import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card text-center">
      <h1 className="title text-3xl">Ops, qui non c&apos;è niente</h1>
      <p className="mt-3 text-ink/75">
        Il codice o il link non sono validi. Controlla di averli copiati bene.
      </p>
      <Link href="/" className="btn btn-primary mt-6">Torna all&apos;inizio</Link>
    </div>
  );
}
