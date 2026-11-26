import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import nodemailer, { type Transporter } from "nodemailer";

export type Email = { to: string; subject: string; html: string; text: string };

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  const user = process.env.GMAIL_USER;
  // Google shows app passwords as "abcd efgh ijkl mnop"; the spaces are not part of it.
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
  if (!user || !pass) return null;
  transporter ??= nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
  return transporter;
}

/**
 * Sends through Gmail SMTP when credentials are configured. Without them (local
 * dev) the email is written to .emails/ so it can be opened in a browser.
 */
export async function sendEmail(email: Email): Promise<void> {
  const t = getTransporter();
  if (t) {
    await t.sendMail({
      from: { name: "Secret Santabrus", address: process.env.GMAIL_USER! },
      ...email,
    });
    return;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("GMAIL_USER / GMAIL_APP_PASSWORD non configurati");
  }
  const dir = path.join(process.cwd(), ".emails");
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, `${Date.now()}-${email.to.replace(/[^a-z0-9]/gi, "_")}.html`);
  await writeFile(file, email.html);
  console.log(`[email] to=${email.to} subject="${email.subject}" -> ${file}`);
}

export function appUrl(): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}
