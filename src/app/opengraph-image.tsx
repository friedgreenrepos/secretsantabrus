import { OG_SIZE, renderOgCard } from "@/lib/og";

export const alt = "Secret Santabrus: il Secret Santa dei Calabrus";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgCard({
    eyebrow: "Secret Santabrus",
    title: "Il Secret Santa dei Calabrus",
    footer: "Crea il gruppo, condividi il codice, aspetta l'estrazione",
  });
}
