import React from "react";
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from "remotion";
import {Count, Label, Pixels, Slam, Stage} from "./motion/kit";
import {ATLAS_WORD, FERMAH_WORD} from "./grids";
import {STATS} from "./statsData";
import {Face, FaceRow, Mosaic} from "./motion/faces";
import {BEAT, DIM, DISPLAY, FAINT, GRAY, MONO, NAVY, NAVY_2, RULE, TEAL, WHITE, bar} from "./motion/theme";

const PAD = 110;
const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;

/* 1 — open on people: the wall of faces assembles, the title lands on it */
const Open: React.FC = () => {
  const f = useCurrentFrame();
  const veil = interpolate(f, [30, 44], [0, 0.72], clamp);
  return (
    <Stage flash={false}>
      <AbsoluteFill style={{alignItems: "center", justifyContent: "center"}}>
        <Mosaic cols={16} tile={104} gap={8} start={0} spread={26} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: NAVY, opacity: veil}} />
      <AbsoluteFill style={{padding: PAD, justifyContent: "center", gap: 20}}>
        <Sequence from={32} layout="none">
          <Label>NEW ON FERMAH ATLAS</Label>
          <Slam text="The season," size={150} />
          <Slam text="counted." size={150} color={TEAL} delay={6} />
        </Sequence>
      </AbsoluteFill>
    </Stage>
  );
};

/* 2 — the totals */
const Totals: React.FC = () => (
  <Stage>
    <AbsoluteFill style={{alignItems: "center", justifyContent: "center", opacity: 0.16}}>
      <Mosaic cols={16} tile={104} gap={8} start={-60} spread={1} />
    </AbsoluteFill>
    <AbsoluteFill style={{padding: PAD, justifyContent: "center", gap: 30}}>
      <div style={{display: "flex", gap: 70, alignItems: "baseline", flexWrap: "wrap"}}>
        {[[STATS.weeks, "WEEKS"], [STATS.creators, "ACTIVE CREATORS"]].map(([n, l], i) => (
          <span key={String(l)}>
            <Count to={Number(n)} size={160} delay={i * 4} />
            <span style={{fontFamily: MONO, fontSize: 20, color: DIM, marginLeft: 14, letterSpacing: "0.2em"}}>{l}</span>
          </span>
        ))}
      </div>
      <div style={{display: "flex", gap: 70}}>
        {[[STATS.selections, "SELECTION CREDITS"], [STATS.mentions, "MENTIONS"]].map(([n, l], i) => (
          <span key={String(l)}>
            <Count to={Number(n)} size={74} delay={8 + i * 4} color={WHITE} />
            <span style={{fontFamily: MONO, fontSize: 17, color: DIM, marginLeft: 12, letterSpacing: "0.2em"}}>{l}</span>
          </span>
        ))}
      </div>
    </AbsoluteFill>
  </Stage>
);

