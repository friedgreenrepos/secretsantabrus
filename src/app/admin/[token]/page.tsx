import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyButton } from "@/components/CopyButton";
import { daysUntil, formatDateIt, todayInRome } from "@/lib/dates";
import { MIN_PARTICIPANTS } from "@/lib/draw";
import { appUrl } from "@/lib/mail";
import { formatCode } from "@/lib/random";
import { getGroupByAdminToken, listParticipants } from "@/lib/service";
import { DrawNowForm, EditGroupForm, RemoveButton, RevealToggle } from "./AdminForms";

export const metadata: Metadata = {
  title: "Gestione · Secret Santabrus",
  robots: { index: false },
};

export default async function AdminPage(props: PageProps<"/admin/[token]">) {
  const { token } = await props.params;
  const group = await getGroupByAdminToken(token);
  if (!group) notFound();

  const people = await listParticipants(group.id);
  const byId = new Map(people.map((p) => [p.id, p]));
  const shareUrl = `${appUrl()}/g/${group.code}`;
  const tomorrow = new Date(Date.parse(`${todayInRome()}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10);
  const enough = people.length >= MIN_PARTICIPANTS;

  return (
    <div className="space-y-5">
      <div className="card text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-pine">Gestione</p>
        <h1 className="title mt-1 text-3xl">{group.name}</h1>
        <p className="mt-4 text-sm text-muted">Codice da condividere</p>
        <p className="code-badge text-4xl">{formatCode(group.code)}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <CopyButton value={shareUrl} />
          <Link href={`/g/${group.code}`} className="btn btn-secondary text-sm">
            Vai alla pagina del gruppo
          </Link>
        </div>
      </div>

      <div className="card space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="title text-2xl">Partecipanti ({people.length})</h2>
          {group.drawnAt && <RevealToggle adminToken={token} shown={group.showMatches} />}
        </div>
        {people.length === 0 ? (
          <p className="text-sm text-muted">Ancora nessuno iscritto.</p>
        ) : (
          <ul className="divide-y divide-line rounded-xl border border-line bg-white">
            {people.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {p.name}
                    {group.drawnAt && group.showMatches && p.recipientId && (
                      <span className="font-normal text-muted"> → {byId.get(p.recipientId)?.name}</span>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted">{p.email}</p>
                  <p className="text-xs text-muted">
                    {p.confirmedAt ? "Email confermata ✓" : "Email da confermare"}
                    {group.drawnAt && (p.notifiedAt ? " · estrazione inviata ✓" : " · estrazione in attesa")}
                  </p>
                </div>
                {!group.drawnAt && <RemoveButton adminToken={token} id={p.id} name={p.name} />}
              </li>
            ))}
          </ul>
        )}
      </div>

      {group.drawnAt ? (
        <div className="card text-center">
          <p className="text-lg">🎉 Estrazione fatta!</p>
          <p className="mt-1 text-sm text-muted">
            Ognuno ha ricevuto un&apos;email con la persona a cui fare il regalo.
          </p>
        </div>
      ) : (
        <>
          <div className="card space-y-4">
            <h2 className="title text-2xl">Estrazione</h2>
            <p className="text-sm text-ink/80">
              L&apos;estrazione automatica è prevista per la mattina di{" "}
              <strong>{formatDateIt(group.drawDate)}</strong>
              {daysUntil(group.drawDate) > 0 && ` (tra ${daysUntil(group.drawDate)} giorni)`}.
            </p>
            {enough ? (
              <DrawNowForm adminToken={token} count={people.length} />
            ) : (
              <p className="rounded-xl bg-gold/15 px-4 py-3 text-sm text-ink/80">
                Servono almeno {MIN_PARTICIPANTS} partecipanti per l&apos;estrazione. Se il giorno
                dell&apos;estrazione sono meno, il gruppo resta aperto finché non si arriva a{" "}
                {MIN_PARTICIPANTS}.
              </p>
            )}
          </div>

          <div className="card">
            <h2 className="title mb-5 text-2xl">Modifica evento</h2>
            <EditGroupForm group={group} minDate={tomorrow} />
          </div>
        </>
      )}
    </div>
  );
}
