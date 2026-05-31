export interface SlashCommand {
  id: string;
  label: string;
  snippet: string;
}

export const SLASH_COMMANDS: SlashCommand[] = [
  { id: "h1", label: "Heading 1", snippet: "# " },
  { id: "h2", label: "Heading 2", snippet: "## " },
  { id: "h3", label: "Heading 3", snippet: "### " },
  { id: "table", label: "Table (3×3)", snippet: "\n| Col 1 | Col 2 | Col 3 |\n| --- | --- | --- |\n|  |  |  |\n" },
  { id: "code", label: "Code block", snippet: "\n```\n\n```\n" },
  { id: "mermaid", label: "Mermaid diagram", snippet: "\n```mermaid\nflowchart LR\n  A --> B\n```\n" },
  { id: "quote", label: "Blockquote", snippet: "\n> \n" },
  { id: "task", label: "Task list", snippet: "\n- [ ] Task\n" },
  { id: "toc", label: "Table of contents", snippet: "\n## Contents\n\n<!-- TOC will appear in preview from headings -->\n" },
  { id: "fm", label: "Front matter", snippet: "---\ntitle: \ndate: \n---\n\n" },
  { id: "slide", label: "Slide break", snippet: "\n---\n\n" },
  { id: "wiki", label: "Wiki link", snippet: "[[page-name]]" },
];

export function filterSlashCommands(query: string): SlashCommand[] {
  const q = query.toLowerCase();
  return SLASH_COMMANDS.filter((c) => c.label.toLowerCase().includes(q) || c.id.includes(q));
}
