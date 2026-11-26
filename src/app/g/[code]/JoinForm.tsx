"use client";

import { useActionState } from "react";
import { joinGroup, type FormState } from "@/app/actions";
import { Field, FormMessage, SubmitButton } from "@/components/form";

export function JoinForm({ code }: { code: string }) {
  const [state, action] = useActionState(joinGroup.bind(null, code), {} as FormState);
  return (
    <form action={action} className="space-y-5">
      <Field name="name" label="Il tuo nome" state={state} required maxLength={60} autoComplete="given-name" />
      <Field name="email" label="La tua email" state={state} type="email" required autoComplete="email"
        hint="Qui riceverai il nome della persona a cui fare il regalo." />
      <Field name="giftIdeas" label="Idee regalo per te" state={state} multiline maxLength={1000}
        placeholder="Libri gialli, calzini improbabili, qualsiasi cosa al cioccolato…"
        hint="Facoltative: le vedrà solo chi ti pesca. Potrai modificarle fino all'estrazione." />
      <FormMessage state={state} />
      <SubmitButton pendingText="Iscrizione…">Partecipa 🎁</SubmitButton>
    </form>
  );
}
