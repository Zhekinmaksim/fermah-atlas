import React from "react";
import {Composition} from "remotion";
import {Promo} from "./Promo";
import {FPS} from "./theme";

const DURATION = 1350; // 45 s

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
