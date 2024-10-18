export type Hex = {
  q: number;
  r: number;
  root: string;
  quality: string;
  offset?: number;
};

export const hexes: Hex[] = [
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
  // -3
  {
    q: 0,
    r: -3,
    root: "F#4",
    quality: "dim7",
  },
  {
    q: 1,
    r: -3,
    root: "Eb4",
    quality: "dim7",
  },
  {
    q: 2,
    r: -3,
    root: "C4",
    quality: "dim7",
  },
  {
    q: 3,
    r: -3,
    root: "A3",
    quality: "dim7",
  },
  // -4
  {
    q: 0,
    r: -4,
    root: "D4",
    quality: "7",
    offset: 1,
  },
  {
    q: 1,
    r: -4,
    root: "B3",
    quality: "7",
    offset: 1,
  },
  {
    q: 2,
    r: -4,
    root: "Ab3",
    quality: "7",
    offset: 1,
  },
  {
    q: 3,
    r: -4,
    root: "F3",
    quality: "7",
    offset: 1,
  },
];
