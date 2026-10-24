import {
  Color,
  FogExp2,
  Matrix4,
  PerspectiveCamera,
  Quaternion,
  Scene,
  Vector3,
  type InstancedMesh,
  type ShaderMaterial,
  type WebGLRenderer,
} from "three";
import { BookcaseBuilder } from "@/src/lib/library/bookcase-builder";
import { DustField } from "@/src/lib/library/dust-field";
import { LanternField, type Lantern } from "@/src/lib/library/lantern-field";
import { LibraryMaterials, type LampLattice } from "@/src/lib/library/library-materials";
import type { LibraryFrame } from "@/src/lib/library/types";

export class StacksScene {
  readonly maxPixelRatio = 1.5;

  private static readonly caseWidth = 1.25;
  private static readonly caseDepth = 0.34;
  private static readonly caseHeight = 2.6;
  private static readonly caseCount = 40;
  private static readonly patternCases = 8;
  private static readonly bay = StacksScene.caseWidth * 2;
  private static readonly aisleHalfWidth = 1.15;
  private static readonly startZ = 4;
  private static readonly springY = 3.05;
  private static readonly ceilingY = 4.75;
  private static readonly lanternY = 3.15;
  private static readonly speed = 0.3;
  private static readonly fogDensity = 0.1;
  private static readonly pullSearchInterval = 20;
  private static readonly iron = new Color("#1d1917");
  private static readonly targets = [new Vector3(-1.0, 1.55, -2.6), new Vector3(1.0, 1.1, -3.4), new Vector3(-1.0, 1.9, -4.3)];

  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(54, 1, 0.05, 80);
  private readonly builder = new BookcaseBuilder();
  private readonly lamps: LampLattice;
  private readonly materials: { books: ShaderMaterial; wood: ShaderMaterial; stone: ShaderMaterial };
  private readonly meshes: InstancedMesh[];
  private readonly lanterns: LanternField;
  private readonly dust: DustField;
  private readonly pulled: [number, number, number] = [-1, -1, -1];
  private cameraZ = 0;
  private frameCount = 0;

