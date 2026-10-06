# Spotlight Week 22 — motion reel

26 seconds, 786 frames at 30 fps, twelve bars at 110 BPM. One beat of the story per bar.

```
npm install
npm run dev               # Remotion Studio
npm run render            # out/spotlight-week-22.mp4
npm run render:vertical   # 9:16 for stories
npm run render:square     # 1:1
```

## The story it tells

| bar | seconds | beat |
|---|---|---|
| 1 | 0.0–2.2 | WEEK 22 — five selected, twenty mentioned |
| 2 | 2.2–4.4 | The two longest selection runs ended |
| 3 | 4.4–6.5 | @Nyuella — five in a row, weeks 17–21, the strip fading on 22 |
| 4 | 6.5–8.7 | @legendary54321 four selections, @Adityapunk01 five appearances |
| 5 | 8.7–10.9 | light switch: three five-week appearance runs ended |
| 6 | 10.9–13.1 | the five selected names, one per half-beat |
| 7 | 13.1–15.3 | @Bilalearn — the only active selection run of two or more weeks |
| 8 | 15.3–17.5 | the twenty mentions, filling in |
| 9 | 17.5–19.6 | 10 of 25 names had never been in the record |
| 10 | 19.6–21.8 | those ten, named |
| 11 | 21.8–24.0 | longest active appearance runs: @illfated_fr 5, @Faizan626371 4 |
| 12 | 24.0–26.2 | every week since May, kept — fermahatlas.xyz |

The reel covers week 22, dated October 4, 2026. It opens with the two longest
selection runs ending, then shows three five-week appearance runs ending. Bar 9
turns to ten new creators out of twenty-five names. This is not the season's largest
intake: week 18 introduced twelve active creators.

## Where the numbers come from

Every figure comes from the audited `site/data/stats.json` and `seed.json`, excluding
suspended accounts and preserving established collaboration credits and week dates.
`npm run sync:data` regenerates `src/statsData.ts`, including the week 22 names and
record strips. A filled cell is a selection, an outlined cell a mention, and a gap
is a week that creator missed. Nyuella's five is the longest selection run;
cryptomasterAJ's six is the longest appearance run.

## Making next week's cut

Copy `src/Week22.tsx` to `src/Week23.tsx`, update the data generator and narrative for
the audited week, and register it in `src/Root.tsx`. The timing and music can be reused.
