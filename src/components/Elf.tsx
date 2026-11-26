/** Santabrus mascot: a lady elf. Pure SVG so it scales and needs no asset. */
export function Elf({ className, title = "Elfa di Santabrus" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 120 112" className={className} role="img" aria-label={title}>
      <g fill="#b8532f">
        <rect x="20" y="66" width="14" height="40" rx="7" />
        <rect x="86" y="66" width="14" height="40" rx="7" />
      </g>
      <g fill="#b3261e">
        <circle cx="27" cy="104" r="5" />
        <circle cx="93" cy="104" r="5" />
      </g>
      <g stroke="#8f3c20" strokeWidth="1.5" fill="none" strokeLinecap="round">
        <path d="M21 78 Q27 82 33 78 M21 88 Q27 92 33 88" />
        <path d="M87 78 Q93 82 99 78 M87 88 Q93 92 99 88" />
      </g>
      <ellipse cx="60" cy="70" rx="33" ry="31" fill="#b8532f" />
      <g fill="#f4cfb2">
        <path d="M31 66 L10 52 Q16 70 33 78 Z" />
        <path d="M89 66 L110 52 Q104 70 87 78 Z" />
      </g>
      <circle cx="60" cy="72" r="27" fill="#f9dcc4" />
      <path d="M30 50 Q44 8 80 8 Q98 9 106 26 Q92 18 82 22 Q90 34 90 50 Z" fill="#1f6b45" />
      <path d="M58 14 Q66 30 64 48" stroke="#195a3a" strokeWidth="2" fill="none" />
      <rect x="27" y="44" width="66" height="11" rx="5.5" fill="#fdf8ef" />
      <circle cx="106" cy="28" r="6" fill="#c9a14a" />
      <circle cx="104.5" cy="26.5" r="1.8" fill="#f3dc9c" />
      <g fill="#2b2b2b">
        <ellipse cx="50" cy="73" rx="2.8" ry="3.4" />
        <ellipse cx="70" cy="73" rx="2.8" ry="3.4" />
      </g>
      <g stroke="#2b2b2b" strokeWidth="1.1" strokeLinecap="round">
        <path d="M47.6 71.2 L46 70.4 M73.4 71.2 L75 70.4" />
      </g>
      <circle cx="51" cy="72" r="0.9" fill="#fff" />
      <circle cx="71" cy="72" r="0.9" fill="#fff" />
      <g fill="#e8857a" opacity="0.55">
        <circle cx="43" cy="82" r="4.5" />
        <circle cx="77" cy="82" r="4.5" />
      </g>
      <circle cx="60" cy="79" r="1.6" fill="#eaa98f" />
      <path d="M53 85 Q60 91 67 85" stroke="#9b3a2c" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M40 96 L50 104 L60 97 L70 104 L80 96 Q60 108 40 96 Z" fill="#b3261e" />
    </svg>
  );
}
