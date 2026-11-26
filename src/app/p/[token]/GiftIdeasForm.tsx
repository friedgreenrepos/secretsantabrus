"use client";

import { useActionState } from "react";
import { updateGiftIdeas, type FormState } from "@/app/actions";
import { Field, FormMessage, SubmitButton } from "@/components/form";

export function GiftIdeasForm({ token, giftIdeas }: { token: string; giftIdeas: string }) {
  const [state, action] = useActionState(updateGiftIdeas.bind(null, token), {} as FormState);
  return (
    <form action={action} className="space-y-4">
      <Field name="giftIdeas" label="Le tue idee regalo" state={state} multiline maxLength={1000}
        defaultValue={giftIdeas} hint="Le vedrà solo chi ti pesca. Modificabili fino all'estrazione." />
      <FormMessage state={state} />
      <SubmitButton className="btn btn-secondary w-full" pendingText="Salvataggio…">
        Salva idee regalo
      </SubmitButton>
    </form>
  );
}
