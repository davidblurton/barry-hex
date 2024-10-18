export class Point {
  constructor(public x: number, public y: number) {}
}

export const HEX_SIZE = 1;

export type HexCoord = {
  q: number;
  r: number;
};

export function cube_round(frac: { q: number; r: number; s: number }) {
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

export function axial_round(hex: { q: number; r: number }) {
  return cube_to_axial(cube_round(axial_to_cube(hex)));
}

export function pointy_hex_corner(center: Point, size: number, i: number) {
  const angle_deg = 60 * i - 30;
  const angle_rad = (Math.PI / 180) * angle_deg;

  return new Point(
    center.x + size * Math.cos(angle_rad),
    center.y + size * Math.sin(angle_rad)
  );
}

export function hexToGridPoint(q: number, r: number) {
  return new Point(
    HEX_SIZE * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r),
    HEX_SIZE * (3 / 2) * r
  );
}

export function pixel_to_pointy_hex(point: Point) {
  const q = ((Math.sqrt(3) / 3) * point.x - (1 / 3) * point.y) / HEX_SIZE;
  const r = ((2 / 3) * point.y) / HEX_SIZE;
  return axial_round({ q, r });
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
