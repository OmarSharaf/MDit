import yaml from "js-yaml";

export interface FrontMatter {
  raw: string;
  data: Record<string, unknown>;
  body: string;
}

export function parseFrontMatter(content: string): FrontMatter {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { raw: "", data: {}, body: content };
  }
  try {
    const data = (yaml.load(match[1]) as Record<string, unknown>) ?? {};
    return { raw: match[1], data, body: match[2] };
  } catch {
    return { raw: match[1], data: {}, body: match[2] };
  }
}

export function updateFrontMatter(content: string, data: Record<string, unknown>): string {
  const { body } = parseFrontMatter(content);
  const keys = Object.keys(data);
  if (!keys.length) return body;
  const yamlStr = yaml.dump(data, { lineWidth: 120 }).trimEnd();
  return `---\n${yamlStr}\n---\n${body}`;
}

export function stripFrontMatter(content: string): string {
  return parseFrontMatter(content).body;
}
