# Attribute Intelligence Agent

A retail catalog attribute-analytics app (styled around Lululemon product data) with two pieces:

1. **A static web app** (this repo root) — upload a product CSV, get real per-attribute aggregation (revenue, conversion rate, return rate, etc.) computed client-side, and real Claude-generated insights/recommendations reasoned over those aggregates via a Netlify Function.
2. **A Claude plugin** ([`attribute-intelligence-plugin/`](attribute-intelligence-plugin/)) — the same attribute-intelligence methodology, packaged as a skill you can run on any product CSV directly inside a Claude conversation, no deployment required.

| Page | Purpose |
|------|---------|
| [index.html](index.html) | **Agent console** — upload a CSV (or load generated sample data), pick an analysis type (Inventory, Pricing, Customer, Recommendations), and run the analysis. Aggregation (Scout/Analyst) is deterministic JavaScript; the Strategy/Action insights and recommendations come from a real call to Claude via `/.netlify/functions/analyze`. An agent activity log shows each real step as it happens. |
| [dashboard.html](dashboard.html) | **Strategic dashboard** — KPI cards, attribute contribution charts, customer segment views, a filterable attribute performance table, and trend lines. Auto-loads `sample_product_attribution_data-v2.csv` on startup. **Not yet rewired to Claude** — see [Known issues](#validation-notes--known-issues). |

The app is **static HTML/CSS/JavaScript plus one serverless function** — no framework, no database. Charts are rendered with [Chart.js](https://www.chartjs.org/), both loaded from a public CDN.

> **What is real, what calls Claude, and what's still a demo:** On `index.html`, the attribute aggregations (revenue, conversion rate = purchases ÷ views, return-rate averages, funnel drop-off, statistical outliers, small-sample flags) are genuinely computed client-side from the loaded CSV — this data and the aggregated JSON (never the raw CSV) is what gets sent to `/.netlify/functions/analyze`, which calls the real Anthropic API and returns Claude's actual reasoning as the insights/recommendations you see. If that call fails, the UI shows an honest "AI insights unavailable" banner with the computed metrics — it never falls back to invented text. `dashboard.html` has **not** been rewired yet: its KPI drift, trend arrows, and confidence badge are still scripted `Math.random()` effects, not real analysis. See [DEPLOY.md](DEPLOY.md) for the scope note on that page.

## Repository layout

```
index.html                              Agent console page
dashboard.html                          Strategic dashboard page (not yet rewired to Claude)

app.js                                  Console entry point: init, keyboard shortcuts
data-loader.js                          CSV upload / drag-and-drop parsing + sample data generator (console)
analysis-engine.js                      Real aggregation, funnel/anomaly detection, payload building, and the
                                         fetch() call to /.netlify/functions/analyze (console)
ui-controller.js                        Notifications, overlays, counters, particle effects (shared UI helpers)
results-exporter.js                     JSON report export + sample CSV download (console)
agentic-ai.js                           Agent activity log, fed entirely by real events (console)

attribute-dashboard.js                  Dashboard logic: charts, KPI animations, table, CSV export
local-csv-loader.js                     Fetches and processes the v2 CSV for the dashboard (with fallback data)

netlify/functions/analyze.js            Netlify Function: validates the aggregated payload, calls the
                                         Anthropic API server-side, returns strict JSON insights/recommendations
netlify.toml                            Netlify config: functions directory + static publish root
package.json                            Minimal manifest (Node >=18, `npm run dev` -> `netlify dev`)

styles.css                              Shared base styles (both pages)
agentic-ai.css                          Agent activity log styles (console)
dashboard.css                           Dashboard styles
attribute-dashboard-additional.css      Extra dashboard styles (currently not linked from any page)

sample_product_attribution_data.csv     v1 sample data — matches the console's upload format (17 columns)
sample_product_attribution_data-v2.csv  v2 enriched sample data — auto-loaded by the dashboard (50 products,
                                        includes attr_contrib_conversion, loyalty_attribute_score,
                                        return_risk_score, region, customer_age_group, price bands, etc.)

attribute-intelligence-plugin/          Standalone Claude plugin packaging the same methodology (see its README)
DEPLOY.md                               Netlify env var setup, netlify dev, and plugin install steps
```

`script.js` and `csv-data-loader.js` (legacy, unreferenced, superseded by the modular files above) have been deleted.

## Data formats

**Console upload (v1 format).** The upload on `index.html` expects a comma-separated CSV with this header row (header names are lowercased and spaces become underscores on import):

```
product_id, product_name, category, style, fit, fabric, color, price,
sustainability_score, views, cart_adds, purchases, revenue, return_rate,
customer_rating, season, launch_date
```

A matching sample is provided in `sample_product_attribution_data.csv`, and the console's **Download Sample CSV** button generates a fresh 50-row file in this format.

**Dashboard auto-load (v2 format).** `dashboard.html` fetches `sample_product_attribution_data-v2.csv` from the site root at startup. Beyond the v1 columns it uses `normalized_fabric` / `normalized_color` / `normalized_fit` / `normalized_style` / `normalized_price_band`, `region`, `customer_age_group`, and the modeled scores `attr_contrib_conversion`, `loyalty_attribute_score`, and `return_risk_score`. To point the dashboard at a different file, change `config.csvFileName` at the top of [local-csv-loader.js](local-csv-loader.js:11). If the fetch fails, the dashboard silently falls back to built-in demo data.

Note: the CSV parser is intentionally simple — it handles quoted fields containing commas, but not escaped quotes (`""`) or newlines inside fields.

## How to deploy

The site itself is still static, but `index.html` now depends on one serverless function, so it needs a host that runs Netlify Functions — plain static hosts (GitHub Pages, S3, Nginx) will serve the pages but the Claude-backed insights on the console will always show the "AI insights unavailable" fallback banner on those hosts, since there's no function runtime behind them.

**Do not open the pages via `file://`** — the dashboard's CSV `fetch()` and the console's call to `/.netlify/functions/analyze` both require an HTTP origin.

### Netlify (recommended — required for real Claude-backed insights)

1. Create a new site from this repo in Netlify.
2. Build command: none. Publish directory: `.` (repository root). `netlify.toml` already configures the functions directory.
3. Set the `ANTHROPIC_API_KEY` environment variable (see [DEPLOY.md](DEPLOY.md)).
4. Deploy. `/.netlify/functions/analyze` is live automatically.

### Local development

```bash
npm install -g netlify-cli
netlify dev
```

This serves the static site and runs the function locally on the same origin. See [DEPLOY.md](DEPLOY.md) for setting the API key locally.

### Static-only hosts (GitHub Pages, S3, Nginx, etc.)

These will serve `index.html` and `dashboard.html` fine, but there is no function runtime, so every analysis on the console will hit the honest fallback banner instead of real Claude insights. Use these only if you specifically want the deterministic-aggregates-only experience.

## Usage

1. Open the app — the agent console loads with an animated splash.
2. Click **Load Sample Lululemon Data** (or upload/drag-drop your own v1-format CSV). The Scout Agent logs a real profile of what it parsed (row count, schema, missing columns).
3. Select an analysis card (Inventory Optimization, Dynamic Pricing, Customer Insights, or Product Recommendations) and click **Execute AI Analysis**.
4. The Analyst Agent aggregates the real numbers first; the Strategy Agent then sends those aggregates (never the raw CSV) to Claude via `/.netlify/functions/analyze`, and the Action Agent surfaces the ranked recommendations that come back.
5. Review the metrics dashboard, attribute revenue chart, Claude-generated recommendations, and insights. Export a JSON report or download a sample CSV from the action panel.
6. Click **Strategic Dashboard** in the header to open the analytics dashboard, which auto-loads the v2 dataset; use the Conversion/Loyalty/Returns toggles and table filters to explore, or **Export** to download the attribute analysis as CSV. (This page is still a UI demo — see Known issues.)

Keyboard shortcuts on the console: `Ctrl+Enter` run analysis · `Ctrl+L` load sample data · `Ctrl+D` download sample CSV · `Ctrl+A` clear the agent activity log · `Esc` close overlays. (Note these override the browser's default select-all and bookmark shortcuts while the page is focused.)

## Validation notes & known issues

All JavaScript files pass a syntax check (`node --check`). Issues worth knowing about:

- **`dashboard.html` is still a UI demo, not yet Claude-backed.** `attribute-dashboard.js`'s KPI drift (small random deltas every 10 seconds), trend arrows, sparklines, and its hardcoded "94.2% Confidence" badge are scripted effects, not real analysis. This page was outside the Phase 2 task list; see [DEPLOY.md](DEPLOY.md#known-scope-note).
- **The console (`index.html`) is Claude-backed.** Attribute aggregation, funnel/anomaly detection, and the metrics dashboard are computed from the real CSV. Insights and recommendations come from `/.netlify/functions/analyze`, which calls the real Anthropic API. If that call fails or times out, the UI shows the computed metrics with an honest banner — never invented insight text.
- **Duplicate columns in the v2 CSV.** The header contains `category.1`, `purchases.2`, `return_rate.3`, etc. (artifacts of a pandas export). The loaders read columns they need by exact name, so this is harmless, but be aware when regenerating the dataset.
- **Untrusted CSV caution.** Parsed CSV values are inserted into the DOM. `analysis-engine.js` escapes attribute names and Claude's response text before rendering; `attribute-dashboard.js` on the separate dashboard page does not — only load CSV files you trust.
- **No offline mode.** Chart.js comes from a CDN; pages render without charts if offline.
- **Payload size.** The console sends only aggregated JSON to the function (top ~15 attribute values per dimension, catalog totals, funnel rates, anomaly list) — typically a few KB, well under the function's 100KB hard limit. The raw CSV is never transmitted to the function.

## License

The web app itself has no license file — add one before distributing. The Claude plugin in `attribute-intelligence-plugin/` is separately licensed under MIT (see its own `LICENSE`).
