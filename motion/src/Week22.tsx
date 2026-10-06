import React from "react";
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from "remotion";
import {Count, Label, Pixels, Slam, Stage} from "./motion/kit";
import {ATLAS_WORD, FERMAH_WORD} from "./grids";
import {STATS} from "./statsData";
import {
  BEAT, DIM, DISPLAY, FAINT, GRAY, MONO, NAVY, NAVY_2, RULE, TEAL, WHITE, bar,
} from "./motion/theme";

const PAD = 110;
const WEEKS = 22;

/* A record strip: one cell per week, filled where that creator appeared. */
const Strip: React.FC<{
  weeks: Record<number, "S" | "m">;
  upto?: number;
  height?: number;
  dim?: boolean;
}> = ({weeks, upto = WEEKS, height = 54, dim = false}) => (
  <div style={{display: "flex", gap: 6}}>
    {Array.from({length: WEEKS}).map((_, i) => {
      const w = i + 1;
      const t = weeks[w];
      const shown = w <= upto;
      const bg = !shown || !t ? "#22314F" : t === "S" ? TEAL : "transparent";
      return (
        <div key={w} style={{
          flex: 1, height, background: dim ? "#1b2744" : bg,
          border: shown && t === "m" && !dim ? `3px solid ${TEAL}` : "none",
          boxSizing: "border-box",
        }} />
      );
    })}
  </div>
);

const {nyuella: NYUELLA, legend: LEGEND, aditya: ADITYA, bilal: BILAL} = STATS.week22.records;
const SELECTED = STATS.week22.selected;
const MENTIONS = STATS.week22.mentions;
const NEW_NAMES = STATS.week22.newNames;
const WEEK_DATE = new Date(`${STATS.week22.date}T00:00:00Z`).toLocaleDateString("en-US", {
  month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
}).toUpperCase();

/* 1 — which week this is */
const Open: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [26, 40], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return (
    <Stage flash={false}>
      <AbsoluteFill style={{padding: PAD, justifyContent: "center", gap: 18}}>
        <Label>FERMAH · COMMUNITY SPOTLIGHT</Label>
        <Slam text="Week 22." size={190} delay={6} />
        <div style={{opacity: o, fontFamily: MONO, fontSize: 21, letterSpacing: "0.2em", color: DIM}}>
          FIVE SELECTED · TWENTY MENTIONED
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

/* 2 — the headline of the week */
const Headline: React.FC = () => (
  <Stage>
    <AbsoluteFill style={{padding: PAD, justifyContent: "center"}}>
      <Slam text="The top two" size={128} />
      <Slam text="selection runs ended." size={104} color={TEAL} delay={6} />
    </AbsoluteFill>
  </Stage>
);

/* 3 — Nyuella's five, then the gap */
const StreakA: React.FC = () => {
  const f = useCurrentFrame();
  const drop = interpolate(f, [34, 44], [1, 0.25], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return (
    <Stage>
      <AbsoluteFill style={{padding: PAD, justifyContent: "center", gap: 26}}>
        <Label>LONGEST SELECTION RUN</Label>
        <div style={{display: "flex", alignItems: "baseline", gap: 26}}>
          <span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 92, color: WHITE, letterSpacing: "-0.03em"}}>
            @Nyuella
          </span>
          <Count to={5} size={92} />
          <span style={{fontFamily: MONO, fontSize: 20, color: DIM}}>IN A ROW</span>
        </div>
        <div style={{opacity: drop}}>
          <Strip weeks={NYUELLA} />
        </div>
        <div style={{fontFamily: MONO, fontSize: 17, letterSpacing: "0.18em", color: FAINT}}>
          WEEKS 17—21 · NOT IN WEEK 22
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

/* 4 — and the other two */
const StreakB: React.FC = () => {
  const f = useCurrentFrame();
  const second = interpolate(f, [16, 24], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return (
    <Stage>
      <AbsoluteFill style={{padding: PAD, justifyContent: "center", gap: 22}}>
        <div style={{display: "flex", alignItems: "baseline", gap: 20}}>
          <span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, color: WHITE}}>@legendary54321</span>
          <span style={{fontFamily: MONO, fontSize: 18, color: TEAL, letterSpacing: "0.18em"}}>4 SELECTIONS</span>
        </div>
        <Strip weeks={LEGEND} height={34} />
        <div style={{opacity: second, display: "flex", alignItems: "baseline", gap: 20, marginTop: 14}}>
          <span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, color: WHITE}}>@Adityapunk01</span>
          <span style={{fontFamily: MONO, fontSize: 18, color: TEAL, letterSpacing: "0.18em"}}>5 APPEARANCES</span>
        </div>
        <div style={{opacity: second}}>
          <Strip weeks={ADITYA} height={34} />
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

/* 5 — the point */
const Point: React.FC = () => (
  <Stage invert>
    <AbsoluteFill style={{padding: PAD, justifyContent: "center", gap: 14}}>
      <Slam text="Three five-week" size={104} color={NAVY} />
      <Slam text="appearance runs ended." size={100} color={NAVY} delay={5} />
      <div style={{fontFamily: MONO, fontSize: 22, letterSpacing: "0.2em", color: "rgba(0,16,48,.72)", marginTop: 10}}>
        NYUELLA · LEGENDARY54321 · ADITYAPUNK01
      </div>
    </AbsoluteFill>
  </Stage>
);

/* 6 — who got in */
const Selected: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Stage>
      <AbsoluteFill style={{padding: PAD, justifyContent: "center", gap: 20}}>
        <Label>SELECTED</Label>
        {SELECTED.map((h, i) => {
          const t = interpolate(f - 10 - i * (BEAT * 0.52), [0, 6], [0, 1], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          });
          return (
            <div key={h} style={{
              opacity: t, transform: `translateX(${(1 - t) * -26}px)`,
              display: "flex", alignItems: "center", gap: 18,
            }}>
              <div style={{width: 14, height: 14, background: TEAL}} />
              <span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 58, color: WHITE, letterSpacing: "-0.022em"}}>
                {h}
              </span>
            </div>
          );
        })}
      </AbsoluteFill>
    </Stage>
  );
};

