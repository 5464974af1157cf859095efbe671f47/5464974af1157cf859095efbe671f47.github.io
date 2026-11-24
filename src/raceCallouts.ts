import { translate } from './localization';
import type { Marble } from './marble';

type RaceNote = { label: 'Takes the lead' | 'Photo finish'; names: string; remaining: number };

export class RaceCallouts {
  note: RaceNote | null = null;
  private leader: Marble | null = null;
  private candidate: Marble | null = null;
  private held = 0;
  private cooldown = 0;
  private calledFinish = false;

  update(ranked: Marble[], goal: number, dt: number) {
    this.cooldown -= dt;
    if (this.note) {
      this.note.remaining -= dt;
      if (this.note.remaining <= 0) this.note = null;
    }

    const [first, second] = ranked;
    if (!second) return;
    const y = first.y;
    if (!this.calledFinish && first.name !== second.name && goal - y < 6 &&
        Math.abs(y - second.y) < 1.25 && Math.abs(first.x - second.x) < 5) {
      this.note = { label: 'Photo finish', names: first.name + ' / ' + second.name, remaining: 1.6 };
      this.calledFinish = true;
      return;
    }

    // Track the settled race order so positions swapping inside a bumper do not spam the HUD.
    if (!this.leader) this.leader = first;
    if (first !== this.candidate) {
      this.candidate = first;
      this.held = 0;
    }
    this.held += dt;
    if (first === this.leader || this.held < 0.32) return;
    const previous = this.leader;
    this.leader = first;
    if (first.name !== previous.name && y > goal * 0.15 && this.cooldown <= 0 && !this.calledFinish) {
      this.note = { label: 'Takes the lead', names: first.name, remaining: 1.1 };
      this.cooldown = 3.5;
    }
  }
}

export function drawRaceCallout(ctx: CanvasRenderingContext2D, note: RaceNote, width: number, scale: number) {
  const finish = note.label === 'Photo finish';
  const accent = finish ? '#ffce68' : '#83eddf';
  const label = translate(note.label);
  ctx.save();
  ctx.translate(width / 2, 56 * scale);
  ctx.scale(scale, scale);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 16px system-ui, sans-serif';
  const cardWidth = Math.min(width * 0.54 / scale, Math.max(124, ctx.measureText(note.names).width + 32));
  const left = -cardWidth / 2;
  ctx.fillStyle = '#181625';
  ctx.fillRect(left, 0, cardWidth, 49);
  ctx.fillStyle = accent;
  ctx.fillRect(left, 0, 3, 49);
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText(label, 0, 14, cardWidth - 14);
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.fillStyle = '#fff9ee';
  ctx.fillText(note.names, 0, 34, cardWidth - 14);
  ctx.restore();
}

export type { RaceNote };
