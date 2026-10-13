# PracticeOS Docs

Source for **docs.privatepracticeos.app**, the public help center for Private Practice OS, built on
[Mintlify](https://mintlify.com). Contributor and agent rules: see `AGENTS.md`.

## Preview locally
    npm i -g mint
    source ~/.nvm/nvm.sh && nvm use 24
    mint dev                      # http://localhost:3000

## Before merging to main
    node scripts/check.mjs release

Mintlify deploys `main` to production. Merges to `main` need Zack's approval.

## History
Rebuilt on Mintlify in October 2026. The previous site's pages were recovered from its live build
and archived (reference only) at `PracticeOS/Docs_Site/src/content/` on the company drive.

© 2026 Private Practice Collective LLC. See `LICENSE`.
