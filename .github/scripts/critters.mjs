/*
 * Spider-Man and the cat, on one shared timeline (so they can react to each other).
 *
 * One loop is a few "visits" in a row, in a random order, picked at random when the picture is drawn (the same
 * way all day, a new set on the next redraw). There are two kinds of visit.
 *
 * A cat visit, to a random bar of the monthly chart:
 *   1. Spider-Man hangs at home in the top right corner of the window, and the cat leaves the desk and trots
 *      in along the bottom edge.
 *   2. He swings to a spot above the cat, who hops onto the bar.
 *   3. He drops down on a long web next to the cat's head. The cat swats at the web.
 *   4. He flicks away and is pulled back up; the cat sits there for a moment with hearts, then hops down and
 *      trots off.
 *   5. He swings web to web to the far left and back home. The cat is back asleep on the desk.
 *
 * A break-in attempt, on a random stat box: he swings over, drops in front of it and pounds on it. The box
 * shakes, a padlock and a word ("nope.") pop up, and he gives up, is pulled back up and swings home.
 *
 * Everything is CSS animation with a duration of the whole loop (each keyframe is a time in seconds, turned
 * into a percentage), so the two never drift apart. The room's sleeping cat (room.mjs) is hidden while the
 * other one is out.
 */
const S_COLORS = { r: "#E23636", b: "#2B50AA", k: "#111111", w: "#FFFFFF" };
const SPIDEY = ["........rr.", "...rrrr..rr", "..rrrrrr.rr", "..rwrrwr.rr", "...rrrr..rr", "rrrrrrrrrrr", "rrrrkkrr...", "rrrrrrrr...", "rrbbbbbb...", "rrbbbbbb...", "rrbbbbbb...",
  "..bb..bb...", "..bb..bb...", "..bb..bb...", "..bb..bb...", "..rr..rr...", "..rr..rr...", "..rr..rr..."];

const C_COLORS = { g: "#8B949E", y: "#FFD58A", k: "#14090D", o: "#F0883E", d: "#C96A28", e: "#0D1117", p: "#FFB3B3", h: "#FF6B8B" };
const WALK = [
  [".o.......o..o...", ".o.......oooooo..", ".o.......oooeoo..", ".oo.oooooooooop.", "..ooooooooooooo.", "..oddooddooooo..", "..oooooooooooo..", "..oo.oo..oo.oo..", "..oo.oo..oo.oo.."],
  [".o.......o..o...", ".o.......oooooo..", ".o.......oooeoo..", ".oo.oooooooooop.", "..ooooooooooooo.", "..oddooddooooo..", "..oooooooooooo..", "...oo.oo.oo.oo..", "...oo.oo.oo.oo.."]
];
const SIT = ["....o...o..", "....ooooo..", "....oeoeo..", "....oopoo..", "...ooooooo.", "...ooooooo.", "..oodoodooo", "..ooooooooo", "..ooooooooo", "..oo.oo.oo."];
const PAW = ["...........", ".........oo", ".........oo", ".........o."];     // the raised paw, drawn over the sitting cat
const LOCK = [".ggggg.", ".g...g.", ".g...g.", "yyyyyyy", "yyykyyy", "yyykyyy", "yyyyyyy"];
const HEART = [".hh.hh.", "hhhhhhh", "hhhhhhh", ".hhhhh.", "..hhh..", "...h..."];

const px = (rows, colors, size) => rows.flatMap((row, r) => { const out = []; let c = 0;
  while (c < row.length) { if (row[c] === ".") { c++; continue; } let e = c; while (e < row.length && row[e] === row[c]) e++;
    out.push(`<rect x="${c * size}" y="${r * size}" width="${(e - c) * size}" height="${size}" fill="${colors[row[c]]}"/>`); c = e; }
  return out; }).join("");

