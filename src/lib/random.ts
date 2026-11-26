import { randomBytes, randomInt } from "node:crypto";

// No 0/O, 1/I/L, so codes are easy to read out loud and type.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const CODE_LENGTH = 6;

export function generateCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return code;
}

/** Uppercases and strips spaces/dashes so "ab3-k7p" matches "AB3K7P". */
export function normaliseCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** Formats a code for display, e.g. "AB3K7P" -> "AB3-K7P". */
export function formatCode(code: string): string {
  return `${code.slice(0, 3)}-${code.slice(3)}`;
}

/** Unguessable secret for personal and admin links. */
export function generateToken(): string {
  return randomBytes(24).toString("base64url");
}
