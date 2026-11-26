import type { Metadata } from "next";
import { CodeForm } from "./CodeForm";

export const metadata: Metadata = { title: "Partecipa · Secret Santabrus" };

export default function JoinCodePage() {
  return (
    <div className="card">
      <h1 className="title mb-1 text-3xl">Partecipa</h1>
      <p className="mb-6 text-sm text-muted">Inserisci il codice che ti ha mandato chi organizza.</p>
      <CodeForm />
    </div>
  );
}
