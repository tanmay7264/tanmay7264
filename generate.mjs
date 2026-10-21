// Renders every profile SVG in assets/ from the data below. Run: node generate.mjs
import { mkdirSync, writeFileSync } from "node:fs";

const C = { bg: "#0B1120", bg2: "#070B16", ink: "#F5F1E8", soft: "#FFD9A8", accent: "#F2A541", deep: "#B8661F", muted: "#9AA6B8", line: "#1E2A44" };
const SERIF = `Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif`;
const MONO = `ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace`;
const SANS = `-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const STYLE = `<style>
  .serif{font-family:${SERIF}} .mono{font-family:${MONO}} .sans{font-family:${SANS}}
  .in{animation:in 1.1s cubic-bezier(.16,1,.3,1) both} .d1{animation-delay:.15s} .d2{animation-delay:.35s} .d3{animation-delay:.55s} .d4{animation-delay:.75s} .d5{animation-delay:.95s} .d6{animation-delay:1.15s}
  .draw{stroke-dasharray:1400;stroke-dashoffset:1400;animation:draw 1.8s cubic-bezier(.65,0,.35,1) .4s forwards}
  .spin{transform-origin:center;transform-box:fill-box;animation:spin 40s linear infinite} .spin-r{animation-direction:reverse;animation-duration:60s}
  @keyframes in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
  @keyframes draw{to{stroke-dashoffset:0}}
  .bob{animation:bob 5s ease-in-out infinite alternate} .bob2{animation-duration:3.6s;animation-delay:-1.2s} .bob3{animation-duration:4.4s;animation-delay:-2.5s}
  .win{animation:win 4s ease-in-out infinite alternate} .wave{animation:wave 3s ease-in-out infinite alternate}
  .flag{transform-box:fill-box;transform-origin:left center;animation:flag 1.6s ease-in-out infinite alternate}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes bob{to{transform:translateY(-10px)}}
  @keyframes win{0%,40%{opacity:.25}100%{opacity:1}}
  @keyframes wave{from{opacity:.15}to{opacity:.6}}
  @keyframes flag{to{transform:skewY(6deg) scaleX(.92)}}
  @media (prefers-reduced-motion:reduce){.in,.spin,.bob,.win,.wave,.flag{animation:none}.draw{animation:none;stroke-dashoffset:0}}
</style>`;

const defs = (w, h) => `<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.bg}"/><stop offset="1" stop-color="${C.bg2}"/></linearGradient>
  <radialGradient id="glow" cx="85%" cy="25%" r="60%"><stop offset="0" stop-color="${C.deep}" stop-opacity=".45"/><stop offset="1" stop-color="${C.deep}" stop-opacity="0"/></radialGradient>
  <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="${C.accent}" stroke-opacity=".06"/></pattern>
  <linearGradient id="rule" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.accent}"/><stop offset=".6" stop-color="${C.deep}"/><stop offset="1" stop-color="${C.deep}" stop-opacity="0"/></linearGradient>
  <linearGradient id="sheen" gradientUnits="userSpaceOnUse" x1="-300" y1="0" x2="0" y2="0">
    <stop offset="0" stop-color="${C.accent}"/><stop offset=".5" stop-color="${C.ink}"/><stop offset="1" stop-color="${C.accent}"/>
    <animateTransform attributeName="gradientTransform" type="translate" values="0 0;1500 0;1500 0" keyTimes="0;.4;1" dur="7s" begin="1.5s" repeatCount="indefinite"/>
  </linearGradient>
  <clipPath id="clip"><rect width="${w}" height="${h}" rx="18"/></clipPath>
</defs>`;

const svg = (w, h, label, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(label)}">
${defs(w, h)}${STYLE}
<g clip-path="url(#clip)"><rect width="${w}" height="${h}" fill="url(#bg)"/><rect x="${w * 0.6}" width="${w * 0.4}" height="${h}" fill="url(#grid)"/><rect width="${w}" height="${h}" fill="url(#glow)"/>
<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="18" fill="none" stroke="${C.line}"/>
${body}
</g></svg>\n`;

const text = (x, y, s, { cls = "sans", size = 16, fill = C.muted, anchor, ls, weight, italic } = {}) =>
  `<text class="${cls}" x="${x}" y="${y}" font-size="${size}" fill="${fill}"${anchor ? ` text-anchor="${anchor}"` : ""}${ls ? ` letter-spacing="${ls}"` : ""}${weight ? ` font-weight="${weight}"` : ""}${italic ? ` font-style="italic"` : ""}>${s}</text>`;
