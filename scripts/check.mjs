// Publish-standard check for the PracticeOS docs. Navigation lives in docs.json (Mintlify's model);
// this script only validates. Run before any merge to main.
//   node scripts/check.mjs           -> preview: lists open items, fails only on hard errors
//   node scripts/check.mjs release   -> release: every page must be approved with no open markers
import fs from "node:fs";
import path from "node:path";

const release = process.argv[2] === "release";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

// Hostnames customers may see in the docs. Everything else under our domains or the
// underlying vendor stays out (ADR-0005). Edit this list deliberately, not casually.
const ALLOWED_HOSTS = new Set(["my.privatepracticeos.app"]);
const HOST_PATTERNS = [/[a-z0-9.-]*privatepracticeos\.app/gi, /[a-z0-9.-]*privatepracticecrm\.app/gi,
  /[a-z0-9.-]*leadconnector[a-z0-9.-]*/gi, /[a-z0-9.-]*msgsndr[a-z0-9.-]*/gi, /[a-z0-9.-]*gohighlevel[a-z0-9.-]*/gi];
const BANNED = [[/HIPAA[- ]compliant/i, "unqualified HIPAA claim"], [/\b(revolutionary|disruptive|game[- ]chang)/i, "hype word"],
  [/Private Practice CRM/i, "retired product name"], [/\bPPC\b/, "internal shorthand"], [/\bHigh ?Level\b/i, "vendor name (white-label)"],
  [/\bguarantee/i, "guarantee language"], [/Healing Haven|DeLovely/i, "client-identifying name"]];

const navPages = [];
(function collect(node) {
  if (Array.isArray(node)) node.forEach(collect);
  else if (typeof node === "string") navPages.push(node);
  else if (node && typeof node === "object") for (const k of ["pages", "groups", "tabs", "anchors"]) if (node[k]) collect(node[k]);
})(JSON.parse(fs.readFileSync(path.join(root, "docs.json"), "utf8")).navigation);
const config = JSON.parse(fs.readFileSync(path.join(root, "docs.json"), "utf8"));
const redirectSources = new Set((config.redirects ?? []).map((r) => r.source.replace(/^\//, "")));

const ignored = (rel) => /^(scripts|drafts|node_modules)\//.test(rel) || rel.endsWith(".draft.mdx") || path.basename(rel).startsWith("._");
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.name.startsWith(".")) return [];
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : e.name.endsWith(".mdx") ? [path.relative(root, p)] : [];
  });
}
const files = walk(root).filter((r) => !ignored(r));
const slugs = new Set(files.map((f) => f.replace(/\.mdx$/, "")));

const errors = [], open = [];
for (const p of navPages) if (!slugs.has(p)) errors.push(`docs.json lists "${p}" but ${p}.mdx does not exist`);
for (const s of slugs) if (!navPages.includes(s)) errors.push(`${s}.mdx is not in docs.json navigation — Mintlify would still publish it. Add it, or move it to drafts/`);

for (const rel of files) {
  const slug = rel.replace(/\.mdx$/, "");
  const text = fs.readFileSync(path.join(root, rel), "utf8");
  const fm = Object.fromEntries([...(/^---\n([\s\S]*?)\n---/.exec(text)?.[1] ?? "").matchAll(/^([A-Za-z_]+):\s*(.*)$/gm)].map((m) => [m[1], m[2]]));
  if (!fm.title) errors.push(`${slug}: missing title`);
  if (!fm.description) errors.push(`${slug}: missing description`);
  if (!["drafted", "approved"].includes(fm.status)) errors.push(`${slug}: status must be drafted or approved`);
  const markers = (text.match(/\bVERIFY\b|\bTODO\b|\bTBD\b/g) || []).length;
  if (markers) open.push(`${slug}: ${markers} open VERIFY/TODO marker(s)`);
  if (release && fm.status !== "approved") errors.push(`${slug}: not approved`);
  if (release && markers) errors.push(`${slug}: open VERIFY/TODO markers`);
  for (const [re, why] of BANNED) if (re.test(text)) errors.push(`${slug}: ${why} (${re})`);
  for (const re of HOST_PATTERNS) for (const h of text.match(re) ?? []) if (!ALLOWED_HOSTS.has(h.toLowerCase())) errors.push(`${slug}: hostname not on the allowlist: ${h}`);
  for (const m of text.matchAll(/(?:\]\(|href=")(\/[^)"#\s]*)/g)) {
    const t = m[1].replace(/^\//, "").replace(/\/$/, "") || "index";
    if (!slugs.has(t) && !redirectSources.has(t)) errors.push(`${slug}: broken internal link ${m[1]}`);
  }
}

console.log(`${release ? "release" : "preview"}: ${files.length} pages, ${navPages.length} in navigation`);
open.forEach((o) => console.log("  open: " + o));
if (errors.length) { console.error(`\n${errors.length} problem(s):`); errors.forEach((e) => console.error("  ✗ " + e)); process.exit(1); }
console.log("OK");
