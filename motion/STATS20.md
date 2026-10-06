# Season statistics reel — with faces

19.6 seconds, 589 frames, nine bars at 110 BPM. `npm run render:stats`.

The reel opens on people, not on type: 128 active creators from the archive as a wall of faces that opens
in a wave from the centre outwards, and the title lands on top of it. After that, every
number has a face attached — the four longest runs, the longest comeback, the twelve most
recent tier-ups — and the light switch in bar 7 brings the wall back with everyone who
appeared only once fading into the background.

## How a face appears

`src/motion/faces.tsx`. Each avatar opens like a square iris from its centre (a
`clip-path: inset()` going from 50% to 0 over nine frames), rides a spring that overshoots
by a few percent, and a teal frame draws itself round it half a beat later. Square, not
round, so it matches the pixel grid of the logo and the cards. A creator without an avatar
gets an initials tile in the same frame, never an empty slot.

The wall's wave is the same move with a delay set by each tile's distance from the centre.

## Method

The reference for the way of working is @l3d1c's Remotion launch ad on Skillry: every cut on
a fixed beat grid, and a contact sheet of stills checked before a single video render.
`stats20-faces-contact.png` is that sheet for this reel, drawn with the real avatars.

All numbers come from `src/statsData.ts`, regenerated with `npm run sync:data` from
the audited `site/data/stats.json` and `seed.json`. The active totals are 22 weeks,
178 creators, 109 selection credits, and 279 mentions; 79 creators appeared once
and 99 returned. Suspended accounts are excluded. The longest comeback is
Iamolaniyi_: fourteen absent weeks between week 5 and week 20. Prince_swago's gap
is thirteen weeks after the corrected week 4 appearance.

`npm run verify:data -- ../site/data` verifies the generated numbers and week 22
records. `npm run verify:stills` creates contact sheets in `out/stills/` before
rendering. `npm run verify:media` checks both encoded MP4s and samples every scene.
