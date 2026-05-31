# SEO & search discoverability

MDit’s web build is optimized for **search engines**, **social previews**, and **installable PWA** metadata. Configuration lives in one place: [`src/constants/seoMeta.ts`](../../src/constants/seoMeta.ts).

## What is included

| Layer | Deliverable |
| --- | --- |
| **HTML** | Title, description, keywords, canonical, hreflang, Dublin Core, robots directives |
| **Social** | Open Graph (Facebook, LinkedIn), Twitter/X large image cards |
| **Structured data** | JSON-LD `@graph`: WebSite, Organization, WebApplication, SoftwareApplication, Person, FAQPage, BreadcrumbList |
| **Crawlers** | `robots.txt`, `sitemap.xml` (with image extension), `humans.txt`, `security.txt` |
| **PWA** | Generated `site.webmanifest` with screenshots and related apps |
| **Fallback** | Rich `<noscript>` content for crawlers and users without JavaScript |
| **Icons** | favicon, Apple touch icon, 192/512 PWA icons, `browserconfig.xml` |

## Production setup (required)

### 1. Canonical URL

In **Vercel → Settings → Environment Variables** (Production):

```text
VITE_SITE_URL=https://your-live-domain.com
```

No trailing slash. Rebuild after changing.

### 2. Google Search Console

1. [Google Search Console](https://search.google.com/search-console) → add **URL prefix** property.
2. Verification → **HTML tag** → copy the `content` value.
3. Add `VITE_GOOGLE_SITE_VERIFICATION` in Vercel with that value.
4. Redeploy → **Verify** in Search Console.
5. **Sitemaps** → submit: `https://your-domain/sitemap.xml`
6. **URL inspection** → request indexing for your homepage.

### 3. Bing Webmaster Tools (recommended)

1. [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Add site → HTML meta tag → set `VITE_BING_SITE_VERIFICATION`
3. Submit the same sitemap URL.

### 4. Optional verifications

| Variable | Service |
| --- | --- |
| `VITE_YANDEX_VERIFICATION` | Yandex Webmaster |
| `VITE_PINTEREST_VERIFICATION` | Pinterest domain verify |
| `VITE_TWITTER_SITE` / `VITE_TWITTER_CREATOR` | Override default `@omarsharaf` |

See [`.env.example`](../../.env.example) for the full list.

## Validate before/after launch

| Tool | Checks |
| --- | --- |
| [Google Rich Results Test](https://search.google.com/test/rich-results) | FAQ + SoftwareApplication schema |
| [Schema Markup Validator](https://validator.schema.org/) | JSON-LD graph |
| [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) | Open Graph image and text |
| [Twitter Card Validator](https://cards-dev.twitter.com/validator) | Large image card |
| [PageSpeed Insights](https://pagespeed.web.dev/) | Core Web Vitals (indirect SEO signal) |

Live URLs to spot-check:

- `/robots.txt`
- `/sitemap.xml`
- `/site.webmanifest`
- `/og-image.png`
- `/.well-known/security.txt`

## Regenerate brand assets

```bash
npm run icons       # favicons + og-image.png from SVG
npm run build       # injects SEO into dist/
```

## Editing copy

Update **`src/constants/seoMeta.ts`** only — then rebuild. Do not hand-edit generated `dist/` files.

- **Title / description** — keep description under ~160 characters for Google snippets.
- **FAQ** — powers FAQ rich results; add real user questions.
- **Keywords** — used in `<meta name="keywords">`; focus on intent, not stuffing.

## Indexing expectations

MDit is a **single-page application**. Google renders JavaScript well; the static `<head>` and `<noscript>` block provide reliable signals. Full indexing may take **several days to a few weeks** for new domains. Consistent `VITE_SITE_URL`, sitemap submission, and a few external links (GitHub README, profile) help.

## Desktop vs web

SEO applies to the **web deployment** only. The Tauri desktop app does not use these files.
