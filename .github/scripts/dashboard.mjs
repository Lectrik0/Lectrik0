// Draws dashboard.svg: a terminal-style picture of my GitHub activity for the README.
//
//   ./contributions.sh   a heatmap of the last year
//   whoami               a short intro, six stats and contributions per month
//
// No dependencies, no secrets: it reads the public contribution calendar through GitHub's GraphQL API
// with the workflow's own token. Everything it draws is a number, a date or a fixed string below, and goes
// through esc() anyway.
//
// Usage: node .github/scripts/dashboard.mjs [calendar.json]   (a saved calendar instead of the live one)
import { readFileSync, writeFileSync } from "node:fs";
import { ROOM_CSS, ROOM_H, ROOM_LABEL, roomBody } from "./room.mjs";
import { critters } from "./critters.mjs";
import { couch } from "./couch.mjs";

const LOGIN = process.env.GITHUB_REPOSITORY_OWNER || "Lectrik0";
const OUT = "dashboard.svg";

// The intro next to the stats. Edit freely.
const ME = {
  user: "ali",
  lines: [
    ["name", "Ali Ahmed"],
    ["role", "Cybersecurity student"],
    ["focus", "Cloud security (AWS)"],
    ["based", "Cairo, Egypt"],
    ["now", "Intern @ Ebank"]
  ]
};

const esc = v => String(v).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const day = iso => new Date(`${iso}T00:00:00Z`);
const shortDate = iso => `${MONTHS[day(iso).getUTCMonth()]} ${day(iso).getUTCDate()}`;

/* ---------- data ---------- */
async function loadDays() {
  const file = process.argv[2];
  let weeks;
  if (file) {
    weeks = JSON.parse(readFileSync(file, "utf8")).weeks;
  } else {
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error("GITHUB_TOKEN is not set");
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { authorization: `bearer ${token}`, "content-type": "application/json", "user-agent": "profile-dashboard" },
      body: JSON.stringify({
        query: `query($login: String!) { user(login: $login) { contributionsCollection { contributionCalendar {
          weeks { contributionDays { date contributionCount weekday } } } } } }`,
        variables: { login: LOGIN }
      }),
      signal: AbortSignal.timeout(20000)
    });
    if (!res.ok) throw new Error(`GitHub answered ${res.status}`);
    const body = await res.json();
    if (body.errors || !body.data?.user) throw new Error("GitHub's answer had no calendar in it");
    weeks = body.data.user.contributionsCollection.contributionCalendar.weeks;
  }
  const days = weeks.flatMap(w => w.contributionDays.map(d => ({ date: String(d.date), count: Number(d.contributionCount) || 0, weekday: Number(d.weekday) })));
  if (!days.length || days.some(d => !/^\d{4}-\d{2}-\d{2}$/.test(d.date) || d.weekday < 0 || d.weekday > 6)) throw new Error("The calendar has an unexpected shape");
  return days;
}

/* ---------- numbers ---------- */
export function stats(days) {
  const total = days.reduce((s, d) => s + d.count, 0);
  const active = days.filter(d => d.count > 0);
  let longest = { n: 0, from: "", to: "" }, run = 0, from = "";
  for (const d of days) {
    if (d.count > 0) {
      if (!run) from = d.date;
      run++;
      if (run > longest.n) longest = { n: run, from, to: d.date };
    } else run = 0;
  }
  // The current streak runs up to today, or up to yesterday if today has nothing yet.
  let i = days.length - 1;
  if (days[i].count === 0) i--;
  let current = { n: 0, from: "", to: "" };
  for (; i >= 0 && days[i].count > 0; i--) current = { n: current.n + 1, from: days[i].date, to: current.to || days[i].date };
  const best = days.reduce((b, d) => (d.count > b.count ? d : b), days[0]);
  const perMonth = [];
  for (const d of days) {
    const key = d.date.slice(0, 7);
    const last = perMonth[perMonth.length - 1];
    if (last && last.key === key) last.count += d.count;
    else perMonth.push({ key, month: day(d.date).getUTCMonth(), count: d.count });
  }
  return { total, active: active.length, current, longest, best, avg: active.length ? total / active.length : 0, perMonth };
}