/* 3 — every week as a column, growing in */
const Chart: React.FC = () => {
  const f = useCurrentFrame();
  const max = Math.max(...STATS.perWeek.map((w) => w.sel + w.men));
  return (
    <Stage>
      <AbsoluteFill style={{padding: PAD, justifyContent: "center", gap: 26}}>
        <Label>EVERY ANNOUNCEMENT</Label>
        <div style={{display: "flex", gap: 10, height: 430, alignItems: "flex-end"}}>
          {STATS.perWeek.map((w, i) => {
            const t = interpolate(f - i * 1.6, [0, 12], [0, 1], clamp);
            const hs = (w.sel / max) * 100 * t;
            const hm = (w.men / max) * 100 * t;
            const hn = (w.new / max) * 100 * t;
            return (
              <div key={w.w} style={{flex: 1, height: "100%", display: "flex", flexDirection: "column",
                justifyContent: "flex-end", position: "relative"}}>
                <div style={{height: `${hm}%`, background: "#1b6a78"}} />
                <div style={{height: `${hs}%`, background: TEAL}} />
                <div style={{position: "absolute", left: -2, right: -2, bottom: `${hn}%`, height: 4,
                  background: WHITE, opacity: t}} />
              </div>
            );
          })}
        </div>
        <div style={{display: "flex", gap: 30, fontFamily: MONO, fontSize: 16, letterSpacing: "0.18em", color: DIM}}>
          <span><span style={{color: TEAL}}>■</span> SELECTED</span>
          <span><span style={{color: "#1b6a78"}}>■</span> MENTIONED</span>
          <span><span style={{color: WHITE}}>—</span> NEW TO THE ARCHIVE</span>
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

/* 4 — the longest runs */
const Runs: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Stage>
      <AbsoluteFill style={{padding: PAD, justifyContent: "center", gap: 24}}>
        <Label>LONGEST SELECTION RUNS</Label>
        {STATS.runs.map((r, i) => {
          const t = interpolate(f - 6 - i * (BEAT * 0.5), [0, 7], [0, 1], clamp);
          return (
            <div key={r.h} style={{opacity: Math.min(1, t * 3), display: "grid",
              gridTemplateColumns: "84px 380px 1fr 80px", alignItems: "center", gap: 24}}>
              <Face handle={r.h} size={84} delay={6 + i * (BEAT * 0.5)} ring />
              <span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 42, color: WHITE}}>@{r.h}</span>
              <div style={{display: "flex", gap: 6}}>
                {Array.from({length: STATS.weeks}).map((_, k) => {
                  const w = k + 1;
                  const on = w >= r.from && w <= r.to;
                  const lit = interpolate(f - 14 - i * (BEAT * 0.5) - (w - r.from) * 2, [0, 4], [0, 1], clamp);
                  return <div key={k} style={{flex: 1, height: 30,
                    background: on ? (lit > 0.5 ? TEAL : "#22314F") : "#22314F"}} />;
                })}
              </div>
              <span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, color: TEAL, textAlign: "right"}}>{r.n}</span>
            </div>
          );
        })}
      </AbsoluteFill>
    </Stage>
  );
};

/* 5 — the longest gap */
const Gap: React.FC = () => (
  <Stage>
    <AbsoluteFill style={{alignItems: "flex-end", justifyContent: "center", paddingRight: PAD}}>
      <Face handle={STATS.gap.handle} size={300} delay={4} ring />
    </AbsoluteFill>
    <AbsoluteFill style={{padding: PAD, justifyContent: "center", gap: 16}}>
      <Label>LONGEST COMEBACK</Label>
      <div style={{display: "flex", alignItems: "baseline", gap: 26}}>
        <Count to={STATS.gap.weeks} size={230} />
        <span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 72, color: WHITE, letterSpacing: "-0.03em"}}>
          weeks gone
        </span>
      </div>
      <Slam text={`@${STATS.gap.handle} — out after week ${STATS.gap.from}, back in week ${STATS.gap.back}.`}
            size={46} color={GRAY} delay={12} />
    </AbsoluteFill>
  </Stage>
);

/* 6 — moving up */
const TierUps: React.FC = () => (
  <Stage>
    <AbsoluteFill style={{padding: PAD, justifyContent: "center", gap: 18}}>
      <Label>MOVING UP</Label>
      <div style={{display: "flex", alignItems: "baseline", gap: 26}}>
        <Count to={STATS.tierups} size={230} />
        <span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, color: WHITE, letterSpacing: "-0.03em"}}>
          times
        </span>
      </div>
      <Slam text="mentioned one week, selected the next." size={52} color={GRAY} delay={10} />
      <div style={{marginTop: 18}}>
        <FaceRow handles={STATS.tierupFaces.slice(0, 12)} size={104} step={2.4} delay={16} />
      </div>
    </AbsoluteFill>
  </Stage>
);

/* 7 — the hard light switch: who stays */
const Stay: React.FC = () => {
  const f = useCurrentFrame();
  const fadeOnce = interpolate(f, [8, 30], [0, 1], clamp);
  return (
  <Stage invert>
    <AbsoluteFill style={{alignItems: "center", justifyContent: "center", opacity: 0.9}}>
      <Mosaic cols={16} tile={104} gap={8} start={-60} spread={1} dimOnce={fadeOnce} />
    </AbsoluteFill>
    <AbsoluteFill style={{background: "linear-gradient(90deg, rgba(6,193,157,.96) 0%, rgba(6,193,157,.88) 46%, rgba(6,193,157,0) 74%)"}} />
    <AbsoluteFill style={{padding: PAD, justifyContent: "center", gap: 18}}>
      <Slam text={`${STATS.oneTimers} appeared once.`} size={120} color={NAVY} />
      <Slam text={`${STATS.cameBack} came back.`} size={120} color={NAVY} delay={8} />
      <div style={{fontFamily: MONO, fontSize: 21, letterSpacing: "0.2em", color: "rgba(0,16,48,.72)", marginTop: 6}}>
        OF {STATS.creators} ACTIVE CREATORS
      </div>
    </AbsoluteFill>
  </Stage>
  );
};

