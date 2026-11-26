import "server-only";
import { and, asc, eq, isNotNull, isNull, lte } from "drizzle-orm";
import { db, groups, participants, type Group, type Participant } from "@/db";
import { drawCircle, MIN_PARTICIPANTS } from "./draw";
import { drawEmail } from "./emails";
import { sendEmail } from "./mail";
import { normaliseCode } from "./random";
import { todayInRome } from "./dates";

export async function getGroupByCode(code: string): Promise<Group | undefined> {
  return db.query.groups.findFirst({ where: eq(groups.code, normaliseCode(code)) });
}

export async function getGroupByAdminToken(token: string): Promise<Group | undefined> {
  return db.query.groups.findFirst({ where: eq(groups.adminToken, token) });
}

export async function getParticipantByToken(
  token: string,
): Promise<{ participant: Participant; group: Group } | undefined> {
  const participant = await db.query.participants.findFirst({
    where: eq(participants.token, token),
  });
  if (!participant) return undefined;
  const group = await db.query.groups.findFirst({ where: eq(groups.id, participant.groupId) });
  return group && { participant, group };
}

export async function listParticipants(groupId: string): Promise<Participant[]> {
  return db.query.participants.findMany({
    where: eq(participants.groupId, groupId),
    orderBy: asc(participants.createdAt),
  });
}

export type DrawResult = "drawn" | "already_drawn" | "not_enough";

/**
 * Runs the draw for one group inside a transaction that locks the group row,
 * so the cron and the organiser's button can't both draw, and nobody can join
 * mid-draw. Emails are sent after commit.
 */
export async function runDraw(groupId: string): Promise<DrawResult> {
  const result = await db.transaction(async (tx) => {
    const [group] = await tx.select().from(groups).where(eq(groups.id, groupId)).for("update");
    if (!group || group.drawnAt) return "already_drawn" as const;

    const people = await tx
      .select({ id: participants.id })
      .from(participants)
      .where(eq(participants.groupId, groupId));
    if (people.length < MIN_PARTICIPANTS) return "not_enough" as const;

    const pairs = drawCircle(people.map((p) => p.id));
    for (const [giverId, recipientId] of pairs) {
      await tx.update(participants).set({ recipientId }).where(eq(participants.id, giverId));
    }
    await tx.update(groups).set({ drawnAt: new Date() }).where(eq(groups.id, groupId));
    return "drawn" as const;
  });

  if (result === "drawn") await sendPendingDrawEmails(groupId);
  return result;
}

/** Sends the draw email to everyone in a drawn group who hasn't had it yet. */
export async function sendPendingDrawEmails(groupId: string): Promise<{ sent: number; failed: number }> {
  const group = await db.query.groups.findFirst({ where: eq(groups.id, groupId) });
  if (!group?.drawnAt) return { sent: 0, failed: 0 };

  const people = await listParticipants(groupId);
  const byId = new Map(people.map((p) => [p.id, p]));
  let sent = 0;
  let failed = 0;
  for (const giver of people) {
    if (giver.notifiedAt || !giver.recipientId) continue;
    const recipient = byId.get(giver.recipientId);
    if (!recipient) continue;
    try {
      await sendEmail(drawEmail(group, giver, recipient));
      await db.update(participants).set({ notifiedAt: new Date() }).where(eq(participants.id, giver.id));
      sent++;
    } catch (err) {
      console.error(`Draw email failed for participant ${giver.id}`, err);
      failed++;
    }
  }
  return { sent, failed };
}

/**
 * Daily cron entry point: draws every group whose date has arrived and retries
 * any draw emails that failed earlier. Groups with fewer than 3 people are left
 * open and retried on the next run.
 */
export async function runDueDraws() {
  const today = todayInRome();
  const due = await db
    .select({ id: groups.id, code: groups.code })
    .from(groups)
    .where(and(isNull(groups.drawnAt), lte(groups.drawDate, today)));

  const results: Record<string, DrawResult> = {};
  for (const g of due) results[g.code] = await runDraw(g.id);

  const drawnWithPending = await db
    .selectDistinct({ id: groups.id })
    .from(groups)
    .innerJoin(participants, eq(participants.groupId, groups.id))
    .where(and(isNotNull(groups.drawnAt), isNull(participants.notifiedAt)));
  for (const g of drawnWithPending) await sendPendingDrawEmails(g.id);

  return { today, results, retried: drawnWithPending.length };
}

export function adminCookieName(code: string): string {
  return `santabrus_admin_${code}`;
}

/** Marks a participant's email as confirmed. Returns false if already confirmed or unknown. */
export async function markConfirmed(token: string): Promise<boolean> {
  const rows = await db
    .update(participants)
    .set({ confirmedAt: new Date() })
    .where(and(eq(participants.token, token), isNull(participants.confirmedAt)))
    .returning({ id: participants.id });
  return rows.length > 0;
}
