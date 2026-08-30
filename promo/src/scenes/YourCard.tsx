import React from "react";
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {DISPLAY, MONO, DIM, GRAY, RULE, TEAL, WHITE} from "../theme";

/**
 * 25 - 28 s. The point of the whole project: the archive is not a list, it is
 * a page each person can take. One real card, one real address.
 */
export const YourCard: React.FC<{handle?: string}> = ({handle = "eam__sha"}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const s = spring({frame, fps, config: {damping: 200, mass: 0.7}});
  const scale = interpolate(s, [0, 1], [0.86, 1]);
  const o = interpolate(frame, [0, 12], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const line = interpolate(frame, [22, 34], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const url = interpolate(frame, [34, 46], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  // the handle types itself into the address
  const typed = Math.round(interpolate(frame, [40, 62], [0, handle.length], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  }));

  return (
    <AbsoluteFill style={{alignItems: "center", justifyContent: "center", gap: 46}}>
      <div style={{opacity: line, fontFamily: MONO, fontSize: 20, letterSpacing: "0.28em", color: DIM}}>
        EVERY CREATOR HAS A PAGE
      </div>

      <div style={{opacity: o, transform: `scale(${scale})`}}>
        <Img
          src={staticFile(`cards/${handle}.png`)}
          style={{width: 1080, display: "block", border: `1px solid ${RULE}`}}
        />
      </div>

      <div style={{opacity: url, display: "flex", alignItems: "baseline", gap: 4}}>
        <span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 46, color: WHITE, letterSpacing: "-0.02em"}}>
          fermahatlas.xyz/c/
        </span>
        <span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 46, color: TEAL, letterSpacing: "-0.02em"}}>
          {handle.slice(0, typed)}
          <span style={{opacity: frame % 16 < 8 ? 1 : 0.15}}>_</span>
        </span>
      </div>

      <div style={{opacity: url, fontFamily: MONO, fontSize: 17, letterSpacing: "0.2em", color: GRAY}}>
        POST IT AND X UNFURLS YOUR CARD
      </div>
    </AbsoluteFill>
  );
};
