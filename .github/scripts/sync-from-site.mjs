// Rewrites two lists in README.md from lectrik0.github.io, so the profile follows the site:
//   WRITEUPS markers ← the newest write-ups in feed.xml
//   CERTS markers    ← the certifications in data/site.json (edited in Backstage)
// No dependencies. Usage: node .github/scripts/sync-from-site.mjs [feed.xml site.json]  (local files instead of the live site)
import { readFile, writeFile } from "node:fs/promises";

const SITE = "https://lectrik0.github.io/";
const SITE_LINK = /^https:\/\/lectrik0\.github\.io\/[\w\-./#%]*$/;
const MAX_POSTS = 5;

async function get(path, local) {
  if (local) return readFile(local, "utf8");
  const res = await fetch(SITE + path);
  if (!res.ok) throw new Error(`${SITE}${path}: HTTP ${res.status}`);
  return res.text();
}

const decode = s => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
const tag = (xml, name) => decode(xml.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`))?.[1] ?? "").trim();
// Site text goes into Markdown as plain words: no links, markup or table pipes.
const plain = s => String(s ?? "").replace(/[[\]<>*_`|\\"]/g, "").replace(/\s+/g, " ").trim();
const month = d => new Date(d).toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });

function writeups(xml) {
  const posts = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)]
    .map(([, e]) => ({
      title: plain(tag(e, "title")),
      summary: plain(tag(e, "summary")),
      url: e.match(/<link\b[^>]*href="([^"]+)"/)?.[1] ?? "",
      date: tag(e, "published") || tag(e, "updated")
    }))
    .filter(p => p.title && SITE_LINK.test(p.url) && !Number.isNaN(Date.parse(p.date)))
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    .slice(0, MAX_POSTS);
  return posts.length
    ? posts.map(p => `- **[${p.title}](${p.url})** · ${month(p.date)}${p.summary ? `<br>${p.summary}` : ""}`).join("\n")
    : "- Coming soon.";
}

// Same statuses as the site, listed earned first, then in progress, then planned.
const STATUS = {
  earned: { label: "Earned", color: "157A4B" },
  progress: { label: "In progress", color: "2F6FB3" },
  planned: { label: "Planned", color: "6E7781" }
};
const ORDER = Object.keys(STATUS);
// shields.io static badge text: "-" and "_" are doubled, then URL-encoded.
const badgeText = s => encodeURIComponent(s.replace(/-/g, "--").replace(/_/g, "__"));

function certs(json) {
  const data = JSON.parse(json);
  const list = (Array.isArray(data.certs) ? data.certs : [])
    .map((c, i) => ({ name: plain(c?.name), status: STATUS[c?.status] ? c.status : "planned", i }))
    .filter(c => c.name)
    .sort((a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status) || a.i - b.i);
  if (!list.length) return "Coming soon.";
  return list.map(({ name, status }) => {
    const { label, color } = STATUS[status];
    const src = `https://img.shields.io/badge/${badgeText(name)}-${badgeText(label)}-${color}?style=for-the-badge`;
    return `<a href="${SITE}#certs"><img src="${src}" alt="${name}: ${label}"/></a>`;
  }).join("\n");
}

function fill(readme, name, body) {
  const start = `<!-- ${name}:START -->`, end = `<!-- ${name}:END -->`;
  const from = readme.indexOf(start), to = readme.indexOf(end);
  if (from < 0 || to < from) throw new Error(`README.md needs ${start} and ${end}`);
  return `${readme.slice(0, from + start.length)}\n${body}\n${readme.slice(to)}`;
}

const [feedFile, dataFile] = process.argv.slice(2);
const readme = await readFile("README.md", "utf8");
let next = fill(readme, "WRITEUPS", writeups(await get("feed.xml", feedFile)));
next = fill(next, "CERTS", certs(await get("data/site.json", dataFile)));
if (next !== readme) await writeFile("README.md", next);
console.log(`README ${next === readme ? "unchanged" : "updated"}.`);