const TOP = 36, LENGTH = 80, ANGLE = 35, SIN = Math.sin(ANGLE * Math.PI / 180);   // webs are fixed at the title bar (y = TOP)
const SWING = 0.85, IDLE = 2.8, HOME = 832, STEP = 2 * LENGTH * SIN;                // seconds per swing, seconds hanging at home, home's x, distance of one swing
const CP = 3, WALK_W = WALK[0][0].length * CP, SIT_W = SIT[0].length * CP, SIT_H = SIT.length * CP;
const WEB = "#C9D1D9", CAT_VISITS = 2, TILE_VISITS = 2, WORDS = ["thud!", "locked.", "denied.", "nope."], clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// a small seeded random generator, so a day's picture is always the same
function random(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

// One visit, as times in seconds from the start of the visit. `target` is a bar ({x, top}) or a stat box ({x, y, w, h}).
function plan(kind, target, rand) {
  const tile = kind === "tile";
  let side = rand() < 0.5 ? 1 : -1, wanted;                                      // which side of the cat he hangs on...
  if (tile) wanted = target.x + 24 + rand() * (target.w - 60);                  // ...or where along the box he drops
  else {
    wanted = target.x + (side === 1 ? 40 : -24);
    if (wanted > 780) wanted = target.x - 24;                                    // ...unless that runs out of room
    if (wanted < 130) wanted = target.x + 40;
  }
  const swings = []; let t = 0;
  const add = s => { s.start = t; s.end = t += s.sec; swings.push(s); return s; };
  add({ anchor: HOME, L: LENGTH, from: -6, to: 6, sec: IDLE, idle: true });
  let x = HOME;
  for (; x - wanted > 230; x -= STEP) add({ anchor: x - LENGTH * SIN, L: LENGTH, from: -ANGLE, to: ANGLE, sec: SWING });
  const L1 = clamp((x - wanted) / (2 * SIN), 40, 200), handX = x - 2 * L1 * SIN;
  add({ anchor: x - L1 * SIN, L: L1, from: -ANGLE, to: ANGLE, sec: SWING });
  const hoverFor = tile ? 2.6 : 2.2;
  const desc = [t, t + 0.7], hover = [t + 0.7, t + 0.7 + hoverFor], flick = [hover[1], hover[1] + 0.6], asc = [flick[1], flick[1] + 0.7], visit = [t, asc[1]];
  t = asc[1];
  x = handX;
  if (!tile) for (; x - STEP >= 100; x -= STEP) add({ anchor: x - LENGTH * SIN, L: LENGTH, from: -ANGLE, to: ANGLE, sec: SWING });   // a tour to the far left (cat visits only)
  for (; x + STEP < HOME - 30; x += STEP) add({ anchor: x + LENGTH * SIN, L: LENGTH, from: ANGLE, to: -ANGLE, sec: SWING });
  const Llast = clamp((HOME - x) / (2 * SIN), 30, 140);
  add({ anchor: x + Llast * SIN, L: Llast, from: ANGLE, to: -ANGLE, sec: SWING });
  const p = { kind, side, swings, handX, L1, desc, hover, flick, asc, visit, total: t };
  if (tile) {
    Object.assign(p, { tile: target, hangY: target.y + target.h / 2 - 18, away: rand() < 0.5 ? 12 : -12, word: WORDS[Math.floor(rand() * WORDS.length)] });
  } else {
    const sitTop = target.top - SIT_H;
    Object.assign(p, { hangY: sitTop - 4, away: -side * 12, sitTop, sitX: target.x - SIT_W / 2, barX: target.x, barTop: target.top,
      tSit: desc[0], tJump: desc[0] - 0.7, tIn: desc[0] - 3.1, tDown: flick[1] + 1.8, tOff: flick[1] + 2.5, tGone: flick[1] + 5.1 });
  }
  p.LV = p.hangY - TOP;
  return p;
}

// `ground` is the y of the cat's feet on the floor; `bars` are the middle and the top of each bar of the monthly chart;
// `tiles` are the stat boxes ({x, y, w, h});
// `delay` holds everything back (in its first, hidden state) until the dashboard has finished building itself
export function critters({ ground, bars, tiles, delay = 0, seed = 1 }) {
  const rand = random(seed);
  const shuffle = list => list.map(v => [rand(), v]).sort((p, q) => p[0] - q[0]).map(([, v]) => v);
  const kinds = shuffle([...Array(CAT_VISITS).fill("cat"), ...Array(TILE_VISITS).fill("tile")]);
  const barPicks = shuffle(bars), tilePicks = shuffle(tiles);
  const plans = kinds.map(kind => plan(kind, kind === "cat" ? barPicks.pop() : tilePicks.pop(), rand));
  let TOTAL = 0; plans.forEach(p => { p.offset = TOTAL; TOTAL += p.total; });

  /* ---- keyframes: times in seconds -> percentages of the whole loop ---- */
  const pct = sec => (sec * 100 / TOTAL).toFixed(3);
  const frames = (name, stops) => {
    const list = [...stops].sort((a, b) => a[0] - b[0]);
    if (list[0][0] > 0) list.unshift([0, list[0][1]]);
    if (list[list.length - 1][0] < TOTAL) list.push([TOTAL, list[list.length - 1][1]]);
    return `@keyframes ${name}{${list.map(([sec, decl]) => `${pct(sec)}%{${decl}}`).join("")}}`;
  };
  const gate = (name, on, off, windows) => frames(name, [[0, off], ...windows.flatMap(([a, b]) => [[a, on], [b, off]])]);
  const css = [], svg = [];
  css.push(`.sp{animation-duration:${TOTAL.toFixed(2)}s;animation-iteration-count:infinite;animation-timing-function:ease-in-out}`);

  const walkStops = [], walkWindows = [], deskWindows = [], shakes = {};
  plans.forEach((p, e) => {
    const o = p.offset, at0 = sec => o + sec;
    /* Spider-Man's swings: each is on screen only for its own slice of the loop */
    p.swings.forEach((s, i) => {
      const name = `sp${e}_${i}`, hide = a => `opacity:0;transform:rotate(${a}deg)`, show = a => `opacity:1;transform:rotate(${a}deg)`;
      const first = e === 0 && i === 0, last = e === plans.length - 1 && i === p.swings.length - 1;
      css.push(frames(name, [[0, first ? show(s.from) : hide(s.from)], [Math.max(0, at0(s.start) - 0.01), hide(s.from)], [at0(s.start), show(s.from)], [at0(s.end), show(s.to)],
        ...(last ? [] : [[at0(s.end) + 0.01, hide(s.to)]])]));
      if (!s.idle) css.push(frames(`th${e}_${i}`, [[0, "opacity:0"], [at0(s.start), "opacity:0;transform:scale(.5)"], [at0(s.start) + 0.2, "opacity:1;transform:scale(1)"], [at0(s.start) + 0.6, "opacity:1"], [at0(s.start) + 0.8, "opacity:0"]]));
      const y = TOP + s.L, ax = s.anchor.toFixed(1);
      svg.push(`<g class="sp${first ? "" : " sp-go"}" style="animation-name:${name};transform-origin:${ax}px ${TOP}px"><path d="M${ax} ${TOP}V${y.toFixed(1)}" stroke="${WEB}" stroke-opacity=".75" stroke-width="1"/><use href="#spidey" x="${ax}" y="${y.toFixed(1)}"/>` +
        (s.idle ? "" : `<text class="sp-t" style="animation-name:th${e}_${i}" x="${ax}" y="${TOP + 22}" font-size="10" font-weight="700" font-style="italic" text-anchor="middle" fill="#A991FF">thwip!</text>`) + `</g>`);
    });

    /* the visit: he drops on a long web (beside the cat, or in front of a stat box), sways, flicks away, and is pulled up */
    const away = p.away, sway = p.kind === "tile" ? 0.35 : 0.7, s0 = p.L1 / p.LV, dy = -(p.LV - p.L1), hx = p.handX.toFixed(1);
    const [d0, d1] = p.desc.map(at0), [h0] = p.hover.map(at0), [f0, f1] = p.flick.map(at0), [a0, a1] = p.asc.map(at0), v0 = at0(p.visit[0]);
    css.push(frames(`sv${e}`, [[0, "opacity:0;transform:rotate(0deg)"], [v0 - 0.01, "opacity:0;transform:rotate(0deg)"], [v0, "opacity:1;transform:rotate(0deg)"], [h0, "opacity:1;transform:rotate(0deg)"],
      [h0 + 0.55, `opacity:1;transform:rotate(${sway}deg)`], [h0 + 1.1, `opacity:1;transform:rotate(${-sway}deg)`], [h0 + 1.65, `opacity:1;transform:rotate(${sway}deg)`], [f0, "opacity:1;transform:rotate(0deg)"],
      [f1, `opacity:1;transform:rotate(${away}deg)`], [a1, "opacity:1;transform:rotate(0deg)"], [a1 + 0.01, "opacity:0;transform:rotate(0deg)"]]));
    css.push(frames(`svw${e}`, [[0, `transform:scaleY(${s0.toFixed(4)})`], [d0, `transform:scaleY(${s0.toFixed(4)})`], [d1, "transform:scaleY(1)"], [a0, "transform:scaleY(1)"], [a1, `transform:scaleY(${s0.toFixed(4)})`]]));
    const body = [[0, `transform:translateY(${dy.toFixed(1)}px)`], [d0, `transform:translateY(${dy.toFixed(1)}px)`], [d1, "transform:translateY(0)"]];
    if (p.kind === "tile") for (let k = 0, at_ = h0 + 0.2; at_ < f0 - 0.2; k++, at_ += 0.3) body.push([at_, `transform:translateY(${k % 2 ? 0 : -6}px)`]);   // pounding on the box
    body.push([a0, "transform:translateY(0)"], [a1, `transform:translateY(${dy.toFixed(1)}px)`]);
    css.push(frames(`svb${e}`, body));
    svg.push(`<g class="sp sp-go" style="animation-name:sv${e};transform-origin:${hx}px ${TOP}px"><path class="sp" style="animation-name:svw${e};transform-origin:${hx}px ${TOP}px" d="M${hx} ${TOP}V${p.hangY}" stroke="${WEB}" stroke-opacity=".75" stroke-width="1"/>` +
      `<g class="sp" style="animation-name:svb${e}"><use href="#spidey" x="${hx}" y="${p.hangY}"/></g></g>`);

    if (p.kind === "tile") {
      /* the stat box: it shakes while he pounds on it, and a padlock and a word pop up */
      const t = p.tile, i = tiles.indexOf(t);
      (shakes[i] ||= []).push([h0 + 0.2, f0 - 0.1]);
      css.push(gate(`wc-lock${e}`, "opacity:1", "opacity:0", [[h0 + 1.0, f1 + 0.5]]));
      svg.push(`<g class="wc"><g class="wc-gate" style="animation-name:wc-lock${e}"><g transform="translate(${(t.x + t.w - 22).toFixed(1)} ${t.y + 6})">${px(LOCK, C_COLORS, 2)}</g>` +
        `<text x="${(t.x + t.w - 8).toFixed(1)}" y="${t.y + t.h - 8}" text-anchor="end" font-size="10" font-weight="700" font-style="italic" fill="#F85149">${p.word}</text></g></g>`);
    } else {
      /* the cat: trots in, hops onto the bar, swats, sits with hearts, hops down, trots off */
      const lift = p.barTop - ground, x1 = Math.max(24, p.barX - 90), onBar = p.barX - WALK_W / 2, offBar = p.barX + 50;
      const at = (sec, xx, yy, timing) => [at0(sec), `transform:translate(${xx.toFixed(1)}px,${yy.toFixed(1)}px)${timing ? `;animation-timing-function:${timing}` : ""}`];
      walkStops.push(at(p.tIn - 0.5, -60, 0, "linear"), at(p.tIn, -60, 0, "linear"), at(p.tJump, x1, 0, "ease-out"), at((p.tJump + p.tSit) / 2, (x1 + onBar) / 2, lift - 36, "ease-in"), at(p.tSit, onBar, lift),
        at(p.tDown, onBar, lift, "ease-out"), at((p.tDown + p.tOff) / 2, (onBar + offBar) / 2, lift - 30, "ease-in"), at(p.tOff, offBar, 0, "linear"), at(p.tGone, 960, 0));
      walkWindows.push([at0(p.tIn), at0(p.tSit)], [at0(p.tDown), at0(p.tGone)]);
      deskWindows.push([at0(p.tIn) - 0.1, at0(p.tGone) + 0.2]);
      css.push(gate(`wc-showsit${e}`, "opacity:1", "opacity:0", [[at0(p.tSit), at0(p.tDown)]]));
      css.push(gate(`wc-paw${e}`, "opacity:1", "opacity:0", [[d1, f1]]));
      css.push(gate(`wc-hearts${e}`, "opacity:1", "opacity:0", [[f0, at0(p.tDown)]]));
      const mirror = p.side === -1 ? `translate(${p.sitX + SIT_W} ${p.sitTop}) scale(-1 1)` : `translate(${p.sitX} ${p.sitTop})`;
      svg.push(`<g class="wc"><g transform="${mirror}"><g class="wc-gate" style="animation-name:wc-showsit${e}">${px(SIT, C_COLORS, CP)}<g class="wc-gate" style="animation-name:wc-paw${e}"><g class="wc-swat">${px(PAW, C_COLORS, CP)}</g></g></g></g>` +
        `<g class="wc-gate" style="animation-name:wc-hearts${e}"><g transform="translate(${p.sitX + SIT_W - 4} ${p.sitTop - 18})"><g class="wc-heart">${px(HEART, C_COLORS, 2)}</g></g>` +
        `<g transform="translate(${p.sitX - 8} ${p.sitTop - 8})"><g class="wc-heart" style="animation-delay:-2s">${px(HEART, C_COLORS, 2)}</g></g></g></g>`);
    }
  });

  // a stat box shakes (side to side, quickly) while he pounds on it
  css.push(`.tile{animation-duration:${TOTAL.toFixed(2)}s;animation-iteration-count:infinite;animation-timing-function:linear}`);
  Object.entries(shakes).forEach(([i, windows]) => {
    const stops = windows.flatMap(([a, b]) => { const list = [[a - 0.01, "transform:translateX(0)"]]; for (let k = 0, tt = a; tt < b; k++, tt += 0.07) list.push([tt, `transform:translateX(${k % 2 ? -3 : 3}px)`]); list.push([b, "transform:translateX(0)"]); return list; });
    css.push(frames(`ts${i}`, [[0, "transform:translateX(0)"], ...stops]), `.tile-${i}{animation-name:ts${i}}`);
  });

  // one walking cat for all the visits
  css.push(`.wc-walk,.wc-gate{animation-duration:${TOTAL.toFixed(2)}s;animation-iteration-count:infinite}.wc-walk{animation-name:wc-walk;animation-timing-function:linear}.wc-gate{animation-timing-function:steps(1)}`);
  css.push(frames("wc-walk", walkStops));
  css.push(gate("wc-showwalk", "opacity:1", "opacity:0", walkWindows));
  css.push(gate("room-cat", "opacity:0", "opacity:1", deskWindows));
  css.push(`.room-cat{animation:room-cat ${TOTAL.toFixed(2)}s steps(1) infinite}`);
  css.push(`.wc-f1{animation:wc-f1 .4s steps(1) infinite}@keyframes wc-f1{50%{opacity:0}}.wc-f2{animation:wc-f2 .4s steps(1) infinite}@keyframes wc-f2{0%{opacity:0}50%{opacity:1}}`);
  css.push(`.wc-swat{animation:wc-swat .35s steps(1) infinite}@keyframes wc-swat{50%{opacity:0}}`);
  css.push(`.wc-heart{opacity:0;animation:wc-heart 4s ease-out infinite}@keyframes wc-heart{0%{opacity:0;transform:translateY(0)}20%{opacity:1}100%{opacity:0;transform:translateY(-22px)}}`);
  css.push(`.sp-t{opacity:0;transform-box:fill-box;transform-origin:center;animation-duration:${TOTAL.toFixed(2)}s;animation-iteration-count:infinite;animation-timing-function:ease-out}`);
  css.push(`@media (prefers-reduced-motion:reduce){.sp-go,.wc{display:none}}`);
  // last, so that no shorthand above can reset it
  css.push(`.sp,.wc-walk,.wc-gate,.sp-t,.tile,.room-cat{animation-delay:${delay}s;animation-fill-mode:backwards}`);

  const sprite = px(SPIDEY, S_COLORS, 2).replace(/x="(\d+)"/g, (_, v) => `x="${+v - 20}"`);
  const walker = `<g class="wc"><g class="wc-walk"><g transform="translate(0 ${ground - WALK[0].length * CP})"><g class="wc-gate" style="animation-name:wc-showwalk"><g class="wc-f1">${px(WALK[0], C_COLORS, CP)}</g><g class="wc-f2">${px(WALK[1], C_COLORS, CP)}</g></g></g></g></g>`;
  return { css: css.join("\n"), svg: `<defs><g id="spidey">${sprite}</g></defs>${svg.join("")}${walker}`, total: TOTAL, hovers: plans.map(p => p.offset + p.hover[0] + 1), kinds: plans.map(p => p.kind) };
}
