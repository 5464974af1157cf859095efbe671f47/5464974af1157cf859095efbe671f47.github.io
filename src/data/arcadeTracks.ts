import type { MapEntity } from '../types/MapEntity.type';
import type { StageDef } from './maps';

export type TrackArt = 'neon' | 'glacier';
type Point = [number, number];

export function trackRails(goal: number): Point[][] {
  const left: Point[] = [[9, -300], [9, 5], [4, 11], [4, goal - 12], [10, goal - 4], [10, goal + 2]];
  return [left, left.map(([x, y]) => [26 - x, y])];
}

function rail(points: Point[], color: string): MapEntity {
  return {
    position: { x: 0, y: 0 }, type: 'static',
    shape: { type: 'polyline', rotation: 0, points, color },
    props: { density: 1, restitution: 0, angularVelocity: 0 },
  };
}

function bumper(x: number, y: number, radius: number, color: string): MapEntity {
  return {
    position: { x, y }, type: 'static',
    shape: { type: 'circle', radius, color },
    props: { density: 1, restitution: 0.78, angularVelocity: 0 },
  };
}

function spinner(x: number, y: number, halfLength: number, spin: number, color: string): MapEntity {
  return {
    position: { x, y }, type: 'kinematic',
    shape: { type: 'box', width: halfLength, height: 0.16, rotation: 0, color },
    props: { density: 1, restitution: 0.35, angularVelocity: spin },
  };
}

function ice(x: number, y: number, angle: number): MapEntity {
  return {
    position: { x, y }, type: 'static',
    shape: { type: 'box', width: 1.5, height: 0.23, rotation: angle, color: '#9bf8ed' },
    props: { density: 1, restitution: 0.15, angularVelocity: 0, life: 1 },
  };
}

export const neonArcade: StageDef = {
  title: 'Neon Arcade', trackArt: 'neon', goalY: 67, zoomY: 64,
  cameraZones: [{ x: 13, y: 32, w: 18, h: 12 }],
  entities: [
    ...trackRails(67).map(points => rail(points, '#fc65b9')),
    bumper(13, 9, 0.95, '#ffce51'),
    ...[7.5, 13, 18.5].map(x => bumper(x, 16, 0.88, '#62ece3')),
    ...[10, 16].map(x => bumper(x, 21, 1.15, '#ffce51')),
    spinner(8.8, 30, 3.5, 1.8, '#ff75bf'),
    spinner(17.2, 32.5, 3.5, -2.1, '#62ece3'),
    bumper(13, 39, 1.5, '#ffce51'),
    rail([[4, 42], [9.4, 46]], '#fc65b9'),
    rail([[22, 42], [16.6, 46]], '#62ece3'),
    spinner(13, 51, 3.6, 1.65, '#ff75bf'),
    bumper(9, 56, 0.72, '#ffce51'),
    bumper(17, 56, 0.72, '#ffce51'),
  ],
};

export const glacierDrop: StageDef = {
  title: 'Glacier Drop', trackArt: 'glacier', goalY: 61, zoomY: 58,
  cameraZones: [{ x: 13, y: 28, w: 18, h: 14 }],
  entities: [
    ...trackRails(61).map(points => rail(points, '#8dd9ff')),
    ice(11.2, 8, 0.16), ice(14.8, 8, -0.16),
    rail([[4, 12], [10.5, 16.5]], '#61b6fc'),
    rail([[22, 12], [16.8, 15.5]], '#61b6fc'),
    ...[7, 11, 15, 19].map((x, i) => ice(x, 20 + i % 2, i % 2 ? -0.18 : 0.18)),
    bumper(12.8, 26, 1.3, '#69f3da'),
    rail([[22, 27], [15.5, 32.5]], '#61b6fc'),
    rail([[4, 30], [9.8, 34]], '#61b6fc'),
    ...[8.7, 13, 17.3].map((x, i) => ice(x, 38 + i % 2, 0.08 * (i - 1))),
    spinner(12.5, 44, 3.4, -1.4, '#b8d8ff'),
    ice(9, 49, 0.18), ice(16.5, 51, -0.22),
  ],
};
