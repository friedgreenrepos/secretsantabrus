"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, groups, participants } from "@/db";
import { todayInRome } from "@/lib/dates";
import { MIN_PARTICIPANTS } from "@/lib/draw";
import { adminEmail, confirmEmail } from "@/lib/emails";
import { sendEmail } from "@/lib/mail";
import { generateCode, generateToken, normaliseCode, CODE_LENGTH } from "@/lib/random";
import { adminCookieName, getGroupByAdminToken, getParticipantByToken, runDraw } from "@/lib/service";

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  ok?: string;
  values?: Record<string, string>;
};

const text = (max: number) => z.string().trim().max(max, `Massimo ${max} caratteri`);
const required = (max: number) => text(max).min(1, "Campo obbligatorio");
const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Indirizzo email non valido"));

const eventSchema = z.object({
  name: required(80),
  description: text(1000),
  budget: z.coerce
    .number({ error: "Inserisci un numero" })
    .int("Usa un numero intero")
    .min(1, "Almeno 1 €")
    .max(10_000, "Un po' troppo, no?"),
  drawDate: z.iso
    .date("Data non valida")
    .refine((d) => d > todayInRome(), "Scegli una data a partire da domani"),
});

function fail(formData: FormData, error: z.ZodError): FormState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    fieldErrors[key] ??= issue.message;
  }
  return { fieldErrors, values: formValues(formData) };
}

function formValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [k, v] of formData) if (typeof v === "string" && !k.startsWith("$")) values[k] = v;
  return values;
}

function isUniqueViolation(err: unknown): boolean {
  const e = err as { code?: string; cause?: { code?: string } };
  return e?.code === "23505" || e?.cause?.code === "23505";
}

// ---------- Create ----------

export async function createGroup(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = eventSchema
    .extend({ organiserEmail: emailField })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(formData, parsed.error);

  let group;
  for (let attempt = 0; attempt < 5 && !group; attempt++) {
    try {
      [group] = await db
        .insert(groups)
        .values({ ...parsed.data, code: generateCode(), adminToken: generateToken() })
        .returning();
    } catch (err) {
      if (!isUniqueViolation(err)) throw err; // code collision: try another one
    }
  }
  if (!group) return { error: "Qualcosa è andato storto, riprova.", values: formValues(formData) };

  try {
    await sendEmail(adminEmail(group));
  } catch (err) {
    console.error("Admin email failed", err);
  }
  // Remember the organiser on this device so the group page can link back to
  // the admin page, without ever putting the admin token in a shareable URL.
  (await cookies()).set(adminCookieName(group.code), group.adminToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 120,
    path: "/",
  });
  redirect(`/g/${group.code}?creato=1`);
}

// ---------- Join ----------

export async function goToGroup(_: FormState, formData: FormData): Promise<FormState> {
  const code = normaliseCode(String(formData.get("code") ?? ""));
  if (code.length !== CODE_LENGTH) return { error: "Il codice ha 6 caratteri", values: { code } };
  const exists = await db.query.groups.findFirst({ where: eq(groups.code, code), columns: { id: true } });
  if (!exists) return { error: "Nessun Secret Santa con questo codice", values: { code } };
  redirect(`/g/${code}`);
}

const joinSchema = z.object({
  name: required(60),
  email: emailField,
  giftIdeas: text(1000),
});

export async function joinGroup(code: string, _: FormState, formData: FormData): Promise<FormState> {
  const parsed = joinSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(formData, parsed.error);

  let outcome: { token: string } | { error: string };
  try {
    outcome = await db.transaction(async (tx) => {
      // Shares the lock with runDraw so nobody slips in while the draw is running.
      const [group] = await tx.select().from(groups).where(eq(groups.code, code)).for("update");
      if (!group) return { error: "Secret Santa non trovato" };
      if (group.drawnAt) return { error: "L'estrazione è già stata fatta: iscrizioni chiuse." };
      const [p] = await tx
        .insert(participants)
        .values({ ...parsed.data, groupId: group.id, token: generateToken() })
        .returning();
      return { token: p.token };
    });
  } catch (err) {
    if (!isUniqueViolation(err)) throw err;
    return {
      fieldErrors: { email: "Questa email è già iscritta a questo Secret Santa" },
      values: formValues(formData),
    };
  }
  if ("error" in outcome) return { error: outcome.error, values: formValues(formData) };

  const found = await getParticipantByToken(outcome.token);
  if (found) {
    try {
      await sendEmail(confirmEmail(found.group, found.participant));
    } catch (err) {
      console.error("Confirmation email failed", err);
    }
  }
  redirect(`/p/${outcome.token}?nuovo=1`);
}

// ---------- Participant ----------

export async function updateGiftIdeas(token: string, _: FormState, formData: FormData): Promise<FormState> {
  const parsed = z.object({ giftIdeas: text(1000) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(formData, parsed.error);
  const found = await getParticipantByToken(token);
  if (!found) return { error: "Link non valido" };
  if (found.group.drawnAt) return { error: "L'estrazione è già stata fatta." };
  await db.update(participants).set(parsed.data).where(eq(participants.id, found.participant.id));
  revalidatePath(`/p/${token}`);
  return { ok: "Idee regalo salvate ✓" };
}

export async function resendConfirmation(token: string): Promise<void> {
  const found = await getParticipantByToken(token);
  if (!found || found.participant.confirmedAt) return;
  await sendEmail(confirmEmail(found.group, found.participant));
  redirect(`/p/${token}?reinviata=1`);
}

// ---------- Organiser ----------

async function requireAdmin(adminToken: string) {
  const group = await getGroupByAdminToken(adminToken);
  if (!group) throw new Error("Link di gestione non valido");
  return group;
}

export async function updateGroup(adminToken: string, _: FormState, formData: FormData): Promise<FormState> {
  const group = await requireAdmin(adminToken);
  if (group.drawnAt) return { error: "L'estrazione è già stata fatta: l'evento non è più modificabile." };
  const parsed = eventSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(formData, parsed.error);
  await db.update(groups).set(parsed.data).where(eq(groups.id, group.id));
  revalidatePath(`/admin/${adminToken}`);
  return { ok: "Modifiche salvate ✓" };
}

export async function removeParticipant(adminToken: string, participantId: string): Promise<void> {
  const group = await requireAdmin(adminToken);
  if (group.drawnAt) return;
  await db
    .delete(participants)
    .where(and(eq(participants.id, participantId), eq(participants.groupId, group.id)));
  revalidatePath(`/admin/${adminToken}`);
}

export async function drawNow(adminToken: string, _prev: FormState): Promise<FormState> {
  const group = await requireAdmin(adminToken);
  const result = await runDraw(group.id);
  revalidatePath(`/admin/${adminToken}`);
  if (result === "not_enough") return { error: `Servono almeno ${MIN_PARTICIPANTS} partecipanti.` };
  if (result === "already_drawn") return { error: "L'estrazione è già stata fatta." };
  return { ok: "Estrazione fatta! Le email sono partite 🎉" };
}

export async function setShowMatches(adminToken: string, show: boolean): Promise<void> {
  const group = await requireAdmin(adminToken);
  await db.update(groups).set({ showMatches: show }).where(eq(groups.id, group.id));
  revalidatePath(`/admin/${adminToken}`);
}
