---
name: attribute-intelligence
description: Systematic five-phase methodology for analyzing product/SKU catalog data to find which attributes actually drive revenue, conversion, returns, and loyalty. Use this skill whenever the user uploads or references a product catalog, merchandising, or SKU-level export (CSV/Excel), or mentions product attributes, fabric/fit/color/style performance, assortment planning, pricing bands, catalog performance, SKU analytics, or conversion by attribute — or asks things like "which attributes drive sales", "which fabric sells best", "why are my returns high", "what should I stock more of", "analyze my product data", or "what's underperforming in my catalog" — even without the word "attribute". Triggers on an uploaded product CSV with no prompt text.
---

# Attribute Intelligence

A product catalog export is a pile of correlated numbers, not an opinion. Your job is to compute real aggregates from the data — via code execution, never by eyeballing or estimating — and reason about what they actually show. Every claim you make must trace back to a number you calculated in this session.

Work through the five phases below, in order. Do not skip Phase 3 (funnel & anomaly analysis) or the small-sample checks in it — they are what separates a real analysis from a plausible-sounding one.

## Phase 0 — Scope Check

Before starting, confirm this is product/catalog data. If the file has no attribute-like columns (fabric, color, fit, style, category, SKU, price) and no funnel columns (views, clicks, purchases, conversion), say plainly that this doesn't look like product catalog data and stop. Do not force the methodology onto web-analytics exports, financial statements, or unrelated datasets. Name what the file actually looks like instead.

## Phase 1 — Ingest & Validate

Use code execution (pandas) to read the file. Do not parse it by reading the raw text and guessing.

1. Detect the schema by header matching:
   - **v1 (console format, 17 columns)**: `product_id, product_name, category, style, fit, fabric, color, price, sustainability_score, views, cart_adds, purchases, revenue, return_rate, customer_rating, season, launch_date`
   - **v2 (dashboard/enriched format)**: adds `normalized_fabric`, `normalized_color`, `normalized_fit`, `normalized_style`, `normalized_price_band`, `region`, `city_tier`, `customer_age_group`, funnel columns (`impressions`, `product_views`, `clicks`, `click_through_rate`, `add_to_cart`, `add_to_cart_rate`, `conversion_rate`), and modeled scores (`attr_contrib_conversion`, `attr_contrib_return`, `attr_contrib_loyalty`, `return_risk_score`, `loyalty_attribute_score`, `top_attribute_influence`). v2 exports are known to carry duplicate-named columns (`category.1`, `purchases.2`, `return_rate.3`, etc.) from a messy source export — when you see `pandas` auto-suffix duplicates this way, pick the column that matches the documented semantics (usually the first occurrence for identity fields like category, and the raw base columns — `purchases`, `revenue`, `return_rate` — over their `.N` duplicates for computed metrics, unless a later duplicate is clearly the corrected/enriched version). State which duplicate you used and why.
   - **Unknown**: if headers don't clearly match either schema, list the actual columns found and infer what's usable rather than assuming one of the two schemas.
2. Handle BOM, `\r\n` line endings, and quoted fields with embedded commas — pandas' default CSV parser handles these; don't hand-roll a parser.
3. Report before analyzing: row count, column count, any columns with missing/null values (and what % missing), and any columns you are ignoring (and why — e.g., free-text fields, redundant duplicate columns).
4. Never invent a value for a missing column. If `views`, `purchases`, or `revenue` is absent, say explicitly which downstream analyses become impossible (e.g., "no `views` column — conversion rate cannot be computed, only revenue and return-rate rollups are possible") rather than substituting a proxy silently.

## Phase 2 — Aggregate

Compute per-attribute rollups via code execution, grouping by each available dimension: fabric, color, fit, style, category, price band (bucket `price` if no `normalized_price_band` exists — document your bucket edges), region, age group, and season — whichever the schema provides. For each dimension × value, compute:

- Revenue (sum) and revenue share (% of catalog total)
- Conversion rate = purchases ÷ views (or ÷ `product_views` / `impressions` in v2 — state which denominator you used)
- Cart-to-purchase rate = purchases ÷ cart_adds (or ÷ `add_to_cart`)
- Average return rate
- Average customer rating
- Unit velocity = purchases per product (purchases ÷ product count in that group)
- Product count (n) — this is your sample size; carry it into every later phase

