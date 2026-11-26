import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resendConfirmation } from "@/app/actions";
import { EventDetails, ParticipantList } from "@/components/EventDetails";
import { SubmitButton } from "@/components/form";
import { getParticipantByToken, listParticipants } from "@/lib/service";
import { GiftIdeasForm } from "./GiftIdeasForm";

export const metadata: Metadata = {
  title: "La tua pagina · Secret Santabrus",
  robots: { index: false },
};

export default async function ParticipantPage(props: PageProps<"/p/[token]">) {
  const { token } = await props.params;
  const { nuovo, confermato, reinviata } = await props.searchParams;
  const found = await getParticipantByToken(token);
  if (!found) notFound();
  const { participant: me, group } = found;

  const people = await listParticipants(group.id);
  const recipient = me.recipientId ? people.find((p) => p.id === me.recipientId) : undefined;

  return (
    <div className="space-y-5">
      {nuovo && (
        <Banner>
          Ci sei, {me.name}! 🎉 Ti abbiamo mandato un&apos;email per confermare l&apos;indirizzo
          (se non la vedi, controlla nello spam). <strong>Salva questa pagina</strong>: è il tuo
          link personale.
        </Banner>
      )}
      {confermato && <Banner>Email confermata ✓ Ci vediamo all&apos;estrazione!</Banner>}
      {reinviata && <Banner>Email di conferma inviata di nuovo ✓</Banner>}

      {recipient && (
        <div className="card text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-pine">
            Sei il Secret Santa di…
          </p>
          <div className="mx-auto mt-4 max-w-xs rounded-2xl border-[3px] border-dashed border-gold bg-red px-4 py-6 text-white">
            <div className="text-4xl">🎁</div>
            <div className="font-display mt-2 text-3xl">{recipient.name}</div>
          </div>
          <div className="mt-6 text-left">
            <h2 className="mb-2 text-sm font-semibold text-pine">💡 Le sue idee regalo</h2>
            {recipient.giftIdeas.trim() ? (
              <p className="whitespace-pre-line rounded-xl border-l-4 border-gold bg-white px-4 py-3">
                {recipient.giftIdeas}
              </p>
            ) : (
              <p className="text-sm italic text-muted">Nessuna idea lasciata: usa la fantasia!</p>
            )}
          </div>
        </div>
      )}

      <div className="card space-y-6">
        <EventDetails group={group} />
        <section>
          <h2 className="mb-2 text-sm font-semibold text-pine">Partecipanti ({people.length})</h2>
          <ParticipantList
            names={people.map((p) => ({ id: p.id, name: p.name, confirmed: !!p.confirmedAt }))}
          />
        </section>
      </div>

      <div className="card space-y-5">
        <div>
          <h2 className="title text-2xl">Ciao {me.name}</h2>
          <p className="mt-1 text-sm text-muted">
            {me.email}{" "}
            {me.confirmedAt ? (
              <span className="text-pine">· confermata ✓</span>
            ) : (
              <span>· da confermare</span>
            )}
          </p>
          {!me.confirmedAt && !group.drawnAt && (
            <form action={resendConfirmation.bind(null, token)} className="mt-2">
              <SubmitButton className="btn btn-ghost -ml-3 text-sm" pendingText="Invio…">
                Reinvia email di conferma
              </SubmitButton>
            </form>
          )}
        </div>
        {group.drawnAt ? (
          me.giftIdeas && (
            <div>
              <h3 className="mb-1 text-sm font-semibold text-pine">Le tue idee regalo</h3>
              <p className="whitespace-pre-line text-sm text-ink/80">{me.giftIdeas}</p>
            </div>
          )
        ) : (
          <GiftIdeasForm token={token} giftIdeas={me.giftIdeas} />
        )}
      </div>
    </div>
  );
}

function Banner({ children }: { children: React.ReactNode }) {
  return (
    <div role="status" className="rounded-2xl bg-white/95 px-5 py-4 text-sm text-pine shadow-lg">
      {children}
    </div>
  );
}
