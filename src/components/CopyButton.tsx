"use client";

import { useState } from "react";

export function CopyButton({ value, label = "Copia link" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-secondary text-sm"
      onClick={async () => {
        try {
          if (navigator.share && /Mobi/i.test(navigator.userAgent)) {
            await navigator.share({ title: "Secret Santabrus", url: value });
            return;
          }
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // user dismissed the share sheet or clipboard is blocked: nothing to do
        }
      }}
    >
      {copied ? "Copiato ✓" : label}
    </button>
  );
}
