import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MarkdownPreview } from "./MarkdownPreview";
import styles from "./PresentationView.module.css";

interface Props {
  slides: string[];
  content: string;
}

export function PresentationView({ slides, content }: Props) {
  const [index, setIndex] = useState(0);
  const total = Math.max(1, slides.length);
  const slideContent = slides.length ? slides[index] : content;

  const next = useCallback(() => setIndex((i) => Math.min(i + 1, total - 1)), [total]);
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      if (e.key === "Home") setIndex(0);
      if (e.key === "End") setIndex(total - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, total]);

  return (
    <div className={styles.wrap} role="region" aria-label="Presentation">
      <div className={styles.slide}>
        <MarkdownPreview content={slideContent} syncSelection={false} />
      </div>
      <div className={styles.controls}>
        <button type="button" onClick={prev} disabled={index === 0} aria-label="Previous slide">
          <ChevronLeft size={16} />
        </button>
        <span>{index + 1} / {total}</span>
        <button type="button" onClick={next} disabled={index >= total - 1} aria-label="Next slide">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
