import { GameObject } from './entities/GameObject.js';

export class SpatialGrid<T extends GameObject> {
  private grid: Map<string, Set<T>> = new Map();
  private cellSize: number;

  constructor(cellSize: number = 10) {
    this.cellSize = cellSize;
  }

  private getKey(x: number, z: number): string {
    const gx = Math.floor(x / this.cellSize);
    const gz = Math.floor(z / this.cellSize);
    return `${gx},${gz}`;
  }

  clear() {
    this.grid.clear();
  }

  insert(obj: T) {
    const key = this.getKey(obj.x, obj.z);
    if (!this.grid.has(key)) {
      this.grid.set(key, new Set());
    }
    this.grid.get(key)!.add(obj);
  }

  getNearby(x: number, z: number, radius: number): T[] {
    const results: T[] = [];
    const minX = Math.floor((x - radius) / this.cellSize);
    const maxX = Math.floor((x + radius) / this.cellSize);
    const minZ = Math.floor((z - radius) / this.cellSize);
    const maxZ = Math.floor((z + radius) / this.cellSize);

    for (let gx = minX; gx <= maxX; gx++) {
      for (let gz = minZ; gz <= maxZ; gz++) {
        const key = `${gx},${gz}`;
        const cell = this.grid.get(key);
        if (cell) {
          for (const obj of cell) {
            results.push(obj);
          }
        }
      }
    }
    return results;
  }
}
