import React from "react";
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {BEAT, DISPLAY, FAINT, MONO, NAVY, TEAL, WHITE} from "./theme";

/** Background: the brand grid, plus a one-frame flash on the downbeat. */
export const Stage: React.FC<{children: React.ReactNode; invert?: boolean; flash?: boolean}> = ({
  children,
  invert = false,
  flash = true,
}) => {
  const frame = useCurrentFrame();
  const hit = flash ? interpolate(frame, [0, 4], [0.18, 0], {extrapolateRight: "clamp"}) : 0;
  const line = invert ? "rgba(0,16,48,.16)" : "rgba(55,69,106,.22)";
  return (
    <AbsoluteFill style={{backgroundColor: invert ? TEAL : NAVY, overflow: "hidden"}}>
      <AbsoluteFill
        style={{
          backgroundImage:
            `repeating-linear-gradient(to right, ${line} 0 1px, transparent 1px 36px),
             repeating-linear-gradient(to bottom, ${line} 0 1px, transparent 1px 36px)`,
        }}
      />
      {children}
      <AbsoluteFill style={{background: invert ? NAVY : WHITE, opacity: hit, pointerEvents: "none"}} />
    </AbsoluteFill>
  );
};

/** Type that slams in and settles — the core move of the reel. */
export const Slam: React.FC<{
  text: string;
  size: number;
  color?: string;
  delay?: number;
  width?: string;
}> = ({text, size, color = WHITE, delay = 0, width}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 200, mass: 0.45}});
  const scale = interpolate(s, [0, 1], [1.12, 1]);
  const o = interpolate(frame - delay, [0, 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        fontFamily: DISPLAY,
        fontWeight: 700,
        fontSize: size,
        color,
        letterSpacing: "-0.022em",
        lineHeight: 0.96,
        opacity: o,
        maxWidth: width,
        transform: `scale(${scale})`,
        transformOrigin: "left center",
      }}
    >
      {text}
    </div>
  );
};

/** Mono label with the brand tick drawing in front of it. */
export const Label: React.FC<{children: React.ReactNode; delay?: number; color?: string}> = ({
  children,
  delay = 0,
  color = FAINT,
}) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame - delay, [0, 8], [0, 34], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const o = interpolate(frame - delay, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{display: "flex", alignItems: "center", gap: 14, opacity: o}}>
      <div style={{width: w, height: 3, background: TEAL}} />
      <span style={{fontFamily: MONO, fontSize: 18, letterSpacing: "0.2em", color}}>{children}</span>
    </div>
  );
};

/** A number that counts up over a beat and a half, then holds. */
export const Count: React.FC<{
  to: number;
  suffix?: string;
  size: number;
  delay?: number;
  color?: string;
}> = ({to, suffix = "", size, delay = 0, color = TEAL}) => {
  const frame = useCurrentFrame();
  const v = Math.round(
    interpolate(frame - delay, [0, BEAT * 1.5], [0, to], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  return (
    <span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: size, color, letterSpacing: "-0.03em"}}>
      {v}
      {suffix}
    </span>
  );
};

/** Pixel grid renderer for the mark and the wordmarks. */
export const Pixels: React.FC<{
  grid: string[];
  cell: number;
  color?: string;
  reveal?: number;
  gap?: number;
}> = ({grid, cell, color, reveal = 1, gap = cell * 0.16}) => {
  const rows = grid.length;
  const cols = grid[0].length;
  const span = rows + cols;
  const w = cols * cell + (cols - 1) * gap;
  const h = rows * cell + (rows - 1) * gap;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{display: "block"}}>
      {grid.map((row, r) =>
        row.split("").map((ch, c) => {
          if (ch === ".") return null;
          const at = (r + c) / span;
          const t = Math.min(1, Math.max(0, (reveal - at) * 7));
          if (t <= 0) return null;
          const s = cell * (0.5 + 0.5 * t);
          const off = (cell - s) / 2;
          return (
            <rect
              key={`${r}-${c}`}
              x={c * (cell + gap) + off}
              y={r * (cell + gap) + off}
              width={s}
              height={s}
              opacity={t}
              fill={color ?? (ch === "T" ? TEAL : WHITE)}
            />
          );
        }),
      )}
    </svg>
  );
};
