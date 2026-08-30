import React from "react";
import {interpolate, useCurrentFrame} from "remotion";
import {DIM, MONO, TEAL} from "../theme";

/** Small standing credit from the drop onwards — the address is on screen for
    35 of the 45 seconds without ever taking a scene over. */
export const Tag: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [240, 264], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const out = interpolate(frame, [1240, 1260], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return (
    <div style={{
      position: "absolute", right: 60, bottom: 46, opacity: o * out,
      fontFamily: MONO, fontSize: 17, letterSpacing: "0.2em", textAlign: "right",
    }}>
      <div style={{color: TEAL}}>FERMAHATLAS.XYZ</div>
      <div style={{color: DIM, marginTop: 6}}>@FERMAH_ATLAS</div>
    </div>
  );
};
