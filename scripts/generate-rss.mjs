// Generates public/rss.xml from public/news.json at build time.
// Feeds are consumed aggressively by search AIs (Perplexity et al) and RSS
// readers — a zero-maintenance distribution channel for every news item.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const news = JSON.parse(readFileSync(join(root, "public/news.json"), "utf8"));

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const items = news.items
  .slice()
  .sort((a, b) => (a.date < b.date ? 1 : -1))
  .map(
    (it) => `    <item>
      <title>${esc(it.title_bg)}</title>
      <link>${esc(it.url)}</link>
      <guid isPermaLink="false">${esc(it.url + "#" + it.date)}</guid>
      <pubDate>${new Date(it.date + "T09:00:00Z").toUTCString()}</pubDate>
      <category>${esc(it.type)}</category>
      <description>${esc(it.title_en)}</description>
    </item>`
  )
  .join("\n");

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>BAMAS / БАЗАП — Новини</title>
    <link>https://www.bamas.xyz/news</link>
    <atom:link href="https://www.bamas.xyz/rss.xml" rel="self" type="application/rss+xml" />
    <description>Партньорства, събития и съобщения от Българската асоциация за адитивно производство.</description>
    <language>bg</language>
${items}
  </channel>
</rss>
`;

writeFileSync(join(root, "public/rss.xml"), rss);
console.log(`rss.xml generated with ${news.items.length} items`);
