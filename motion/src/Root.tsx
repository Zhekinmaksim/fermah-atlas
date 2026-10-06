import React from "react";
import {Composition} from "remotion";
import {Motion} from "./Motion";
import {Week22} from "./Week22";
import {Stats20, STATS20_FRAMES} from "./Stats20";
import {Promo} from "./Promo";
import {FPS} from "./theme";

const DURATION = 1350; // 45 s

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Stats20"
        component={Stats20}
        durationInFrames={STATS20_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Stats20Square"
        component={Stats20}
        durationInFrames={STATS20_FRAMES}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="Stats20Vertical"
        component={Stats20}
        durationInFrames={STATS20_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Week22"
        component={Week22}
        durationInFrames={786}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Week22Square"
        component={Week22}
        durationInFrames={786}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="Week22Vertical"
        component={Week22}
        durationInFrames={786}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Motion"
        component={Motion}
        durationInFrames={786}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="MotionSquare"
        component={Motion}
        durationInFrames={786}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="MotionVertical"
        component={Motion}
        durationInFrames={786}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Promo"
        component={Promo}
        durationInFrames={DURATION}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{safeZones: false}}
      />
      <Composition
        id="PromoSquare"
        component={Promo}
        durationInFrames={DURATION}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={{safeZones: false}}
      />
      <Composition
        id="PromoVertical"
        component={Promo}
        durationInFrames={DURATION}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{safeZones: false}}
      />
    </>
  );
};
