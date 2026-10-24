import {
  BoxGeometry,
  Color,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  Quaternion,
  Vector3,
  type ShaderMaterial,
} from "three";
import { SeededRandom } from "@/src/lib/library/seeded-random";

export interface BookcaseShape {
  width: number;
  height: number;
  depth: number;
  shelves: number;
}

interface Piece {
  matrix: Matrix4;
  color: Color;
  seed: number;
}

interface LibraryMeshes {
  books: InstancedMesh;
  wood: InstancedMesh;
  stone: InstancedMesh;
}

export class BookcaseBuilder {
  private static readonly bindings = [
    "#5c1a1b",
    "#6e2026",
    "#7c2f22",
    "#8a4b28",
    "#8a4b28",
    "#a46b37",
    "#6b4122",
    "#6b4122",
    "#4a2d18",
    "#4a2d18",
    "#2f2014",
    "#2f4632",
    "#4f5a34",
    "#2a3448",
    "#3b3f45",
    "#c9b68a",
    "#b49c6c",
    "#1f1815",
    "#7a5a2a",
  ].map((hex) => {
    return new Color(hex);
  });
  private static readonly woods = ["#6a4426", "#5c3a20", "#734a2a", "#4f321c"].map((hex) => {
    return new Color(hex);
  });
  private static readonly stoneColor = new Color("#8d8379");
  private static readonly boardThickness = 0.035;

  private readonly books: Piece[] = [];
  private readonly woodPieces: Piece[] = [];
  private readonly stonePieces: Piece[] = [];
  private readonly centers: Vector3[] = [];
  private random = new SeededRandom(1);
  private woodColor = BookcaseBuilder.woods[0];

  add(placement: Matrix4, shape: BookcaseShape, seed: number): void {
    this.random = new SeededRandom(seed);
    this.woodColor = this.random.pick(BookcaseBuilder.woods);
    const { width, height, depth, shelves } = shape;
    const board = BookcaseBuilder.boardThickness;
    this.addWoodBox(placement, new Vector3(-width / 2 + board / 2, height / 2, 0.01), new Vector3(board * 1.6, height, depth + 0.02));
    this.addWoodBox(placement, new Vector3(width / 2 - board / 2, height / 2, 0.01), new Vector3(board * 1.6, height, depth + 0.02));
    this.addWoodBox(placement, new Vector3(0, height / 2, -depth / 2 + 0.006), new Vector3(width, height, 0.012));
    this.addWoodBox(placement, new Vector3(0, height + 0.05, 0.03), new Vector3(width + 0.06, 0.1, depth + 0.08));
    this.addWoodBox(placement, new Vector3(0, height + 0.13, 0.05), new Vector3(width + 0.1, 0.06, depth + 0.12));
    this.addWoodBox(placement, new Vector3(0, 0.06, 0.03), new Vector3(width + 0.04, 0.12, depth + 0.07));
    const base = 0.12;
    const gap = (height - base - board) / shelves;
    for (let shelf = 0; shelf <= shelves; shelf++) {
      const y = base + board / 2 + shelf * gap;
      this.addWoodBox(placement, new Vector3(0, y, 0.01), new Vector3(width - 2 * board, board, depth));
      this.addWoodBox(placement, new Vector3(0, y - 0.004, depth / 2 + 0.012), new Vector3(width - 2 * board, board + 0.02, 0.024));
      if (shelf < shelves) {
        this.fillShelf(placement, y + board / 2, gap - board, width - 2 * board, depth);
      }
    }
  }

  addStone(matrix: Matrix4): void {
    this.stonePieces.push({ matrix, color: BookcaseBuilder.stoneColor, seed: this.random.next() * 50 });
  }

  addTimber(matrix: Matrix4, color?: Color): void {
    this.woodPieces.push({ matrix, color: color ?? this.woodColor, seed: this.random.next() * 50 });
  }

