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
  @keyframes spin{to{transform:rotate(360deg)}}
  @media (prefers-reduced-motion:reduce){.in,.spin{animation:none}.draw{animation:none;stroke-dashoffset:0}}
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
const chips = (x, y, arr) => {
  let cx = x;
  return arr.map((c) => { const w = c.length * 7.4 + 26; const s = `<rect x="${cx}" y="${y}" width="${w}" height="28" rx="14" fill="${C.accent}" fill-opacity=".08" stroke="${C.accent}" stroke-opacity=".35"/>${text(cx + w / 2, y + 18.5, esc(c), { cls: "mono", size: 12, fill: C.soft, anchor: "middle" })}`; cx += w + 10; return s; }).join("\n");
};

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
<g class="spin" opacity=".9"><circle cx="980" cy="190" r="150" fill="none" stroke="${C.accent}" stroke-opacity=".35" stroke-dasharray="2 10"/></g>
<g class="spin spin-r"><circle cx="980" cy="190" r="118" fill="none" stroke="${C.soft}" stroke-opacity=".25" stroke-dasharray="40 14"/><circle cx="980" cy="72" r="5" fill="${C.accent}"/></g>
<circle cx="980" cy="190" r="88" fill="${C.bg2}" stroke="${C.accent}" stroke-opacity=".6"/>
${text(980, 214, "TN", { cls: "serif", size: 72, fill: "url(#sheen)", anchor: "middle", italic: true, weight: 300 })}
<g class="in d1">${text(64, 78, "HELLO, WORLD · MUMBAI, IN", { cls: "mono", size: 12, fill: C.accent, ls: 3 })}</g>
<g class="in d2">${text(60, 150, "Tanmay", { cls: "serif", size: 76, fill: C.ink, weight: 300, ls: -2 })}${text(60, 222, "Narnaware.", { cls: "serif", size: 76, fill: "url(#sheen)", weight: 300, ls: -2, italic: true })}</g>
<g class="in d3">${text(64, 266, esc(D.title), { cls: "sans", size: 22, fill: C.soft })}${text(64, 296, esc(D.tagline), { cls: "sans", size: 16, fill: C.muted })}</g>
<g class="in d4">${text(64, 324, esc(D.sub), { cls: "mono", size: 12, fill: C.muted, ls: 1 })}</g>
<path class="draw" d="M64 356 H1136" stroke="url(#rule)"/>
<g class="in d5">${D.stats.map(([v, l], i) => text(64 + i * 270, 400, `<tspan class="serif" font-size="30" fill="${C.ink}">${esc(v)}</tspan><tspan dx="10" fill="${C.muted}">${esc(l)}</tspan>`, { size: 13 })).join("\n")}</g>`);

const titles = [
  ["about", "01", "ABOUT", "Hello, I'm", "Tanmay.", "WHO I AM"],
  ["recognition", "02", "RECOGNITION", "Proof,", "on the record.", "WINS & AWARDS"],
  ["work", "03", "SELECTED WORK", "Products,", "not just projects.", "WHAT I BUILT"],
  ["toolkit", "04", "TOOLKIT", "The tools", "I reach for.", "HOW I BUILD"],
  ["commits", "05", "COMMIT LOG", "A year of", "building.", "ON GITHUB"],
  ["experience", "06", "EXPERIENCE", "Where I've", "shipped.", "THE PATH"],
  ["connect", "07", "CONNECT", "Let's build something", "people return to.", "SAY HELLO"],
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
  const x = 40 + (i % 3) * 376, y = 36 + Math.floor(i / 3) * 140;
  return `<g class="in d${i + 1}"><rect x="${x}" y="${y}" width="356" height="122" rx="14" fill="${C.bg2}" fill-opacity=".6" stroke="${C.line}"/>
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
${p.metrics.map(([v, l], i) => `<g class="in d${i + 2}"><rect x="770" y="${48 + i * 86}" width="374" height="72" rx="12" fill="${C.bg2}" fill-opacity=".7" stroke="${C.line}"/>
${text(794, 94 + i * 86, esc(v), { cls: "serif", size: 30, fill: C.ink, weight: 300 })}${text(1120, 90 + i * 86, esc(l), { cls: "mono", size: 12, fill: C.muted, anchor: "end", ls: 1 })}</g>`).join("\n")}`);

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

mkdirSync("assets", { recursive: true });
for (const [name, s] of Object.entries(out)) writeFileSync(`assets/${name}.svg`, s);
console.log(`wrote ${Object.keys(out).length} SVGs`);