const lines = (x, y, arr, step, opts) => arr.map((l, i) => text(x, y + i * step, esc(l), opts)).join("\n");
// Keycap chips: a darker base 4px below the cap gives them depth.
const chips = (x, y, arr) => {
  let cx = x;
  return arr.map((c) => { const w = c.length * 7.4 + 26; const s = `<rect x="${cx}" y="${y + 4}" width="${w}" height="28" rx="14" fill="${C.deep}" fill-opacity=".45"/><rect x="${cx}" y="${y}" width="${w}" height="28" rx="14" fill="${C.bg}"/><rect x="${cx}" y="${y}" width="${w}" height="28" rx="14" fill="${C.accent}" fill-opacity=".08" stroke="${C.accent}" stroke-opacity=".35"/>${text(cx + w / 2, y + 18.5, esc(c), { cls: "mono", size: 12, fill: C.soft, anchor: "middle" })}`; cx += w + 10; return s; }).join("\n");
};

const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16); return "#" + [n >> 16, (n >> 8) & 255, n & 255].map((c) => Math.round(f > 0 ? c + (255 - c) * f : c * (1 + f)).toString(16).padStart(2, "0")).join(""); };
const pts = (a) => a.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
const poly = (a, fill, extra = "") => `<polygon points="${pts(a)}" fill="${fill}"${extra}/>`;
// Extruded card: front rect plus a lit top and a shaded right side, d px deep.
const slab3d = (x, y, w, h, d = 12) => poly([[x, y], [x + d, y - d], [x + w + d, y - d], [x + w, y]], C.accent, ` fill-opacity=".22"`) +
  poly([[x + w, y], [x + w + d, y - d], [x + w + d, y + h - d], [x + w, y + h]], C.deep, ` fill-opacity=".4"`) +
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${C.bg2}" fill-opacity=".92" stroke="${C.line}"/>`;

// ---------- data ----------
const D = {
  name: "Tanmay Narnaware",
  title: "Product & Growth Builder",
  tagline: "I connect engineering, customer insight and growth to build products people return to.",
  sub: "PGDM E-Business '27 · WeSchool Mumbai · Ex-Apexon · Founder, BatchMates",
  stats: [["30", "months at Apexon"], ["99.37", "CMAT I&E percentile"], ["1,400+", "student community"], ["45→80%", "villa occupancy"]],
  about: [
    "Product & growth builder who started in engineering. Thirty months at Apexon",
    "taught me how technical decisions move engagement; running a hospitality",
    "business and a digital studio taught me to measure bookings, leads and trust.",
    "",
    "Today I study PGDM E-Business at WeSchool Mumbai, build BatchMates, and",
    "keep asking one question: what makes people choose a product and come back?",
  ],
  facts: [["NOW", "PGDM E-Business '27, WeSchool Mumbai"], ["RECENTLY", "PM & Strategy Intern, Uni Bamberg"], ["BEFORE", "Senior Front End Dev, Apexon"], ["BUILDING", "BatchMates, verified campus network"], ["BASED IN", "Mumbai, India"]],
  wins: [
    ["99.37", "CMAT percentile", "Innovation & Entrepreneurship, top 1%"],
    ["Award", "Outstanding Internship", "University of Bamberg, Germany"],
    ["1,400+", "Learning community", "WeSchool students across AI & tech"],
    ["Winner", "InnoMUN 2025", "BITS Pilani Marketing Parliament"],
    ["2nd RU", "We4Tech hackathon", "Among 90 teams, rail-pass prototype"],
    ["Lead", "Google Student Developer", "Junior Community Lead, West Zone"],
  ],
  projects: [
    { id: "batchmates", kicker: "01 · PRODUCT · FOUNDER · PILOT", name: "BatchMates", line: "A verified student network for finding the right peer, mentor or opportunity.",
      built: "verified profiles, skill-based discovery and onboarding shaped by 20 studies",
      metrics: [["Pilot", "working product"], ["3", "user groups"], ["20", "studies reviewed"]], stack: ["Next.js", "TypeScript", "Product strategy", "Verified identity"] },
    { id: "glucose-twin", kicker: "02 · HEALTH AI · RESEARCH · 2026", name: "Glucose Digital Twin", line: "Post-meal glucose twin for T2D and prediabetes.",
      built: "ODE physiology + Unscented Kalman Filter + boosted residual model",
      metrics: [["ODE", "physiology core"], ["UKF", "state estimation"], ["2", "public datasets"]], stack: ["Python", "SciPy", "Gradient boosting", "CGMacros", "ShanghaiT2DM"] },
    { id: "industrial-ki", kicker: "03 · GENAI · B2B · 2026", name: "Industrial Knowledge AI", line: "Knowledge intelligence for industrial domains.",
      built: "GraphRAG copilot, entity extraction and compliance-gap detection",
      metrics: [["GraphRAG", "copilot"], ["Live", "on Vercel"], ["3", "AI workflows"]], stack: ["TypeScript", "Next.js", "LLMs", "Knowledge graphs"] },
    { id: "career-ops", kicker: "04 · AI · CAREER TECH · 2026", name: "Career-Ops Web", line: "An AI-powered job-search pipeline, in the browser.",
      built: "a SaaS front end for the Claude Code career-ops system: match, tailor, track",
      metrics: [["SaaS", "web app"], ["AI", "JD matching"], ["Live", "on Vercel"]], stack: ["TypeScript", "Next.js", "Claude", "Vercel"] },
  ],
  toolkit: [
    ["PRODUCT & GROWTH", ["Product strategy", "User research", "GTM", "SEO", "Funnels & KPIs", "Pricing"]],
    ["FRONTEND", ["React", "Next.js", "TypeScript", "JavaScript", "Tailwind", "HTML/CSS"]],
    ["AI & DATA", ["LLMs", "RAG / GraphRAG", "AI agents", "Python", "Claude Code", "Analytics"]],
    ["TOOLS", ["Git", "GitHub", "Figma", "Canva", "Vercel", "Supabase"]],
  ],
  experience: [
    ["2026", "University of Bamberg", "Product Management & Strategy Intern", "Alumni portal MVP, mentor matching, 4-phase launch plan"],
    ["2021–24", "Apexon", "Associate SE → Senior Front End Developer", "30% faster load speed, 20% higher engagement"],
    ["Venture", "Lonavala Villas", "Founder, Hospitality Growth", "Occupancy 45% → 80% via seasonal pricing"],
    ["Venture", "The Socials Web", "Co-Founder, Digital Growth", "+40% organic traffic, 3× leads, +20% conversion"],
  ],
};

