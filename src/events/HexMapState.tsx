import { HEX_WIDTH, HexCoord } from "@/lib/hex";
import { generateTile, Hex } from "@/lib/tiles";
import { arrayEqual } from "@/lib/utils";
import { Range } from "tonal";

import { TypedEventTarget } from "typescript-event-target";

interface HexMapEvents {
  visibleChunksChanged: CustomEvent;
  chunksUpdated: CustomEvent;
}

type ChunkCache = Map<number, Hex[]>;

export class HexMapState extends TypedEventTarget<HexMapEvents> {
  private readonly chunkSize = 6;
  private visibleChunks: number[] = [];
  private chunkCache: ChunkCache = new Map();

  getHexes(): Hex[] {
    return this.visibleChunks.flatMap(
      (r) => this.chunkCache.get(r) ?? this.generateChunk(r)
    );
  }

  updateBounds(bounds: { min: HexCoord; max: HexCoord }) {
    // console.log(`r: ${bounds.min.r}->${bounds.max.r}`);
    const prevChunks = Array.from(this.visibleChunks);

    this.visibleChunks = Range.numeric([
      Math.floor(bounds.min.r / this.chunkSize),
      Math.floor(bounds.max.r / this.chunkSize),
    ]).map((x) => x * this.chunkSize);

    this.visibleChunks.forEach((r) => {
      if (!this.chunkCache.has(r)) {
        const chunks = this.generateChunk(r);

        this.chunkCache.set(r, chunks);
        this.dispatchTypedEvent(
          "chunksUpdated",
          new CustomEvent("chunksUpdated")
        );
      }
    });

    if (!arrayEqual(this.visibleChunks, prevChunks)) {
      this.dispatchTypedEvent(
        "visibleChunksChanged",
        new CustomEvent("visibleChunksChanged")
      );
    }
  }

  private generateChunk(r: number) {
    console.log(`Generate chunk: ${r}->${r + this.chunkSize - 1}`);

    const chunk: Hex[] = [];

    Range.numeric([0, HEX_WIDTH - 1]).forEach((q) => {
      Range.numeric([r, r + this.chunkSize - 1]).forEach((r) => {
        chunk.push(generateTile(q - Math.floor(r / 2), r));
      });
    });

    return chunk;
  }
}
