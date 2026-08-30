import React from "react";
import {TEAL, WHITE} from "../theme";

/** Draws a pixel grid ("T" teal, "W" white, "." empty) as one SVG. */
export const Pixels: React.FC<{
  grid: string[];
  cell: number;
  gap?: number;
  reveal?: number;      // 0..1 — sweeps the pixels in along the diagonal
  color?: string;
  opacity?: number;
}> = ({grid, cell, gap = cell * 0.16, reveal = 1, color, opacity = 1}) => {
  const rows = grid.length;
  const cols = grid[0].length;
  const w = cols * cell + (cols - 1) * gap;
  const h = rows * cell + (rows - 1) * gap;
  const span = rows + cols;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{opacity, display: "block"}}>
      {grid.map((row, r) =>
        row.split("").map((ch, c) => {
          if (ch === ".") return null;
          // each pixel appears when the diagonal sweep passes over it
          const at = (r + c) / span;
          const local = Math.min(1, Math.max(0, (reveal - at) * 6));
          if (local <= 0) return null;
          const s = cell * (0.55 + 0.45 * local);
          const off = (cell - s) / 2;
          return (
            <rect
              key={`${r}-${c}`}
              x={c * (cell + gap) + off}
              y={r * (cell + gap) + off}
              width={s}
              height={s}
              fill={color ?? (ch === "T" ? TEAL : WHITE)}
              opacity={local}
            />
          );
        }),
      )}
    </svg>
  );
};
