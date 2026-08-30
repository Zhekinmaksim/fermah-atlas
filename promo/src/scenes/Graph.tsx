import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {Eyebrow} from "../components/Type";
import {DISPLAY, MONO, DIM, FAINT, GRAY, NAVY_2, RULE, TEAL, WHITE, BEAT} from "../theme";

type Node = {id: string; label: string; note?: string; col: number; row: number; root?: boolean};

const NODES: Node[] = [
  {id: "fermah", label: "Fermah", col: 0, row: 1, root: true},
  {id: "kernel", label: "Kernel", note: "PROTOCOL AGENCY ENGINE", col: 1, row: 1},
  {id: "froben", label: "Froben", note: "PROOF MARKET · MAINNET", col: 2, row: 0},
  {id: "flash", label: "Flashcast", note: "PREDICTION MARKETS", col: 2, row: 2},
  {id: "zk", label: "ZKsync Era", note: "PAYING CUSTOMER", col: 3, row: 0},
  {id: "abs", label: "Abstract Chain", note: "PAYING CUSTOMER", col: 3, row: 1},
];
const EDGES: [string, string][] = [
  ["fermah", "kernel"], ["kernel", "froben"], ["kernel", "flash"],
  ["froben", "zk"], ["froben", "abs"],
];

const COLS = [120, 500, 890, 1330];
const ROWS = [300, 500, 700];
const W = 330, H = 92;

/** 18 - 22 s. Edges draw on the beat, in the order the site states them. */
export const Graph: React.FC = () => {
  const frame = useCurrentFrame();
  const pos = (id: string) => {
    const n = NODES.find((x) => x.id === id)!;
    return {x: COLS[n.col], y: ROWS[n.row]};
  };

  return (
    <AbsoluteFill style={{padding: "70px 130px", justifyContent: "center"}}>
      <div style={{position: "absolute", top: 110, left: 130}}>
        <Eyebrow>ECOSYSTEM GRAPH</Eyebrow>
        <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, letterSpacing: "-0.03em", marginTop: 18, color: WHITE}}>
          One engine underneath.
        </div>
      </div>

      <svg width={1920} height={1080} style={{position: "absolute", inset: 0}}>
        {EDGES.map(([a, b], i) => {
          const p = pos(a), q = pos(b);
          const x1 = p.x + W, y1 = p.y + H / 2, x2 = q.x, y2 = q.y + H / 2;
          const mx = (x1 + x2) / 2;
          const d = `M ${x1} ${y1} H ${mx} V ${y2} H ${x2}`;
          const len = Math.abs(mx - x1) + Math.abs(y2 - y1) + Math.abs(x2 - mx);
          const t = interpolate(frame - 14 - i * (BEAT / 2), [0, 14], [0, 1], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          });
          return (
            <path key={i} d={d} fill="none" stroke={TEAL} strokeWidth={3}
              strokeDasharray={len} strokeDashoffset={len * (1 - t)} />
          );
        })}
      </svg>

      {NODES.map((n, i) => {
        const p = pos(n.id);
        const t = interpolate(frame - 8 - i * (BEAT / 2), [0, 10], [0, 1], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
        });
        return (
          <div key={n.id} style={{
            position: "absolute", left: p.x, top: p.y, width: W, height: H,
            background: n.root ? TEAL : NAVY_2, border: `1px solid ${n.root ? TEAL : "#22314F"}`,
            display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 24px",
            opacity: t, transform: `translateY(${(1 - t) * 14}px)`,
          }}>
            <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 30, letterSpacing: "-0.02em", color: n.root ? "#001030" : WHITE}}>
              {n.label}
            </div>
            {n.note ? (
              <div style={{fontFamily: MONO, fontSize: 13, letterSpacing: "0.14em", color: n.root ? "#001030aa" : DIM, marginTop: 5}}>
                {n.note}
              </div>
            ) : null}
          </div>
        );
      })}

      <div style={{position: "absolute", bottom: 96, left: 130, fontFamily: MONO, fontSize: 15, letterSpacing: "0.16em", color: FAINT}}>
        EVERY EDGE CARRIES A SOURCE AND A CHECK DATE
      </div>
    </AbsoluteFill>
  );
};
