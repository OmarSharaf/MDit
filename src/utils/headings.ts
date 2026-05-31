export interface HeadingItem {
  level: number;
  text: string;
  line: number;
  id: string;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function extractHeadings(content: string): HeadingItem[] {
  const headings: HeadingItem[] = [];
  const lines = content.split("\n");
  const slugCounts: Record<string, number> = {};

  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (!match) return;
    const level = match[1].length;
    const text = match[2].replace(/\s+#*\s*$/, "").trim();
    let id = slugify(text);
    if (slugCounts[id] !== undefined) {
      slugCounts[id]++;
      id = `${id}-${slugCounts[id]}`;
    } else {
      slugCounts[id] = 0;
    }
    headings.push({ level, text, line: index + 1, id });
  });

  return headings;
}

export function lineForHeadingId(content: string, id: string): number | null {
  const h = extractHeadings(content).find((x) => x.id === id);
  return h?.line ?? null;
}
