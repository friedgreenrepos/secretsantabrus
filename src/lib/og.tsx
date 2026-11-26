import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

const PINE = "#14402f";
const CREAM = "#fdf8ef";
const RED = "#b3261e";
const GOLD = "#c9a14a";

// Same deterministic flakes on every render (Park–Miller generator, as in Snow.tsx).
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const FLAKES = Array.from({ length: 70 }, () => ({
  x: rand() * 1200,
  y: rand() * 630,
  s: 3 + rand() * 7,
  o: 0.25 + rand() * 0.5,
}));

async function assets() {
  const dir = process.cwd();
  const [fraunces, geist, geistBold, elf] = await Promise.all([
    readFile(join(dir, "assets/Fraunces-Medium.ttf")),
    readFile(join(dir, "assets/Geist-Regular.ttf")),
    readFile(join(dir, "assets/Geist-SemiBold.ttf")),
    readFile(join(dir, "src/app/icon.svg"), "utf8"),
  ]);
  return {
    elfSrc: `data:image/svg+xml;base64,${Buffer.from(elf).toString("base64")}`,
    fonts: [
      { name: "Fraunces", data: fraunces, weight: 500 as const, style: "normal" as const },
      { name: "Geist", data: geist, weight: 400 as const, style: "normal" as const },
      { name: "Geist", data: geistBold, weight: 600 as const, style: "normal" as const },
    ],
  };
}

type Card = {
  eyebrow: string;
  title: string;
  chips?: string[];
  footer: React.ReactNode;
};

export async function renderOgCard({ eyebrow, title, chips = [], footer }: Card) {
  const { elfSrc, fonts } = await assets();
  const titleSize = title.length > 40 ? 58 : title.length > 22 ? 70 : 84;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: `radial-gradient(ellipse at 30% 0%, #1d5a42 0%, ${PINE} 55%, #0d2e21 100%)`,
          fontFamily: "Geist",
          color: CREAM,
        }}
      >
        {FLAKES.map((f, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: f.x,
              top: f.y,
              width: f.s,
              height: f.s,
              borderRadius: 999,
              background: "#ffffff",
              opacity: f.o,
            }}
          />
        ))}
        <div style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 14, background: RED, display: "flex" }} />
        <div style={{ display: "flex", alignItems: "center", padding: "0 70px", gap: 56, width: "100%" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={elfSrc} width={330} height={308} alt="" />
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: 6, color: GOLD, textTransform: "uppercase" }}>
              {eyebrow}
            </div>
            <div
              style={{
                fontFamily: "Fraunces",
                fontSize: titleSize,
                lineHeight: 1.05,
                marginTop: 14,
                color: "#ffffff",
                display: "flex",
              }}
            >
              {title}
            </div>
            {chips.length > 0 && (
              <div style={{ display: "flex", gap: 14, marginTop: 30 }}>
                {chips.map((c) => (
                  <div
                    key={c}
                    style={{
                      display: "flex",
                      background: CREAM,
                      color: PINE,
                      fontSize: 26,
                      fontWeight: 600,
                      padding: "10px 22px",
                      borderRadius: 999,
                    }}
                  >
                    {c}
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", marginTop: 34, fontSize: 28, color: "#cfe0d6" }}>
              {footer}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}

export const OG_COLORS = { RED, GOLD };
