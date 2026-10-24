import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  type Vector3,
} from "three";

export interface Lantern {
  position: Vector3;
  index: number;
}

export class LanternField {
  private static readonly flameColor = new Color("#ffc27a");
  private static readonly haloScale = 11;

  readonly group = new Group();
  private readonly lanterns: Lantern[];
  private readonly halos: Sprite[] = [];
  private readonly geometry = new SphereGeometry(1, 16, 12);
  private readonly flameMaterial = new MeshBasicMaterial({ color: LanternField.flameColor, fog: true });
  private readonly haloTexture = LanternField.createHaloTexture();
  private readonly haloMaterials: SpriteMaterial[] = [];
  private readonly radius: number;

  constructor(lanterns: Lantern[], radius: number) {
    this.lanterns = lanterns;
    this.radius = radius;
    lanterns.forEach(({ position }) => {
      const flame = new Mesh(this.geometry, this.flameMaterial);
      flame.position.copy(position);
      flame.scale.set(radius * 0.7, radius, radius * 0.7);
      const material = new SpriteMaterial({
        map: this.haloTexture,
        color: LanternField.flameColor,
        blending: AdditiveBlending,
        depthWrite: false,
        transparent: true,
        fog: true,
      });
      const halo = new Sprite(material);
      halo.position.copy(position);
      this.haloMaterials.push(material);
      this.halos.push(halo);
      this.group.add(flame, halo);
    });
  }

  update(time: number): void {
    this.halos.forEach((halo, position) => {
      const strength = LanternField.flicker(time + this.lanterns[position].index * 1.37);
      halo.scale.setScalar(this.radius * LanternField.haloScale * (0.92 + 0.12 * strength));
      this.haloMaterials[position].opacity = 0.42 * strength;
    });
  }

  dispose(): void {
    this.geometry.dispose();
    this.flameMaterial.dispose();
    this.haloTexture.dispose();
    this.haloMaterials.forEach((material) => {
      material.dispose();
    });
  }

  private static flicker(t: number): number {
    return 0.86 + 0.08 * Math.sin(t * 7.3) + 0.04 * Math.sin(t * 13.1 + 1.7) + 0.03 * Math.sin(t * 23.9 + 0.4);
  }

  private static createHaloTexture(): CanvasTexture {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (context) {
      const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
      gradient.addColorStop(0.18, "rgba(255, 255, 255, 0.45)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, size, size);
    }
    return new CanvasTexture(canvas);
  }
}
