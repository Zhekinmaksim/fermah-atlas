# Fermah Atlas — motion reel

26 seconds, 786 frames at 30 fps. Twelve bars, one idea per bar.

```
npm install
npm run dev            # Remotion Studio
npm run render         # out/fermah-atlas-motion.mp4
```

Square and vertical cuts are separate compositions: `MotionSquare`, `MotionVertical`.

## The music

`public/motion.mp3` is cut from **Grid Cut at 2:13.25 → 2:39.43**, normalised to -14 LUFS.
The track runs at 110 BPM, so a beat is 16.36 frames and a bar is 65.45. The cut starts
exactly on the lift, and every scene boundary below is a whole bar — which is why a new
idea lands on a downbeat roughly every 2.2 seconds.

| bar | frames | seconds | scene |
|---|---|---|---|
| 1 | 0–65 | 0.0–2.2 | the A assembles out of nothing |
| 2 | 65–131 | 2.2–4.4 | FERMAH ATLAS, unofficial community archive |
| 3 | 131–196 | 4.4–6.5 | 22 weeks, 136 creators, 84 selected, 187 mentioned — counted up |
| 4 | 196–262 | 6.5–8.7 | who runs on it: Kernel, Froben, Flashcast |
| 5 | 262–327 | 8.7–10.9 | and who makes the proofs: keys, whitelist, EigenLayer, telemetry |
| 6 | 327–393 | 10.9–13.1 | the card wall, two rows against each other |
| 7 | 393–458 | 13.1–15.3 | fermahatlas.xyz/c/nyuella types itself out |
| 8 | 458–524 | 15.3–17.5 | the shark, including the refusal |
| 9 | 524–589 | 17.5–19.6 | hard switch to light: EVERY WEEK |
| 10 | 589–655 | 19.6–21.8 | 22 weeks filling in, the newest one white |
| 11 | 655–720 | 21.8–24.0 | the wall again, second phase |
| 12 | 720–786 | 24.0–26.2 | end card: domain and handle |

## How it is built

No footage and no video generation: every frame is drawn from code. The marks and
wordmarks are the same pixel grids the site and the cards use (`src/grids.ts`), the cards
in the wall are the real PNGs the archive serves, and the shark is a 24-frame PNG sequence
indexed by frame number so the animation is deterministic at render time.

`src/motion/kit.tsx` holds the four moves the reel is made of: `Stage` (brand grid plus a
one-frame flash on the downbeat), `Slam` (type that overshoots and settles), `Count`
(numbers that tick up over a beat and a half) and `Pixels` (the grid renderer). Bar 9
inverts the whole stage to teal for exactly one bar — the hard light/dark switch that
keeps a reel from feeling flat.

## Changing it

Timing lives in `src/motion/theme.ts`: change `BAR` if the track changes, and every scene
moves with it. Content lives in the scene components at the top of `src/Motion.tsx` —
numbers, chip labels, the handle that gets typed.
