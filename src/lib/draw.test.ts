import { describe, expect, it } from "vitest";
import { drawCircle } from "./draw";

function cycleLength(map: Map<string, string>, start: string): number {
  let steps = 0;
  let current = start;
  do {
    current = map.get(current)!;
    steps++;
  } while (current !== start && steps <= map.size);
  return steps;
}

describe("drawCircle", () => {
  it("rejects fewer than 3 people", () => {
    expect(() => drawCircle(["a", "b"])).toThrow();
  });

  it.each([3, 4, 7, 20])("forms one full circle with %i people", (n) => {
    const ids = Array.from({ length: n }, (_, i) => `p${i}`);
    for (let run = 0; run < 200; run++) {
      const map = drawCircle(ids);
      expect(map.size).toBe(n);
      expect(new Set(map.values()).size).toBe(n);
      for (const [giver, recipient] of map) expect(giver).not.toBe(recipient);
      expect(cycleLength(map, ids[0])).toBe(n);
    }
  });
});
