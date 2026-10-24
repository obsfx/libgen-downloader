import { AdditiveBlending, BufferAttribute, BufferGeometry, Points, ShaderMaterial, type Vector3 } from "three";
import { SeededRandom } from "@/src/lib/library/seeded-random";

export interface DustVolume {
  halfWidth: number;
  minY: number;
  maxY: number;
  length: number;
  lampOrigin: Vector3;
  lampStep: Vector3;
}

export class DustField {
  private static readonly vertexShader = `
attribute float aSeed;
uniform float uTime;
uniform float uCameraZ;
uniform float uLength;
uniform float uPixelRatio;
uniform vec3 uLampOrigin;
uniform vec3 uLampStep;
varying float vAlpha;

void main() {
  vec3 p = position;
  p.x += sin(uTime * 0.13 + aSeed * 6.0) * 0.14;
  p.y += sin(uTime * 0.07 + aSeed * 3.0) * 0.2;
  p.z = uCameraZ - mod(uCameraZ - p.z + uTime * 0.02, uLength);
  float stepLength = max(dot(uLampStep, uLampStep), 1e-4);
  float index = floor(dot(p - uLampOrigin, uLampStep) / stepLength + 0.5);
  vec3 toLamp = uLampOrigin + index * uLampStep - p;
  float glow = exp(-dot(toLamp, toLamp) * 0.7);
  vec4 view = modelViewMatrix * vec4(p, 1.0);
  float twinkle = 0.6 + 0.4 * sin(uTime * (0.8 + aSeed) + aSeed * 40.0);
  vAlpha = (0.12 + 0.9 * glow) * twinkle * smoothstep(0.3, 1.2, -view.z);
  gl_PointSize = (1.4 + 2.2 * aSeed) * uPixelRatio * (2.6 / max(-view.z, 0.5));
  gl_Position = projectionMatrix * view;
}
`;

  private static readonly fragmentShader = `
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float alpha = smoothstep(0.5, 0.0, d) * vAlpha;
  gl_FragColor = vec4(vec3(1.0, 0.8, 0.56) * alpha, alpha);
}
`;

  readonly points: Points;
  private readonly geometry = new BufferGeometry();
  private readonly material: ShaderMaterial;

  constructor(count: number, volume: DustVolume) {
    const random = new SeededRandom(97);
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let index = 0; index < count; index++) {
      positions[index * 3] = random.range(-volume.halfWidth, volume.halfWidth);
      positions[index * 3 + 1] = random.range(volume.minY, volume.maxY);
      positions[index * 3 + 2] = -random.range(0, volume.length);
      seeds[index] = random.next();
    }
    this.geometry.setAttribute("position", new BufferAttribute(positions, 3));
    this.geometry.setAttribute("aSeed", new BufferAttribute(seeds, 1));
    this.material = new ShaderMaterial({
      vertexShader: DustField.vertexShader,
      fragmentShader: DustField.fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uCameraZ: { value: 0 },
        uLength: { value: volume.length },
        uPixelRatio: { value: 1 },
        uLampOrigin: { value: volume.lampOrigin },
        uLampStep: { value: volume.lampStep },
      },
    });
    this.points = new Points(this.geometry, this.material);
    this.points.frustumCulled = false;
  }

  update(time: number, cameraZ: number, pixelRatio: number): void {
    this.material.uniforms.uTime.value = time;
    this.material.uniforms.uCameraZ.value = cameraZ;
    this.material.uniforms.uPixelRatio.value = pixelRatio;
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}
