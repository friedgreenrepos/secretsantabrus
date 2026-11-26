// Deterministic pseudo-random flakes so server and client render the same markup.
function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const rand = seeded(42);
const FLAKES = Array.from({ length: 60 }, () => {
  const size = 2 + rand() * 4;
  return {
    left: rand() * 100,
    size,
    opacity: 0.35 + rand() * 0.5,
    fall: 9 + rand() * 14,
    sway: 2 + rand() * 3,
    delay: -rand() * 20,
    // used only when motion is reduced: scatter flakes statically
    top: rand() * 100,
  };
});

export function Snow() {
  return (
    <div className="snow" aria-hidden="true">
      {FLAKES.map((f, i) => (
        <span
          key={i}
          className="flake"
          style={{
            left: `${f.left}%`,
            width: f.size,
            height: f.size,
            opacity: f.opacity,
            animationDuration: `${f.fall}s, ${f.sway}s`,
            animationDelay: `${f.delay}s, ${f.delay}s`,
            bottom: `${f.top}%`,
          }}
        />
      ))}
    </div>
  );
}