// ---------- renderers ----------
const out = {};

out["hero"] = svg(1200, 440, `${D.name}: ${D.title}. ${D.tagline}`, `
${heroCube()}
<g class="in d1">${text(64, 78, "HELLO, WORLD · MUMBAI, IN", { cls: "mono", size: 12, fill: C.accent, ls: 3 })}</g>
<g class="in d2">${text(60, 150, "Tanmay", { cls: "serif", size: 76, fill: C.ink, weight: 300, ls: -2 })}${text(60, 222, "Narnaware.", { cls: "serif", size: 76, fill: "url(#sheen)", weight: 300, ls: -2, italic: true })}</g>
<g class="in d3">${text(64, 266, esc(D.title), { cls: "sans", size: 22, fill: C.soft })}${text(64, 296, esc(D.tagline), { cls: "sans", size: 16, fill: C.muted })}</g>
<g class="in d4">${text(64, 324, esc(D.sub), { cls: "mono", size: 12, fill: C.muted, ls: 1 })}</g>
<path class="draw" d="M64 356 H1136" stroke="url(#rule)"/>
<g class="in d5">${D.stats.map(([v, l], i) => text(64 + i * 270, 400, `<tspan class="serif" font-size="30" fill="${C.ink}">${esc(v)}</tspan><tspan dx="10" fill="${C.muted}">${esc(l)}</tspan>`, { size: 13 })).join("\n")}</g>`);

const titles = [
  ["about", "02", "ABOUT", "Hello, I'm", "Tanmay.", "WHO I AM"],
  ["recognition", "03", "RECOGNITION", "Proof,", "on the record.", "WINS & AWARDS"],
  ["work", "04", "SELECTED WORK", "Products,", "not just projects.", "WHAT I BUILT"],
  ["toolkit", "05", "TOOLKIT", "The tools", "I reach for.", "HOW I BUILD"],
  ["commits", "06", "COMMIT LOG", "A year of", "building.", "ON GITHUB"],
  ["experience", "07", "EXPERIENCE", "Where I've", "shipped.", "THE PATH"],
  ["connect", "08", "CONNECT", "Let's build something", "people return to.", "SAY HELLO"],
];
for (const [id, n, label, a, b, right] of titles)
  out[`title-${id}`] = svg(1200, 120, `${n} ${label}: ${a} ${b}`, `
<g class="in">${text(40, 34, `<tspan fill="${C.soft}">${n}</tspan>   ${label}`, { cls: "mono", size: 12, fill: C.accent, ls: 3 })}</g>
<g class="in d1">${text(38, 84, `${esc(a)} <tspan font-style="italic" fill="url(#sheen)">${esc(b)}</tspan>`, { cls: "serif", size: 44, fill: C.ink, weight: 300, ls: -1 })}</g>
<g class="in d2">${text(1160, 34, esc(right), { cls: "mono", size: 10.5, fill: C.muted, anchor: "end", ls: 2.4 })}</g>
<path class="draw" d="M40 106 H1160" stroke="url(#rule)"/>`);

out["about"] = svg(1200, 300, `About: ${D.about.join(" ")}`, `
<g class="in d1">${lines(56, 72, D.about, 28, { size: 17, fill: C.muted })}</g>
<path d="M760 48 V252" stroke="${C.line}"/>
${D.facts.map(([k, v], i) => `<g class="in d${i + 2}">${text(796, 74 + i * 40, k, { cls: "mono", size: 11, fill: C.accent, ls: 2 })}${text(900, 74 + i * 40, esc(v), { size: 14.5, fill: C.ink })}</g>`).join("\n")}`);

