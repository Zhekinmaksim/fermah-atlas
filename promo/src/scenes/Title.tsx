import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {Eyebrow, Headline} from "../components/Type";
import {DISPLAY, MONO, DIM, TEAL, WHITE} from "../theme";

const STATS = [
  ["2.8M+", "PROOFS SETTLED"],
  ["1M+", "MARKETS RESOLVED"],
  ["99.7%", "RELIABILITY"],
  ["0", "HUMANS IN THE LOOP"],
];

/** 8 - 13 s. Lands on the drop. */
export const Title: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{padding: "0 130px", justifyContent: "center", gap: 44}}>
      <Eyebrow>FERMAH ATLAS</Eyebrow>
      <Headline
        size={104}
        every={6}
        words={[
          {text: "The"}, {text: "ecosystem"}, {text: "behind"},
          {text: "protocols", teal: true}, {text: "that", teal: true}, {text: "act.", teal: true},
        ]}
      />
      <div style={{display: "flex", gap: 74}}>
        {STATS.map(([n, l], i) => {
          const t = frame - 46 - i * 6;
          const o = interpolate(t, [0, 10], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
          return (
            <div key={l} style={{opacity: o}}>
              <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 46, color: TEAL, letterSpacing: "-0.02em"}}>{n}</div>
              <div style={{fontFamily: MONO, fontSize: 15, letterSpacing: "0.2em", color: DIM, marginTop: 4}}>{l}</div>
            </div>
          );
        })}
      </div>
      <div style={{fontFamily: MONO, fontSize: 14, letterSpacing: "0.18em", color: "#37456A"}}>
        AS PUBLISHED ON FERMAH.XYZ · CHECKED 2026-08-26
      </div>
    </AbsoluteFill>
  );
};
