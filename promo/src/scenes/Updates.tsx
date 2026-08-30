import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {Eyebrow} from "../components/Type";
import {BEAT, DISPLAY, MONO, DIM, FAINT, GRAY, TEAL, WHITE} from "../theme";

const PIPE = [
  ["ANNOUNCEMENT", "the team posts week 18"],
  ["ONE COMMAND", "add_week.py"],
  ["THE ARCHIVE", "seed, cards, pages"],
  ["LIVE", "counts update themselves"],
];

/** 38 - 42 s. The thing that keeps it from going stale. */
export const Updates: React.FC = () => {
  const frame = useCurrentFrame();
  const weeks = 18;   // 17 published, the 18th is the one landing
  const filled = Math.round(interpolate(frame, [16, 70], [0, weeks], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  }));

  return (
    <AbsoluteFill style={{padding: "0 130px", justifyContent: "center", gap: 52}}>
      <div>
        <Eyebrow>EVERY WEEK</Eyebrow>
        <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 62, letterSpacing: "-0.03em", marginTop: 18, color: WHITE}}>
          A new Spotlight, <span style={{color: TEAL}}>same day</span>.
        </div>
      </div>

      <div style={{display: "flex", gap: 10}}>
        {Array.from({length: weeks}).map((_, i) => {
          const on = i < filled;
          const isNew = i === weeks - 1 && on;
          return (
            <div key={i} style={{flex: 1, display: "flex", flexDirection: "column", gap: 8}}>
              <div style={{
                height: 92,
                background: on ? (isNew ? WHITE : TEAL) : "#22314F",
                transition: "none",
              }} />
              <div style={{fontFamily: MONO, fontSize: 13, color: on ? DIM : "#22314F", textAlign: "center"}}>
                {String(i + 1).padStart(2, "0")}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{display: "flex", gap: 64}}>
        {PIPE.map(([k, v], i) => {
          const o = interpolate(frame - 26 - i * (BEAT / 2), [0, 10], [0, 1], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          });
          return (
            <div key={k} style={{opacity: o, display: "flex", alignItems: "baseline", gap: 14}}>
              {i > 0 ? <span style={{fontFamily: MONO, fontSize: 20, color: "#22314F"}}>→</span> : null}
              <span>
                <div style={{fontFamily: MONO, fontSize: 13, letterSpacing: "0.2em", color: TEAL}}>{k}</div>
                <div style={{fontFamily: MONO, fontSize: 16, color: GRAY, marginTop: 6}}>{v}</div>
              </span>
            </div>
          );
        })}
      </div>

      <div style={{fontFamily: MONO, fontSize: 15, letterSpacing: "0.16em", color: FAINT}}>
        X HANDLES ONLY · NO DISCORD IDENTIFIERS · SUSPENDED ACCOUNTS EXCLUDED
      </div>
    </AbsoluteFill>
  );
};
