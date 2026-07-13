# Deploy Guide

This single repository holds both the **web app** (static site + one Netlify Function, at the repo root) and the **Claude plugin** (`attribute-intelligence-plugin/`, a subdirectory). They deploy independently of each other, but live in one place since `GAMI-Solutions/AttributeintelligenceAgent` already exists and GitHub repo names are case-insensitive — a second repo named `attributeintelligenceagent` would have collided with it. The repo root has its own `.claude-plugin/marketplace.json` that sources the plugin from `./attribute-intelligence-plugin`.

## 1. Web app — Netlify environment variable

The Strategy/Action reasoning in `index.html` calls `/.netlify/functions/analyze`, which calls the Anthropic API server-side. It needs exactly one secret:

1. In the Netlify dashboard: **Site configuration → Environment variables → Add a variable**.
2. Key: `ANTHROPIC_API_KEY`. Value: an API key from the [Anthropic Console](https://console.anthropic.com/).
3. Scope it to at least the **Production** context (add **Deploy previews** / **Local development** too if you want those to work).
4. Redeploy (or trigger a new deploy) so the function picks up the variable.

The key is read server-side only via `process.env.ANTHROPIC_API_KEY` inside `netlify/functions/analyze.js`. It is never sent to the browser, never logged, and should never be committed to git — `netlify.toml` and `.gitignore` don't need any changes to keep it out, since it only ever lives in Netlify's environment config.

No other configuration is required: `netlify.toml` already points Netlify at `netlify/functions/` for functions and the repo root for the static site.

### Verifying it worked

1. Open the deployed site, load the sample CSV, pick any analysis type, and run it.
2. If `insights`/`recommendations` render with cited numbers, the key is wired correctly.
3. If you see the amber "AI insights unavailable — showing computed metrics only" banner, check the Netlify function logs (**Functions → analyze → Logs**) — the most common cause is a missing or invalid `ANTHROPIC_API_KEY`.

## 2. Local development

```bash
npm install -g netlify-cli   # one-time
netlify dev
```

`netlify dev` serves the static site and runs `netlify/functions/analyze.js` locally on the same origin, so `/.netlify/functions/analyze` resolves without any proxy config. Set the API key for local runs with a `.env` file at the repo root (already covered by `.gitignore` — add `ANTHROPIC_API_KEY=sk-ant-...` to it) or `netlify env:set ANTHROPIC_API_KEY sk-ant-...`.

Do not open `index.html` directly via `file://` — the function call and the dashboard's CSV `fetch()` both require an HTTP origin.

## 3. Claude plugin — install steps

The plugin lives in `attribute-intelligence-plugin/` within this same repo; it runs entirely inside a Claude conversation and needs no deployment or API key of its own.

From Claude Code, once this repo is pushed to GitHub:

```
/plugin marketplace add GAMI-Solutions/AttributeintelligenceAgent
/plugin install attributeintelligenceagent@attributeintelligenceagent-marketplace
```

The `marketplace add` command targets the whole repo (its root `.claude-plugin/marketplace.json` points at the `attribute-intelligence-plugin/` subdirectory) — don't point it at the subdirectory itself. To develop it locally before publishing, point the marketplace command at this repo's local path instead of the GitHub path.

## Known scope note

The Strategic Dashboard page (`dashboard.html` / `attribute-dashboard.js`) was **not** part of the Phase 2 task list (2.1–2.5) or the architecture diagram in the roadmap — only the agent console (`index.html`, `analysis-engine.js`, `agentic-ai.js`) was rewired to Claude. `attribute-dashboard.js` still contains its own simulated drift (random deltas every 10 seconds) and a hardcoded "94.2% Confidence" badge. If you want the dashboard held to the same honesty bar, that's a follow-up task, not something silently folded into this pass.
