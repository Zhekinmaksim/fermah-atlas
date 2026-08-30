import React from "react";
import {AbsoluteFill, Audio, Sequence, staticFile} from "remotion";
import {Backdrop} from "./components/Backdrop";
import {Tag} from "./components/Tag";
import {SafeZones} from "./components/SafeZones";
import {Doors} from "./scenes/Doors";
import {EndCard} from "./scenes/EndCard";
import {Assistant} from "./scenes/Assistant";
import {Graph} from "./scenes/Graph";
import {Operators} from "./scenes/Operators";
import {Updates} from "./scenes/Updates";
import {Intro} from "./scenes/Intro";
import {People} from "./scenes/People";
import {YourCard} from "./scenes/YourCard";
import {Title} from "./scenes/Title";
import {SCENES} from "./theme";

export const Promo: React.FC<{safeZones?: boolean}> = ({safeZones = false}) => {
  return (
    <AbsoluteFill>
      {/* The clip is cut from Midnight Relay at 3:32.1, so the drop is exactly
          on frame 240 and every cut below sits on a bar. */}
      <Audio src={staticFile("audio.mp3")} />

      <Backdrop />

      <Sequence {...SCENES.intro} name="Intro"><Intro /></Sequence>
      <Sequence {...SCENES.title} name="Title"><Title /></Sequence>
      <Sequence {...SCENES.doors} name="Doors"><Doors /></Sequence>
      <Sequence {...SCENES.graph} name="Graph"><Graph /></Sequence>
      <Sequence {...SCENES.operators} name="Operators"><Operators /></Sequence>
      <Sequence {...SCENES.wall} name="Archive"><People /></Sequence>
      <Sequence {...SCENES.card} name="YourCard"><YourCard handle="eam__sha" /></Sequence>
      <Sequence {...SCENES.assistant} name="Assistant"><Assistant /></Sequence>
      <Sequence {...SCENES.updates} name="Updates"><Updates /></Sequence>
      <Sequence {...SCENES.end} name="End"><EndCard /></Sequence>

      <Tag />
      <SafeZones show={safeZones} />
    </AbsoluteFill>
  );
};
