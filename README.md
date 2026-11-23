# PracticeOS Docs

Source for [docs.privatepracticeos.app](https://docs.privatepracticeos.app), built on [Mintlify](https://mintlify.com).

Pages are MDX files with YAML frontmatter. Navigation, branding and redirects live in `docs.json`. Pushing to `main` deploys the site.

## Preview locally

```bash
npm i -g mint
mint dev
```

## Check before pushing

```bash
mint validate
mint broken-links
```
