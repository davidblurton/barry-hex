"use client";
import { Hex } from "@/lib/data";
import { HexCoord } from "@/lib/hex";
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

    this.generatedChunks.set(r, chunks);
    this.dispatchEvent(new Event("chunksUpdated"));
  }
}
