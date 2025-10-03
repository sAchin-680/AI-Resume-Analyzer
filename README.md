# AI Resume Analyzer

High-quality, production-ready single-repo React application for analyzing resumes using an opinionated ATS-aware heuristic and AI-guided feedback. Built with React Router (v7), TypeScript, Vite and TailwindCSS. The app demonstrates a small-scope UI for uploading/browsing resumes and returning structured feedback that can be consumed by downstream services.

This README is written with an engineer-focused lens: it includes architecture, local dev, build/deploy, testing guidance, common debugging tips, and extension points so another SDE-2 or above can quickly ramp and iterate.

## Table of contents

- Project summary
- Architecture & key modules
- Quickstart (dev)
- Production build & Docker
- Scripts and developer tooling
- Project data and types
- How the AI prompt is structured
- Troubleshooting & common fixes
- Contribution notes
- License

## Project summary

AI Resume Analyzer ("airesume") is a client-first React application that provides:

- Resume browsing UI with score breakdowns (ATS, tone, content, structure, skills).
- Static sample data in `app/contants` used for local development.
- Integration points for a backend/AI model via well-defined prompt formats and response contract.

The app intentionally keeps analysis logic and the AI prompt shape decoupled so the AI/heuristic implementation can be swapped without changing UI components.

## Architecture & key modules

High-level structure (see repository root):

- `app/` — All client app code (routes, components, styles, static data).
  - `components/` — Reusable UI pieces (Navbar, ResumeCard, ScoreCircle).
  - `contants/` — Static sample data + AI prompt templates (`index.ts`).
  - `routes/` — Route entrypoints (single `home.tsx` route by default).
  - `welcome/` — Branding and the welcome screen.
- `public/` — Static assets (images, PDFs, icons, pdf.worker) — served as-is.
- `package.json` — Scripts and dependency manifest.

Built with:
- React 19 + TypeScript
- React Router v7 (dev tooling and server integration)
- Vite as the dev server/build tool
- TailwindCSS for utility-first styling
- PDF rendering via `pdfjs-dist`
- State via `zustand`

Design notes
- Routes are configured using `@react-router/dev` and source-based routing in `app/routes.ts`.
- `app/root.tsx` contains top-level layout + error boundary.
- `app/contants/index.ts` contains sample resume objects (`resumes`) and the expected AI response contract (`AIResponseFormat`), plus a helper `prepareInstructions` to assemble prompts.

## Quickstart (local development)

Prerequisites
- Node.js 18+ or stable LTS
- npm (bundled with Node) or your preferred package manager

Install and run

```bash
# from repository root
npm install
npm run dev
```

The dev server uses Vite and React Router's dev server. By default it runs with HMR and exposes the app (usually at `http://localhost:5173`). Check terminal output for the exact URL.

Typecheck

```bash
npm run typecheck
```

Build for production

```bash
npm run build
# serve the build (production server)
npm start
```

## Docker (containerized) build

A production Dockerfile exists at the repository root. Build and run locally:

```bash
# build image
docker build -t airesume:local .
# run container (map port if server listens)
docker run --rm -p 3000:3000 airesume:local
```

Notes: the production server command is `react-router-serve ./build/server/index.js` (see `package.json`). If you change ports or the server entry, update the Dockerfile accordingly.

## Scripts and developer tooling

Key `package.json` scripts:

- `dev` — starts the React Router/Vite dev server (HMR)
- `build` — builds the app for production
- `start` — serves the built server bundle
- `typecheck` — runs `react-router typegen` and `tsc`

Recommended dev workflow
1. branch off `main` for any feature/fix
2. implement changes + unit tests (if adding logic)
3. run `npm run typecheck`
4. run `npm run dev` and smoke test locally
5. open PR with a clear description and artifacts/screenshots

## Project data and types

`app/contants/index.ts` contains sample `resumes: Resume[]` and an `AIResponseFormat` string which defines the expected response contract from the AI.

Important contract (summary):
- top-level `Feedback` object with numeric scores (max 100) and five subdomains: `ATS`, `toneAndStyle`, `content`, `structure`, `skills`.
- each domain contains a `score` and `tips` with typed entries (recommended `type: "good" | "improve"`, `tip`, and `explanation`)

If you extend this shape, update the UI components that consume `feedback` to avoid runtime errors.

## How the AI prompt is structured

`prepareInstructions` in `app/contants/index.ts` assembles a deterministic prompt used to request analysis. The README below documents the contract and how to produce a compliant response:

- The helper expects: `{ jobTitle, jobDescription, AIResponseFormat }` and returns a string prompt.
- The response must be a single JSON object (no surrounding text) following `AIResponseFormat`.

When integrating with an LLM, ensure the model returns valid JSON. Prefer using structured output techniques (e.g., `functions` in OpenAI or returning JSON in a code block and parsing it), and validate the parsed JSON before using it in UI.

## Troubleshooting & common fixes

- `npm run dev` fails
  - Check Node version (>=18). If you get cryptic Vite or React Router errors, clear cache: `rm -rf node_modules/.vite` and restart.
  - If TypeScript errors block the dev server, run `npm run typecheck` to see detailed error messages.

- Static assets not found (404)
  - Paths in `app/contants` sometimes use `public/...` vs `/public/...`. Files in `public/` are served from the web root — reference them as `/images/resume_01.png` or `/resumes/resume-1.pdf` (leading slash) rather than `public/...`.

- Pushing to remote or reverting commits
  - This repo uses `main` as the default branch. Use feature branches for PRs. See Git docs for `git reset`, `git revert`, and `git push --force-with-lease` if you need to rewrite remote history.

## Extension points / recommended next work

- Integrate a backend endpoint to call an LLM or local model and return `Feedback` JSON. Keep `prepareInstructions` as the single source of truth for prompts.
- Replace static `resumes` with a storage-backed list (S3, GCS, or signed-URL uploads).
- Add unit tests for parsing/validating the AI response (happy path + malformed JSON + missing fields).
- Add E2E tests (Cypress/Playwright) to validate the full flow: upload -> analyze -> display.

## Contribution notes

- Use conventional commits-style messages if you plan to run semantic-release or automation later.
- Keep PRs small and focused; one feature or bug per PR.
- Add tests for new features and update the README when adding or changing end-user behavior.

## License

This repository currently includes no license file. Add a `LICENSE` (MIT/Apache-2.0/etc.) if you plan to publish.

---

If you want, I can:
- add a `README` badge matrix (build, typecheck),
- fix the `app/contants` asset paths (make them root-relative),
- add a basic server-API stub and a minimal test for the prompt/response parsing.

Tell me which follow-up you'd like and I will implement it.
