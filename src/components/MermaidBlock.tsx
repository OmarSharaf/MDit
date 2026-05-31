import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

let mermaidReady = false;

function initMermaid(theme: "light" | "dark") {
  mermaid.initialize({
    startOnLoad: false,
    theme: theme === "dark" ? "dark" : "default",
    securityLevel: "loose",
  });
  mermaidReady = true;
}

interface Props {
  code: string;
  theme: "light" | "dark";
}

export function MermaidBlock({ code, theme }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mermaidReady) initMermaid(theme);
    else mermaid.initialize({ theme: theme === "dark" ? "dark" : "default" });

    const el = ref.current;
    if (!el) return;

    const id = `mermaid-${Math.random().toString(36).slice(2)}`;
    mermaid
      .render(id, code.trim())
      .then(({ svg }) => {
        el.innerHTML = svg;
        setError(null);
      })
      .catch((e) => setError(String(e)));
  }, [code, theme]);

  if (error) {
    return <pre className="mermaid-error">{code}</pre>;
  }

  return <div ref={ref} className="mermaid-diagram" />;
}
