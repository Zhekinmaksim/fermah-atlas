import React from "react";
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from "remotion";
import {Eyebrow} from "../components/Type";
import {DISPLAY, MONO, DIM, RULE, TEAL, WHITE} from "../theme";

const CARDS = [
  "0x_angelarts", "bruno_jr_talent", "cd_sh51200", "eam__sha", "mr_satoshiii", "newko20110815",
  "oxkimia", "sah4r_core", "sarcastic_au", "shantelledore", "sn0wflakk", "themoewithin",
];
const STATS = [["136", "CREATORS"], ["17", "WEEKS"], ["84", "SELECTED"], ["187", "MENTIONED"]];

/* Same wall as the site: two rows, opposite directions, the list doubled so the
   loop is seamless. On the site it is a CSS marquee running 72 s and 88 s over
   50% of the track; here the same speeds are expressed in pixels per frame so
   they stay identical at any resolution. */
const CARD_W = 460;
const GAP = 22;
// the site scrolls slowly because it sits there for minutes; a three second cut
// needs about one card of travel to read as movement, so it runs faster here
const SPEED_TOP = 6.2;      // px per frame, left
const SPEED_BOTTOM = 4.6;   // px per frame, right

const Row: React.FC<{list: string[]; speed: number; reverse?: boolean; offset?: number}> = ({
  list, speed, reverse = false, offset = 0,
}) => {
  const frame = useCurrentFrame();
  const span = list.length * (CARD_W + GAP);        // one full pass
  const travelled = (frame * speed + offset) % span;
  const x = reverse ? travelled - span : -travelled;

  return (
    <div style={{overflow: "hidden", width: "100%"}}>
      <div style={{display: "flex", gap: GAP, width: "max-content", transform: `translateX(${x}px)`}}>
        {[...list, ...list].map((h, i) => (
          <Img
            key={`${h}-${i}`}
            src={staticFile(`cards/${h}.png`)}
            style={{
              width: CARD_W,
              flex: "none",
              display: "block",
              border: `1px solid ${RULE}`,
              opacity: 0.78,
            }}
          />
        ))}
      </div>
    </div>
  );
};

/** 22 - 25 s. The archive, moving the way it moves on the site. */
export const People: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{justifyContent: "center", overflow: "hidden"}}>
      <div style={{position: "absolute", top: 96, left: 130, zIndex: 2}}>
        <Eyebrow>BUILT BY FERMAFIA</Eyebrow>
        <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 58, letterSpacing: "-0.03em", marginTop: 16, color: WHITE}}>
          Every recognition, <span style={{color: TEAL}}>archived</span>.
        </div>
      </div>

      <div style={{display: "flex", flexDirection: "column", gap: 22, marginTop: 40}}>
        <Row list={CARDS.slice(0, 6)} speed={SPEED_TOP} />
        <Row list={CARDS.slice(6)} speed={SPEED_BOTTOM} reverse offset={240} />
      </div>

      <div style={{position: "absolute", bottom: 90, left: 130, display: "flex", gap: 78, zIndex: 2}}>
        {STATS.map(([n, l], i) => {
          const t = frame - 18 - i * 5;
          const o = interpolate(t, [0, 10], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
          const shown = Math.round(
            Number(n) * interpolate(t, [0, 16], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}),
          );
          return (
            <div key={l} style={{opacity: o}}>
              <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, color: TEAL, letterSpacing: "-0.02em"}}>
                {shown}
              </div>
              <div style={{fontFamily: MONO, fontSize: 15, letterSpacing: "0.2em", color: DIM, marginTop: 2}}>{l}</div>
            </div>
          );
        })}
      </div>

      {/* the same edge mask the site uses, so cards fade in and out of frame */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(90deg,#001030 0%,rgba(0,16,48,0) 12%,rgba(0,16,48,0) 88%,#001030 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
