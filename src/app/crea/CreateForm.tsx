"use client";

import { useActionState } from "react";
import { createGroup, type FormState } from "@/app/actions";
import { Field, FormMessage, SubmitButton } from "@/components/form";

export function CreateForm({ minDate }: { minDate: string }) {
  const [state, action] = useActionState(createGroup, {} as FormState);
  return (
    <form action={action} className="space-y-5">
      <Field name="name" label="Nome dell'evento" state={state} required maxLength={80}
        placeholder="Natale Calabrus 2026" />
      <Field name="description" label="Descrizione" state={state} multiline maxLength={1000}
        placeholder="Scambio dei regali la sera del 24 a casa di…" hint="Facoltativa" />
      <div className="grid grid-cols-2 gap-4">
        <Field name="budget" label="Budget (€)" state={state} type="number" inputMode="numeric"
          min={1} max={10000} step={1} required placeholder="25" />
        <Field name="drawDate" label="Data dell'estrazione" state={state} type="date" min={minDate} required />
      </div>
      <Field name="organiserEmail" label="La tua email" state={state} type="email" required
        autoComplete="email"
        hint="Ti mandiamo il link per gestire il gruppo. Potrai partecipare anche tu al passo successivo." />
      <FormMessage state={state} />
      <SubmitButton pendingText="Creazione…">Crea il Secret Santa</SubmitButton>
    </form>
  );
}
