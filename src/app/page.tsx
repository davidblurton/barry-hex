"use client";

import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { MapControls, OrthographicCamera } from "@react-three/drei";

import { Chord, Midi, Range } from "tonal";
import Piano from "@/components/Piano";
import { Hex, hexToGridPoint } from "@/lib/hex";
import { hexes } from "@/lib/data";
import { ControlsEventTarget } from "@/events/ControlsEventTarget";
import { HexMapEventTarget } from "@/events/HexMapEventTarget";
import InfiniteHexGrid from "@/components/InfiniteHexGrid";
import { colors } from "@/lib/colors";
import HexTile from "@/components/HexTile";

function NoteTiles({
  selected,
  setSelected,
}: {
  selected?: Hex;
  setSelected: (hex: Hex) => void;
}) {
  function onClick(hex: Hex) {
    setSelected(hex);
  }

  return (
    <>
      {hexes.map((hex) => (
        <HexTile
          key={`${hex.q},${hex.r}`}
          hex={hex}
          onClick={onClick}
          selected={selected?.q === hex.q && selected?.r === hex.r}
        />
      ))}
    </>
  );
}

function getNotesForHex(hex: Hex) {
  return Range.numeric([0, 3])
    .map((x) => x + hex.q)
    .map((x) => x + (hex.offset !== undefined ? hex.offset : 0))
    .map((x) => x + 1)
    .map((x) => x + 1)
    .map(Chord.steps(hex.quality, hex.root));
}

const controlsTarget = new ControlsEventTarget();
const hexMapTarget = new HexMapEventTarget();

export default function CanvasPage() {
  const initialHex = hexes[6];
  const initialPoint = hexToGridPoint(initialHex.q, initialHex.r);

  const [selected, setSelected] = useState<Hex | undefined>(initialHex);

  return (
    <div className="h-full w-full">
      <Canvas>
        <color attach="background" args={["#f5efe6"]} />
        <ambientLight intensity={1} />

        <OrthographicCamera
          makeDefault
          position={[initialPoint.x, initialPoint.y, 5]}
          up={[0, 0, 1]}
          zoom={70}
          far={10000}
        />

        <MapControls
          makeDefault
          zoomSpeed={1}
          dampingFactor={1}
          target={[initialPoint.x, initialPoint.y, 0]}
          enableRotate={false}
          minZoom={30}
          maxZoom={100}
          onChange={() => controlsTarget.onMove()}
        />

        <InfiniteHexGrid
          controlsTarget={controlsTarget}
          hexMapTarget={hexMapTarget}
        />
        <NoteTiles selected={selected} setSelected={setSelected} />
        {/* <gridHelper rotation={[Math.PI / 2, 0, 0]} /> */}
        {/* <axesHelper args={[1]} /> */}
      </Canvas>

      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center">
        {selected !== undefined && (
          <Piano
            selection={getNotesForHex(selected).map((x) => ({
              noteNum: Midi.toMidi(x)! - 12,
              color: colors.YELLOW_400,
            }))}
          />
        )}
      </div>
    </div>
  );
}
