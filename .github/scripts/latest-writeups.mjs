// Rewrites the "Latest Write-ups" list in README.md from the site's Atom feed.
// No dependencies. Usage: node .github/scripts/latest-writeups.mjs [feed.xml to read instead of the live feed]
import { readFile, writeFile } from "node:fs/promises";

const FEED = "https://lectrik0.github.io/feed.xml";
const SITE = /^https:\/\/lectrik0\.github\.io\/[\w\-./#%]*$/;
const MAX = 5;
const START = "<!-- WRITEUPS:START -->", END = "<!-- WRITEUPS:END -->";

async function feed() {
  if (process.argv[2]) return readFile(process.argv[2], "utf8");
  const res = await fetch(FEED);
  if (!res.ok) throw new Error(`${FEED}: HTTP ${res.status}`);
  return res.text();
}

const decode = s => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
const tag = (xml, name) => decode(xml.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`))?.[1] ?? "").trim();
// Feed text goes into Markdown as plain words: no links, markup or table pipes.
const plain = s => s.replace(/[[\]<>*_`|\\]/g, "").replace(/\s+/g, " ").trim();
const month = d => new Date(d).toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });

const posts = [...(await feed()).matchAll(/<entry>([\s\S]*?)<\/entry>/g)]
  .map(([, e]) => ({
    title: plain(tag(e, "title")),
    summary: plain(tag(e, "summary")),
    url: e.match(/<link\b[^>]*href="([^"]+)"/)?.[1] ?? "",
    date: tag(e, "published") || tag(e, "updated")
  }))
  .filter(p => p.title && SITE.test(p.url) && !Number.isNaN(Date.parse(p.date)))
  .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
  .slice(0, MAX);

const list = posts.length
  ? posts.map(p => `- **[${p.title}](${p.url})** · ${month(p.date)}${p.summary ? `<br>${p.summary}` : ""}`).join("\n")
  : "- Coming soon.";

const readme = await readFile("README.md", "utf8");
const from = readme.indexOf(START), to = readme.indexOf(END);
if (from < 0 || to < from) throw new Error(`README.md needs ${START} and ${END}`);
const next = `${readme.slice(0, from + START.length)}\n${list}\n${readme.slice(to)}`;
if (next !== readme) await writeFile("README.md", next);
console.log(`${posts.length} write-up(s) listed; README ${next === readme ? "unchanged" : "updated"}.`);