out["recognition"] = svg(1200, 340, `Recognition: ${D.wins.map((w) => w.join(" ")).join("; ")}`, D.wins.map(([v, t, d], i) => {
  const x = 40 + (i % 3) * 376, y = 44 + Math.floor(i / 3) * 142;
  return `<g class="in d${i + 1}">${slab3d(x, y, 348, 122, 12)}
${text(x + 24, y + 52, esc(v), { cls: "serif", size: 34, fill: "url(#sheen)", weight: 300 })}
${text(x + 24, y + 80, esc(t), { size: 15.5, fill: C.ink, weight: 600 })}${text(x + 24, y + 102, esc(d), { size: 13, fill: C.muted })}</g>`;
}).join("\n"));

for (const p of D.projects)
  out[`project-${p.id}`] = svg(1200, 340, `${p.name}: ${p.line} Built ${p.built}. Stack: ${p.stack.join(", ")}.`, `
<g class="in d1">${text(56, 62, esc(p.kicker), { cls: "mono", size: 12, fill: C.accent, ls: 2.6 })}
${text(54, 124, esc(p.name), { cls: "serif", size: 52, fill: C.ink, weight: 300, ls: -1.5 })}
${text(56, 162, esc(p.line), { size: 17, fill: C.muted })}
${text(56, 196, `<tspan fill="${C.accent}">BUILT ›</tspan> ${esc(p.built)}`, { cls: "mono", size: 12.5, fill: C.soft })}</g>
<path class="draw" d="M56 228 H700" stroke="url(#rule)"/>
<g class="in d3">${chips(56, 256, p.stack)}</g>
${p.metrics.map(([v, l], i) => `<g class="in d${i + 2}">${slab3d(770, 50 + i * 86, 364, 70, 10)}
${text(794, 96 + i * 86, esc(v), { cls: "serif", size: 30, fill: C.ink, weight: 300 })}${text(1112, 92 + i * 86, esc(l), { cls: "mono", size: 12, fill: C.muted, anchor: "end", ls: 1 })}</g>`).join("\n")}`);

out["toolkit"] = svg(1200, 300, `Toolkit. ${D.toolkit.map(([g, t]) => `${g}: ${t.join(", ")}`).join(". ")}`, D.toolkit.map(([g, tools], i) => `<g class="in d${i + 1}">
${text(56, 66 + i * 62, esc(g), { cls: "mono", size: 11.5, fill: C.accent, ls: 2.2 })}${chips(260, 47 + i * 62, tools)}</g>`).join("\n"));

out["experience"] = svg(1200, 380, `Experience: ${D.experience.map((e) => e.join(", ")).join("; ")}`, `
<path class="draw" d="M180 52 V330" stroke="${C.accent}" stroke-opacity=".4"/>
${D.experience.map(([when, org, role, impact], i) => { const y = 64 + i * 78; return `<g class="in d${i + 1}">
${text(150, y + 6, esc(when), { cls: "mono", size: 12, fill: C.muted, anchor: "end", ls: 1 })}<circle cx="180" cy="${y + 2}" r="6" fill="${C.bg}" stroke="${C.accent}" stroke-width="2"/>
${text(212, y + 8, esc(org), { cls: "serif", size: 26, fill: C.ink, weight: 300 })}${text(212, y + 34, esc(role), { size: 14.5, fill: C.soft })}
${text(1144, y + 8, esc(impact), { cls: "mono", size: 12, fill: C.muted, anchor: "end" })}</g>`; }).join("\n")}`);

out["footer"] = svg(1200, 160, "Tanmay: building products people return to.", `
<g class="in d1">${text(600, 78, "Tanmay", { cls: "serif", size: 48, fill: "url(#sheen)", anchor: "middle", italic: true, weight: 300 })}</g>
<g class="in d2">${text(600, 116, "BUILDING PRODUCTS PEOPLE RETURN TO", { cls: "mono", size: 12, fill: C.muted, anchor: "middle", ls: 3 })}</g>`);

