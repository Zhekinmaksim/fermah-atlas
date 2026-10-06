import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {Pixels} from "../components/Pixels";
import {Spectrum} from "../components/Spectrum";
import {ATLAS_WORD, FERMAH_WORD, PI_GRID} from "../grids";
import {BAR, DIM, MONO} from "../theme";

/** 0 - 8 s. The sparse part of the track: the mark assembles, then the wordmark. */
export const Intro: React.FC = () => {
  const frame = useCurrentFrame();

  const markReveal = interpolate(frame, [10, 70], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const wordReveal = interpolate(frame, [BAR * 2, BAR * 3 + 20], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const markShift = interpolate(frame, [BAR * 2, BAR * 2 + 24], [0, -160], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const kicker = interpolate(frame, [BAR * 3, BAR * 3 + 18], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  // the last bar tightens: everything scales up a hair into the drop
  const zoom = interpolate(frame, [BAR * 3, 262], [1, 1.06], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});

  return (
    <AbsoluteFill style={{alignItems: "center", justifyContent: "center"}}>
      <div style={{transform: `scale(${zoom})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 78}}>
        <div style={{display: "flex", alignItems: "center", gap: 34, transform: `translateX(${markShift}px)`}}>
          <Pixels grid={PI_GRID} cell={22} reveal={markReveal} />
          <div style={{display: "flex", alignItems: "center", gap: 30, opacity: wordReveal > 0 ? 1 : 0}}>
            <Pixels grid={FERMAH_WORD} cell={8} reveal={wordReveal} />
            <Pixels grid={ATLAS_WORD} cell={8} reveal={wordReveal} color="#06C19D" />
          </div>
        </div>
        <div style={{opacity: kicker, fontFamily: MONO, fontSize: 20, letterSpacing: "0.34em", color: DIM}}>
          UNOFFICIAL COMMUNITY ARCHIVE
        </div>
      </div>
      <div style={{position: "absolute", bottom: 90, opacity: 0.5}}>
        <Spectrum bars={40} height={90} />
      </div>
    </AbsoluteFill>
  );
};
