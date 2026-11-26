"use client";

import { useActionState } from "react";
import { goToGroup, type FormState } from "@/app/actions";
import { FormMessage, SubmitButton } from "@/components/form";

export function CodeForm() {
  const [state, action] = useActionState(goToGroup, {} as FormState);
  return (
    <form action={action} className="space-y-4">
      <label htmlFor="code" className="sr-only">Codice</label>
      <input
        id="code"
        name="code"
        required
        autoFocus
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        maxLength={10}
        placeholder="ABC-123"
        defaultValue={state.values?.code}
        className="input code-badge py-4 text-center text-3xl uppercase placeholder:text-ink/20"
      />
      <FormMessage state={state} />
      <SubmitButton pendingText="Cerco…">Continua</SubmitButton>
    </form>
  );
}
