import type { Metadata } from "next";
import { Fraunces, Geist } from "next/font/google";
import Link from "next/link";
import { Elf } from "@/components/Elf";
import { Snow } from "@/components/Snow";
import "./globals.css";

const body = Geist({ variable: "--font-body", subsets: ["latin"] });
const display = Fraunces({ variable: "--font-display", subsets: ["latin"] });

export const metadata: Metadata = {
  // Makes the og:image URLs absolute, which WhatsApp & co. require.
  metadataBase: new URL(
    process.env.APP_URL ??
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : "http://localhost:3000"),
  ),
  title: "Secret Santabrus",
  description: "Il Secret Santa dei Calabrus: crea il gruppo, condividi il codice, aspetta l'estrazione.",
  openGraph: { siteName: "Secret Santabrus", locale: "it_IT", type: "website" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className={`${body.variable} ${display.variable} antialiased`}>
      <body className="min-h-dvh font-sans">
        <Snow />
        <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-xl flex-col px-4 py-6 sm:py-10">
          <header className="mb-6 flex items-center justify-center">
            <Link href="/" className="flex items-center gap-3 text-white">
              <Elf className="h-12 w-12" />
              <span className="font-display text-2xl tracking-tight">Secret Santabrus</span>
            </Link>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="mt-10 text-center text-xs text-white/50">
            Fatto con ❤️ per i Calabrus · OH OH OH
          </footer>
        </div>
      </body>
    </html>
  );
}
