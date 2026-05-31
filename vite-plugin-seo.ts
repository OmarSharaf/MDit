import type { Plugin } from "vite";
import { buildKeywords, SEO } from "./src/constants/seoMeta";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildJsonLd(siteUrl: string): string {
  const imageUrl = `${siteUrl}${SEO.ogImage.path}`;
  const graph = [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: SEO.siteName,
      description: SEO.description,
      inLanguage: SEO.language,
      publisher: { "@id": `${siteUrl}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteUrl}/?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: SEO.organization.name,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: imageUrl,
        width: SEO.ogImage.width,
        height: SEO.ogImage.height,
      },
      sameAs: SEO.organization.sameAs,
    },
    {
      "@type": "WebApplication",
      "@id": `${siteUrl}/#webapp`,
      name: SEO.siteName,
      url: siteUrl,
      description: SEO.description,
      applicationCategory: SEO.application.category,
      operatingSystem: SEO.application.operatingSystems.join(", "),
      browserRequirements: "Requires JavaScript. Modern evergreen browser.",
      softwareVersion: SEO.application.version,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
      featureList: SEO.application.featureList,
      screenshot: imageUrl,
      author: { "@id": `${siteUrl}/#author` },
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#software`,
      name: SEO.siteName,
      alternateName: SEO.legalName,
      url: siteUrl,
      downloadUrl: SEO.releasesUrl,
      softwareVersion: SEO.application.version,
      applicationCategory: SEO.application.category,
      operatingSystem: SEO.application.operatingSystems,
      description: SEO.description,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: SEO.application.featureList,
      screenshot: imageUrl,
      author: { "@id": `${siteUrl}/#author` },
    },
    {
      "@type": "Person",
      "@id": `${siteUrl}/#author`,
      name: SEO.author.name,
      url: SEO.author.url,
      jobTitle: SEO.author.jobTitle,
      sameAs: [SEO.author.url, SEO.githubUrl],
    },
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}/#faq`,
      mainEntity: SEO.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${siteUrl}/#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: SEO.siteName,
          item: siteUrl,
        },
      ],
    },
  ];

  return JSON.stringify(
    {
      "@context": "https://schema.org",
      "@graph": graph,
    },
    null,
    0
  );
}

