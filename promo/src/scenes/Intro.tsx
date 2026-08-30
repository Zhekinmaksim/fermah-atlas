import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from "remotion";
import {Pixels} from "../components/Pixels";
import {Spectrum} from "../components/Spectrum";
import {ATLAS_WORD, FERMAH_WORD, PI_GRID} from "../grids";
import {BAR, DIM, MONO} from "../theme";

/** 0 - 8 s. The sparse part of the track: the mark assembles, then the wordmark. */
export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const {width} = useVideoConfig();

  const markReveal = interpolate(frame, [10, 70], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const wordReveal = interpolate(frame, [BAR * 2, BAR * 3 + 20], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const kicker = interpolate(frame, [BAR * 3, BAR * 3 + 18], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  // the last bar tightens: everything scales up a hair into the drop
  const zoom = interpolate(frame, [BAR * 3, 262], [1, 1.06], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  // The full lockup is 1761px wide at its native grid size. Reserve 48px per
  // side before the final zoom so the leading A mark cannot leave the canvas.
  const lockupScale = Math.min(1, (width - 96) / (1761 * 1.06));
  const wordBlockWidth = 1407 * wordReveal;

  return (
    <AbsoluteFill style={{alignItems: "center", justifyContent: "center"}}>
      <div style={{transform: `scale(${lockupScale * zoom})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 78}}>
        <div style={{display: "flex", alignItems: "center", gap: 34 * wordReveal}}>
          <Pixels grid={PI_GRID} cell={22} reveal={markReveal} />
          <div style={{width: wordBlockWidth, overflow: "hidden"}}>
            <div style={{display: "flex", alignItems: "center", gap: 30, marginLeft: 34, width: 1373}}>
              <Pixels grid={FERMAH_WORD} cell={8} reveal={wordReveal} />
              <Pixels grid={ATLAS_WORD} cell={8} reveal={wordReveal} color="#06C19D" />
            </div>
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
