export type Hex = {
  q: number;
  r: number;
  root: string;
  quality: string;
  offset: number;
};

function mod(x: number, y: number) {
  return (x + y ** 10) % y;
}

function getQuality(r: number) {
  return ["7", "dim7", "m6", "6"][mod(r, 4)];
}

function getRoot(q: number, r: number) {
  const rOffset = mod(r, 4) === 0 ? 1 : 0;
  const rMod = mod(r, 12);

  switch (rMod) {
    case 1:
    case 2:
    case 3:
    case 4: {
      return ["Bb3", "G3", "E3", "Db3"][mod(q + rOffset, 4)];
    }
    case 5:
    case 6:
    case 7:
    case 8:
      return ["D4", "B3", "Ab3", "F3"][mod(q + rOffset, 4)];
    case 9:
    case 10:
    case 11:
    case 0:
      return ["F#4", "Eb4", "C4", "A3"][mod(q + rOffset, 4)];
  }

  return "";
}

function getOffset(q: number, r: number) {
  let qOffset = mod(q, 4) + 2;
  let rOffset = 0;

  rOffset += Math.floor(r / 12) * 4 - Math.floor(r / 4);

  if (mod(r, 4) === 0) {
    rOffset += 2;
  }

  if (mod(r, 12) === 0) {
    rOffset -= 4;
  }

  if (mod(q, 4) === 3 && mod(r, 4) === 0) {
    rOffset -= 4;
  }

  return qOffset + rOffset;
}

export function generateTile(q: number, r: number): Hex {
  return {
    q,
    r,
    quality: getQuality(r),
    root: getRoot(q, r),
    offset: getOffset(q, r),
  };
}