All of these are computed values. Do not describe a number you have not actually calculated in code.

## Phase 3 — Funnel & Anomaly Analysis

1. **Funnel drop-off by attribute**: for each attribute value, compute the views → cart_adds → purchases drop-off ratios. Flag attributes with unusually steep drop at a specific stage (e.g., high cart-add rate but low purchase completion — a checkout/price friction signal, not a demand signal).
2. **Statistical outliers**: compute the catalog-wide mean and standard deviation for conversion rate and return rate. Flag any attribute value whose group average deviates more than 1 standard deviation from the catalog mean. Report the actual mean, standard deviation, and the flagged value's distance from it.
3. **Small-sample traps — mandatory**: any attribute value backed by fewer than 5 products OR fewer than 500 total views must be explicitly labeled low-confidence in every subsequent phase where it's mentioned. State the actual n and view count. Never assign a fake confidence percentage — "n=3 products, 890 views — treat this as a signal to watch, not a conclusion" is the correct framing, not "87% confidence."

## Phase 4 — Insight Synthesis

This is where you reason — grounded only in the numbers from Phases 2–3. Every insight must cite the specific figures behind it (revenue, conversion rate, n, standard deviations, etc.). Cover, wherever the data supports it:

- **Revenue concentration risk**: is revenue concentrated in one or two attribute values? State the % share and how many distinct values it's spread (or not spread) across.
- **Underpriced / overpriced attribute combinations**: cross-reference price band against conversion rate and return rate — does a combination convert well but sit in a low price band (headroom), or convert poorly at a high price band (resistance)?
- **Return-risk drivers**: which attribute values carry return rates meaningfully above the catalog average, and at what volume (a high return rate on a low-volume item matters less than the same rate on a top-seller)?
- **Seasonal patterns** (only if `season` or `launch_date` present): does performance cluster by season or by recency since launch?
- **Whitespace**: attribute values with above-average conversion rate but below-average catalog coverage (few SKUs) — a signal for expansion, not proof of it.

Explicitly separate correlation from causation. "Black converts best" describes what the data shows, not why — note that it may reflect assortment depth, marketing placement, or price positioning rather than color preference itself, unless the data lets you rule those out.

## Phase 5 — Recommendations

Produce a ranked list, organized under the four lenses below (only include a lens if the data supports at least one recommendation there — don't pad):

- **Inventory** — what to stock more/less of
- **Pricing** — where price is misaligned with demonstrated demand or resistance
- **Customer** — segment- or loyalty-related actions (only if region/age-group/loyalty data exists)
- **Product** — assortment/design recommendations (whitespace, underperforming combinations)

Each recommendation must include:
1. **The action** — specific and concrete
2. **The evidence** — the exact numbers from Phase 2–3 that support it
3. **Expected impact direction** — up/down on which metric, not a fabricated magnitude unless the data supports estimating one
4. **The caveat/assumption** — what would have to be true for this to work, and any small-sample or correlation-vs-causation flag that applies

## Hard Rules

- Never fabricate a number. If you did not compute it in this session from the actual data, do not state it.
- Always state sample sizes (n products, n views) alongside any rate or average.
- Never present correlation as causation.
- Never simulate confidence scores, model accuracy percentages, or any other invented metric of certainty. Describe confidence in words tied to sample size ("well-supported, n=42 products / 38K views" vs "thin evidence, n=3 products").
- If the uploaded file is not product/catalog data, say so in Phase 0 and stop — do not force this methodology onto it.
- If a schema-required column is missing, name exactly which analyses become impossible instead of substituting an estimate.

## Output Format

Structure the final response as:

1. **Schema & data quality** — detected schema (v1/v2/unknown), row count, missing data, ignored columns, duplicate-column decisions (Phase 1)
2. **Attribute performance summary** — the key rollup tables (Phase 2), condensed to the top and bottom performers per dimension, not every row
3. **Funnel & anomaly flags** — outliers and small-sample cautions (Phase 3)
4. **Insights** — grouped by category, each citing its evidence (Phase 4)
5. **Recommendations** — ranked, grouped by Inventory / Pricing / Customer / Product, each with action / evidence / impact direction / caveat (Phase 5)

Two well-evidenced insights beat ten padded ones. If a phase genuinely has nothing notable (e.g., no seasonal pattern exists), say so briefly rather than manufacturing a finding.