// Four shades by how busy the day was, like GitHub's own graph: quartiles of the days that have anything.
export function levels(days) {
  const sorted = days.map(d => d.count).filter(Boolean).sort((a, b) => a - b);
  const q = p => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] ?? 0;
  const cuts = [q(0.25), q(0.5), q(0.75)];
  return count => (count === 0 ? 0 : count <= cuts[0] ? 1 : count <= cuts[1] ? 2 : count <= cuts[2] ? 3 : 4);
}

/* ---------- drawing ---------- */
const C = { bg: "#0D1117", bar: "#161B22", line: "#30363D", text: "#C9D1D9", dim: "#8B949E", accent: "#00C2FF", ok: "#3FB950",
  cells: ["#161B22", "#1B3A66", "#2A5A9E", "#4A8BD8", "#6FC3FF"] };
const FONT = `ui-monospace, SFMono-Regular, Menlo, Consolas, 'DejaVu Sans Mono', monospace`;

// "ALI" as a bitmap, drawn with rectangles so it looks the same everywhere (no font needed)
// The dashboard builds itself when it loads: the prompts type, the heatmap fills in column by column, the
// lofi room fades in (rain falling, code scrolling, steam rising, the cat's tail swishing), then the tiles
// pop in and the bars grow. Times are in seconds. Without animation support (or with reduced motion) everything simply shows.
// animation support (or with reduced motion) everything simply shows.
const CSS = `
.fade{animation:fade .5s ease-out both}
.pop{animation:pop .45s cubic-bezier(.3,1.5,.5,1) both;transform-box:fill-box;transform-origin:center}
.type{animation:type var(--d) steps(var(--n)) both}
.grow{animation:grow .7s cubic-bezier(.2,.8,.2,1) both;transform-box:fill-box;transform-origin:50% 100%}
@keyframes fade{from{opacity:0}}
@keyframes pop{from{opacity:0;transform:scale(.4)}}
@keyframes type{from{clip-path:inset(-3px 100% -3px 0)}}
@keyframes grow{from{transform:scaleY(0)}}
${ROOM_CSS}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}`;
const at = (cls, delay, inner, extra = "") => `<g class="${cls}" style="animation-delay:${delay.toFixed(2)}s${extra}">${inner}</g>`;

