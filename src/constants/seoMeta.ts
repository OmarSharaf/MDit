/**
 * Single source of truth for MDit web SEO (build-time + documentation).
 * Values are injected into index.html, robots.txt, sitemap, and JSON-LD at build.
 */

export const SEO = {
  siteName: "MDit",
  legalName: "MDit Markdown Editor",
  tagline: "Markdown, done well.",
  title: "MDit — Professional Markdown Editor with Live Preview",
  shortTitle: "MDit — Markdown Editor",
  description:
    "MDit is a free, professional Markdown editor with live split preview, KaTeX math, Mermaid diagrams, GitHub import, workspace tools, and export to HTML and PDF. Use in your browser or download for Windows.",
  shortDescription:
    "Free Markdown editor with live preview, math, Mermaid, workspace tools, and export. Web and Windows.",
  keywords: [
    "markdown editor",
    "markdown editor online",
    "live markdown preview",
    "split markdown editor",
    "mermaid markdown",
    "katex markdown",
    "gfm editor",
    "technical writing tool",
    "documentation editor",
    "note taking app",
    "markdown export html",
    "markdown pdf",
    "free markdown editor",
    "windows markdown editor",
    "tauri markdown editor",
    "distraction free writing",
    "yaml front matter editor",
    "github gist import markdown",
  ],
  locale: "en_US",
  language: "en",
  themeColor: "#3b5bdb",
  backgroundColor: "#f4f5f8",
  defaultUrl: "https://mdit.vercel.app",
  githubUrl: "https://github.com/OmarSharaf/MDit",
  releasesUrl: "https://github.com/OmarSharaf/MDit/releases",
  docsPath: "/",
  author: {
    name: "Omar S. M. Abdelfatah",
    url: "https://omarsharaf.me",
    jobTitle: "Software Developer",
  },
  organization: {
    name: "MDit",
    url: "https://mdit.vercel.app",
    logo: "/og-image.png",
    sameAs: ["https://github.com/OmarSharaf/MDit", "https://omarsharaf.me"],
  },
  ogImage: {
    path: "/og-image.png",
    width: 1200,
    height: 630,
    alt: "MDit — Professional Markdown editor with live split preview, math, and Mermaid diagrams",
    type: "image/png",
  },
  twitter: {
    card: "summary_large_image" as const,
    site: "@omarsharaf",
    creator: "@omarsharaf",
  },
  application: {
    version: "1.0.0",
    category: "WritingApplication",
    operatingSystems: ["Windows 10", "Windows 11", "Web Browser"],
    featureList: [
      "Live split preview with GitHub Flavored Markdown",
      "KaTeX math and Mermaid diagram rendering",
      "Workspace folders, search, and Git status panel",
      "Export to HTML, PDF, Word, and ODT",
      "YAML front matter, outline, and snapshots",
      "Command palette, Vim keymap, and Markdown lint",
    ],
  },
  faq: [
    {
      question: "What is MDit?",
      answer:
        "MDit is a fast, professional Markdown editor with a live split preview, built for writers and developers. It supports GFM, math, Mermaid, workspace tools, and export — in the browser and on Windows.",
    },
    {
      question: "Is MDit free?",
      answer:
        "Yes. MDit is free to use in the web browser. The Windows desktop app is also free and open source under the MIT license.",
    },
    {
      question: "Do I need an account to use MDit?",
      answer:
        "No account is required. Open the web app and start writing, or install the desktop app for full folder and Git integration.",
    },
    {
      question: "What is the difference between the web app and desktop app?",
      answer:
        "Both share the same editor and preview. The desktop app adds native folder workspaces, workspace-wide search, Git panel, and file associations for .md files.",
    },
    {
      question: "Can MDit export my documents?",
      answer:
        "Yes. Export to self-contained HTML, print to PDF, Word (.doc), ODT, and publish a workspace as a static HTML site.",
    },
  ],
  noscript: {
    heading: "MDit — Professional Markdown Editor",
    paragraphs: [
      "MDit is a distraction-free Markdown editor with live split preview. Write on the left and see formatted output on the right — including tables, task lists, footnotes, KaTeX math, and Mermaid diagrams.",
      "Use MDit in your browser for instant access, or install the Windows desktop build for project folders, workspace search, Git integration, and GitHub import.",
    ],
    features: [
      "Live split preview with scroll sync",
      "KaTeX math and Mermaid diagrams",
      "Workspace folders, search, and Git (desktop)",
      "Export to HTML, PDF, Word, and ODT",
      "Command palette, Vim keymap, snapshots",
      "Free and open source (MIT)",
    ],
  },
} as const;

export function buildKeywords(): string {
  return SEO.keywords.join(", ");
}
