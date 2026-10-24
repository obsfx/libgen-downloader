import { Color, ShaderMaterial, Vector3 } from "three";

export interface LampLattice {
  origin: Vector3;
  step: Vector3;
  intensity: number;
}

export abstract class LibraryMaterials {
  static readonly fogColor = new Color("#0d0a12");

  private static readonly noise = `
// Hash without Sine by Dave Hoskins, MIT License: https://www.shadertoy.com/view/4djSRW
float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float valueNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash12(cell);
  float b = hash12(cell + vec2(1.0, 0.0));
  float c = hash12(cell + vec2(0.0, 1.0));
  float d = hash12(cell + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
`;

  private static readonly lighting = `
uniform vec3 uFogColor;
uniform float uFogDensity;
uniform vec3 uLightDirection;
uniform vec3 uLampOrigin;
uniform vec3 uLampStep;
uniform float uLampIntensity;
uniform float uTime;

const vec3 LAMP = vec3(1.0, 0.64, 0.34);

float flicker(float index) {
  float t = uTime + index * 1.37;
  return 0.86 + 0.08 * sin(t * 7.3) + 0.04 * sin(t * 13.1 + 1.7) + 0.03 * sin(t * 23.9 + 0.4);
}

vec3 shade(vec3 color, vec3 normal, vec3 worldPosition, float depth) {
  float diffuse = max(dot(normal, uLightDirection), 0.0);
  float sky = 0.5 + 0.5 * normal.y;
  vec3 light = vec3(0.19 + 0.07 * sky + 0.2 * diffuse) * vec3(0.82, 0.82, 0.96);
  float stepLength = max(dot(uLampStep, uLampStep), 1e-4);
  float index = floor(dot(worldPosition - uLampOrigin, uLampStep) / stepLength + 0.5);
  vec3 lamp = uLampOrigin + index * uLampStep;
  vec3 toLamp = lamp - worldPosition;
  float distance2 = dot(toLamp, toLamp);
  float facing = 0.3 + 0.7 * max(dot(normal, normalize(toLamp)), 0.0);
  light += LAMP * uLampIntensity * flicker(index) * facing / (1.0 + 0.34 * distance2);
  vec3 lit = color * light;
  lit += (hash12(gl_FragCoord.xy) - 0.5) * 0.04;
  float fog = 1.0 - exp(-uFogDensity * uFogDensity * depth * depth);
  return mix(lit, uFogColor, fog);
}
`;

  private static readonly vertexShader = `
attribute float aIndex;
attribute float aSeed;
uniform vec3 uPulled;
uniform vec3 uPull;
varying vec3 vLocalNormal;
varying vec3 vLocalPosition;
varying vec3 vScale;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;
varying vec3 vColor;
varying float vSeed;
varying float vDepth;

void main() {
  float pull = uPull.x * step(abs(aIndex - uPulled.x), 0.5)
    + uPull.y * step(abs(aIndex - uPulled.y), 0.5)
    + uPull.z * step(abs(aIndex - uPulled.z), 0.5);
  mat4 world = modelMatrix * instanceMatrix;
  vec3 forward = (world * vec4(0.0, 0.0, 1.0, 0.0)).xyz;
  vec4 worldPosition = world * vec4(position, 1.0) + vec4(forward * pull * 0.6, 0.0);
  vScale = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
  vWorldNormal = normalize((world * vec4(normal, 0.0)).xyz);
  vWorldPosition = worldPosition.xyz;
  vLocalNormal = normal;
  vLocalPosition = position;
  vColor = instanceColor;
  vSeed = aSeed;
  vec4 viewPosition = viewMatrix * worldPosition;
  vDepth = -viewPosition.z;
  gl_Position = projectionMatrix * viewPosition;
}
`;

  private static readonly varyings = `
varying vec3 vLocalNormal;
varying vec3 vLocalPosition;
varying vec3 vScale;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;
varying vec3 vColor;
varying float vSeed;
varying float vDepth;
`;

