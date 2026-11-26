import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CopyButton } from "@/components/CopyButton";
import { EventDetails, ParticipantList } from "@/components/EventDetails";
import { appUrl } from "@/lib/mail";
import { formatCode } from "@/lib/random";
import { adminCookieName, getGroupByCode, listParticipants } from "@/lib/service";
import { JoinForm } from "./JoinForm";

export async function generateMetadata(props: PageProps<"/g/[code]">): Promise<Metadata> {
  const group = await getGroupByCode((await props.params).code);
  return { title: group ? `${group.name} · Secret Santabrus` : "Secret Santabrus" };
}

export default async function GroupPage(props: PageProps<"/g/[code]">) {
  const { code } = await props.params;
  const { creato } = await props.searchParams;
  const group = await getGroupByCode(code);
  if (!group) notFound();
  // normalise lowercase / dashed codes in the URL
  if (group.code !== code) redirect(`/g/${group.code}`);

  const adminToken = (await cookies()).get(adminCookieName(group.code))?.value;
  const isOrganiser = adminToken === group.adminToken;
  const people = await listParticipants(group.id);
  const shareUrl = `${appUrl()}/g/${group.code}`;

  return (
    <div className="space-y-5">
      {creato && isOrganiser && (
        <div className="card border-gold text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-pine">
            🎉 Secret Santa creato!
          </p>
          <p className="mt-3 text-sm text-muted">Condividi questo codice con il gruppo:</p>
          <p className="code-badge mt-1 text-4xl">{formatCode(group.code)}</p>
          <div className="mt-4 flex justify-center">
            <CopyButton value={shareUrl} />
          </div>
          <p className="mt-4 text-xs text-muted">
            Ti abbiamo mandato via email il link per gestire il gruppo. Ora iscriviti anche tu qui
            sotto, se partecipi.
          </p>
        </div>
      )}

      <div className="card space-y-6">
        <EventDetails group={group} />

        <section>
          <h2 className="mb-2 text-sm font-semibold text-pine">
            Partecipanti ({people.length})
          </h2>
          <ParticipantList
            names={people.map((p) => ({ id: p.id, name: p.name, confirmed: !!p.confirmedAt }))}
          />
        </section>

        {isOrganiser && !creato && (
          <Link href={`/admin/${group.adminToken}`} className="btn btn-secondary w-full text-sm">
            ⚙️ Gestisci il gruppo
          </Link>
        )}
      </div>

      <div className="card">
        {group.drawnAt ? (
          <p className="text-center text-ink/80">
            L&apos;estrazione è già stata fatta: le iscrizioni sono chiuse. Se partecipi, controlla
            la tua email!
          </p>
        ) : (
          <>
            <h2 className="title mb-5 text-2xl">Partecipa</h2>
            <JoinForm code={group.code} />
          </>
        )}
      </div>
    </div>
  );
}
