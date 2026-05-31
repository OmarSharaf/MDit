export interface SnippetTemplate {
  id: string;
  name: string;
  content: string;
}

export const SNIPPET_TEMPLATES: SnippetTemplate[] = [
  {
    id: "readme",
    name: "README skeleton",
    content: `# Project Name

> Short description

## Features

- Feature one
- Feature two

## Installation

\`\`\`bash
npm install
\`\`\`

## License

MIT
`,
  },
  {
    id: "blog",
    name: "Blog post",
    content: `---
title: "Post Title"
date: ${new Date().toISOString().slice(0, 10)}
tags: [writing]
---

# Post Title

Introduction paragraph.

## Section

Content here.
`,
  },
  {
    id: "meeting",
    name: "Meeting notes",
    content: `# Meeting Notes — ${new Date().toLocaleDateString()}

**Attendees:**

## Agenda

1.

## Notes

-

## Action items

- [ ]
`,
  },
  {
    id: "mermaid",
    name: "Mermaid diagram",
    content: `\`\`\`mermaid
flowchart LR
  A[Start] --> B{Decision}
  B -->|Yes| C[Done]
  B -->|No| D[Retry]
\`\`\`
`,
  },
];