// ---------- 3D: hero cube ----------
function heroCube() {
  const cx = 975, cy = 196, h = 62;
  const Q = (x, y, z) => [cx + (x - z) * 0.866, cy + (x + z) * 0.5 - y];
  const m = (a, b, c, d, [x, y]) => `matrix(${a} ${b} ${c} ${d} ${x.toFixed(1)} ${y.toFixed(1)})`;
  const edge = ` stroke="${C.soft}" stroke-opacity=".55" stroke-linejoin="round"`;
  const mini = (x, y, s, col, cls) => { const q = (a, b, c) => [x + (a - c) * 0.866, y + (a + c) * 0.5 - b];
    return `<g class="bob ${cls}">${poly([q(-s, s, -s), q(s, s, -s), q(s, s, s), q(-s, s, s)], shade(col, 0.25))}${poly([q(-s, -s, s), q(s, -s, s), q(s, s, s), q(-s, s, s)], col)}${poly([q(s, -s, -s), q(s, -s, s), q(s, s, s), q(s, s, -s)], shade(col, -0.4))}</g>`; };
  return `<ellipse cx="${cx}" cy="${cy + 146}" rx="100" ry="11" fill="#000" fill-opacity=".4"/>
<ellipse id="orbit" cx="${cx}" cy="${cy}" rx="200" ry="64" fill="none" stroke="${C.accent}" stroke-opacity=".35" stroke-dasharray="2 9"/>
${mini(812, 104, 13, "#06B6D4", "bob2")}${mini(1135, 118, 10, "#7C3AED", "bob3")}${mini(1120, 318, 15, "#22C55E", "bob2")}
<g class="bob">
${poly([Q(-h, h, -h), Q(h, h, -h), Q(h, h, h), Q(-h, h, h)], C.accent, edge)}
${poly([Q(-h, -h, h), Q(h, -h, h), Q(h, h, h), Q(-h, h, h)], C.deep, edge)}
${poly([Q(h, -h, -h), Q(h, -h, h), Q(h, h, h), Q(h, h, -h)], shade(C.deep, -0.45), edge)}
<text class="serif" transform="${m(0.866, 0.5, -0.866, 0.5, Q(0, h, 0))}" y="20" font-size="60" font-style="italic" text-anchor="middle" fill="${C.bg2}">TN</text>
<text class="mono" transform="${m(0.866, 0.5, 0, 1, Q(0, 0, h))}" y="5" font-size="13" letter-spacing="3" text-anchor="middle" fill="${C.ink}">PRODUCT</text>
<text class="mono" transform="${m(0.866, -0.5, 0, 1, Q(h, 0, 0))}" y="5" font-size="13" letter-spacing="3" text-anchor="middle" fill="${C.soft}">GROWTH</text>
</g>
<circle r="5" fill="${C.accent}"><animateMotion dur="9s" repeatCount="indefinite" path="M${cx - 200} ${cy} a200 64 0 1 0 400 0 a200 64 0 1 0 -400 0"/></circle>`;
}

