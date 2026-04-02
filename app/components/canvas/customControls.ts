import { fabric } from 'fabric';

/* ═══════════════════════════════════════════════════════════════
 *  HOVER TRACKING
 *  A WeakMap that stores which control name the cursor is over
 *  for each active fabric object.  Updated by a mouse:move
 *  handler in useInitializeCanvas, consumed by render functions.
 * ═══════════════════════════════════════════════════════════════ */
export const hoveredControlMap = new WeakMap<fabric.Object, string>();

/* ═══════════════════════════════════════════════════════════════
 *  ROTATION CURSOR
 * ═══════════════════════════════════════════════════════════════ */
export function mouseRotateIcon(angle: number): string {
  const relativeAngle = angle - 90;
  const pos: { [key: number]: string } = {
    '-90': '9.25 5.25',
    '-75': '9.972 3.863',
    '-60': '10.84 1.756',
    '-45': '11.972 -1.716',
    '-30': '18.83 0.17',
    '-15': '28.49 -9.49',
    '15': '-7.985 46.77',
    '30': '-0.415 27.57',
    '45': '2.32 21.713',
    '60': '3.916 18.243',
    '75': '4.762 16.135',
    '90': '5.25 14.75',
    '105': '5.84 13.617',
    '120': '6.084 12.666',
    '135': '6.317 12.01',
    '150': '6.754 11.325',
    '165': '7.06 10.653',
    '180': '7.25 10',
    '195': '7.597 9.43',
    '210': '7.825 8.672',
    '225': '7.974 7.99',
    '240': '8.383 7.332',
    '255': '8.83 6.441',
  };
  const defaultPos = '7.25 10';
  const transform =
    relativeAngle === 0
      ? 'translate(9.5 3.5)'
      : `rotate(${relativeAngle} ${pos[relativeAngle] || defaultPos})`;
  const imgCursor = encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='24' height='24'>
      <defs>
        <filter id='a' width='266.7%' height='156.2%' x='-75%' y='-21.9%' filterUnits='objectBoundingBox'>
          <feOffset dy='1' in='SourceAlpha' result='shadowOffsetOuter1'/>
          <feGaussianBlur in='shadowOffsetOuter1' result='shadowBlurOuter1' stdDeviation='1'/>
          <feColorMatrix in='shadowBlurOuter1' result='shadowMatrixOuter1' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0'/>
          <feMerge>
            <feMergeNode in='shadowMatrixOuter1'/>
            <feMergeNode in='SourceGraphic'/>
          </feMerge>
        </filter>
        <path id='b' d='M1.67 12.67a7.7 7.7 0 0 0 0-9.34L0 5V0h5L3.24 1.76a9.9 9.9 0 0 1 0 12.48L5 16H0v-5l1.67 1.67z'/>
      </defs>
      <g fill='none' fill-rule='evenodd'>
        <path d='M0 24V0h24v24z'/>
        <g fill-rule='nonzero' filter='url(#a)' transform='${transform}'>
          <use fill='#000' fill-rule='evenodd' xlink:href='#b'/>
          <path stroke='#FFF' d='M1.6 11.9a7.21 7.21 0 0 0 0-7.8L-.5 6.2V-.5h6.7L3.9 1.8a10.4 10.4 0 0 1 0 12.4l2.3 2.3H-.5V9.8l2.1 2.1z'/>
        </g>
      </g>
    </svg>`);
  return `url("data:image/svg+xml;charset=utf-8,${imgCursor}") 12 12, crosshair`;
}

export function treatAngle(angle: number): number {
  return angle - (angle % 15);
}

export const rotationStyleHandler = (
  eventData: MouseEvent,
  control: fabric.Control,
  fabricObject: fabric.Object,
) => {
  if (fabricObject.lockRotation) {
    return 'not-allowed';
  }
  const angle = treatAngle(fabricObject?.angle || 0);
  return mouseRotateIcon(angle);
};

/* ═══════════════════════════════════════════════════════════════
 *  MODERN CONTROL RENDERING
 *  Canvas-drawn circular buttons with Lucide-style line icons.
 *  Supports hover state: scale up + brighter color + glow.
 * ═══════════════════════════════════════════════════════════════ */
const CONTROL_SIZE = 28;

/** Draw a rounded-rect path (compatibility helper) */
function rrect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/** Core renderer — draws a circular button with an icon */
function drawButton(
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  bg: string,
  hoverBg: string,
  hovered: boolean,
  drawIcon: (ctx: CanvasRenderingContext2D, s: number) => void,
) {
  const scale = hovered ? 1.22 : 1.0;
  const r = (CONTROL_SIZE / 2) * scale;

  ctx.save();
  ctx.translate(left, top);

  /* ── drop shadow ── */
  ctx.shadowColor = hovered ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.18)';
  ctx.shadowBlur = hovered ? 14 : 7;
  ctx.shadowOffsetY = hovered ? 3 : 2;

  /* ── background circle ── */
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = hovered ? hoverBg : bg;
  ctx.fill();

  /* ── subtle inner highlight on hover ── */
  if (hovered) {
    ctx.beginPath();
    ctx.arc(0, -r * 0.28, r * 0.65, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fill();
  }

  /* ── white border ring ── */
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.strokeStyle = hovered ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)';
  ctx.lineWidth = hovered ? 1.8 : 1.2;
  ctx.stroke();

  /* ── icon ── */
  ctx.strokeStyle = '#ffffff';
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = 1.7 * scale;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  drawIcon(ctx, r * 0.48);

  ctx.restore();
}

/* ── Icon Drawers (clean Lucide-style line art) ────────────── */

function iconTrash(ctx: CanvasRenderingContext2D, s: number) {
  // Lid
  ctx.beginPath();
  ctx.moveTo(-s * 0.85, -s * 0.4);
  ctx.lineTo(s * 0.85, -s * 0.4);
  ctx.stroke();
  // Handle
  ctx.beginPath();
  ctx.moveTo(-s * 0.28, -s * 0.4);
  ctx.lineTo(-s * 0.28, -s * 0.78);
  ctx.lineTo(s * 0.28, -s * 0.78);
  ctx.lineTo(s * 0.28, -s * 0.4);
  ctx.stroke();
  // Body
  ctx.beginPath();
  ctx.moveTo(-s * 0.65, -s * 0.4);
  ctx.lineTo(-s * 0.5, s * 0.85);
  ctx.lineTo(s * 0.5, s * 0.85);
  ctx.lineTo(s * 0.65, -s * 0.4);
  ctx.stroke();
  // Vertical line
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.05);
  ctx.lineTo(0, s * 0.55);
  ctx.stroke();
}

function iconCopy(ctx: CanvasRenderingContext2D, s: number) {
  const cr = s * 0.12;
  // Back rect
  rrect(ctx, -s * 0.15, -s * 0.9, s * 1.05, s * 1.05, cr);
  ctx.stroke();
  // Front rect (slight fill to cover overlap)
  ctx.save();
  rrect(ctx, -s * 0.9, -s * 0.15, s * 1.05, s * 1.05, cr);
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fill();
  ctx.restore();
  rrect(ctx, -s * 0.9, -s * 0.15, s * 1.05, s * 1.05, cr);
  ctx.stroke();
}

function iconCheck(ctx: CanvasRenderingContext2D, s: number) {
  ctx.lineWidth *= 1.4;
  ctx.beginPath();
  ctx.moveTo(-s * 0.5, s * 0.05);
  ctx.lineTo(-s * 0.1, s * 0.5);
  ctx.lineTo(s * 0.55, -s * 0.4);
  ctx.stroke();
}

function iconRotate(ctx: CanvasRenderingContext2D, s: number) {
  // Arc
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.62, -Math.PI * 0.75, Math.PI * 0.35, false);
  ctx.stroke();
  // Arrow tip
  const ea = Math.PI * 0.35;
  const ex = Math.cos(ea) * s * 0.62;
  const ey = Math.sin(ea) * s * 0.62;
  ctx.beginPath();
  ctx.moveTo(ex - s * 0.32, ey - s * 0.08);
  ctx.lineTo(ex, ey);
  ctx.lineTo(ex + s * 0.08, ey - s * 0.32);
  ctx.stroke();
}

/* ═══════════════════════════════════════════════════════════════
 *  EXPORTED RENDER FUNCTIONS
 *  Each one is a valid fabric Control `render` callback.
 * ═══════════════════════════════════════════════════════════════ */

export const renderDeleteControl = (
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  _styleOverride: any,
  fabricObject: fabric.Object,
) => {
  const hovered = hoveredControlMap.get(fabricObject) === 'remove';
  drawButton(ctx, left, top, '#ef4444', '#dc2626', hovered, iconTrash);
};

export const renderCopyControl = (
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  _styleOverride: any,
  fabricObject: fabric.Object,
) => {
  const hovered = hoveredControlMap.get(fabricObject) === 'copy';
  drawButton(ctx, left, top, '#3b82f6', '#1d4ed8', hovered, iconCopy);
};

export const renderCopiedSuccessControl = (
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  _styleOverride: any,
  _fabricObject: fabric.Object,
) => {
  drawButton(ctx, left, top, '#22c55e', '#16a34a', true, iconCheck);
};

export const renderRotateControl = (
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  _styleOverride: any,
  fabricObject: fabric.Object,
) => {
  const hovered = hoveredControlMap.get(fabricObject) === 'mtr';
  drawButton(ctx, left, top, '#64748b', '#475569', hovered, iconRotate);
};

/* ═══════════════════════════════════════════════════════════════
 *  MODERN CORNER HANDLE RENDERER
 *  Replaces the default chunky blue circles with sleek, small,
 *  white-filled handles with a thin colored border.
 * ═══════════════════════════════════════════════════════════════ */
export function renderCornerControl(
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  _styleOverride: any,
  _fabricObject: fabric.Object,
) {
  const size = 10;
  ctx.save();
  ctx.translate(left, top);
  // Shadow
  ctx.shadowColor = 'rgba(0,0,0,0.15)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 1;
  // White fill
  ctx.beginPath();
  ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  // Colored border
  ctx.shadowColor = 'transparent';
  ctx.beginPath();
  ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.restore();
}
