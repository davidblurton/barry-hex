import { HEX_WIDTH, HexCoord } from "@/lib/hex";
import { generateTile, Hex } from "@/lib/tiles";
import { arrayEqual } from "@/lib/utils";
import { Range } from "tonal";

export class HexMapEventTarget extends EventTarget {
  private readonly chunkSize = 6;
  private generatedChunks: Map<number, Hex[]> = new Map();
  private visibleChunks: number[] = [];

  getHexes(): Hex[] {
    return this.visibleChunks.flatMap((r) => this.generatedChunks.get(r)!);
  }

  updateBounds(bounds: { min: HexCoord; max: HexCoord }) {
    // console.log(`r: ${bounds.min.r}->${bounds.max.r}`);
    const prevChunks = Array.from(this.visibleChunks);

    this.visibleChunks = Range.numeric([
      Math.floor(bounds.min.r / this.chunkSize),
      Math.floor(bounds.max.r / this.chunkSize),
    ]).map((x) => x * this.chunkSize);

    this.visibleChunks.forEach((r) => {
      if (!this.generatedChunks.has(r)) {
        this.generateChunk(0, r);
      }
    });

    if (!arrayEqual(this.visibleChunks, prevChunks)) {
      this.dispatchEvent(new Event("visibleChunksChanged"));
    }
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
