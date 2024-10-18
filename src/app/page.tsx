"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { MapControls, OrthographicCamera } from "@react-three/drei";

import { Chord, Midi, Range } from "tonal";
import Piano from "@/components/Piano";
import { hexToGridPoint } from "@/lib/hex";
import { ControlsEventTarget } from "@/events/ControlsEventTarget";
import { HexMapEventTarget } from "@/events/HexMapEventTarget";
import InfiniteHexGrid from "@/components/InfiniteHexGrid";
import { colors } from "@/lib/colors";
import { generateTile, Hex } from "@/lib/tiles";

function getNotesForHex(hex: Hex) {
  return Range.numeric([0, 3])
    .map((x) => x + hex.offset)
    .map(Chord.steps(hex.quality, hex.root));
}

export default function CanvasPage() {
  const initialHex = generateTile(2, -1); // C6
  const initialPoint = { x: 0, y: 0 }; //hexToGridPoint(initialHex.q, initialHex.r);

  const [selected, setSelected] = useState<Hex | undefined>(initialHex);

  console.log(selected);

  const instanceRef = useRef<HexMapEventTarget>(new HexMapEventTarget());

  const hexMapTarget = instanceRef.current;
  const controlsTarget = new ControlsEventTarget();

  useEffect(() => {
    hexMapTarget.reset();
    controlsTarget.onMove();
  }, [controlsTarget, hexMapTarget]);

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
          selected={selected}
          onClick={setSelected}
        />
        {/* <NoteTiles selected={selected} setSelected={setSelected} /> */}
        {/* <gridHelper rotation={[Math.PI / 2, 0, 0]} /> */}
        <axesHelper args={[1]} />
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
