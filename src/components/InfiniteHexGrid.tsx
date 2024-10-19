import { HexMapEventTarget } from "@/events/HexMapEventTarget";
import { pixel_to_pointy_hex } from "@/lib/hex";
import { useThree } from "@react-three/fiber";
import { useState, useEffect } from "react";

import * as THREE from "three";
import HexTile from "./HexTile";
import { Hex } from "@/lib/tiles";
import { ControlsEventTarget } from "@/events/ControlsEventTarget";

function getVisibleBounds(camera: THREE.OrthographicCamera) {
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

  return h;
}

export default function InfiniteHexGrid({
  controlsTarget,
  hexMapTarget,
  selected,
  onClick,
}: {
  controlsTarget: ControlsEventTarget;
  hexMapTarget: HexMapEventTarget;
  onClick: (hex: Hex) => void;
  selected?: Hex;
}) {
  const { camera } = useThree();
  const [, setCounter] = useState(0);

  useEffect(() => {
    hexMapTarget.addEventListener("visibleChunksChanged", update);
    controlsTarget.addEventListener("moved", calcWidthHeight);

    function calcWidthHeight() {
      if (camera instanceof THREE.OrthographicCamera) {
        const bounds = getVisibleBounds(camera);
        hexMapTarget.updateBounds(bounds);
      }
    }

    function update() {
      setCounter((x) => x + 1);
    }

    calcWidthHeight();

    return () => {
      hexMapTarget.removeEventListener("visibleChunksChanged", update);
      controlsTarget.removeEventListener("moved", calcWidthHeight);
    };
  }, [camera, controlsTarget, hexMapTarget]);

  // Replace with useHexes
  const hexes = hexMapTarget.getHexes();

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
