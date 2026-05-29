export interface RootPath {
  d: string;
  width: number;
  opacity: number;
  delay: number;
  duration: number;
}

export interface RootCluster {
  paths: RootPath[];
  driftX: number;
  driftY: number;
  duration: number;
  delay: number;
}

export interface RootScene {
  clusters: RootCluster[];
}

type Point = {
  x: number;
  y: number;
};

type ClusterPreset = {
  direction: number;
  offsetX: number;
  offsetY: number;
  xRatio: number;
  yRatio: number;
  spread: number;
};

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const hashSeed = (seed: string): number => {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};

const createRandom = (seed: string): (() => number) => {
  let state = hashSeed(seed) || 1;

  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const range = (random: () => number, min: number, max: number): number => min + random() * (max - min);

const pick = <T>(random: () => number, values: readonly T[]): T => values[Math.floor(random() * values.length)]!;

const CLUSTER_PRESETS: readonly ClusterPreset[] = [
  {
    direction: 0,
    offsetX: -0.035,
    offsetY: 0,
    xRatio: 0,
    yRatio: 0.36,
    spread: 0.72
  },
  {
    direction: Math.PI / 2,
    offsetX: 0,
    offsetY: -0.05,
    xRatio: 0.78,
    yRatio: 0,
    spread: 0.84
  },
  {
    direction: Math.PI,
    offsetX: 0.035,
    offsetY: 0,
    xRatio: 1,
    yRatio: 0.42,
    spread: 0.68
  },
  {
    direction: -Math.PI / 2,
    offsetX: 0,
    offsetY: 0.055,
    xRatio: 0.44,
    yRatio: 1,
    spread: 0.7
  }
];

const getOrigin = (width: number, height: number, preset: ClusterPreset, random: () => number): Point => ({
  x: width * preset.xRatio + width * preset.offsetX + range(random, -width * 0.015, width * 0.015),
  y: height * preset.yRatio + height * preset.offsetY + range(random, -height * 0.02, height * 0.02)
});

const toPath = (points: Point[]): string => {
  if (points.length < 2) return "";

  let path = `M ${points[0]!.x.toFixed(2)} ${points[0]!.y.toFixed(2)}`;

  if (points.length === 2) {
    const next = points[1]!;
    return `${path} L ${next.x.toFixed(2)} ${next.y.toFixed(2)}`;
  }

  for (let index = 1; index < points.length - 1; index += 1) {
    const point = points[index]!;
    const next = points[index + 1]!;
    const midX = (point.x + next.x) / 2;
    const midY = (point.y + next.y) / 2;
    path += ` Q ${point.x.toFixed(2)} ${point.y.toFixed(2)} ${midX.toFixed(2)} ${midY.toFixed(2)}`;
  }

  const penultimate = points[points.length - 2]!;
  const last = points[points.length - 1]!;
  path += ` Q ${penultimate.x.toFixed(2)} ${penultimate.y.toFixed(2)} ${last.x.toFixed(2)} ${last.y.toFixed(2)}`;
  return path;
};

const generateBranch = (
  width: number,
  height: number,
  start: Point,
  baseAngle: number,
  length: number,
  thickness: number,
  depth: number,
  startDelay: number,
  random: () => number,
  into: RootPath[]
): void => {
  if (depth > 4 || thickness < 0.35 || length < 20) return;

  const steps = Math.max(3, Math.round(range(random, 4, 7)));
  const points: Point[] = [start];
  let cursor = { ...start };
  let angle = baseAngle;

  for (let index = 0; index < steps; index += 1) {
    const steer = range(random, -0.34, 0.34) * (1 + depth * 0.14);
    const centerX = width / 2;
    const centerY = height / 2;
    const targetAngle = Math.atan2(centerY - cursor.y, centerX - cursor.x);
    angle += steer + (targetAngle - angle) * 0.12;

    const stepLength = length / steps * range(random, 0.76, 1.18);
    cursor = {
      x: clamp(cursor.x + Math.cos(angle) * stepLength, -width * 0.08, width * 1.08),
      y: clamp(cursor.y + Math.sin(angle) * stepLength, -height * 0.08, height * 1.08)
    };
    points.push(cursor);
  }

  const path = toPath(points);
  if (path) {
    into.push({
      d: path,
      width: Number(thickness.toFixed(2)),
      opacity: Number(clamp(0.4 - depth * 0.06 + random() * 0.08, 0.08, 0.46).toFixed(3)),
      delay: Number(startDelay.toFixed(2)),
      duration: Number(clamp(length / 220 + random() * 0.9, 0.9, 2.8).toFixed(2))
    });
  }

  const branchChance = clamp(0.88 - depth * 0.14, 0.28, 0.88);

  for (let index = 1; index < points.length - 1; index += 1) {
    if (random() > branchChance) continue;

    const pivot = points[index]!;
    const direction = pick(random, [-1, 1]);
    const childAngle = angle + direction * range(random, 0.35, 0.92);
    const childLength = length * range(random, 0.34, 0.62);
    const childThickness = thickness * range(random, 0.52, 0.8);
    const childDelay = startDelay + range(random, 0.16, 0.42) + depth * 0.06;

    generateBranch(width, height, pivot, childAngle, childLength, childThickness, depth + 1, childDelay, random, into);
  }
};

const createCluster = (width: number, height: number, preset: ClusterPreset, seed: string): RootCluster => {
  const random = createRandom(seed);
  const origin = getOrigin(width, height, preset, random);
  const paths: RootPath[] = [];
  const primaryBranches = Math.round(range(random, 3, 5));

  for (let index = 0; index < primaryBranches; index += 1) {
    const spreadFactor = primaryBranches === 1 ? 0.5 : index / (primaryBranches - 1);
    const branchAngle =
      preset.direction - preset.spread / 2 + preset.spread * spreadFactor + range(random, -0.14, 0.14);

    generateBranch(
      width,
      height,
      origin,
      branchAngle,
      Math.min(width, height) * range(random, 0.22, 0.34),
      range(random, 1.35, 2.8),
      0,
      index * 0.18,
      random,
      paths
    );
  }

  return {
    paths,
    driftX: Number(range(random, -10, 10).toFixed(2)),
    driftY: Number(range(random, -8, 8).toFixed(2)),
    duration: Number(range(random, 26, 44).toFixed(2)),
    delay: Number(range(random, -8, 0).toFixed(2))
  };
};

export const createRootScene = (width: number, height: number, seed: string): RootScene => ({
  clusters: CLUSTER_PRESETS.map((preset, index) => createCluster(width, height, preset, `${seed}:${index}`))
});