  closestBook(point: Vector3): number {
    let closest = -1;
    let closestDistance = Infinity;
    this.centers.forEach((center, index) => {
      const distance = center.distanceToSquared(point);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = index;
      }
    });
    return closest;
  }

  build(materials: { books: ShaderMaterial; wood: ShaderMaterial; stone: ShaderMaterial }): LibraryMeshes {
    return {
      books: BookcaseBuilder.mesh(this.books, materials.books, true),
      wood: BookcaseBuilder.mesh(this.woodPieces, materials.wood, false),
      stone: BookcaseBuilder.mesh(this.stonePieces, materials.stone, false),
    };
  }

  private fillShelf(placement: Matrix4, floorY: number, clearance: number, innerWidth: number, depth: number): void {
    let x = -innerWidth / 2 + 0.008;
    const end = innerWidth / 2 - 0.008;
    while (x < end - 0.025) {
      const roll = this.random.next();
      if (roll < 0.035) {
        x += this.random.range(0.05, 0.12);
        continue;
      }
      if (roll < 0.08 && end - x > 0.34) {
        x = this.addPile(placement, x, floorY, clearance, depth);
        continue;
      }
      const thickness = Math.min(this.random.range(0.028, 0.075), end - x);
      const height = clearance * this.random.range(0.62, 0.95);
      const bookDepth = depth * this.random.range(0.74, 0.92);
      const lean = roll > 0.965 && end - x > 0.14;
      const angle = lean ? -this.random.range(0.12, 0.26) : 0;
      const shift = lean ? Math.sin(-angle) * height * 0.5 : 0;
      this.addBook(
        placement,
        new Vector3(x + thickness / 2 + shift, floorY + (height * Math.cos(angle)) / 2, depth / 2 - bookDepth / 2 - 0.012),
        new Vector3(thickness, height, bookDepth),
        angle,
      );
      x += thickness + shift * 2 + this.random.range(0, 0.003);
    }
  }

  private addPile(placement: Matrix4, x: number, floorY: number, clearance: number, depth: number): number {
    const length = this.random.range(0.2, 0.3);
    const count = 2 + Math.floor(this.random.next() * 3);
    let y = floorY;
    for (let book = 0; book < count && y < floorY + clearance * 0.7; book++) {
      const thickness = this.random.range(0.03, 0.06);
      const bookDepth = depth * this.random.range(0.72, 0.9);
      this.addBook(
        placement,
        new Vector3(x + length / 2 + this.random.range(-0.012, 0.012), y + thickness / 2, depth / 2 - bookDepth / 2 - 0.012),
        new Vector3(thickness, length, bookDepth),
        Math.PI / 2,
      );
      y += thickness;
    }
    return x + length + 0.01;
  }

  private addBook(placement: Matrix4, center: Vector3, size: Vector3, angle: number): void {
    const rotation = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), angle);
    const matrix = placement.clone().multiply(new Matrix4().compose(center, rotation, size));
    this.books.push({ matrix, color: this.random.pick(BookcaseBuilder.bindings), seed: this.random.next() * 100 });
    this.centers.push(new Vector3().setFromMatrixPosition(matrix));
  }

  private addWoodBox(placement: Matrix4, center: Vector3, size: Vector3): void {
    this.addTimber(placement.clone().multiply(new Matrix4().compose(center, new Quaternion(), size)));
  }

  private static mesh(pieces: Piece[], material: ShaderMaterial, isIndexed: boolean): InstancedMesh {
    const geometry = new BoxGeometry(1, 1, 1);
    const indices = new Float32Array(pieces.length);
    const seeds = new Float32Array(pieces.length);
    const mesh = new InstancedMesh(geometry, material, pieces.length);
    pieces.forEach((piece, index) => {
      mesh.setMatrixAt(index, piece.matrix);
      mesh.setColorAt(index, piece.color);
      indices[index] = isIndexed ? index : -10;
      seeds[index] = piece.seed;
    });
    geometry.setAttribute("aIndex", new InstancedBufferAttribute(indices, 1));
    geometry.setAttribute("aSeed", new InstancedBufferAttribute(seeds, 1));
    mesh.frustumCulled = false;
    return mesh;
  }
}