/* 8 — one page per week */
const WeekPages: React.FC = () => {
  const f = useCurrentFrame();
  const typed = Math.round(interpolate(f - 30, [0, 8], [0, 2], clamp));
  return (
    <Stage>
      <AbsoluteFill style={{padding: PAD, justifyContent: "center", gap: 28}}>
        <Label>ONE PAGE PER ANNOUNCEMENT</Label>
        <div style={{display: "grid", gridTemplateColumns: "repeat(11, 1fr)", gap: 10}}>
          {STATS.perWeek.map((w, i) => {
            const t = interpolate(f - i * 1.1, [0, 6], [0, 1], clamp);
            const last = i === STATS.perWeek.length - 1;
            return (
              <div key={w.w} style={{
                opacity: t, padding: "14px 0", textAlign: "center",
                background: last ? TEAL : NAVY_2, border: `1px solid ${last ? TEAL : RULE}`,
                fontFamily: DISPLAY, fontWeight: 700, fontSize: 26, color: last ? NAVY : WHITE,
              }}>W{String(w.w).padStart(2, "0")}</div>
            );
          })}
        </div>
        <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 58, letterSpacing: "-0.022em"}}>
          <span style={{color: WHITE}}>fermahatlas.xyz/week/</span>
          <span style={{color: TEAL}}>{"22".slice(0, typed)}<span style={{opacity: f % 14 < 7 ? 1 : 0.15}}>_</span></span>
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

/* 9 — where it lives */
const End: React.FC = () => {
  const f = useCurrentFrame();
  const r = interpolate(f, [0, 18], [0, 1], clamp);
  const o = interpolate(f, [18, 30], [0, 1], clamp);
  const out = interpolate(f, [52, 65], [1, 0], clamp);
  return (
    <Stage flash={false}>
      <AbsoluteFill style={{alignItems: "center", justifyContent: "center", gap: 36, opacity: out}}>
        <div style={{display: "flex", alignItems: "center", gap: 24}}>
          <Pixels grid={FERMAH_WORD} cell={9} reveal={r} color={WHITE} />
          <Pixels grid={ATLAS_WORD} cell={9} reveal={r} color={TEAL} />
        </div>
        <div style={{opacity: o, fontFamily: MONO, fontSize: 32, letterSpacing: "0.22em", color: TEAL}}>
          FERMAHATLAS.XYZ/STATS
        </div>
        <div style={{opacity: o, fontFamily: MONO, fontSize: 18, letterSpacing: "0.2em", color: DIM}}>
          @FERMAH_ATLAS · BUILT BY @0MAXXDEV
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

const Tag: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [bar(1), bar(1) + 18], [0, 1], clamp);
  const out = interpolate(f, [bar(8) - 14, bar(8)], [1, 0], clamp);
  return (
    <div style={{position: "absolute", right: 56, bottom: 44, opacity: o * out, textAlign: "right",
      fontFamily: MONO, fontSize: 15, letterSpacing: "0.2em"}}>
      <div style={{color: TEAL}}>FERMAHATLAS.XYZ/STATS</div>
      <div style={{color: FAINT, marginTop: 6}}>THROUGH WEEK {STATS.weeks}</div>
    </div>
  );
};

export const STATS20_FRAMES = bar(9);

export const Stats20: React.FC = () => {
  const scenes: React.FC[] = [Open, Totals, Chart, Runs, Gap, TierUps, Stay, WeekPages, End];
  return (
    <AbsoluteFill style={{backgroundColor: NAVY}}>
      <Audio src={staticFile("stats20.mp3")} />
      {scenes.map((C, i) => (
        <Sequence key={i} from={bar(i)} durationInFrames={bar(i + 1) - bar(i)} name={C.name}>
          <C />
        </Sequence>
      ))}
      <Tag />
    </AbsoluteFill>
  );
};
