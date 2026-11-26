import type { Group } from "@/db/schema";
import { daysUntil, formatDateIt, formatEuro } from "@/lib/dates";

export function EventDetails({ group }: { group: Group }) {
  const days = daysUntil(group.drawDate);
  return (
    <div className="space-y-4">
      <div>
        <h1 className="title text-3xl">{group.name}</h1>
        {group.description && (
          <p className="mt-2 whitespace-pre-line text-ink/80">{group.description}</p>
        )}
      </div>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl border border-line bg-white px-4 py-3">
          <dt className="text-muted">Budget</dt>
          <dd className="mt-0.5 text-lg font-semibold text-pine">{formatEuro(group.budget)}</dd>
        </div>
        <div className="rounded-xl border border-line bg-white px-4 py-3">
          <dt className="text-muted">Estrazione</dt>
          <dd className="mt-0.5 font-semibold text-pine first-letter:uppercase">
            {formatDateIt(group.drawDate)}
          </dd>
        </div>
      </dl>
      <p className="text-sm text-muted">
        {group.drawnAt
          ? "🎉 L'estrazione è stata fatta."
          : days > 1
            ? `⏳ Mancano ${days} giorni all'estrazione, che avverrà la mattina del giorno scelto.`
            : days === 1
              ? "⏳ L'estrazione è domani mattina!"
              : "⏳ L'estrazione avverrà a breve."}
      </p>
    </div>
  );
}

export function ParticipantList({
  names,
}: {
  names: { id: string; name: string; confirmed: boolean }[];
}) {
  if (names.length === 0) return <p className="text-sm text-muted">Ancora nessuno… sii il primo!</p>;
  return (
    <ul className="flex flex-wrap gap-2">
      {names.map((p) => (
        <li
          key={p.id}
          className="rounded-full border border-line bg-white px-3 py-1 text-sm"
          title={p.confirmed ? "Email confermata" : "Email da confermare"}
        >
          {p.name} {p.confirmed ? <span className="text-pine">✓</span> : null}
        </li>
      ))}
    </ul>
  );
}
