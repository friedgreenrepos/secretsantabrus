import { randomInt } from "node:crypto";

export const MIN_PARTICIPANTS = 3;

/**
 * Arranges everyone in a single gift-giving circle: shuffle, then each person
 * gives to the next one and the last gives to the first. This guarantees no one
 * draws themselves and there are no closed sub-loops (A↔B), same as the
 * original Python script.
 *
 * Returns a map of giverId -> recipientId.
 */
export function drawCircle(ids: readonly string[]): Map<string, string> {
  if (ids.length < MIN_PARTICIPANTS) {
    throw new Error(`Servono almeno ${MIN_PARTICIPANTS} partecipanti`);
  }
  const order = [...ids];
  for (let i = order.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  const result = new Map<string, string>();
  order.forEach((giver, i) => result.set(giver, order[(i + 1) % order.length]));
  return result;
}
