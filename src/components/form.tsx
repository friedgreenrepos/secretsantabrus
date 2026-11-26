"use client";

import { useFormStatus } from "react-dom";
import type { FormState } from "@/app/actions";

export function SubmitButton({
  children,
  pendingText = "Un attimo…",
  className = "btn btn-primary w-full",
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? pendingText : children}
    </button>
  );
}

type FieldProps = {
  name: string;
  label: string;
  state: FormState;
  hint?: string;
  defaultValue?: string | number;
  multiline?: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "defaultValue">;

export function Field({ name, label, state, hint, defaultValue, multiline, ...input }: FieldProps) {
  const error = state.fieldErrors?.[name];
  const value = state.values?.[name] ?? defaultValue ?? "";
  const id = `f-${name}`;
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea
          id={id}
          name={name}
          className="input"
          defaultValue={value}
          maxLength={input.maxLength}
          placeholder={input.placeholder}
          aria-invalid={!!error}
          aria-describedby={describedBy}
        />
      ) : (
        <input
          id={id}
          name={name}
          className="input"
          defaultValue={value}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          {...input}
        />
      )}
      {error ? (
        <span id={`${id}-err`} className="error">{error}</span>
      ) : hint ? (
        <span id={`${id}-hint`} className="hint">{hint}</span>
      ) : null}
    </div>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  if (state.error)
    return (
      <p role="alert" className="rounded-xl bg-red/10 px-4 py-3 text-sm text-red">
        {state.error}
      </p>
    );
  if (state.ok)
    return (
      <p role="status" className="rounded-xl bg-pine/10 px-4 py-3 text-sm text-pine">
        {state.ok}
      </p>
    );
  return null;
}
