# Fermah Atlas — 45 second promo

Remotion 4.0.518. 1350 frames at 30 fps.

```
npm install
npm run dev        # studio
npm run render     # out/fermah-atlas-45s.mp4
```

## The music

`public/audio.mp3` is cut from **Midnight Relay at 3:32.10 → 4:17.10**, normalised to
-14 LUFS with a 1 s fade at the tail.

That window was picked by measuring the track: energy, onset density and steadiness across
every 30 s window. The largest energy jump in the whole six minutes sits at **3:40.1** —
a sparse, gated breakdown that snaps into the fullest groove of the track. The cut starts
eight seconds before it, so the video gets a quiet opening for the logo and a hard landing
for the headline.

The track runs at **120.25 BPM**, close enough to 120 that a beat is 15 frames and a bar is
60. Every cut in `src/theme.ts` is a multiple of a bar, and the drop lands on frame 240.

## Cuts

| frames | seconds | scene |
|---|---|---|
| 0–240 | 0:00–0:08 | logo assembles pixel by pixel, wordmark, kicker |
| 240–360 | 0:08–0:12 | headline on the drop, the four Fermah figures with a source line |
| 360–540 | 0:12–0:18 | the five sections, one per beat |
| 540–660 | 0:18–0:22 | ecosystem graph, edges drawing in order |
| 660–780 | 0:22–0:26 | operators — how a prover node joins |
| 780–900 | 0:26–0:30 | the Fermafia card wall and the archive counters |
| 900–1020 | 0:30–0:34 | one creator page, the address typing itself |
| 1020–1140 | 0:34–0:38 | the shark assistant, including a refusal |
| 1140–1260 | 0:38–0:42 | the weekly update, week 17 landing |
| 1260–1350 | 0:42–0:45 | wordmark, fermahatlas.xyz, @fermah_atlas |

`components/Tag.tsx` keeps **fermahatlas.xyz / @fermah_atlas** in the bottom-right corner from
the drop until the end card, so the address is on screen for 35 of the 45 seconds even if
someone watches muted and scrolls past the ending.

## What comes from 4.0.518

- **Mirrored audio spectrum** — the shape added to the Elements catalog in this release,
  rebuilt in `components/Spectrum.tsx` from `visualizeAudio` so it stays on brand: square
  pixels, one colour, no gradients.
- **Social safe zones** — `components/SafeZones.tsx`. Flip `safeZones` in the Studio props
  panel while composing the square and vertical cuts.
- `@remotion/media` now uses Mediabunny retry defaults; if you switch the audio import to
  `import {Audio} from "@remotion/media"` you get that path. Core `<Audio>` is used here
  because it needs no extra setup.
- Studio in this release also ships WebMCP tools, so an agent can drive the timeline —
  irrelevant to the render, handy while editing.

## Swapping content

Everything on screen comes from three places: `src/theme.ts` for colour and timing,
`src/grids.ts` for the pixel logo, and the arrays at the top of each scene. The card wall
reads `public/cards/*.png` — the same files the site serves, so a new Spotlight week means
copying the new cards in and re-rendering.
