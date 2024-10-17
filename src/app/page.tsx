"use client";

import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Shape } from "three";
import { Line, MapControls, OrthographicCamera, Text } from "@react-three/drei";

import * as THREE from "three";
import { Chord, Midi, Range } from "tonal";
import Piano from "@/components/Piano";

const colors = {
  YELLOW_400: "#facc15",
  BLUE_400: "#60a5fa",
  BLUE_500: "#3b82f6",
};

class Point {
  constructor(public x: number, public y: number) {}
}

function pointy_hex_corner(center: Point, size: number, i: number) {
  const angle_deg = 60 * i - 30;
  const angle_rad = (Math.PI / 180) * angle_deg;

  return new Point(
    center.x + size * Math.cos(angle_rad),
    center.y + size * Math.sin(angle_rad)
  );
}

const size = 1;

function toGridPoint(q: number, r: number) {
  return new Point(
    size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r),
    size * (3 / 2) * r
  );
}

const HexShape = ({
  hex,
  onClick,
  selected,
}: {
  hex: Hex;
  onClick: (hex: Hex) => void;
  selected: boolean;
}) => {
  const [hover, setHover] = useState(false);
  const center = toGridPoint(hex.q, hex.r);

  const shape = React.useMemo(() => {
    const hex = new Shape();
    const start = pointy_hex_corner(center, size, 0);

    hex.moveTo(start.x, start.y);

    for (let i = 1; i < 6; i++) {
      const p = pointy_hex_corner(center, size, i);
      hex.lineTo(p.x, p.y);
    }

    hex.lineTo(start.x, start.y);
    return hex;
  }, [center]);

  const chord = Chord.get([hex.root, hex.quality]);

  return (
    <>
      <mesh
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        onClick={() => onClick(hex)}
      >
        <shapeGeometry args={[shape]} />
        <meshBasicMaterial
          color={
            selected
              ? colors.YELLOW_400
              : hover
              ? colors.BLUE_500
              : colors.BLUE_400
          }
        />
      </mesh>

      <Line
        points={shape.getPoints()}
        color="black"
        lineWidth={3}
        dashed={false}
      />

      <Text
        position={[center.x, center.y, 0]}
        fontSize={0.4}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {chord.tonic + chord.aliases[0]}
      </Text>

      <Text
        position={[center.x, center.y - size / 2, 0]}
        fontSize={0.2}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {`${hex.q}, ${hex.r}`}
      </Text>
    </>
  );
};

type Hex = {
  q: number;
  r: number;
  root: string;
  quality: string;
  offset?: number;
};

const hexes: Hex[] = [
  {
    q: 0,
    r: 0,
    root: "Eb4",
    quality: "7",
    offset: 1,
  },
  {
    q: 1,
    r: 0,
    root: "C4",
    quality: "7",
    offset: 1,
  },
  {
    q: 2,
    r: 0,
    root: "A3",
    quality: "7",
    offset: 1,
  },
  {
    q: 3,
    r: 0,
    root: "F#3",
    quality: "7",
    offset: 1,
  },
  {
    q: 0,
    r: -1,
    root: "F#4",
    quality: "6",
  },
  {
    q: 1,
    r: -1,
    root: "Eb4",
    quality: "6",
  },
  {
    q: 2,
    r: -1,
    root: "C4",
    quality: "6",
  },
  {
    q: 3,
    r: -1,
    root: "A3",
    quality: "6",
  },
  {
    q: 0,
    r: -2,
    root: "F#4",
    quality: "m6",
  },
  {
    q: 1,
    r: -2,
    root: "Eb4",
    quality: "m6",
  },
  {
    q: 2,
    r: -2,
    root: "C4",
    quality: "m6",
  },
  {
    q: 3,
    r: -2,
    root: "A3",
    quality: "m6",
  },
];

// Range.numeric([0, 4]).forEach((q) => {
//   Range.numeric([0, -4]).forEach((r) => {
//     hexes.push(new Hex(q, r));
//   });
// });

const store = {
  target: new THREE.Vector3(0, 0, 5),
};

function Scene({
  selected,
  setSelected,
}: {
  selected?: Hex;
  setSelected: (hex: Hex) => void;
}) {
  // useFrame((state, delta) => {
  // https://stackoverflow.com/questions/75562296/how-do-you-animate-the-camera-with-react-three-fiber
  // state.camera.position.x = THREE.MathUtils.damp(
  //   state.camera.position.x,
  //   store.target.x,
  //   4,
  //   delta
  // );
  // state.camera.position.y = THREE.MathUtils.damp(
  //   state.camera.position.y,
  //   store.target.y,
  //   4,
  //   delta
  // );
  // state.camera.position.z = THREE.MathUtils.damp(
  //   state.camera.position.z,
  //   store.target.z,
  //   4,
  //   delta
  // );
  // state.camera.lookAt(state.camera.position);
  // });

  function onClick(hex: Hex) {
    setSelected(hex);

    const gridPoint = toGridPoint(hex.q, hex.r);

    const target = new THREE.Vector3(gridPoint.x, gridPoint.y, 5);
    store.target = target;
  }

  return (
    <>
      {hexes.map((hex) => (
        <HexShape
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

export default function CanvasPage() {
  const initialHex = hexes[6];
  const initialPoint = toGridPoint(initialHex.q, initialHex.r);

  const [selected, setSelected] = useState<Hex | undefined>(initialHex);

  return (
    <>
      <Canvas>
        <color attach="background" args={["#f5efe6"]} />
        <ambientLight intensity={1} />
        <Scene selected={selected} setSelected={setSelected} />

        <MapControls
          makeDefault
          zoomSpeed={1}
          dampingFactor={1}
          target={[initialPoint.x, initialPoint.y, 0]}
          enableRotate={false}
          minZoom={30}
          maxZoom={100}
        />

        <OrthographicCamera
          makeDefault
          position={[initialPoint.x, initialPoint.y, 5]}
          up={[0, 0, 1]}
          zoom={70}
          far={10000}
        />
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
    </>
  );
}
