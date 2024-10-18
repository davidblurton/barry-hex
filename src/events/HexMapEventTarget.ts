"use client";
import { HEX_WIDTH, HexCoord } from "@/lib/hex";
import { generateTile, Hex } from "@/lib/tiles";
import { Range } from "tonal";

export class HexMapEventTarget extends EventTarget {
  readonly chunkSize = 6;
  generatedChunks: Map<number, Hex[]> = new Map();

  getHexes(): Hex[] {
    return Array.from(this.generatedChunks.values()).flat();
  }

  updateBounds(bounds: { min: HexCoord; max: HexCoord }) {
    // console.log(`r: ${bounds.min.r}->${bounds.max.r}`);
    const rValues = Range.numeric([
      Math.floor(bounds.min.r / this.chunkSize),
      Math.floor(bounds.max.r / this.chunkSize),
    ]).map((x) => x * this.chunkSize);

    rValues.forEach((r) => {
      if (!this.generatedChunks.has(r)) {
        this.generateChunk(0, r);
      }
    });
  }

  reset() {
    this.generatedChunks.clear();
  }

  private generateChunk(q: number, r: number) {
    console.log(`Generate chunk: ${r}->${r + this.chunkSize - 1}`);

    const chunks: Hex[] = [];

    Range.numeric([0, HEX_WIDTH - 1]).forEach((q) => {
      Range.numeric([r, r + this.chunkSize - 1]).forEach((r) => {
        chunks.push(generateTile(q - Math.floor(r / 2), r));
      });
    });

    this.generatedChunks.set(r, chunks);
    this.dispatchEvent(new Event("chunksUpdated"));
  }
}
