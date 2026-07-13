# Attribute Intelligence Agent 🧵

**Finds which product attributes actually drive your sales.**

A product catalog export is full of correlated numbers — fabric, color, fit, style, price, region — but nobody has time to pivot-table all of it by hand. Attribute Intelligence Agent gives Claude a rigorous, five-phase analyst methodology to turn a raw catalog CSV into real attribute-performance findings: computed via code execution, reasoned about by Claude, never simulated.

It's the merchandising counterpart to our other plugin, [Dashboard Discovery Agent](https://github.com/GAMI-Solutions/dashboarddiscoveryagent) — that one audits *dashboards* someone already built; this one analyzes the *raw catalog data* behind them.

## What it does

Upload a product/SKU catalog CSV and ask Claude to analyze it. You get:

- **Data quality report** — detected schema, row count, missing values, columns ignored, and how ambiguous/duplicate columns were resolved
- **Attribute performance rollups** — revenue, conversion rate, cart-to-purchase rate, return rate, rating, and unit velocity per fabric / color / fit / style / price band / region / age group — all computed, never estimated
- **Funnel & anomaly flags** — statistical outliers (>1 SD from the catalog mean) and explicit small-sample warnings instead of fake confidence scores
- **Insights** — revenue concentration risk, pricing misalignment, return-risk drivers, seasonal patterns, whitespace opportunities, each citing the numbers behind it
- **Ranked recommendations** — grouped under Inventory, Pricing, Customer, and Product, each with the action, the evidence, the expected direction of impact, and the caveat

## Install

From Claude Code:

```
/plugin marketplace add GAMI-Solutions/attributeintelligenceagent
/plugin install attributeintelligenceagent@attributeintelligenceagent-marketplace
```

## Use

1. Attach a product catalog CSV (see supported schemas below).
2. Ask anything like:
   - "Analyze this product catalog"
   - "Which fabric sells best?"
   - "Why are my returns high?"
   - "What should I stock more of?"
   - Or just upload the file with no prompt — the skill triggers on its own.
3. For a deep audit of one or more catalog snapshots, the bundled **attributeintelligenceagent** subagent runs the full methodology end to end and can compare snapshots over time.

## Supported CSV schemas

**v1 — console format (17 columns):**

```
product_id, product_name, category, style, fit, fabric, color, price,
sustainability_score, views, cart_adds, purchases, revenue, return_rate,
customer_rating, season, launch_date
```

**v2 — enriched/dashboard format:** everything in v1 plus `normalized_fabric`, `normalized_color`, `normalized_fit`, `normalized_style`, `normalized_price_band`, `region`, `city_tier`, `customer_age_group`, funnel columns (`impressions`, `product_views`, `clicks`, `click_through_rate`, `add_to_cart`, `add_to_cart_rate`, `conversion_rate`), and modeled scores (`attr_contrib_conversion`, `attr_contrib_return`, `attr_contrib_loyalty`, `return_risk_score`, `loyalty_attribute_score`, `top_attribute_influence`). Real-world v2 exports often carry duplicate-named columns (`category.1`, `purchases.2`, etc.) from a messy source system — the skill documents how it resolves these rather than silently picking one.

Any other tabular file with recognizable attribute + funnel columns will be analyzed on a best-effort basis; anything that isn't product data gets a plain "this isn't catalog data" response instead of a forced analysis.

## What's inside

```
attributeintelligenceagent/
├── .claude-plugin/
│   ├── plugin.json                      # plugin manifest
│   └── marketplace.json                 # makes this repo directly installable as a marketplace
├── skills/
│   └── attribute-intelligence/
│       └── SKILL.md                     # the methodology (the "brain")
├── agents/
│   └── attributeintelligenceagent.md    # deep-analysis subagent
├── README.md
├── PRIVACY.md
└── LICENSE
```

## Methodology (short version)

1. **Scope check** — is this actually product catalog data? If not, say so and stop.
2. **Ingest & validate** — read with pandas, detect v1/v2/unknown schema, handle duplicate columns and messy formatting, report data quality up front
3. **Aggregate** — real per-attribute rollups: revenue, conversion, cart-to-purchase, returns, rating, velocity, sample size
4. **Funnel & anomaly analysis** — drop-off by attribute, statistical outliers, mandatory small-sample warnings
5. **Insight synthesis & recommendations** — reasoning grounded only in the computed numbers, ranked actions across Inventory / Pricing / Customer / Product

Design principle: **never fabricate a number.** If it wasn't computed in this session from the actual file, it doesn't appear in the report. Sample sizes are stated everywhere; correlation is never presented as causation.

## Limitations

- Data-only: it analyzes the catalog file you provide. It does not connect to any live commerce platform, warehouse, or database — that's a natural extension for a future MCP server.
- Quality of insight depends on the columns present. Missing a `views` or `purchases` column means conversion analysis becomes impossible, and the skill will say so rather than guess.

## Roadmap

- [x] v1.0 — CSV/catalog-based methodology, v1 and v2 schema support
- [ ] Live commerce-platform MCP connector (Shopify, etc.)
- [ ] Multi-snapshot trend tracking across uploads
- [ ] Scheduled catalog health checks

## Author

Gami Solutions — muthu@gami-solutions.com

## License

MIT — see [LICENSE](LICENSE).
