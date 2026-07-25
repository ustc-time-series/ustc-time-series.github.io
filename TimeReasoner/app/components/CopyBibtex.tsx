"use client";

import { useRef, useState } from "react";

type CopyBibtexProps = {
  bibtex: string;
};

export function CopyBibtex({ bibtex }: CopyBibtexProps) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(bibtex);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      if (!codeRef.current) return;

      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(codeRef.current);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }

  return (
    <div className="bibtex-card">
      <div className="bibtex-toolbar">
        <span>BibTeX</span>
        <button type="button" onClick={handleCopy} data-copy-bibtex>
          <span aria-hidden="true">{copied ? "✓" : "⧉"}</span>
          {copied ? "Copied" : "Copy BibTeX"}
        </button>
        <span className="sr-only" aria-live="polite">
          {copied ? "BibTeX copied to clipboard" : ""}
        </span>
      </div>
      <pre>
        <code ref={codeRef}>{bibtex}</code>
      </pre>
    </div>
  );
}
