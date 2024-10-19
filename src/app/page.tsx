"use client";

import React, { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { MapControls, OrthographicCamera } from "@react-three/drei";

import { Chord, Midi, Range } from "tonal";
import Piano from "@/components/Piano";
import { ControlsEventTarget } from "@/events/ControlsEventTarget";
import { ChunkCache, HexMapEventTarget } from "@/events/HexMapEventTarget";
import InfiniteHexGrid from "@/components/InfiniteHexGrid";
import { colors } from "@/lib/colors";
import { generateTile, Hex } from "@/lib/tiles";
import "@types/webpack-env";

function getNotesForHex(hex: Hex) {
  return Range.numeric([0, 3])
    .map((x) => x + hex.offset)
    .map(Chord.steps(hex.quality, hex.root));
}

export default function CanvasPage() {
  const initialHex = generateTile(2, -1); // C6
  const initialPoint = { x: 0, y: 0 }; //hexToGridPoint(initialHex.q, initialHex.r);

  const [selected, setSelected] = useState<Hex | undefined>(initialHex);
  const chunkCache = useRef<ChunkCache>(new Map());

  if (module.hot) {
    chunkCache.current.clear();
  }

  const controlsTarget = new ControlsEventTarget();
  const hexMapTarget = new HexMapEventTarget(chunkCache.current);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "ArrowDown":
          setSelected((hex) =>
            hex ? generateTile(hex.q, hex.r - 1) : undefined
          );
          break;
        case "ArrowUp":
          setSelected((hex) =>
            hex ? generateTile(hex.q, hex.r + 1) : undefined
          );
          break;
        case "ArrowLeft":
          setSelected((hex) =>
            hex ? generateTile(hex.q - 1, hex.r) : undefined
          );
          break;
        case "ArrowRight":
          setSelected((hex) =>
            hex ? generateTile(hex.q + 1, hex.r) : undefined
          );
          break;
      }
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="h-full w-full">
      <Canvas frameloop="demand">
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
