import type { TrackArt } from './data/arcadeTracks';
import { trackRails } from './data/arcadeTracks';
import type { GameObject } from './gameObject';
import { translate } from './localization';
import type { MapEntityState } from './types/MapEntity.type';

export function drawTrack(ctx: CanvasRenderingContext2D, style: TrackArt, goal: number) {
  const neon = style === 'neon';
  const [left, right] = trackRails(goal);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(...left[0]);
  for (const point of left.slice(1)) ctx.lineTo(...point);
  for (const point of right.reverse()) ctx.lineTo(...point);
  ctx.closePath();
  ctx.clip();
  const bed = ctx.createLinearGradient(4, 0, 22, 0);
  bed.addColorStop(0, neon ? '#311639' : '#114356');
  bed.addColorStop(0.5, neon ? '#19142b' : '#11293c');
  bed.addColorStop(1, neon ? '#292041' : '#194456');
  ctx.fillStyle = bed;
  ctx.fillRect(4, -300, 18, goal + 302);

  // The markings run along the playfield so the camera shows how fast the marbles fall.
  ctx.strokeStyle = neon ? '#503053' : '#225066';
  ctx.lineWidth = 0.04;
  ctx.beginPath();
  for (let y = -10; y < goal; y += 4) {
    if (neon) {
      for (const x of [6, 10, 16, 20]) {
        ctx.moveTo(x - 0.42, y);
        ctx.lineTo(x, y + 0.42);
        ctx.lineTo(x + 0.42, y);
      }
    } else {
      ctx.moveTo(4, y);
      ctx.lineTo(8, y + 1.8);
      ctx.lineTo(9.5, y + 1.3);
      ctx.lineTo(11, y + 2.5);
      ctx.moveTo(22, y - 0.8);
      ctx.lineTo(19, y + 1.5);
      ctx.lineTo(17, y + 1.5);
    }
  }
  ctx.stroke();
  for (const y of [4.6, goal - 0.55]) {
    const tile = 0.27;
    const startX = y < 5 ? 9 : 10;
    const endX = 26 - startX;
    ctx.fillStyle = y < 5 ? (neon ? '#79506e' : '#406f80') : '#c4eee7';
    for (let x = startX, col = 0; x < endX; x += tile, col++) {
      ctx.fillRect(x, y + (col % 2) * tile, tile, tile);
    }
  }
  ctx.restore();
}

// Draw in the obstacle's local coordinates, on top of its normal body.
export function drawObstacleDetail(ctx: CanvasRenderingContext2D, entity: MapEntityState) {
  const shape = entity.shape;
  ctx.save();
  ctx.shadowBlur = 0;
  if (shape.type === 'circle') {
    ctx.fillStyle = (shape.color ?? '#ffffff') + '35';
    ctx.fill();
    ctx.strokeStyle = shape.color ?? '#ffffff';
    ctx.lineWidth = 0.075;
    ctx.beginPath();
    ctx.arc(0, 0, shape.radius * 0.69, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fillRect(-0.12, -0.12, 0.24, 0.24);
  } else if (shape.type === 'box') {
    if (entity.life > 0) {
      ctx.strokeStyle = '#277384';
      ctx.lineWidth = 0.065;
      ctx.beginPath();
      ctx.moveTo(-0.55, -shape.height);
      ctx.lineTo(-0.18, 0.04);
      ctx.lineTo(0.12, -0.08);
      ctx.lineTo(0.42, shape.height);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#17223b';
      ctx.beginPath();
      ctx.arc(0, 0, 0.21, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

export class IceShards implements GameObject {
  private age = 0;

  constructor(private x: number, private y: number) {}

  get isDestroy() { return this.age >= 480; }
  update(ms: number) { this.age += ms; }

  render(ctx: CanvasRenderingContext2D) {
    const t = this.age / 480;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.globalAlpha = Math.max(0, 1 - t);
    for (let i = -2; i <= 2; i++) {
      ctx.save();
      ctx.translate(i * (0.5 + t * 0.95), t * t * 2.2 - t * (2.5 - Math.abs(i) * 0.4));
      ctx.rotate(i + t * (i + 0.5));
      ctx.fillStyle = i % 2 ? '#8ee6ff' : '#e5fffc';
      ctx.beginPath();
      ctx.moveTo(-0.21, 0.08);
      ctx.lineTo(0.1, -0.18);
      ctx.lineTo(0.18, 0.13);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
}

export function drawWind(
  ctx: CanvasRenderingContext2D, width: number, scale: number, direction: number, labelKey: 'Crosswind' | 'Tilt'
) {
  ctx.save();
  ctx.translate(width / 2, 18 * scale);
  ctx.scale(scale, scale);
  ctx.font = 'bold 15px system-ui, sans-serif';
  const label = translate(labelKey);
  const half = (ctx.measureText(label).width + 66) / 2;
  ctx.fillStyle = '#102534';
  ctx.fillRect(-half, 0, half * 2, 30);
  ctx.fillStyle = '#88f4e8';
  ctx.fillRect(-half, 28, half * 2, 2);
  ctx.fillStyle = '#e6fffb';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, -half + 12, 15);
  ctx.translate(half - 23, 15);
  ctx.scale(direction, 1);
  ctx.strokeStyle = '#88f4e8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (const x of [-8, 0, 8]) {
    ctx.moveTo(x - 3, -5);
    ctx.lineTo(x + 2, 0);
    ctx.lineTo(x - 3, 5);
  }
  ctx.stroke();
  ctx.restore();
}
