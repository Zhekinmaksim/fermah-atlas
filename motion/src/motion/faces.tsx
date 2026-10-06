import React from "react";
import {Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {STATS} from "../statsData";
import {DISPLAY, NAVY_2, RULE, TEAL, WHITE} from "./theme";

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const HAVE = new Set<string>(STATS.hasAvatar as unknown as string[]);

/**
 * One face. It opens like a square iris from the centre, overshoots a little on
 * a spring, and a teal frame draws round it a beat later. Creators without an
 * avatar get a pixel-brand tile with their initials, never an empty square.
 */
export const Face: React.FC<{
  handle: string;
  size: number;
  delay?: number;
  ring?: boolean;
  dim?: number;          // 0..1, fades a face back without hiding it
}> = ({handle, size, delay = 0, ring = false, dim = 0}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - delay, fps, config: {damping: 12, mass: 0.5, stiffness: 190}});
  const iris = interpolate(f - delay, [0, 9], [50, 0], clamp);          // inset %, 50 = closed
  const frame = interpolate(f - delay, [6, 18], [0, 1], clamp);
  const has = HAVE.has(handle.toLowerCase());
  const initials = handle.replace(/^[^A-Za-z0-9]+/, "").slice(0, 2).toUpperCase();

  return (
    <div style={{
      width: size, height: size, position: "relative",
      transform: `scale(${0.55 + 0.45 * s})`, opacity: 1 - dim * 0.78,
    }}>
      <div style={{
        position: "absolute", inset: 0, overflow: "hidden", borderRadius: 2,
        clipPath: `inset(${iris}% round 2px)`, background: NAVY_2,
      }}>
        {has ? (
          <Img src={staticFile(`avatars/${handle.toLowerCase()}.jpg`)}
               style={{width: "100%", height: "100%", objectFit: "cover", display: "block",
                       filter: dim ? `grayscale(${dim})` : undefined}} />
        ) : (
          <div style={{
            width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
            background: `repeating-linear-gradient(45deg, ${NAVY_2} 0 6px, #0a2148 6px 12px)`,
            fontFamily: DISPLAY, fontWeight: 700, fontSize: size * 0.34, color: TEAL,
          }}>{initials}</div>
        )}
      </div>
      {ring ? (
        <svg width={size} height={size} style={{position: "absolute", inset: 0, overflow: "visible"}}>
          <rect x={-3} y={-3} width={size + 6} height={size + 6} rx={3} fill="none"
                stroke={TEAL} strokeWidth={2.5}
                strokeDasharray={(size + 6) * 4} strokeDashoffset={(size + 6) * 4 * (1 - frame)} />
        </svg>
      ) : (
        <div style={{position: "absolute", inset: 0, border: `1px solid ${RULE}`, borderRadius: 2, opacity: frame}} />
      )}
    </div>
  );
};

/**
 * The whole archive as a wall of faces. Tiles open in a wave that starts in the
 * middle and travels outwards, so the reel opens on people rather than on type.
 */
export const Mosaic: React.FC<{
  cols: number;
  tile: number;
  gap?: number;
  start?: number;
  spread?: number;      // frames the wave takes from centre to corner
  dimOnce?: number;     // 0..1 — fade creators who appeared only once
  fade?: number;        // 0..1 — fade the whole wall behind type
}> = ({cols, tile, gap = 8, start = 0, spread = 30, dimOnce = 0, fade = 0}) => {
  // whole rows only, so the wall is a clean rectangle with no stub at the end
  const rows = Math.floor(STATS.mosaic.length / cols);
  const faces = STATS.mosaic.slice(0, rows * cols);
  const cx = (cols - 1) / 2, cy = (rows - 1) / 2;
  const maxD = Math.hypot(cx, cy);
  return (
    <div style={{
      display: "grid", gridTemplateColumns: `repeat(${cols}, ${tile}px)`, gap,
      opacity: 1 - fade,
    }}>
      {faces.map((m, i) => {
        const c = i % cols, r = Math.floor(i / cols);
        const d = Math.hypot(c - cx, r - cy) / maxD;
        return (
          <Face key={m.h} handle={m.h} size={tile} delay={start + d * spread}
                dim={m.once ? dimOnce : 0} />
        );
      })}
    </div>
  );
};

/** A row of named faces, popping in one after another. */
export const FaceRow: React.FC<{handles: readonly string[]; size: number; step?: number; delay?: number}> = ({
  handles, size, step = 3, delay = 0,
}) => (
  <div style={{display: "flex", gap: 14, flexWrap: "wrap"}}>
    {handles.map((h, i) => (
      <div key={h} style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 8}}>
        <Face handle={h} size={size} delay={delay + i * step} ring />
      </div>
    ))}
  </div>
);

export const faceExists = (h: string) => HAVE.has(h.toLowerCase());
export {WHITE};
