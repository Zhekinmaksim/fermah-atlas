/**
 * Fermah Atlas — shared Fermafia Board.
 *
 * GET  /api/board           -> {items, counts}
 * POST /api/board           {category, title, body, handle}
 *
 * Entries are intentionally short and public. Upstash Redis keeps the board
 * shared across visitors; without a linked store the endpoint returns 501.
 */
import crypto from "node:crypto";

const CATEGORIES = new Set(["ideas", "build", "help", "research"]);
const KEY = "atlas:fermafia-board";
const MAX_ITEMS = 120;
const hits = new Map();

function text(value, max) {
  return String(value || "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function handle(value) {
  return String(value || "")
    .replace(/^@+/, "")
    .replace(/[^A-Za-z0-9_]/g, "")
    .slice(0, 32);
}

function limited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((stamp) => now - stamp < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 3;
}

async function store() {
  try {
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
    if (!url || !token) return null;
    const {Redis} = await import("@upstash/redis");
    return new Redis({url, token});
  } catch {
    return null;
  }
}

function responseItems(rows) {
  return rows.map((row) => {
    if (row && typeof row === "object") return row;
    try { return JSON.parse(row); } catch { return null; }
  }).filter(Boolean);
}

export default async function handler(req, res) {
  const kv = await store();
  if (!kv) {
    res.status(501).json({error: "board storage not configured"});
    return;
  }

  if (req.method === "GET") {
    const rows = responseItems(await kv.lrange(KEY, 0, MAX_ITEMS - 1));
    const counts = {ideas: 0, build: 0, help: 0, research: 0};
    rows.forEach((item) => { if (counts[item.category] !== undefined) counts[item.category] += 1; });
    res.setHeader?.("Cache-Control", "no-store");
    res.status(200).json({items: rows, counts});
    return;
  }

  if (req.method === "POST") {
    const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "local";
    if (limited(ip)) {
      res.status(429).json({error: "too many board posts"});
      return;
    }
    const body = req.body || {};
    const category = String(body.category || "").toLowerCase();
    const title = text(body.title, 120);
    const detail = text(body.body, 600);
    const author = handle(body.handle);
    if (!CATEGORIES.has(category) || title.length < 8 || detail.length < 12) {
      res.status(400).json({error: "category, title and a short description are required"});
      return;
    }

    const item = {
      id: crypto.randomUUID(),
      category,
      title,
      body: detail,
      handle: author,
      votes: 0,
      createdAt: new Date().toISOString(),
    };
    await kv.lpush(KEY, JSON.stringify(item));
    await kv.ltrim(KEY, 0, MAX_ITEMS - 1);
    res.status(201).json({ok: true, item});
    return;
  }

  res.status(405).json({error: "method not allowed"});
}
