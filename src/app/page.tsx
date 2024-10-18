"use client";

import React, { useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
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

function cube_round(frac: { q: number; r: number; s: number }) {
  let q = Math.round(frac.q);
  let r = Math.round(frac.r);
  let s = Math.round(frac.s);

  const q_diff = Math.abs(q - frac.q);
  const r_diff = Math.abs(r - frac.r);
  const s_diff = Math.abs(s - frac.s);

  if (q_diff > r_diff && q_diff > s_diff) {
    q = -r - s;
  } else if (r_diff > s_diff) {
    r = -q - s;
  } else {
    s = -q - r;
  }

  return { q, r, s };
}

function cube_to_axial(cube: { q: number; r: number }) {
  const q = cube.q;
  const r = cube.r;
  return { q, r };
}

function axial_to_cube(hex: { q: number; r: number }) {
  const q = hex.q;
  const r = hex.r;
  const s = -q - r;
  return { q, r, s };
}

function axial_round(hex: { q: number; r: number }) {
  return cube_to_axial(cube_round(axial_to_cube(hex)));
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

function hexToGridPoint(q: number, r: number) {
  return new Point(
    size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r),
    size * (3 / 2) * r
  );
}

function getLabelForHex(hex: Hex) {
  if (hex.quality === "") {
    return "";
  }

  const chord = Chord.get([hex.root, hex.quality]);
  return chord.tonic + chord.aliases[0];
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
  const center = hexToGridPoint(hex.q, hex.r);

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

  return (
    <>
      {hex.quality !== "" && (
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
      )}

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
        {getLabelForHex(hex)}
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

    const gridPoint = hexToGridPoint(hex.q, hex.r);

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

function pixel_to_pointy_hex(point: Point) {
  const q = ((Math.sqrt(3) / 3) * point.x - (1 / 3) * point.y) / size;
  const r = ((2 / 3) * point.y) / size;
  return axial_round({ q, r });
}

type HexCoord = {
  q: number;
  r: number;
};

class HexMapEventTarget extends EventTarget {
  readonly chunkSize = 6;
  generatedChunks: Record<number, Hex[]> = {};

  getHexes(): Hex[] {
    return Object.values(this.generatedChunks).flat();
  }

  updateBounds(bounds: { min: HexCoord; max: HexCoord }) {
    // console.log(`r: ${bounds.min.r}->${bounds.max.r}`);

    const rValues = Range.numeric([
      Math.floor(bounds.min.r / this.chunkSize),
      Math.floor(bounds.max.r / this.chunkSize),
    ]).map((x) => x * this.chunkSize);

    rValues.forEach((r) => {
      if (this.generatedChunks[r] === undefined) {
        this.generateChunk(0, r);
      }
    });
  }

  private generateChunk(q: number, r: number) {
    console.log(`Generate chunk: ${r}->${r + this.chunkSize - 1}`);

    const chunks: Hex[] = [];

    Range.numeric([-4, 4]).forEach((q) => {
      Range.numeric([r, r + this.chunkSize - 1]).forEach((r) => {
        chunks.push({
          q: q - Math.floor(r / 2),
          r,
          quality: "",
          root: "",
        });
      });
    });

    this.generatedChunks[r] = chunks;
    this.dispatchEvent(new Event("chunksUpdated"));
  }
}

const hexMapTarget = new HexMapEventTarget();

function Resize({ controlsTarget }: { controlsTarget: EventTarget }) {
  const { camera } = useThree();
  const [, setCounter] = useState(0);

  useEffect(() => {
    function calcWidthHeight() {
      if (camera instanceof THREE.OrthographicCamera) {
        const zoom = camera.zoom;

        const b = {
          minX: camera.position.x + camera.left / zoom,
          maxX: camera.position.x + camera.right / zoom,
          maxY: camera.position.y + camera.top / zoom,
          minY: camera.position.y + camera.bottom / zoom,
        };

        const topLeft = pixel_to_pointy_hex({ x: b.minX, y: b.maxY });
        const bottomRight = pixel_to_pointy_hex({ x: b.maxX, y: b.minY });

        const h = {
          min: { q: topLeft.q, r: topLeft.r },
          max: { q: bottomRight.q, r: bottomRight.r },
        };

        hexMapTarget.updateBounds(h);
      }
    }
    calcWidthHeight();

    controlsTarget.addEventListener("moved", calcWidthHeight);

    return () => {
      controlsTarget.removeEventListener("moved", calcWidthHeight);
    };
  }, [camera, controlsTarget]);

  useEffect(() => {
    function update() {
      setCounter((c) => c + 1);
    }

    hexMapTarget.addEventListener("chunksUpdated", update);

    return () => {
      hexMapTarget.removeEventListener("chunksUpdated", update);
    };
  }, []);

  return (
    <>
      {hexMapTarget.getHexes().map((hex) => (
        <HexShape
          key={`${hex.q},${hex.r}`}
          hex={hex}
          onClick={() => {}}
          selected={false}
        />
      ))}
    </>
  );
}

class ControlsEventTarget extends EventTarget {
  constructor() {
    super();
  }

  onMove() {
    this.dispatchEvent(new CustomEvent("moved"));
  }
}

export default function CanvasPage() {
  const initialHex = hexes[6];
  const initialPoint = hexToGridPoint(initialHex.q, initialHex.r);
  const target = new ControlsEventTarget();

  const [selected, setSelected] = useState<Hex | undefined>(initialHex);

  function onMove() {
    target.onMove();
  }

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
          onChange={onMove}
        />

        <Resize controlsTarget={target} />
        <Scene selected={selected} setSelected={setSelected} />
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