/* 7 — the only streak left */
const Survivor: React.FC = () => (
  <Stage>
    <AbsoluteFill style={{padding: PAD, justifyContent: "center", gap: 26}}>
      <Label>ONLY ACTIVE SELECTION RUN OF 2+ WEEKS</Label>
      <Slam text="@Bilalearn" size={116} color={TEAL} />
      <Strip weeks={BILAL} />
      <div style={{fontFamily: MONO, fontSize: 19, letterSpacing: "0.18em", color: GRAY}}>
        DEBUTED STRAIGHT INTO THE SELECTED LIST IN WEEK 21
      </div>
    </AbsoluteFill>
  </Stage>
);

/* 8 — the twenty */
const Mentions: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Stage>
      <AbsoluteFill style={{padding: PAD, justifyContent: "center", gap: 22}}>
        <Label>HONOURABLE MENTIONS</Label>
        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 50px"}}>
          {MENTIONS.map((h, i) => {
            const t = interpolate(f - 8 - i * 1.6, [0, 5], [0, 1], {
              extrapolateLeft: "clamp", extrapolateRight: "clamp",
            });
            return (
              <div key={h} style={{opacity: t, display: "flex", alignItems: "center", gap: 12}}>
                <div style={{width: 10, height: 10, border: `2px solid ${TEAL}`}} />
                <span style={{fontFamily: MONO, fontSize: 22, color: GRAY}}>{h}</span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

/* 9 — the counter-fact */
const Intake: React.FC = () => (
  <Stage>
    <AbsoluteFill style={{padding: PAD, justifyContent: "center", gap: 10}}>
      <Label>AND YET</Label>
      <div style={{display: "flex", alignItems: "baseline", gap: 24}}>
        <Count to={NEW_NAMES.length} size={200} />
        <span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 84, color: WHITE, letterSpacing: "-0.03em"}}>
          of {SELECTED.length + MENTIONS.length} names
        </span>
      </div>
      <Slam text="had never been in the record." size={62} color={WHITE} delay={14} />
      <div style={{fontFamily: MONO, fontSize: 20, letterSpacing: "0.2em", color: TEAL, marginTop: 12}}>
        TEN NEW NAMES IN ONE WEEK
      </div>
    </AbsoluteFill>
  </Stage>
);

/* 10 — name them */
const NewNames: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Stage>
      <AbsoluteFill style={{padding: PAD, justifyContent: "center", gap: 18}}>
        <Label>FIRST TIME IN THE ARCHIVE</Label>
        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 50px"}}>
          {NEW_NAMES.map((h, i) => {
            const t = interpolate(f - 6 - i * 3.2, [0, 6], [0, 1], {
              extrapolateLeft: "clamp", extrapolateRight: "clamp",
            });
            return (
              <span key={h} style={{
                opacity: t, transform: `translateY(${(1 - t) * 14}px)`,
                fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, color: WHITE, letterSpacing: "-0.022em",
              }}>{h}</span>
            );
          })}
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

/* 11 — what is left standing */
const Standing: React.FC = () => {
  const f = useCurrentFrame();
  const two = interpolate(f, [18, 26], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return (
    <Stage>
      <AbsoluteFill style={{padding: PAD, justifyContent: "center", gap: 24}}>
        <Label>LONGEST ACTIVE APPEARANCE RUNS</Label>
        <div style={{display: "flex", alignItems: "baseline", gap: 22}}>
          <span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 72, color: WHITE}}>@illfated_fr</span>
          <span style={{fontFamily: MONO, fontSize: 22, color: TEAL, letterSpacing: "0.18em"}}>5 STRAIGHT</span>
        </div>
        <div style={{opacity: two, display: "flex", alignItems: "baseline", gap: 22}}>
          <span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 72, color: WHITE}}>@Faizan626371</span>
          <span style={{fontFamily: MONO, fontSize: 22, color: TEAL, letterSpacing: "0.18em"}}>4 STRAIGHT</span>
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

/* 12 — where it is kept */
const End: React.FC = () => {
  const f = useCurrentFrame();
  const r = interpolate(f, [0, 18], [0, 1], {extrapolateRight: "clamp"});
  const o = interpolate(f, [20, 32], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const out = interpolate(f, [52, 65], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return (
    <Stage flash={false}>
      <AbsoluteFill style={{alignItems: "center", justifyContent: "center", gap: 36, opacity: out}}>
        <div style={{fontFamily: MONO, fontSize: 20, letterSpacing: "0.26em", color: DIM}}>
          EVERY WEEK SINCE MAY, KEPT
        </div>
        <div style={{display: "flex", alignItems: "center", gap: 24}}>
          <Pixels grid={FERMAH_WORD} cell={9} reveal={r} color={WHITE} />
          <Pixels grid={ATLAS_WORD} cell={9} reveal={r} color={TEAL} />
        </div>
        <div style={{opacity: o, fontFamily: MONO, fontSize: 30, letterSpacing: "0.22em", color: TEAL}}>
          FERMAHATLAS.XYZ
        </div>
        <div style={{opacity: o, fontFamily: MONO, fontSize: 17, letterSpacing: "0.2em", color: DIM}}>
          @FERMAH_ATLAS · BUILT BY @0MAXXDEV
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

const Tag: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [bar(1), bar(1) + 18], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const out = interpolate(f, [bar(11) - 14, bar(11)], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return (
    <div style={{
      position: "absolute", right: 56, bottom: 44, opacity: o * out, textAlign: "right",
      fontFamily: MONO, fontSize: 15, letterSpacing: "0.2em",
    }}>
      <div style={{color: TEAL}}>FERMAHATLAS.XYZ</div>
      <div style={{color: DIM, marginTop: 6}}>WEEK 22 · {WEEK_DATE}</div>
    </div>
  );
};

export const Week22: React.FC = () => {
  const scenes: React.FC[] = [
    Open, Headline, StreakA, StreakB, Point, Selected,
    Survivor, Mentions, Intake, NewNames, Standing, End,
  ];
  return (
    <AbsoluteFill style={{backgroundColor: NAVY}}>
      <Audio src={staticFile("motion.mp3")} />
      {scenes.map((C, i) => (
        <Sequence key={i} from={bar(i)} durationInFrames={bar(i + 1) - bar(i)} name={C.name}>
          <C />
        </Sequence>
      ))}
      <Tag />
    </AbsoluteFill>
  );
};