// ---------- 3D: Tanmay's World (isometric, mirrors tanmayportfolio.me/world) ----------
// Grid coords follow the portfolio's world.config.js; Germany is shifted (x-34, z+22) to fit one frame.
function isoWorld() {
  const W = 1200, H = 600, s = 9.4, ox = 430, oy = 156, HS = 1.7; // HS: height exaggeration
  const P = (x, y, z) => [ox + (x - z) * s * 0.866, oy + (x + z) * s * 0.5 - y * s];
  const quad = (x0, z0, x1, z1, y = 0) => [P(x0, y, z0), P(x1, y, z0), P(x1, y, z1), P(x0, y, z1)];
  let seed = 19; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const islands = [
    { x0: -5, z0: -5, x1: 37, z1: 37, trees: 46, name: "INDIA · PUNE & MUMBAI", label: [-5, 3.2, -5], anchor: "middle" },
    { x0: 43, z0: -12, x1: 69, z1: 10, trees: 22, name: "GERMANY · BAMBERG", label: [69, -4.2, 10], anchor: "middle" },
  ];
  const areas = [[2, 2, 28, 6.6], [2, 12, 28, 6.6], [2, 21.4, 28, 6.4], [44, -11, 24, 8.6], [46.5, -0.2, 19, 4.9]];
  const paths = [[3, 9.3, 26, 1.4], [27.6, 9.3, 1.4, 11.4], [3, 19.3, 26, 1.4], [3, 19.3, 1.4, 10.4], [3, 28.3, 26, 1.4], [-0.6, 25.6, 3.7, 1.2],
    [44.9, 4.8, 22.1, 1.4], [65.6, -1.7, 1.4, 7.9], [44.9, -1.7, 22.1, 1.4], [44.9, -1.7, 1.4, 7.9]];
  const runways = [[-4.6, 2, 2.2, 31], [44.5, 6.9, 23, 2.2]];
  // [name, x, z, w, d, h, colour, roof]  (hip = pyramid roof, spire = landmark)
  const Z = [
    ["SKN Sinhgad", 7, 6, 4.4, 3.4, 2.0, "#64748B", "hip", [-34, 0]], ["Apexon", 13.5, 6, 4.2, 3.4, 4.6, "#3B82F6"], ["The Socials Web", 20, 6, 3.8, 3.2, 1.8, "#EC4899"],
    ["Lonavala Villas", 25.5, 6, 3.8, 3.2, 1.6, "#EA580C", "hip"], ["Vatsalya · GCL", 7, 16, 4.2, 3.2, 1.8, "#22C55E", "hip"], ["Nurture+", 13.5, 16, 3.6, 3.0, 1.6, "#EAB308", "hip"],
    ["BatchMates HQ", 20, 16, 4.2, 3.4, 2.6, "#06B6D4", "", [-30, 0]], ["WeSchool", 25.5, 16, 4.6, 3.4, 2.8, "#7C3AED", "hip", [26, 0.6]], ["Airport", 0.3, 24.5, 3.2, 2.4, 1.4, "#94A3B8"],
    ["SIRP Library", 7, 25, 4.0, 3.2, 1.8, "#0D9488"], ["AI Lab", 13.5, 25, 3.8, 3.2, 2.2, "#6366F1"], ["Trophy Hall", 21, 25, 5.4, 3.4, 2.2, "#D4A017", "hip"],
    ["Airport", 48.2, 2.2, 2.8, 2.4, 1.4, "#94A3B8", "", [-26, 0]], ["Uni Bamberg", 53.3, 2.2, 4.4, 2.8, 2.4, "#B91C1C", "hip", [22, 0.4]], ["IS Management", 59, 2.2, 4.0, 2.8, 2.2, "#0284C7"],
    ["Autohaus Sperber", 63.4, 2.2, 3.2, 2.8, 1.6, "#E11D48"], ["Berlin & Paris", 53, -5.5, 6, 3.4, 2.6, "#FBBF24", "spire"], ["Munich Job Fair", 62, -5.5, 4.4, 3.4, 2.6, "#84CC16"],
  ];
  const onPath = (x, z) => [...paths, ...runways].some(([px, pz, pw, pd]) => x > px - 0.5 && x < px + pw + 0.5 && z > pz - 0.5 && z < pz + pd + 0.5);
  const onZone = (x, z) => Z.some(([, cx, cz, w, d]) => Math.abs(x - cx) < w / 2 + 0.9 && Math.abs(z - cz) < d / 2 + 0.9);
  const items = []; // [depth, svg]

  const building = ([name, cx, cz, w, d, h0, col, roof, [ldx, ldy] = [0, 0]]) => {
    const h = h0 * HS, x0 = cx - w / 2, x1 = cx + w / 2, z0 = cz - d / 2, z1 = cz + d / 2;
    let g = poly(quad(x0 - 0.3, z0 - 0.3, x1 + 0.3, z1 + 0.3, 0.02), "#000", ` fill-opacity=".25"`);
    g += poly([P(x0, 0, z1), P(x1, 0, z1), P(x1, h, z1), P(x0, h, z1)], col);
    g += poly([P(x1, 0, z0), P(x1, 0, z1), P(x1, h, z1), P(x1, h, z0)], shade(col, -0.35));
    const floors = Math.max(1, Math.floor(h / 1.15)), colsL = Math.floor(w / 0.95), colsR = Math.floor(d / 0.95);
    for (let f = 0; f < floors; f++) {
      const y0 = 0.45 + f * 1.15, y1 = y0 + 0.55;
      for (let c = 0; c < colsL; c++) { const u = x0 + 0.35 + c * ((w - 0.7) / colsL); g += poly([P(u, y0, z1), P(u + 0.45, y0, z1), P(u + 0.45, y1, z1), P(u, y1, z1)], "#FDE68A", ` class="win" style="animation-delay:-${(rnd() * 4).toFixed(2)}s"`); }
      for (let c = 0; c < colsR; c++) { const v = z0 + 0.35 + c * ((d - 0.7) / colsR); g += poly([P(x1, y0, v), P(x1, y0, v + 0.45), P(x1, y1, v + 0.45), P(x1, y1, v)], "#FCD34D", ` fill-opacity=".8" class="win" style="animation-delay:-${(rnd() * 4).toFixed(2)}s"`); }
    }
    let top = h;
    if (roof === "hip" || roof === "spire") {
      const rh = roof === "spire" ? 4.2 : 1.5, ap = P(cx, h + rh, cz), rc = shade(col, -0.2);
      g += poly([P(x0, h, z0), P(x1, h, z0), ap], shade(rc, 0.25)) + poly([P(x0, h, z0), P(x0, h, z1), ap], shade(rc, 0.1));
      g += poly([P(x0, h, z1), P(x1, h, z1), ap], rc) + poly([P(x1, h, z0), P(x1, h, z1), ap], shade(rc, -0.35));
      top = h + rh;
    } else {
      g += poly(quad(x0, z0, x1, z1, h), shade(col, 0.3));
      g += poly(quad(cx - w * 0.18, cz - d * 0.18, cx + w * 0.12, cz + d * 0.12, h + 0.01), shade(col, -0.1)); // roof unit
    }
    const [px0, ly] = P(cx, top + 1.1 + ldy, cz), lx = px0 + ldx, lw = name.length * 6.3 + 14;
    const label = `<line x1="${lx.toFixed(1)}" y1="${(ly + 4).toFixed(1)}" x2="${px0.toFixed(1)}" y2="${P(cx, top, cz)[1].toFixed(1)}" stroke="${C.soft}" stroke-opacity=".35"/>
<rect x="${(lx - lw / 2).toFixed(1)}" y="${(ly - 13).toFixed(1)}" width="${lw.toFixed(1)}" height="17" rx="8.5" fill="${C.bg2}" fill-opacity=".85" stroke="${col}" stroke-opacity=".8"/>
${text(lx.toFixed(1), (ly - 1.2).toFixed(1), esc(name), { cls: "mono", size: 10.5, fill: C.ink, anchor: "middle" })}`;
    items.push([cx + cz + w / 2 + d / 2, g]);
    return label;
  };

  const tree = (x, z) => {
    const [bx, by] = P(x, 0, z), [, ay] = P(x, 1.7 + rnd() * 0.8, z), r = 0.62 * s, col = ["#2F8F6B", "#3AA17A", "#27795C", "#4DB38A"][Math.floor(rnd() * 4)];
    items.push([x + z, `<ellipse cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" rx="${(r * 0.9).toFixed(1)}" ry="${(r * 0.45).toFixed(1)}" fill="#000" fill-opacity=".25"/>` +
      poly([[bx, ay], [bx - r, by - 2], [bx, by + 1]], shade(col, 0.15)) + poly([[bx, ay], [bx, by + 1], [bx + r, by - 2]], shade(col, -0.25))]);
  };

  let ground = "";
  for (const I of islands) {
    const th = 1.4;
    ground += poly([P(I.x0, -th, I.z1), P(I.x1, -th, I.z1), P(I.x1, 0, I.z1), P(I.x0, 0, I.z1)], "#16233A");
    ground += poly([P(I.x1, -th, I.z0), P(I.x1, -th, I.z1), P(I.x1, 0, I.z1), P(I.x1, 0, I.z0)], "#0F1A2D");
    ground += poly(quad(I.x0, I.z0, I.x1, I.z1), "#2A3A52", ` stroke="#3B82F6" stroke-opacity=".45"`);
    let n = 0, guard = 0;
    while (n < I.trees && guard++ < 4000) { const x = I.x0 + 1 + rnd() * (I.x1 - I.x0 - 2), z = I.z0 + 1 + rnd() * (I.z1 - I.z0 - 2); if (!onPath(x, z) && !onZone(x, z)) { tree(x, z); n++; } }
  }
  for (const [x, z, w, d] of areas) ground += poly(quad(x, z, x + w, z + d, 0.01), "#2E4560");
  for (const [x, z, w, d] of paths) ground += poly(quad(x, z, x + w, z + d, 0.02), "#475569");
  for (const [x, z, w, d] of runways) {
    ground += poly(quad(x, z, x + w, z + d, 0.02), "#334155");
    const long = d > w, n = 9;
    for (let i = 0; i < n; i++) { const t = (i + 0.3) / n, t2 = (i + 0.7) / n; ground += long ? poly(quad(x + w / 2 - 0.1, z + d * t, x + w / 2 + 0.1, z + d * t2, 0.03), "#E2E8F0", ` fill-opacity=".7"`) : poly(quad(x + w * t, z + d / 2 - 0.1, x + w * t2, z + d / 2 + 0.1, 0.03), "#E2E8F0", ` fill-opacity=".7"`); }
  }
  ground += poly(quad(28.2, 4.4, 29.8, 7.4, 0.03), "#38BDF8", ` class="wave"`); // villa pool

  const labels = Z.map(building).join("\n");

  // Flags: India and Germany, waving.
  const flag = (x, z, stripes) => { const [px, py] = P(x, 0, z), top = py - 5.2 * s;
    items.push([x + z, `<line x1="${px.toFixed(1)}" y1="${py.toFixed(1)}" x2="${px.toFixed(1)}" y2="${top.toFixed(1)}" stroke="#CBD5E1" stroke-width="1.5"/><g class="flag">${stripes.map((c, i) => `<rect x="${px.toFixed(1)}" y="${(top + i * 5).toFixed(1)}" width="24" height="5" fill="${c}"/>`).join("")}</g>`]); };
  flag(-1.6, 21.5, ["#FF9933", "#FFFFFF", "#138808"]); flag(49.8, -10.6, ["#111111", "#DD0000", "#FFCE00"]);

  items.sort((a, b) => a[0] - b[0]);
  const scene = items.map((i) => i[1]).join("\n");

  // Sea shimmer.
  let sea = "";
  for (let i = 0; i < 26; i++) { const x = 38 + rnd() * 34, z = 12 + rnd() * 26; if (x < 43 || z > 11) { const [a, b] = P(x, -0.4, z); sea += `<path class="wave" style="animation-delay:-${(rnd() * 3).toFixed(2)}s" d="M${a.toFixed(1)} ${b.toFixed(1)} q6 -3 12 0 t12 0" fill="none" stroke="#7DD3FC" stroke-width="1.2"/>`; } }

  // The journey: a walker on India's streets, a plane looping India ⇄ Germany, boats on the sea.
  const route = [[3.7, 10], [28.3, 10], [28.3, 20], [3.7, 20], [3.7, 29], [28.3, 29]].map(([x, z]) => P(x, 0.1, z));
  const routeDe = [[45.6, 5.5], [66.3, 5.5], [66.3, -1], [45.6, -1], [45.6, 5.5]].map(([x, z]) => P(x, 0.1, z));
  const pd = (a) => "M" + a.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L");
  const walker = (p, dur) => `<g><circle r="7" fill="${C.accent}" fill-opacity=".25"/><circle r="3.4" fill="${C.accent}"/><circle cy="-6" r="2.4" fill="${C.ink}"/><animateMotion dur="${dur}" repeatCount="indefinite" path="${p}"/></g>`;
  const [ax, ay] = P(-3.5, 1, 14), [bx, by] = P(56, 1, 8);
  const flight = `M${ax.toFixed(1)} ${ay.toFixed(1)} C${ax + 180} ${ay - 330}, ${bx - 120} ${by - 300}, ${bx.toFixed(1)} ${by.toFixed(1)} C${bx - 100} ${by - 120}, ${ax + 260} ${ay - 60}, ${ax.toFixed(1)} ${ay.toFixed(1)}`;
  const plane = `<path d="${flight}" fill="none" stroke="${C.soft}" stroke-opacity=".22" stroke-dasharray="3 7"/>
<g><polygon points="13,0 -9,-3 -12,0 -9,3" fill="${C.ink}"/><polygon points="3,0 -4,-11 -7,-11 -3,0 -7,11 -4,11" fill="${C.soft}"/><polygon points="-8,0 -12,-5 -13,-5 -12,0 -13,5 -12,5" fill="${C.soft}"/>
<animateMotion dur="16s" repeatCount="indefinite" rotate="auto" path="${flight}"/></g>`;
  const boat = (x1, z1, x2, z2, dur) => { const a = P(x1, -0.3, z1), b = P(x2, -0.3, z2);
    return `<g><polygon points="-11,0 11,0 7,5 -7,5" fill="${C.ink}"/><polygon points="0,-2 0,-17 9,-2" fill="${C.accent}"/><animateMotion dur="${dur}" repeatCount="indefinite" keyPoints="0;1;0" keyTimes="0;.5;1" calcMode="linear" path="M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${b[0].toFixed(1)} ${b[1].toFixed(1)}"/></g>`; };

  const islandNames = islands.map((I) => { const [x, y] = P(...I.label); return `<g class="bob bob3">${text(x.toFixed(1), y.toFixed(1), esc(I.name), { cls: "mono", size: 12, fill: C.soft, anchor: "middle", ls: 2.4 })}</g>`; }).join("");

  return svg(W, H, "Tanmay's World: an isometric 3D map where every chapter of Tanmay's journey is a building. India island: SKN Sinhgad, Apexon, The Socials Web, Lonavala Villas, Vatsalya GCL, Nurture+, BatchMates HQ, WeSchool, SIRP Library, AI Lab, Trophy Hall. A plane flies to the Germany island: Uni Bamberg, IS Management, Autohaus Sperber, Munich Job Fair, Berlin and Paris.", `
<g class="in d1">${text(720, 70, "01 · TANMAY'S WORLD · ISOMETRIC", { cls: "mono", size: 12, fill: C.accent, ls: 2.6 })}
${text(718, 120, "Every chapter", { cls: "serif", size: 44, fill: C.ink, weight: 300, ls: -1 })}
${text(718, 166, "is a building.", { cls: "serif", size: 44, fill: "url(#sheen)", weight: 300, ls: -1, italic: true })}
${text(720, 200, "India → Germany → home. 18 places, one journey.", { size: 15, fill: C.muted })}</g>
${sea}
${boat(39, 30, 44, 17, "18s")}${boat(71, -6, 73, 7, "20s")}
${ground}
${scene}
<path d="${pd(route)}" fill="none" stroke="${C.accent}" stroke-opacity=".35" stroke-width="1.5" stroke-dasharray="1 5" stroke-linecap="round"/>
${walker(pd(route), "36s")}${walker(pd(routeDe), "22s")}
${labels}
${islandNames}
${plane}
<g class="in d3">${text(56, 560, "▶  ENTER THE INTERACTIVE 3D WORLD", { cls: "mono", size: 12, fill: C.accent, ls: 2.4 })}${text(56, 582, "tanmayportfolio.me/world · walk in, click any building", { cls: "mono", size: 11.5, fill: C.muted })}</g>`);
}
out["world"] = isoWorld();

mkdirSync("assets", { recursive: true });
for (const [name, s] of Object.entries(out)) writeFileSync(`assets/${name}.svg`, s);
console.log(`wrote ${Object.keys(out).length} SVGs`);
