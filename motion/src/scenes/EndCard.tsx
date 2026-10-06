import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {Pixels} from "../components/Pixels";
import {ATLAS_WORD, FERMAH_WORD} from "../grids";
import {DIM, MONO, TEAL, WHITE} from "../theme";

/** 27 - 30 s. Wordmark, domain, and the disclaimer that has to be visible. */
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const reveal = interpolate(frame, [0, 18], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const url = interpolate(frame, [18, 28], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const handle = interpolate(frame, [30, 42], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const out = interpolate(frame, [76, 90], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});

  return (
    <AbsoluteFill style={{alignItems: "center", justifyContent: "center", gap: 74, opacity: out}}>
      <div style={{display: "flex", alignItems: "center", gap: 34}}>
        <Pixels grid={FERMAH_WORD} cell={10} reveal={reveal} />
        <Pixels grid={ATLAS_WORD} cell={10} reveal={reveal} color={TEAL} />
      </div>
      <div style={{opacity: url, marginTop: -18, fontFamily: MONO, fontSize: 38, letterSpacing: "0.22em", color: TEAL}}>
        FERMAHATLAS.XYZ
      </div>
      <div style={{opacity: handle, marginTop: -30, fontFamily: MONO, fontSize: 26, letterSpacing: "0.2em", color: WHITE}}>
        @FERMAH_ATLAS
      </div>
      <div style={{opacity: handle, marginTop: -26, fontFamily: MONO, fontSize: 17, letterSpacing: "0.2em", color: DIM}}>
        UNOFFICIAL COMMUNITY ARCHIVE · BUILT BY @0MAXXDEV
      </div>
    </AbsoluteFill>
  );
};