  private static readonly bookFragmentShader = `
${LibraryMaterials.varyings}
${LibraryMaterials.noise}
${LibraryMaterials.lighting}

const vec3 GILT = vec3(0.82, 0.64, 0.32);
const vec3 PARCHMENT = vec3(0.8, 0.71, 0.53);

void main() {
  vec3 color = vColor * (0.88 + 0.16 * valueNoise(vLocalPosition.xy * vec2(18.0, 70.0) + vSeed));
  if (vLocalNormal.z > 0.5) {
    float y = vLocalPosition.y;
    float x = vLocalPosition.x;
    float style = hash11(vSeed * 7.7);
    float ribDistance = abs(fract((y + 0.36) / 0.18 + 0.5) - 0.5) * 0.18;
    float inRibZone = step(abs(y), 0.4);
    float rib = (1.0 - smoothstep(0.008, 0.016, ribDistance)) * inRibZone * step(0.3, style);
    float gilt = (1.0 - smoothstep(0.002, 0.005, abs(ribDistance - 0.022))) * inRibZone * step(0.62, style);
    color = mix(color, color * 1.45 + 0.03, rib * 0.85);
    color = mix(color, GILT, gilt * 0.9);
    float labelPick = hash11(vSeed * 2.9);
    float label = step(abs(y - 0.27), 0.055) * step(abs(x), 0.34) * step(0.68, labelPick);
    vec3 labelColor = mix(vec3(0.36, 0.07, 0.06), vec3(0.07, 0.05, 0.05), step(0.84, labelPick));
    float labelEdge = label * (1.0 - step(abs(y - 0.27), 0.044) * step(abs(x), 0.28));
    color = mix(color, labelColor, label);
    color = mix(color, GILT, labelEdge * 0.85);
    color *= 0.72 + 0.28 * smoothstep(0.5, 0.28, abs(x));
  } else if (vLocalNormal.y > 0.5) {
    float pages = step(abs(vLocalPosition.x), 0.42) * step(vLocalPosition.z, 0.44);
    float leaves = 0.86 + 0.14 * valueNoise(vec2(vLocalPosition.x * 60.0, vSeed));
    color = mix(color, PARCHMENT * leaves, pages);
  } else if (vLocalNormal.z < -0.5) {
    color *= 0.5;
  }
  gl_FragColor = vec4(shade(color, normalize(vWorldNormal), vWorldPosition, vDepth), 1.0);
}
`;

  private static readonly woodFragmentShader = `
${LibraryMaterials.varyings}
${LibraryMaterials.noise}
${LibraryMaterials.lighting}

void main() {
  vec3 p = vLocalPosition * vScale;
  vec2 grain = vec2(p.x, p.y + p.z);
  if (vScale.y >= vScale.x && vScale.y >= vScale.z) {
    grain = vec2(p.y, p.x + p.z);
  } else if (vScale.z > vScale.x) {
    grain = vec2(p.z, p.x + p.y);
  }
  float warp = valueNoise(vec2(grain.x * 1.2, grain.y * 5.0 + vSeed * 9.0));
  float rings = 0.5 + 0.5 * sin(grain.y * 140.0 + warp * 9.0 + vSeed * 20.0);
  float streak = valueNoise(vec2(grain.x * 0.9, grain.y * 55.0 + vSeed * 3.0));
  vec3 color = vColor * (0.74 + 0.16 * rings + 0.2 * streak);
  gl_FragColor = vec4(shade(color, normalize(vWorldNormal), vWorldPosition, vDepth), 1.0);
}
`;

  private static readonly stoneFragmentShader = `
${LibraryMaterials.varyings}
${LibraryMaterials.noise}
${LibraryMaterials.lighting}

void main() {
  vec3 w = vWorldPosition;
  vec2 uv = vec2(w.x + w.z, w.y) / vec2(0.46, 0.3);
  if (abs(vWorldNormal.y) > 0.5) {
    uv = w.xz / vec2(0.72, 0.56);
  }
  uv.x += step(1.0, mod(floor(uv.y), 2.0)) * 0.5;
  vec2 cell = floor(uv);
  vec2 f = fract(uv);
  float edge = min(min(f.x, 1.0 - f.x), min(f.y, 1.0 - f.y));
  float mortar = smoothstep(0.0, 0.05, edge);
  float tone = hash12(cell + vSeed);
  float rough = valueNoise(uv * 7.0);
  vec3 color = vColor * (0.76 + 0.24 * tone) * (0.82 + 0.24 * rough);
  color *= mix(0.4, 1.0, mortar);
  gl_FragColor = vec4(shade(color, normalize(vWorldNormal), vWorldPosition, vDepth), 1.0);
}
`;

  static books(fogDensity: number, lamps: LampLattice): ShaderMaterial {
    return LibraryMaterials.create(LibraryMaterials.bookFragmentShader, fogDensity, lamps);
  }

  static wood(fogDensity: number, lamps: LampLattice): ShaderMaterial {
    return LibraryMaterials.create(LibraryMaterials.woodFragmentShader, fogDensity, lamps);
  }

  static stone(fogDensity: number, lamps: LampLattice): ShaderMaterial {
    return LibraryMaterials.create(LibraryMaterials.stoneFragmentShader, fogDensity, lamps);
  }

  private static create(fragmentShader: string, fogDensity: number, lamps: LampLattice): ShaderMaterial {
    return new ShaderMaterial({
      vertexShader: LibraryMaterials.vertexShader,
      fragmentShader,
      uniforms: {
        uFogColor: { value: LibraryMaterials.fogColor },
        uFogDensity: { value: fogDensity },
        uLightDirection: { value: new Vector3(-0.35, 0.75, 0.55).normalize() },
        uLampOrigin: { value: lamps.origin },
        uLampStep: { value: lamps.step },
        uLampIntensity: { value: lamps.intensity },
        uTime: { value: 0 },
        uPulled: { value: new Vector3(-1, -1, -1) },
        uPull: { value: new Vector3(0, 0, 0) },
      },
    });
  }
}
