// netlify/functions/analyze.js
//
// Bridges the static front end to the Anthropic API. The browser sends only
// AGGREGATED numbers (never the raw CSV) computed by analysis-engine.js; this
// function asks Claude to reason over those numbers and return strictly
// structured JSON (insights / recommendations / agentNarrative).
//
// ANTHROPIC_API_KEY must be set as a Netlify environment variable. It is
// read from process.env here and never sent to, or echoed back to, the
// browser.
//
// Free-tier constraint: Netlify's synchronous functions are killed at ~10s.
// We cap max_tokens at 1200, keep the prompt tight, and give the Anthropic
// call its own 8s timeout so we can return a clean error before Netlify's
// hard kill.

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 1200;
const ANTHROPIC_TIMEOUT_MS = 8000;
const MAX_PAYLOAD_BYTES = 100 * 1024; // ~100 KB, per spec
const ALLOWED_ANALYSIS_TYPES = ['inventory', 'pricing', 'customer', 'recommendations'];

// Best-effort in-memory rate limit. Resets on cold start; not a substitute
// for a real rate limiter, but cheap insurance against a runaway client.
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const requestLog = new Map(); // ip -> [timestamps]

const SYSTEM_PROMPT = `You are a retail merchandising analyst. You will be given ALREADY-COMPUTED aggregate statistics from a product catalog (revenue, conversion rates, return rates, funnel counts, and flagged anomalies) for one analysis lens. You did not compute these numbers yourself - trust them as given.

Rules:
- Reason ONLY from the numbers provided. Never invent a statistic that is not present in the input.
- Every insight and every recommendation must cite specific numbers from the input (e.g. "Warpstreme: $2.32M revenue across 12 SKUs, 12.6% conversion").
- If an attribute value is flagged as low-sample (small n or low views), say so explicitly and lower your confidence in words - never invent a numeric confidence score.
- Distinguish correlation from causation. Do not claim an attribute "causes" an outcome; describe what the data shows and name plausible confounds when relevant.
- If the provided data is too thin to support a category (insights or recommendations), return an empty array for it rather than padding with generic advice.
- Respond with ONLY a raw JSON object - no markdown code fences, no commentary before or after - matching exactly this shape:
{
  "insights": [ { "title": "", "detail": "", "evidence": "", "severity": "info|warning|opportunity" } ],
  "recommendations": [ { "action": "", "rationale": "", "evidence": "", "priority": 1 } ],
  "agentNarrative": { "strategy": "one paragraph summarizing the strategic reasoning", "action": "one paragraph summarizing the prioritized actions" }
}`;

exports.handler = async (event) => {
  const cors = {
    'Content-Type': 'application/json',
  };

  if (event.httpMethod !== 'POST') {
    return respond(405, { error: 'Method not allowed. Use POST.' }, cors);
  }

  const ip =
    (event.headers && (event.headers['x-nf-client-connection-ip'] || event.headers['client-ip'])) ||
    'unknown';

  if (isRateLimited(ip)) {
    return respond(429, { error: 'Rate limit exceeded. Try again in a minute.' }, cors);
  }

  const rawBody = event.body || '';
  const bodyBytes = Buffer.byteLength(rawBody, 'utf8');
  if (bodyBytes > MAX_PAYLOAD_BYTES) {
    return respond(413, { error: `Payload too large (${bodyBytes} bytes). Max is ${MAX_PAYLOAD_BYTES} bytes - send aggregated data only, never the raw CSV.` }, cors);
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch (err) {
    return respond(400, { error: 'Invalid JSON body.' }, cors);
  }

  const { analysisType, catalogSummary, attributeAggregates, funnelStats, anomalies } = payload || {};

  if (!ALLOWED_ANALYSIS_TYPES.includes(analysisType)) {
    return respond(400, { error: `analysisType must be one of: ${ALLOWED_ANALYSIS_TYPES.join(', ')}` }, cors);
  }
  if (!catalogSummary || !attributeAggregates) {
    return respond(400, { error: 'catalogSummary and attributeAggregates are required.' }, cors);
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return respond(500, { error: 'Server is not configured with an API key. Set ANTHROPIC_API_KEY in Netlify environment variables.' }, cors);
  }

  const userMessage = buildUserMessage({ analysisType, catalogSummary, attributeAggregates, funnelStats, anomalies });

  try {
    const first = await callClaude(userMessage);
    const parsed = tryParseJson(first);
    if (parsed) {
      return respond(200, parsed, cors);
    }

    // Retry once with an explicit reminder if the first response wasn't valid JSON.
    const retryMessage = `${userMessage}\n\nYour previous response was not valid JSON. Respond with ONLY the raw JSON object described in the system prompt - no markdown fences, no prose.`;
    const second = await callClaude(retryMessage);
    const parsedRetry = tryParseJson(second);
    if (parsedRetry) {
      return respond(200, parsedRetry, cors);
    }

    return respond(502, { error: 'Claude did not return valid JSON after a retry.' }, cors);
  } catch (err) {
    if (err.name === 'AbortError') {
      return respond(504, { error: 'Analysis timed out. Try a narrower analysis type or fewer attributes.' }, cors);
    }
    return respond(502, { error: `Upstream error: ${err.message}` }, cors);
  }
};

function buildUserMessage({ analysisType, catalogSummary, attributeAggregates, funnelStats, anomalies }) {
  return [
    `Analysis lens requested: ${analysisType}`,
    '',
    'catalogSummary:',
    JSON.stringify(catalogSummary),
    '',
    'attributeAggregates (per dimension, top attributes only):',
    JSON.stringify(attributeAggregates),
    '',
    'funnelStats:',
    JSON.stringify(funnelStats || {}),
    '',
    'anomalies (statistical outliers / small-sample flags):',
    JSON.stringify(anomalies || []),
  ].join('\n');
}

async function callClaude(userMessage) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ANTHROPIC_TIMEOUT_MS);

  try {
    const res = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Anthropic API returned ${res.status}: ${text.slice(0, 300)}`);
    }

    const data = await res.json();
    const textBlock = (data.content || []).find((block) => block.type === 'text');
    if (!textBlock) {
      throw new Error('No text content in Anthropic response.');
    }
    return textBlock.text;
  } finally {
    clearTimeout(timeout);
  }
}

function tryParseJson(rawText) {
  if (!rawText) return null;
  // Defensively strip ```json ... ``` or ``` ... ``` fences if the model adds them anyway.
  const stripped = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  try {
    const obj = JSON.parse(stripped);
    if (obj && typeof obj === 'object') {
      return {
        insights: Array.isArray(obj.insights) ? obj.insights : [],
        recommendations: Array.isArray(obj.recommendations) ? obj.recommendations : [],
        agentNarrative: obj.agentNarrative && typeof obj.agentNarrative === 'object'
          ? obj.agentNarrative
          : { strategy: '', action: '' },
      };
    }
    return null;
  } catch (err) {
    return null;
  }
}

function isRateLimited(ip) {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX_REQUESTS;
}

function respond(statusCode, body, headers) {
  return {
    statusCode,
    headers,
    body: JSON.stringify(body),
  };
}
