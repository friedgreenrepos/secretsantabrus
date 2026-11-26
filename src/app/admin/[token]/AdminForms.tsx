"use client";

import { useActionState } from "react";
import {
  drawNow,
  removeParticipant,
  setShowMatches,
  updateGroup,
  type FormState,
} from "@/app/actions";
import { Field, FormMessage, SubmitButton } from "@/components/form";
import type { Group } from "@/db/schema";

export function EditGroupForm({ group, minDate }: { group: Group; minDate: string }) {
  const [state, action] = useActionState(updateGroup.bind(null, group.adminToken), {} as FormState);
  return (
    <form action={action} className="space-y-5">
      <Field name="name" label="Nome dell'evento" state={state} required maxLength={80} defaultValue={group.name} />
      <Field name="description" label="Descrizione" state={state} multiline maxLength={1000}
        defaultValue={group.description} />
      <div className="grid grid-cols-2 gap-4">
        <Field name="budget" label="Budget (€)" state={state} type="number" inputMode="numeric"
          min={1} max={10000} step={1} required defaultValue={group.budget} />
        <Field name="drawDate" label="Data dell'estrazione" state={state} type="date" min={minDate}
          required defaultValue={group.drawDate} />
      </div>
      <FormMessage state={state} />
      <SubmitButton className="btn btn-secondary w-full" pendingText="Salvataggio…">
        Salva modifiche
      </SubmitButton>
    </form>
  );
}

export function RemoveButton({ adminToken, id, name }: { adminToken: string; id: string; name: string }) {
  return (
    <form
      action={removeParticipant.bind(null, adminToken, id)}
      onSubmit={(e) => {
        if (!confirm(`Rimuovere ${name} dal Secret Santa?`)) e.preventDefault();
      }}
    >
      <SubmitButton className="btn btn-ghost text-sm" pendingText="…">
        Rimuovi
      </SubmitButton>
    </form>
  );
}

export function DrawNowForm({ adminToken, count }: { adminToken: string; count: number }) {
  const [state, action] = useActionState(drawNow.bind(null, adminToken), {} as FormState);
  return (
    <form
      action={action}
      className="space-y-3"
      onSubmit={(e) => {
        if (!confirm(`Fare l'estrazione adesso con ${count} partecipanti? Le iscrizioni verranno chiuse e partiranno le email.`))
          e.preventDefault();
      }}
    >
      <FormMessage state={state} />
      <SubmitButton pendingText="Estrazione in corso…">🎲 Fai l&apos;estrazione adesso</SubmitButton>
    </form>
  );
}

export function RevealToggle({ adminToken, shown }: { adminToken: string; shown: boolean }) {
  return (
    <form
      action={setShowMatches.bind(null, adminToken, !shown)}
      onSubmit={(e) => {
        if (!shown && !confirm("Sei sicuro? Se partecipi anche tu, rovinerai la sorpresa! 🙈"))
          e.preventDefault();
      }}
    >
      <SubmitButton className="btn btn-ghost text-sm" pendingText="…">
        {shown ? "🙈 Nascondi abbinamenti" : "👀 Mostra abbinamenti"}
      </SubmitButton>
    </form>
  );
}