  constructor(renderer: WebGLRenderer) {
    this.renderer = renderer;
    const firstBayCenter = StacksScene.startZ - StacksScene.bay / 2;
    this.lamps = {
      origin: new Vector3(0, StacksScene.lanternY, firstBayCenter),
      step: new Vector3(0, 0, -StacksScene.bay),
      intensity: 3.0,
    };
    this.materials = {
      books: LibraryMaterials.books(StacksScene.fogDensity, this.lamps),
      wood: LibraryMaterials.wood(StacksScene.fogDensity, this.lamps),
      stone: LibraryMaterials.stone(StacksScene.fogDensity, this.lamps),
    };
    this.scene.fog = new FogExp2(LibraryMaterials.fogColor, StacksScene.fogDensity);
    this.buildBookcases();
    this.buildArchitecture();
    const lanterns = this.lanternPositions();
    const { books, wood, stone } = this.builder.build(this.materials);
    this.meshes = [books, wood, stone];
    this.scene.add(books, wood, stone);
    this.lanterns = new LanternField(lanterns, 0.045);
    this.scene.add(this.lanterns.group);
    this.dust = new DustField(420, {
      halfWidth: StacksScene.aisleHalfWidth - 0.1,
      minY: 0.3,
      maxY: 3.6,
      length: 14,
      lampOrigin: this.lamps.origin,
      lampStep: this.lamps.step,
    });
    this.scene.add(this.dust.points);
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  render({ time, pointer, focus }: LibraryFrame): void {
    const period = StacksScene.caseWidth * StacksScene.patternCases;
    this.cameraZ = 2.2 - ((time * StacksScene.speed) % period);
    const sway = Math.sin(time * 0.11) * 0.05 + pointer.x * 0.16;
    this.camera.position.set(pointer.x * 0.12, 1.45 + pointer.y * 0.12, this.cameraZ);
    this.camera.lookAt(Math.sin(sway) * 6, 1.6 + pointer.y * 0.45, this.cameraZ - 6);
    this.camera.updateMatrixWorld();

    const shouldSearch = this.frameCount % StacksScene.pullSearchInterval === 0;
    this.frameCount++;
    focus.forEach((value, channel) => {
      if (value < 0.001 && (shouldSearch || this.pulled[channel] < 0)) {
        const target = StacksScene.targets[channel];
        this.pulled[channel] = this.builder.closestBook(new Vector3(target.x, target.y, this.cameraZ + target.z));
      }
    });
    Object.values(this.materials).forEach((material) => {
      material.uniforms.uTime.value = time;
    });
    this.materials.books.uniforms.uPulled.value.set(...this.pulled);
    this.materials.books.uniforms.uPull.value.set(...focus);
    this.lanterns.update(time);
    this.dust.update(time, this.cameraZ, this.renderer.getPixelRatio());
    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    this.meshes.forEach((mesh) => {
      mesh.geometry.dispose();
      mesh.dispose();
    });
    Object.values(this.materials).forEach((material) => {
      material.dispose();
    });
    this.lanterns.dispose();
    this.dust.dispose();
  }

  private buildBookcases(): void {
    const shape = {
      width: StacksScene.caseWidth,
      height: StacksScene.caseHeight,
      depth: StacksScene.caseDepth,
      shelves: 7,
    };
    const half = StacksScene.aisleHalfWidth + shape.depth / 2;
    for (let index = 0; index < StacksScene.caseCount; index++) {
      const z = StacksScene.startZ - (index + 0.5) * StacksScene.caseWidth;
      const pattern = index % StacksScene.patternCases;
      this.builder.add(new Matrix4().makeRotationY(Math.PI / 2).setPosition(-half, 0, z), shape, 31 + pattern);
      this.builder.add(new Matrix4().makeRotationY(-Math.PI / 2).setPosition(half, 0, z), shape, 47 + pattern);
      if (pattern === 3) {
        this.addLadder(z);
      }
    }
  }

  private buildArchitecture(): void {
    const length = StacksScene.caseCount * StacksScene.caseWidth;
    const middleZ = StacksScene.startZ - length / 2;
    const backX = StacksScene.aisleHalfWidth + StacksScene.caseDepth + 0.12;
    this.addStoneBox(new Vector3(0, -0.05, middleZ), new Vector3(backX * 2 + 0.4, 0.1, length + 6));
    this.addStoneBox(new Vector3(0, StacksScene.ceilingY + 0.1, middleZ), new Vector3(backX * 2 + 0.4, 0.2, length + 6));
    [-1, 1].forEach((side) => {
      this.addStoneBox(new Vector3(side * backX, (StacksScene.caseHeight + StacksScene.ceilingY) / 2 + 0.1, middleZ), new Vector3(0.2, StacksScene.ceilingY - StacksScene.caseHeight + 0.2, length + 6));
    });
    this.addStoneBox(new Vector3(0, StacksScene.ceilingY / 2, StacksScene.startZ - length - 0.3), new Vector3(backX * 2 + 0.4, StacksScene.ceilingY + 0.4, 0.3));
    const bays = StacksScene.caseCount / 2;
    for (let bay = 0; bay <= bays; bay++) {
      const z = StacksScene.startZ - bay * StacksScene.bay;
      [-1, 1].forEach((side) => {
        const innerX = StacksScene.aisleHalfWidth - 0.12;
        const outerX = StacksScene.aisleHalfWidth + StacksScene.caseDepth + 0.05;
        this.addStoneBox(new Vector3(side * (innerX + outerX) / 2, StacksScene.springY / 2, z), new Vector3(outerX - innerX, StacksScene.springY, 0.3));
        this.addStoneBox(new Vector3(side * (innerX + outerX) / 2, StacksScene.springY + 0.07, z), new Vector3(outerX - innerX + 0.08, 0.14, 0.4));
      });
      this.addArch(z);
    }
  }

  private addArch(z: number): void {
    const springX = StacksScene.aisleHalfWidth - 0.12;
    const span = springX * 2;
    const springY = StacksScene.springY + 0.14;
    const segments = 7;
    [-1, 1].forEach((side) => {
      const center = new Vector3(side * springX, springY, z);
      const startAngle = side < 0 ? 0 : Math.PI;
      const endAngle = side < 0 ? Math.PI / 3 : (Math.PI * 2) / 3;
      for (let segment = 0; segment < segments; segment++) {
        const a = startAngle + ((endAngle - startAngle) * segment) / segments;
        const b = startAngle + ((endAngle - startAngle) * (segment + 1)) / segments;
        const from = new Vector3(center.x + Math.cos(a) * span, center.y + Math.sin(a) * span, z);
        const to = new Vector3(center.x + Math.cos(b) * span, center.y + Math.sin(b) * span, z);
        const middle = from.clone().add(to).multiplyScalar(0.5);
        const angle = Math.atan2(to.y - from.y, to.x - from.x);
        const rotation = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), angle);
        this.builder.addStone(new Matrix4().compose(middle, rotation, new Vector3(from.distanceTo(to) + 0.02, 0.16, 0.24)));
      }
    });
  }

  private addLadder(z: number): void {
    const lean = 0.19;
    const length = 2.55;
    const placement = new Matrix4().compose(
      new Vector3(StacksScene.aisleHalfWidth - 0.24, (length * Math.cos(lean)) / 2, z - 0.2),
      new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), -lean),
      new Vector3(1, 1, 1),
    );
    [-0.21, 0.21].forEach((offset) => {
      this.builder.addTimber(placement.clone().multiply(new Matrix4().compose(new Vector3(0, 0, offset), new Quaternion(), new Vector3(0.04, length, 0.045))));
    });
    for (let rung = 0; rung < 8; rung++) {
      const y = -length / 2 + 0.25 + rung * 0.3;
      this.builder.addTimber(placement.clone().multiply(new Matrix4().compose(new Vector3(0, y, 0), new Quaternion(), new Vector3(0.03, 0.03, 0.42))));
    }
  }

  private addStoneBox(center: Vector3, size: Vector3): void {
    this.builder.addStone(new Matrix4().compose(center, new Quaternion(), size));
  }

  private addIron(origin: Vector3, offset: Vector3, size: Vector3): void {
    this.builder.addTimber(new Matrix4().compose(origin.clone().add(offset), new Quaternion(), size), StacksScene.iron);
  }

  private lanternPositions(): Lantern[] {
    const lanterns: Lantern[] = [];
    const bays = StacksScene.caseCount / 2;
    for (let bay = -1; bay < bays; bay++) {
      const position = this.lamps.origin.clone().addScaledVector(this.lamps.step, bay);
      lanterns.push({ position, index: bay });
      const chainLength = StacksScene.ceilingY - position.y;
      this.builder.addTimber(
        new Matrix4().compose(new Vector3(position.x, position.y + chainLength / 2 + 0.08, position.z), new Quaternion(), new Vector3(0.012, chainLength, 0.012)),
        StacksScene.iron,
      );
      this.addIron(position, new Vector3(0, 0.15, 0), new Vector3(0.2, 0.035, 0.2));
      this.addIron(position, new Vector3(0, 0.2, 0), new Vector3(0.1, 0.06, 0.1));
      this.addIron(position, new Vector3(0, -0.13, 0), new Vector3(0.16, 0.025, 0.16));
      [-0.075, 0.075].forEach((x) => {
        [-0.075, 0.075].forEach((z) => {
          this.addIron(position, new Vector3(x, 0.01, z), new Vector3(0.012, 0.28, 0.012));
        });
      });
    }
    return lanterns;
  }
}
