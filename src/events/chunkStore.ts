import { Hex } from "@/lib/data";

function createChunkStore() {
  const store: Map<number, Hex[]> = new Map();

  return store;
}

export const globalChunkStore = createChunkStore();
