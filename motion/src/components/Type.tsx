import React from "react";
import {interpolate, useCurrentFrame} from "remotion";
import {DIM, DISPLAY, MONO, TEAL, WHITE} from "../theme";

export const Eyebrow: React.FC<{children: React.ReactNode; delay?: number}> = ({
  children,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame - delay, [0, 10], [0, 1], {extrapolateRight: "clamp", extrapolateLeft: "clamp"});
  const w = interpolate(frame - delay, [0, 16], [0, 44], {extrapolateRight: "clamp", extrapolateLeft: "clamp"});
  return (
    <div style={{display: "flex", alignItems: "center", gap: 16, opacity: o}}>
      <div style={{width: w, height: 3, background: TEAL}} />
      <span style={{fontFamily: MONO, fontSize: 22, letterSpacing: "0.26em", color: DIM}}>
        {children}
      </span>
    </div>
  );
};

/** Headline that wipes in word by word, one word per beat. */
export const Headline: React.FC<{
  words: {text: string; teal?: boolean}[];
  size: number;
  delay?: number;
  every?: number;
}> = ({words, size, delay = 0, every = 7}) => {
  const frame = useCurrentFrame();
  return (
    <h1
      style={{
        fontFamily: DISPLAY,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.02,
        letterSpacing: "-0.03em",
        margin: 0,
        maxWidth: "16em",
        display: "flex",
        flexWrap: "wrap",
        columnGap: size * 0.24,
      }}
    >
      {words.map((w, i) => {
        const t = frame - delay - i * every;
        const o = interpolate(t, [0, 8], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
        const y = interpolate(t, [0, 12], [size * 0.28, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
        return (
          <span
            key={i}
            style={{opacity: o, transform: `translateY(${y}px)`, color: w.teal ? TEAL : WHITE}}
          >
            {w.text}
          </span>
        );
      })}
    </h1>
  );
};
