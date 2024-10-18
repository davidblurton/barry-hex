import { colors } from "@/lib/colors";
import { Hex, HEX_SIZE, hexToGridPoint, pointy_hex_corner } from "@/lib/hex";
import { Line, Text } from "@react-three/drei";
import React, { useState } from "react";

import * as THREE from "three";
import { Chord } from "tonal";

function getLabelForHex(hex: Hex) {
  if (hex.root === "" || hex.quality === "") {
    return "";
  }

  const chord = Chord.get([hex.root, hex.quality]);
  return chord.tonic + chord.aliases[0];
}

export default function HexTile({
  hex,
  onClick,
  selected,
}: {
  hex: Hex;
  onClick: (hex: Hex) => void;
  selected: boolean;
}) {
  const [hover, setHover] = useState(false);
  const center = hexToGridPoint(hex.q, hex.r);

  const shape = React.useMemo(() => {
    const hex = new THREE.Shape();
    const start = pointy_hex_corner(center, HEX_SIZE, 0);

    hex.moveTo(start.x, start.y);

    for (let i = 1; i < 6; i++) {
      const p = pointy_hex_corner(center, HEX_SIZE, i);
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
          <meshBasicMaterial color={selected ? colors.YELLOW_400 : hex.color} />
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
        position={[center.x, center.y - HEX_SIZE / 2, 0]}
        fontSize={0.2}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {`${hex.q}, ${hex.r}`}
      </Text>
    </>
  );
}
