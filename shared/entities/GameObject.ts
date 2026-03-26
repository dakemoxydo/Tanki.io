export abstract class GameObject {
  id: string;
  x: number;
  z: number;
  rotation: number;
  type: string;
  active: boolean = true;

  constructor(id: string, x: number, z: number, rotation: number = 0, type: string = 'object') {
    this.id = id;
    this.x = x;
    this.z = z;
    this.rotation = rotation;
    this.type = type;
  }

  abstract update(delta: number, ...args: any[]): void;
}
