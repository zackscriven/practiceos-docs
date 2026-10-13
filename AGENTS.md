# PracticeOS Docs — agent instructions

Public help center for Private Practice OS, served by Mintlify at docs.privatepracticeos.app.
Audience: practice owners and their staff. Mintlify deploys `main` to production automatically —
**never push to `main` or merge a PR without Zack's explicit OK.** Work on a branch.

## Structure
- Pages are `.mdx` with YAML frontmatter. Navigation is maintained by hand in `docs.json`.
- Every page in the repo must be in `docs.json` navigation; Mintlify publishes every page it can see.
  Unfinished work goes in `drafts/` or `*.draft.mdx` (excluded by `.mintignore`).
- Required frontmatter: `title`, `description`, `status` (`drafted` | `approved`), `source`
  (where the steps were verified: session date/timestamp, live UI check date).
- Retired URLs get a `redirects` entry in `docs.json`, never a dead link.

## Publish standard
- `drafted`: written from a cited source; not yet checked in the live product or not yet signed off.
- `approved`: steps checked against the current product, zero `{/* VERIFY: ... */}` markers, Zack signed off.
- Unconfirmed steps carry an MDX comment `{/* VERIFY: what to check */}` (not rendered).
- `node scripts/check.mjs` during work; `node scripts/check.mjs release` must pass before merging to `main`.

## Terminology
- Product: "Private Practice OS" or "PracticeOS". Company: "Private Practice Collective".
- Never "Private Practice CRM", never "PPC", never the underlying platform vendor's name.

## Content boundaries
- No PHI, no real client or practice names, no identifying examples.
- No unqualified "HIPAA-compliant"; no clinical-outcome claims; no hype words; no guarantees.
- Never state subscription prices.
- Hostnames: only those on the allowlist in `scripts/check.mjs`. The customer's own subdomains
  (e.g. `pages.yourpractice.com`) are fine as examples.
- Third-party screens (Meta, Google, registrars) change often — date-stamp those pages.

## Style
- Second person, active voice, sentence-case headings, one idea per sentence.
- Bold for UI labels exactly as they appear: **Settings → Billing**.
- Use Mintlify components: `<Steps>`, `<Note>`, `<Warning>`, `<Tip>`, `<CardGroup>`.

## Local preview
    source ~/.nvm/nvm.sh && nvm use 24 && mint dev   # Node 24; Mintlify refuses Node 25

## exFAT drive
macOS writes `._*` files. Never commit them. If git reports "non-monotonic index":
`find . -name '._*' -type f -delete` inside the repo.