export function render(days) {
  const s = stats(days), level = levels(days);
  const W = 880, PAD = 28, CELL = 11, GAP = 3, STEP = CELL + GAP;
  const text = (x, y, content, { fill = C.text, size = 13, weight = 400, anchor = "start" } = {}) =>
    `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${esc(content)}</text>`;
  const prompt = (y, cmd, delay) => at("type", delay,
    `${text(PAD, y, `${ME.user}@github`, { fill: C.ok, weight: 600 })}${text(PAD + 92, y, "~", { fill: C.accent })}` +
    `${text(PAD + 110, y, "$", { fill: C.dim })}${text(PAD + 128, y, cmd, { weight: 600 })}`, `;--d:${(0.5 + cmd.length * 0.05).toFixed(2)}s;--n:${cmd.length + 14}`);

  // heatmap: columns are weeks (Sunday first), rows are weekdays; each column fades in a moment after the last
  const cellSpots = [];   // the cells with something in them, for Spider-Man to tag
  const gx = PAD, gy = 112, first = day(days[0].date), columns = new Map(), labels = [];
  let lastMonth = -1;
  days.forEach(d => {
    const col = Math.floor((Math.round((day(d.date) - first) / 864e5) + days[0].weekday) / 7);
    const x = gx + col * STEP, y = gy + d.weekday * STEP;
    if (d.count > 0) cellSpots.push({ x, y });
    columns.set(col, (columns.get(col) || "") + `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2" fill="${C.cells[level(d.count)]}"/>`);
    const m = day(d.date).getUTCMonth();
    if (d.weekday === 0 && m !== lastMonth && col < 51) { labels.push(at("fade", 1.2 + col * 0.03, text(x, gy - 8, MONTHS[m], { fill: C.dim, size: 11 }))); lastMonth = m; }
  });
  const heat = [...columns].map(([col, rects]) => at("fade", 1.2 + col * 0.03, rects)).join("");
  const heatBottom = gy + 7 * STEP, heatEnd = 1.2 + columns.size * 0.03 + 0.5;
  const legendX = W - PAD - 5 * STEP - 80;
  const legend = at("fade", heatEnd, `${text(legendX, heatBottom + 22, "Less", { fill: C.dim, size: 11, anchor: "end" })}` +
    C.cells.map((c, i) => `<rect x="${legendX + 8 + i * STEP}" y="${heatBottom + 12}" width="${CELL}" height="${CELL}" rx="2" fill="${c}"/>`).join("") +
    text(legendX + 14 + 5 * STEP, heatBottom + 22, "More", { fill: C.dim, size: 11 }));
  const caption = at("fade", heatEnd, text(PAD, heatBottom + 22, `${s.total} contributions in the last year`, { fill: C.dim, size: 12 }));

  // whoami: the lofi room on the left, the intro, tiles and monthly bars on the right
  const py = heatBottom + 88, whoamiAt = heatEnd + 0.2, shown = whoamiAt + 0.5 + "whoami".length * 0.05 + 0.1;
  const room = at("fade", shown, `<g transform="translate(${PAD} ${py - 2})"><rect width="220" height="${ROOM_H}" rx="10" fill="#0F1A2E" stroke="${C.line}"/>${roomBody()}</g>`);
  const sx = 290, infoY = py + 14;
  const info = ME.lines.map(([k, v], i) => at("fade", shown + 0.4 + i * 0.12, text(sx, infoY + i * 18, k, { fill: C.dim }) + text(sx + 64, infoY + i * 18, v))).join("");
  const sw = Math.floor((W - PAD - sx - 20) / 3), sh = 62, tilesTop = infoY + ME.lines.length * 18 + 4;
  const tileSpots = Array.from({ length: 6 }, (_, i) => ({ x: sx + (i % 3) * (sw + 10), y: tilesTop + Math.floor(i / 3) * (sh + 10), w: sw, h: sh }));   // for Spider-Man to knock on
  const tiles = [
    [`${s.current.n} days`, "current streak", s.current.n ? `${shortDate(s.current.from)} – ${shortDate(s.current.to)}` : "no streak right now"],
    [`${s.longest.n} days`, "longest streak", s.longest.n ? `${shortDate(s.longest.from)} – ${shortDate(s.longest.to)}` : ""],
    [`${s.total}`, "contributions", "in the last year"],
    [`${s.active}`, "active days", `of ${days.length}`],
    [`${s.best.count}`, "best day", s.best.count ? shortDate(s.best.date) : ""],
    [s.avg.toFixed(1), "avg / active day", "contributions"]
  ].map(([big, label, sub], i) => {
    const x = sx + (i % 3) * (sw + 10), y = tilesTop + Math.floor(i / 3) * (sh + 10);
    return at("pop", shown + 0.3 + i * 0.12, `<g class="tile tile-${i}"><rect x="${x}" y="${y}" width="${sw}" height="${sh}" rx="6" fill="${C.bar}" stroke="${C.line}"/>` +
      text(x + 12, y + 24, big, { fill: C.accent, size: 18, weight: 700 }) + text(x + 12, y + 41, label, { size: 11 }) + text(x + 12, y + 54, sub, { fill: C.dim, size: 10 }) + `</g>`);
  }).join("");

  const cy = tilesTop + 2 * (sh + 10) + 18, chartH = 54, max = Math.max(1, ...s.perMonth.map(m => m.count));
  const bw = 20, bgap = (3 * sw + 20 - s.perMonth.length * bw) / Math.max(1, s.perMonth.length - 1), barsAt = shown + 1.2;
  const bars = at("fade", barsAt, text(sx, cy - 6, "contributions per month", { fill: C.dim, size: 11 })) + s.perMonth.map((m, i) => {
    const h = Math.max(2, Math.round((m.count / max) * chartH)), x = sx + i * (bw + bgap);
    return at("grow", barsAt + i * 0.06, `<rect x="${x.toFixed(1)}" y="${cy + chartH - h}" width="${bw}" height="${h}" rx="2" fill="${m.count === max ? C.accent : C.cells[3]}"/>`) +
      at("fade", barsAt + i * 0.06, text((x + bw / 2).toFixed(1), cy + chartH + 14, MONTHS[m.month], { fill: C.dim, size: 10, anchor: "middle" }));
  }).join("");
  // where each bar is, for the cat to hop onto
  const barSpots = s.perMonth.map((m, i) => ({ x: sx + i * (bw + bgap) + bw / 2, top: cy + chartH - Math.max(2, Math.round((m.count / max) * chartH)) }));
  const H = Math.max(cy + chartH + 44, py + ROOM_H + 22);
  const cursorX = PAD + 128 + "whoami".length * 7.8 + 4;
  const cursor = at("fade", shown, `<rect x="${cursorX}" y="${py - 22 - 12}" width="8" height="15" fill="${C.accent}"><animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.5;1" dur="1.1s" repeatCount="indefinite"/></rect>`);

  // Spider-Man and the cat share one timeline, so they can react to each other (see critters.mjs)
  const scene = critters({ ground: H - 12, bars: barSpots, tiles: tileSpots, cells: cellSpots, seed: Number(new Date().toISOString().slice(0, 10).replace(/-/g, "")), delay: Math.ceil(barsAt + 0.7 + s.perMonth.length * 0.06 + 0.3) });
  // a couch in the empty space beside the intro: Spider-Man drinks coffee, naps, and the cat sleeps on him
  const sky = couch({ x: sx + 246, y: py + 2, w: W - PAD - (sx + 246), h: 100, delay: 6 });
  const a11y = `Terminal-style summary of my GitHub activity: ${s.total} contributions in the last year on ${s.active} active days, a ${s.longest.n}-day longest streak and ${s.current.n} days current streak.`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" role="img" aria-label="${esc(a11y)}" font-family="${esc(FONT)}">
<title>${esc(a11y)}</title>
<desc>${esc(`The picture on the left: ${ROOM_LABEL}.`)}</desc>
<style>${CSS}${scene.css}${sky.css}</style>
<rect width="${W}" height="${H}" rx="10" fill="${C.bg}" stroke="${C.line}"/>
<path d="M0 10a10 10 0 0 1 10-10h${W - 20}a10 10 0 0 1 10 10v26H0z" fill="${C.bar}"/>
<circle cx="22" cy="18" r="5.5" fill="#FF5F56"/><circle cx="42" cy="18" r="5.5" fill="#FFBD2E"/><circle cx="62" cy="18" r="5.5" fill="#27C93F"/>
${text(W / 2, 22, `${ME.user}@github: ~`, { fill: C.dim, size: 12, anchor: "middle" })}
${prompt(66, "./contributions.sh", 0.2)}
${labels.join("")}${heat}${legend}${caption}
${prompt(py - 22, "whoami", whoamiAt)}${cursor}
${room}${info}${sky.svg}${tiles}${bars}${scene.svg}
</svg>
`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  writeFileSync(OUT, render(await loadDays()));
  console.log(`Wrote ${OUT}`);
}
