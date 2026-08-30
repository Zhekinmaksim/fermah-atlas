/**
 * Fermah Atlas — shared leaderboard.
 *
 * GET  /api/scores?game=2048   -> [{name, score}]  top 20
 * POST /api/scores  {game,name,score}
 *
 * Uses Upstash Redis provisioned through Vercel Marketplace. Until a store is
 * linked the endpoint returns 501 and the games fall back to local bests.
 */
const GAMES = new Set(["2048", "memory"]);
const clean = s => String(s || "").replace(/[^A-Za-z0-9_]/g, "").slice(0, 20);

async function kv() {
  try {
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
    if (!url || !token) return null;
    const {Redis} = await import("@upstash/redis");
    return new Redis({url, token});
  } catch { return null; }
}

export default async function handler(req, res) {
  const store = await kv();
  if (!store) {
    res.status(501).json({ error: "leaderboard not configured" });
    return;
  }

  if (req.method === "GET") {
    const game = String(req.query.game || "");
    if (!GAMES.has(game)) { res.status(400).json({ error: "unknown game" }); return; }
    const rows = await store.zrange(`atlas:lb:${game}`, 0, 19, { rev: true, withScores: true });
    const out = [];
    for (let i = 0; i < rows.length; i += 2) out.push({ name: rows[i], score: Number(rows[i + 1]) });
    res.status(200).json(out);
    return;
  }

  if (req.method === "POST") {
    const { game, name, score } = req.body || {};
    const n = clean(name);
    const s = Math.floor(Number(score));
    if (!GAMES.has(game) || !n || !Number.isFinite(s) || s < 0 || s > 10_000_000) {
      res.status(400).json({ error: "bad submission" });
      return;
    }
    const key = `atlas:lb:${game}`;
    const prev = await store.zscore(key, n);
    if (prev === null || s > Number(prev)) await store.zadd(key, { score: s, member: n });
    res.status(200).json({ ok: true, best: Math.max(s, Number(prev || 0)) });
    return;
  }

  res.status(405).json({ error: "method not allowed" });
}
