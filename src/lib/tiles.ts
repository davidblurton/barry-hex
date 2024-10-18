import { Hex } from "./data";

export function getQuality(r: number) {
  return ["7", "dim7", "m6", "6"][(r + 4 ** 10) % 4];
}

export function getRoot(q: number, r: number) {
  if (r === 0) {
    return ["Eb4", "C4", "A3", "F#3"][(q + 4 ** 10) % 4];
  }

  if (r === -1 || r === -2 || r === -3) {
    return ["F#4", "Eb4", "C4", "A3"][(q + 4 ** 10) % 4];
  }

  if (r === -4) {
    return ["D4", "B3", "Ab3", "F3"][(q + 4 ** 10) % 4];
  }

  return "";
}

export function getOffset(r: number) {
  return r % 4 === 0 ? 1 : 0;
}

export function generateTile(q: number, r: number): Hex {
  return {
    q,
    r,
    quality: getQuality(r),
    root: getRoot(q, r),
    offset: getOffset(r),
  };
}
