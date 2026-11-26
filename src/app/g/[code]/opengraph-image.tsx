import { formatDateIt, formatEuro } from "@/lib/dates";
import { OG_COLORS, OG_SIZE, renderOgCard } from "@/lib/og";
import { formatCode } from "@/lib/random";
import { getGroupByCode } from "@/lib/service";

export const alt = "Invito a un Secret Santa su Secret Santabrus";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const group = await getGroupByCode((await params).code);
  if (!group) {
    return renderOgCard({
      eyebrow: "Secret Santabrus",
      title: "Il Secret Santa dei Calabrus",
      footer: "Partecipa con il codice del tuo gruppo",
    });
  }
  // "sabato 5 dicembre 2026" -> "sabato 5 dicembre"
  const date = formatDateIt(group.drawDate).replace(/ \d{4}$/, "");
  return renderOgCard({
    eyebrow: "Sei invitato/a al Secret Santa",
    title: group.name,
    chips: [`Budget ${formatEuro(group.budget)}`, `Estrazione ${date}`],
    footer: group.drawnAt ? (
      "L'estrazione è già stata fatta"
    ) : (
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex" }}>Codice</div>
        <div
          style={{
            display: "flex",
            fontFamily: "Fraunces",
            fontSize: 40,
            letterSpacing: 6,
            color: "#ffffff",
            background: OG_COLORS.RED,
            padding: "4px 18px",
            borderRadius: 12,
          }}
        >
          {formatCode(group.code)}
        </div>
      </div>
    ),
  });
}
