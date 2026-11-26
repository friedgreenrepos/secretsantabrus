import type { Group, Participant } from "@/db/schema";
import { formatDateIt, formatEuro } from "./dates";
import { appUrl, type Email } from "./mail";
import { formatCode } from "./random";

const RED = "#b3261e";
const GREEN = "#14402f";
const CREAM = "#fdf8ef";
const GOLD = "#c9a14a";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function nl2br(s: string): string {
  return esc(s).replace(/\n/g, "<br>");
}

function button(href: string, label: string): string {
  return `<a href="${esc(href)}" style="display:inline-block;background:${RED};color:#ffffff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px;font-size:15px">${esc(label)}</a>`;
}

/** Table-based layout with inline styles: the only thing Gmail and Outlook render reliably. */
function layout(title: string, body: string): string {
  return `<!doctype html>
<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:${GREEN};font-family:Helvetica,Arial,sans-serif;color:#2b2b2b">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${GREEN};padding:32px 12px">
<tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">
    <tr><td align="center" style="color:#ffffff;font-size:13px;letter-spacing:4px;padding-bottom:6px">❄ &nbsp; ❄ &nbsp; ❄</td></tr>
    <tr><td align="center" style="color:#ffffff;font-family:Georgia,serif;font-size:26px;padding-bottom:20px">🧝‍♀️ Secret Santabrus</td></tr>
    <tr><td style="background:${CREAM};border-radius:18px;padding:32px 28px;border-top:6px solid ${RED}">
      ${body}
    </td></tr>
    <tr><td align="center" style="color:#cfe0d6;font-size:12px;padding-top:18px;line-height:1.5">
      Messaggio automatico di Secret Santabrus — OH OH OH, Buon Natale! 🎄
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;
}

function h1(s: string): string {
  return `<h1 style="margin:0 0 16px;font-family:Georgia,serif;font-weight:normal;font-size:24px;color:${GREEN}">${s}</h1>`;
}

function p(s: string): string {
  return `<p style="margin:0 0 14px;font-size:15px;line-height:1.6">${s}</p>`;
}

function eventSummary(group: Group): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;background:#ffffff;border-radius:12px;border:1px solid #eadfca">
  <tr><td style="padding:14px 16px;font-size:14px;line-height:1.7">
    <strong style="font-size:16px;color:${GREEN}">${esc(group.name)}</strong><br>
    ${group.description ? `${nl2br(group.description)}<br>` : ""}
    💶 Budget: <strong>${formatEuro(group.budget)}</strong><br>
    📅 Estrazione: <strong>${formatDateIt(group.drawDate)}</strong>
  </td></tr></table>`;
}

export function confirmEmail(group: Group, participant: Participant): Email {
  const confirmUrl = `${appUrl()}/api/conferma/${participant.token}`;
  const pageUrl = `${appUrl()}/p/${participant.token}`;
  return {
    to: participant.email,
    subject: `Conferma la tua email per "${group.name}"`,
    html: layout(
      "Conferma la tua email",
      `${h1(`Ciao ${esc(participant.name)}!`)}
      ${p(`Ti sei iscritto/a al Secret Santa <strong>${esc(group.name)}</strong>. Conferma che questo indirizzo email è giusto: è qui che riceverai il nome della persona a cui fare il regalo.`)}
      <p style="margin:22px 0;text-align:center">${button(confirmUrl, "Confermo la mia email")}</p>
      ${eventSummary(group)}
      ${p(`Puoi controllare lo stato del gruppo e modificare le tue idee regalo dalla tua pagina personale:<br><a href="${esc(pageUrl)}" style="color:${RED}">${esc(pageUrl)}</a>`)}
      <p style="margin:0;font-size:13px;color:#777">Tieni questo link per te: è personale.</p>`,
    ),
    text: `Ciao ${participant.name}!\n\nConferma la tua email per "${group.name}": ${confirmUrl}\n\nLa tua pagina personale: ${pageUrl}`,
  };
}

export function adminEmail(group: Group): Email {
  const adminUrl = `${appUrl()}/admin/${group.adminToken}`;
  const shareUrl = `${appUrl()}/g/${group.code}`;
  return {
    to: group.organiserEmail,
    subject: `Hai creato "${group.name}" 🎁`,
    html: layout(
      "Il tuo Secret Santa",
      `${h1("Il tuo Secret Santa è pronto!")}
      ${p("Condividi questo codice (o il link) con chi vuoi far partecipare:")}
      <p style="margin:10px 0 6px;text-align:center;font-family:Georgia,serif;font-size:34px;letter-spacing:6px;color:${RED}">${formatCode(group.code)}</p>
      <p style="margin:0 0 20px;text-align:center;font-size:14px"><a href="${esc(shareUrl)}" style="color:${GREEN}">${esc(shareUrl)}</a></p>
      ${eventSummary(group)}
      ${p("Da questo link puoi modificare l'evento, rimuovere partecipanti o fare l'estrazione in anticipo:")}
      <p style="margin:18px 0;text-align:center">${button(adminUrl, "Gestisci il Secret Santa")}</p>
      <p style="margin:0;font-size:13px;color:#777">Non condividere il link di gestione: chi lo ha può modificare il gruppo.</p>`,
    ),
    text: `Il tuo Secret Santa "${group.name}" è pronto.\n\nCodice: ${formatCode(group.code)}\nLink da condividere: ${shareUrl}\n\nLink di gestione (non condividerlo): ${adminUrl}`,
  };
}

export function drawEmail(group: Group, giver: Participant, recipient: Participant): Email {
  const pageUrl = `${appUrl()}/p/${giver.token}`;
  const ideas = recipient.giftIdeas.trim();
  return {
    to: giver.email,
    subject: `🎁 Il tuo Secret Santabrus per "${group.name}"`,
    html: layout(
      "Il tuo Secret Santa",
      `${h1(`Ciao ${esc(giver.name)}!`)}
      ${p(`L'estrazione di <strong>${esc(group.name)}</strong> è stata fatta. Quest'anno sarai il Secret Santa di…`)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0 22px">
        <tr><td align="center" style="background:${RED};border-radius:16px;padding:26px 16px;border:3px dashed ${GOLD}">
          <div style="font-size:34px;line-height:1">🎁</div>
          <div style="color:#ffffff;font-family:Georgia,serif;font-size:32px;padding-top:10px">${esc(recipient.name)}</div>
        </td></tr>
      </table>
      ${
        ideas
          ? `<p style="margin:0 0 6px;font-size:14px;font-weight:600;color:${GREEN}">💡 Le sue idee regalo</p>
             <div style="margin:0 0 20px;padding:12px 14px;background:#ffffff;border-left:4px solid ${GOLD};border-radius:8px;font-size:15px;line-height:1.6">${nl2br(ideas)}</div>`
          : p(`<em>${esc(recipient.name)} non ha lasciato idee regalo: usa la fantasia!</em>`)
      }
      ${p(`Budget: <strong>${formatEuro(group.budget)}</strong>. Acqua in bocca! 🤫`)}
      <p style="margin:18px 0 0;text-align:center">${button(pageUrl, "Apri la tua pagina")}</p>`,
    ),
    text: `Ciao ${giver.name}!\n\nQuest'anno sarai il Secret Santa di: ${recipient.name}\n\n${ideas ? `Idee regalo:\n${ideas}\n\n` : ""}Budget: ${formatEuro(group.budget)}\n\nLa tua pagina: ${pageUrl}`,
  };
}
