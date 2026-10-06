import React from "react";
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {DISPLAY, MONO, DIM, GRAY, RULE, TEAL, WHITE, BEAT} from "../theme";

const DOORS = [
  ["01", "Powered by Fermah", "Production & integrations", "10"],
  ["02", "Built with Fermah", "Apps & workflows", "3"],
  ["03", "Built by Fermafia", "Community tools & creations", "136"],
  ["04", "Operators", "Who runs the prover nodes", "—"],
  ["05", "Play with Fermah", "Three games about the ecosystem", "3"],
];

/** 13 - 18 s. One row per beat. */
export const Doors: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill style={{padding: "0 130px", justifyContent: "center"}}>
      {DOORS.map(([idx, title, sub, count], i) => {
        const delay = i * (BEAT * 0.9);
        const s = spring({frame: frame - delay, fps, config: {damping: 200, mass: 0.6}});
        const x = interpolate(s, [0, 1], [-70, 0]);
        const on = interpolate(frame - delay, [0, 8], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
        return (
          <div
            key={title}
            style={{
              display: "grid",
              gridTemplateColumns: "110px 1fr auto",
              alignItems: "center",
              gap: 48,
              padding: "26px 0",
              borderBottom: `1px solid ${RULE}`,
              opacity: on,
              transform: `translateX(${x}px)`,
            }}
          >
            <span style={{fontFamily: MONO, fontSize: 40, color: "#22314F"}}>{idx}</span>
            <span>
              <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 54, letterSpacing: "-0.035em", color: i === 1 ? TEAL : WHITE, lineHeight: 1}}>
                {title}
              </div>
              <div style={{fontFamily: MONO, fontSize: 18, color: GRAY, marginTop: 10}}>{sub}</div>
            </span>
            <span style={{textAlign: "right"}}>
              <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, color: TEAL}}>{count}</div>
              <div style={{fontFamily: MONO, fontSize: 14, color: DIM, letterSpacing: "0.16em"}}>ENTRIES</div>
            </span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