export function mditSeoPlugin(): Plugin {
  const siteUrl = (process.env.VITE_SITE_URL || SEO.defaultUrl).replace(/\/$/, "");
  const googleVerification = process.env.VITE_GOOGLE_SITE_VERIFICATION?.trim();
  const bingVerification = process.env.VITE_BING_SITE_VERIFICATION?.trim();
  const yandexVerification = process.env.VITE_YANDEX_VERIFICATION?.trim();
  const pinterestVerification = process.env.VITE_PINTEREST_VERIFICATION?.trim();
  const twitterSite = process.env.VITE_TWITTER_SITE?.trim() || SEO.twitter.site;
  const twitterCreator = process.env.VITE_TWITTER_CREATOR?.trim() || SEO.twitter.creator;

  const replacements: Record<string, string> = {
    __SITE_URL__: siteUrl,
    __SITE_NAME__: SEO.siteName,
    __SITE_TITLE__: SEO.title,
    __SITE_SHORT_TITLE__: SEO.shortTitle,
    __SITE_DESCRIPTION__: SEO.description,
    __SITE_SHORT_DESCRIPTION__: SEO.shortDescription,
    __SITE_TAGLINE__: SEO.tagline,
    __SITE_KEYWORDS__: buildKeywords(),
    __SITE_LOCALE__: SEO.locale,
    __SITE_LANGUAGE__: SEO.language,
    __THEME_COLOR__: SEO.themeColor,
    __OG_IMAGE_ALT__: SEO.ogImage.alt,
    __OG_IMAGE_TYPE__: SEO.ogImage.type,
    __GITHUB_URL__: SEO.githubUrl,
    __RELEASES_URL__: SEO.releasesUrl,
    __AUTHOR_NAME__: SEO.author.name,
    __AUTHOR_URL__: SEO.author.url,
    __TWITTER_SITE__: twitterSite,
    __TWITTER_CREATOR__: twitterCreator,
    __JSON_LD__: buildJsonLd(siteUrl),
    __NOSCRIPT_HEADING__: SEO.noscript.heading,
    __NOSCRIPT_FEATURES__: SEO.noscript.features.map((f) => `<li>${f}</li>`).join("\n          "),
    __NOSCRIPT_PARAGRAPHS__: SEO.noscript.paragraphs
      .map((p) => `<p>${p}</p>`)
      .join("\n          "),
  };

  return {
    name: "mdit-seo",
    transformIndexHtml(html) {
      let out = html;
      for (const [token, value] of Object.entries(replacements)) {
        out = out.replaceAll(token, value);
      }

      const verificationTags: string[] = [];
      if (googleVerification) {
        verificationTags.push(
          `<meta name="google-site-verification" content="${googleVerification}" />`
        );
      }
      if (bingVerification) {
        verificationTags.push(`<meta name="msvalidate.01" content="${bingVerification}" />`);
      }
      if (yandexVerification) {
        verificationTags.push(
          `<meta name="yandex-verification" content="${yandexVerification}" />`
        );
      }
      if (pinterestVerification) {
        verificationTags.push(
          `<meta name="p:domain_verify" content="${pinterestVerification}" />`
        );
      }

      out = out.replace("<!-- site-verification -->", verificationTags.join("\n    "));

      return out;
    },
    generateBundle() {
      const lastmod = new Date().toISOString().slice(0, 10);
      const imageUrl = `${siteUrl}${SEO.ogImage.path}`;

      const robots = `# MDit — https://github.com/OmarSharaf/MDit
User-agent: *
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: Slurp
Allow: /

# AI crawlers (optional indexing for discovery)
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

Host: ${new URL(siteUrl).host}
Sitemap: ${siteUrl}/sitemap.xml
`;

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${siteUrl}/" />
    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title>${SEO.siteName} — ${SEO.tagline}</image:title>
      <image:caption>${escapeXml(SEO.ogImage.alt)}</image:caption>
    </image:image>
  </url>
</urlset>
`;

      const humans = `/* TEAM */
Creator: ${SEO.author.name}
Site: ${SEO.author.url}
GitHub: ${SEO.githubUrl}

/* SITE */
Standards: HTML5, CSS3, Schema.org, Open Graph
Software: MDit — Markdown Editor
`;

      const securityExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
      const security = `Contact: ${SEO.author.url}
Expires: ${securityExpiry}
Preferred-Languages: en
Canonical: ${siteUrl}/
Policy: ${SEO.githubUrl}/blob/main/SECURITY.md
`;

      this.emitFile({ type: "asset", fileName: "robots.txt", source: robots });
      this.emitFile({ type: "asset", fileName: "sitemap.xml", source: sitemap });
      this.emitFile({ type: "asset", fileName: "humans.txt", source: humans });
      this.emitFile({ type: "asset", fileName: ".well-known/security.txt", source: security });

      const manifest = {
        id: siteUrl,
        name: SEO.title,
        short_name: SEO.siteName,
        description: SEO.shortDescription,
        start_url: "/",
        scope: "/",
        display: "standalone",
        display_override: ["window-controls-overlay", "standalone", "browser"],
        orientation: "any",
        background_color: SEO.backgroundColor,
        theme_color: SEO.themeColor,
        lang: SEO.language,
        dir: "ltr",
        categories: ["productivity", "utilities", "education"],
        prefer_related_applications: true,
        related_applications: [
          {
            platform: "web",
            url: siteUrl,
          },
        ],
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [
          {
            src: SEO.ogImage.path,
            sizes: `${SEO.ogImage.width}x${SEO.ogImage.height}`,
            type: SEO.ogImage.type,
            form_factor: "wide",
            label: SEO.ogImage.alt,
          },
        ],
      };

      this.emitFile({
        type: "asset",
        fileName: "site.webmanifest",
        source: JSON.stringify(manifest, null, 2),
      });
    },
  };
}
