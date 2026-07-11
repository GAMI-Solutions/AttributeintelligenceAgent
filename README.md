# Attribute Intelligence Agent

A client-side web application that demonstrates an **AI-powered product attribute analytics experience** for a retail catalog (styled around Lululemon product data). It ingests product-level CSV data — attributes such as fabric, fit, style, color, and price alongside funnel metrics such as views, cart adds, purchases, revenue, and returns — aggregates performance by attribute, and presents the results through two interactive pages:
Quick demo link https://legendary-pixie-228606.netlify.app/
| Page | Purpose |
|------|---------|
| [index.html](index.html) | **Agent console** — upload a CSV (or load generated sample data), pick an analysis type (Inventory, Pricing, Customer, Recommendations), run the animated "Agentic AI" pipeline, and review metrics, charts, insights, and recommendations. Includes a simulated multi-agent command center (Scout / Analyst / Strategy / Action agents) with a live communication log. |
| [dashboard.html](dashboard.html) | **Strategic dashboard** — KPI cards with sparklines, attribute contribution charts, customer segment views (age group, region, price band), a filterable attribute performance table, a correlation heatmap, and seasonal trend lines. Auto-loads `sample_product_attribution_data-v2.csv` on startup. |

The app is **pure static HTML/CSS/JavaScript** — there is no build step, no backend, and no framework. Charts are rendered with [Chart.js](https://www.chartjs.org/) and dashboard animations with [Anime.js](https://animejs.com/), both loaded from public CDNs.

> **Important — what is real and what is simulated:** The attribute aggregations (revenue, conversion rate = purchases ÷ views, loyalty and return-risk averages per fabric/color/fit/style/region/age group/price band) are genuinely computed from the loaded CSV. However, the "AI" elements — the neural-network processing stages, agent confidence scores, autonomous action suggestions, model accuracy counters, decision trees, and several insight/recommendation texts — are **scripted demo effects** driven by timers and `Math.random()`, not machine learning. Treat this project as a UI/UX prototype or demo, not a production analytics engine.

## Repository layout

```
index.html                              Agent console page
dashboard.html                          Strategic dashboard page

app.js                                  Console entry point: init, keyboard shortcuts, autonomous suggestions
data-loader.js                          CSV upload / drag-and-drop parsing + sample data generator (console)
analysis-engine.js                      Attribute aggregation, metrics, recommendations, results chart (console)
ui-controller.js                        Notifications, overlays, counters, particle effects (shared UI helpers)
results-exporter.js                     JSON report export + sample CSV download (console)
agentic-ai.js                           Simulated multi-agent command center (console)

attribute-dashboard.js                  Dashboard logic: charts, KPI animations, table, CSV export
local-csv-loader.js                     Fetches and processes the v2 CSV for the dashboard (with fallback data)

styles.css                              Shared base styles (both pages)
agentic-ai.css                          Agent command center styles (console)
dashboard.css                           Dashboard styles
attribute-dashboard-additional.css      Extra dashboard styles (currently not linked from any page)

sample_product_attribution_data.csv     v1 sample data — matches the console's upload format (17 columns)
sample_product_attribution_data-v2.csv  v2 enriched sample data — auto-loaded by the dashboard (50 products,
                                        includes attr_contrib_conversion, loyalty_attribute_score,
                                        return_risk_score, region, customer_age_group, price bands, etc.)

script.js                               LEGACY — old monolithic version, superseded by the modular files.
                                        Not referenced by any page and contains a syntax error. Safe to delete.
csv-data-loader.js                      LEGACY — uses window.fs.readFile (a sandbox-only API that does not
                                        exist in browsers). Not referenced by any page. Safe to delete.
```

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

Because this is a static site, "deployment" is just serving the folder over HTTP. **Do not open the pages via `file://`** — the dashboard loads its CSV with `fetch()`, which browsers block for local files, so you would only ever see the hard-coded fallback data. The CDN scripts (Chart.js, Anime.js) also require internet access.

### Run locally

From the repository root, use any static file server:

```bash
# Python (preinstalled on macOS/Linux)
python3 -m http.server 8000

# or Node
npx serve .
```

Then open `http://localhost:8000/` (which serves `index.html`) or `http://localhost:8000/dashboard.html`.

### GitHub Pages

1. Push the repository to GitHub (already done if you are reading this there).
2. In the repo: **Settings → Pages → Source: Deploy from a branch**, choose `main` and `/ (root)`, then save.
3. The site publishes at `https://<username>.github.io/AttributeintelligenceAgent/`.

No build configuration is needed since everything is served from the root.

### Netlify / Vercel / Cloudflare Pages

Create a new project from the repo and set:

- **Build command:** none
- **Publish / output directory:** `.` (repository root)

### Nginx / Apache / S3 + CloudFront

Copy the entire repository contents (including both CSV files) to the web root or bucket. Ensure `.csv` is served with a readable content type (default `text/csv` is fine) and that `sample_product_attribution_data-v2.csv` sits in the same directory as `dashboard.html`.

## Usage

1. Open the app — the agent console loads with an animated splash.
2. Click **Load Sample Lululemon Data** (or upload/drag-drop your own v1-format CSV).
3. Select an analysis card (Inventory Optimization, Dynamic Pricing, Customer Insights, or Product Recommendations) and click **Execute AI Analysis**.
4. Review the metrics dashboard, attribute revenue chart, recommendations, and insights. Export a JSON report or download a sample CSV from the action panel.
5. Optionally click **Activate Agents** in the Agentic AI Command Center to watch the simulated multi-agent activity feed.
6. Click **Strategic Dashboard** in the header to open the analytics dashboard, which auto-loads the v2 dataset; use the Conversion/Loyalty/Returns toggles and table filters to explore, or **Export** to download the attribute analysis as CSV.

Keyboard shortcuts on the console: `Ctrl+Enter` run analysis · `Ctrl+L` load sample data · `Ctrl+D` download sample CSV · `Ctrl+A` toggle agents · `Esc` close overlays. (Note these override the browser's default select-all and bookmark shortcuts while the page is focused.)

## Validation notes & known issues

All files loaded by the two pages pass a JavaScript syntax check (`node --check`). Issues worth knowing about:

- **`script.js` is broken but unused.** It has an unterminated string on line 412. Neither page references it — it is a leftover pre-modularization version. Delete it (along with `csv-data-loader.js`) to avoid confusion.
- **Simulated analytics.** Several displayed figures are hard-coded or randomized (e.g. "94.3% accuracy", agent confidence, "Peak Hour 7–9 PM", metric-change percentages, correlation heatmap values, seasonal trends, journey-stage numbers on the dashboard). Only the attribute aggregation figures reflect the loaded data.
- **Dashboard data drift.** `attribute-dashboard.js` "refreshes" every 10 seconds by adding small random deltas to the attribute metrics, so numbers slowly drift away from the actual CSV values the longer the page stays open.
- **Non-standard `event` usage.** `analysis-engine.js` reads the implicit global `event` inside `selectAnalysis()`. This works in current Chrome/Edge/Firefox/Safari but is deprecated.
- **Duplicate columns in the v2 CSV.** The header contains `category.1`, `purchases.2`, `return_rate.3`, etc. (artifacts of a pandas export). The loader reads the columns it needs by exact name, so this is harmless, but be aware when regenerating the dataset.
- **Untrusted CSV caution.** Parsed CSV values are inserted into the DOM via `innerHTML` without escaping. Only load CSV files you trust.
- **No offline mode.** Chart.js and Anime.js come from CDNs; the pages will render without charts/animations if offline. Vendor the libraries locally if you need air-gapped deployment.

## License

No license file is present. Add one before distributing.
