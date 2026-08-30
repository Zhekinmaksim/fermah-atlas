# Fermah Atlas

Unofficial community archive of the Fermah ecosystem. Static site, no build step.

## Pages

| file | what it is |
|---|---|
| `index.html` | hero, four doors, what Fermah is, ecosystem graph, latest spotlight, sources |
| `powered.html` | Powered by Fermah — production and announced integrations |
| `built-with.html` | Built with Fermah — projects on Fermah's architecture, plus the submit form |
| `fermafia.html` | Fermafia — 130 creators, searchable, card + post + download |
| `operators.html` | Operators — the supply side and the on-chain node registry |
| `play.html` | Play with Fermah — question of the day, memory, 2048 |
| `c/<handle>.html` | one page per creator, own title and own og:image |

## Where things live

- `assets/atlas.js` — the `ECOSYSTEM` object (every ecosystem fact, each with `source`
  and `checked`), the header/footer, the graph, `CONTACT`.
- `assets/games.js` — the three games and the score client.
- `assets/hero.js` — the pixel backdrop.
- `assets/site.css` — brand tokens (`#001030`, `#06C19D`) and all styles.
- `data/seed.js` — the Spotlight record, loaded as a script so the site works from disk too.
- `cards/`, `brand/` — creator cards and logo assets.
- `api/scores.js` — shared leaderboard (optional, see below).

## Before launch

1. **Email.** `CONTACT` in `assets/atlas.js` is `fermahatlas@gmail.com`. It powers footer
   feedback, profile removal and the email fallback on the submit form.
2. **Moderation queue.** `REPO` in `built-with.html` points at `Zhekinmaksim/fermah-atlas`.
   Submissions open a pre-filled GitHub issue there — create the repo (or change the
   constant) and watch it. Nothing publishes automatically: you read the issue and, if it
   holds up, add an entry to `ECOSYSTEM.builtWith` with a source and a check date.

## Weekly update

```
python add_week.py --text w17.txt          # updates the seed and all cards
cp seed.json site/data/seed.json
python gen_pages.py --seed site/data/seed.json --site site   # creator pages + sitemap
python -c "import json;d=json.load(open('site/data/seed.json'));open('site/data/seed.js','w').write('window.SEED = '+json.dumps(d,ensure_ascii=False,separators=(',',':'))+';')"
cp cards/*.png site/cards/
```

Counts, the creator list, the latest-spotlight block and the timelines all follow the seed.

## The shark assistant

`assets/assistant.js` is the widget; `api/ask.js` is everything that matters. The Anthropic
key lives in the server environment and never reaches the browser.

```
Vercel -> Settings -> Environment Variables
  ANTHROPIC_API_KEY = sk-ant-...
  ANTHROPIC_WORKSPACE_ID = wrkspc_...   (required for identity-linked keys)
```

The assistant is pinned to `claude-haiku-4-5-20251001`, so `ASSISTANT_MODEL` is not needed.

How it is fenced in, in order:

1. Blocked outright before any request is sent: price, token, airdrop, listing, investment
   wording, and the usual injection phrasings ("ignore previous", "act as", "developer mode").
2. Questions are capped at 400 characters and 8 per minute per IP.
3. The system prompt allows one topic only, forbids answering from the model's own knowledge,
   and treats the user's text as data rather than instructions.
4. The model only sees a curated `KB` extract of the official site and docs, picked by keyword.
   If the answer is not in there, it says so and points at docs.fermah.xyz.
5. The reply must come back as `{"on_topic": …, "answer": …}`. Anything with `on_topic: false`
   is replaced by the fixed refusal line before it reaches the browser.

To teach it something new, add an entry to `KB` with its source URL. That is the only way its
knowledge grows — there is no scraping and no training.

## Operator registry

`operators.html` renders from `data/operators.js`, which ships empty. To fill it, take the
Fermah AVS service manager address from
[fermah-xyz/avs-metadata](https://github.com/fermah-xyz/avs-metadata) and run:

```
python tools/fetch_operators.py --rpc <sepolia rpc> --address 0x... --from-block 0x0
```

It reads registration events and writes the file. Nothing is written that the chain did not
return, and labels for addresses are added by hand, only when an operator asks.

## Leaderboard (optional)

The games keep a personal best in `localStorage` and work with no backend. For a shared
board, on Vercel: **Storage → Create → KV**, link it to the project, redeploy. `api/scores.js`
picks the credentials up from the environment; until then it answers 501 and the games
fall back to local bests.

## Deploy

Vercel → Add New → Project → import the repo. Framework preset **Other**, root directory
`site`, no build command. Then Settings → Domains → add `fermahatlas.xyz` and point the
DNS records Vercel shows you. `vercel.json` turns on clean URLs, so `/play` works without
the `.html`.

## Local preview

`data/seed.js` loads as a script, so opening `index.html` from disk works. The leaderboard
needs the API, so use a server if you want to test it:

```
cd site && python3 -m http.server 8000
```

## Rules this site keeps

- Every ecosystem entry carries a source link and a check date.
- Relationships not stated on the current fermah.xyz are drawn dashed and labelled announced.
- A project keeps the label its author gave it — a reference model says so.
- X handles only. No Discord identifiers anywhere in the data.
- Suspended accounts are excluded from all counts.
