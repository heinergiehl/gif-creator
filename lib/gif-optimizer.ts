export const MAX_GIF_BYTES = 50 * 1024 * 1024;

export type TargetUnit = 'KB' | 'MB';
export type MotionPriority = 'smooth' | 'balanced' | 'smallest';
export type PaletteChoice = 'auto' | 256 | 128 | 64 | 32;

export interface GifMetadata {
  width: number;
  height: number;
  frameCount: number;
  durationMs: number;
  framesPerSecond: number;
  loopCount: number | null;
  globalColorCount: number;
  animated: boolean;
}

export interface OptimizerSettings {
  maxWidth: number;
  motionPriority: MotionPriority;
  palette: PaletteChoice;
  preserveTransparency: boolean;
}

export interface OptimizationProfile {
  id: string;
  ladderIndex: number;
  width: number;
  fps: number;
  colors: number;
  dither: 'sierra2_4a' | 'bayer';
  ditherStrength?: number;
}

export interface OptimizationVariant {
  id: string;
  label: string;
  description: string;
  blob: Blob;
  url: string;
  size: number;
  width: number;
  fps: number;
  colors: number;
  underTarget: boolean;
  original: boolean;
}

export interface OptimizationOutcome {
  variants: OptimizationVariant[];
  selectedId: string;
  targetReached: boolean;
  attempts: number;
}

export interface OptimizationProgress {
  stage: 'loading' | 'encoding' | 'finishing';
  value: number;
  message: string;
}

function assertReadable(bytes: Uint8Array, offset: number, length = 1): void {
  if (offset < 0 || offset + length > bytes.length) {
    throw new Error('This GIF appears to be incomplete or damaged.');
  }
}

function readAscii(bytes: Uint8Array, offset: number, length: number): string {
  assertReadable(bytes, offset, length);
  return String.fromCharCode(...bytes.slice(offset, offset + length));
}

function readUint16(bytes: Uint8Array, offset: number): number {
  assertReadable(bytes, offset, 2);
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function skipSubBlocks(bytes: Uint8Array, start: number): number {
  let offset = start;

  while (offset < bytes.length) {
    const blockLength = bytes[offset];
    offset += 1;

    if (blockLength === 0) {
      return offset;
    }

    assertReadable(bytes, offset, blockLength);
    offset += blockLength;
  }

  throw new Error('This GIF contains an incomplete data block.');
}

export function parseGifMetadata(buffer: ArrayBuffer): GifMetadata {
  const bytes = new Uint8Array(buffer);
  assertReadable(bytes, 0, 13);

  const signature = readAscii(bytes, 0, 6);
  if (signature !== 'GIF87a' && signature !== 'GIF89a') {
    throw new Error('Choose a valid animated GIF file.');
  }

  const width = readUint16(bytes, 6);
  const height = readUint16(bytes, 8);
  const packedFields = bytes[10];
  const hasGlobalColorTable = (packedFields & 0x80) !== 0;
  const globalColorCount = hasGlobalColorTable ? 1 << ((packedFields & 0x07) + 1) : 0;

  let offset = 13 + (hasGlobalColorTable ? globalColorCount * 3 : 0);
  let frameCount = 0;
  let durationMs = 0;
  let pendingDelayMs = 100;
  let loopCount: number | null = null;

  while (offset < bytes.length) {
    const marker = bytes[offset];

    if (marker === 0x3b) {
      break;
    }

    if (marker === 0x21) {
      assertReadable(bytes, offset, 2);
      const extensionType = bytes[offset + 1];

      if (extensionType === 0xf9) {
        assertReadable(bytes, offset, 8);
        const blockLength = bytes[offset + 2];
        if (blockLength !== 4) {
          throw new Error('This GIF contains an invalid timing block.');
        }
        const encodedDelay = readUint16(bytes, offset + 4) * 10;
        pendingDelayMs = encodedDelay > 0 ? Math.max(encodedDelay, 20) : 100;
        offset += 8;
        continue;
      }

      if (extensionType === 0xff) {
        assertReadable(bytes, offset + 2, 1);
        const applicationLength = bytes[offset + 2];
        const applicationName = readAscii(bytes, offset + 3, applicationLength);
        let dataOffset = offset + 3 + applicationLength;

        if (
          (applicationName.startsWith('NETSCAPE') || applicationName.startsWith('ANIMEXTS')) &&
          dataOffset < bytes.length &&
          bytes[dataOffset] >= 3
        ) {
          assertReadable(bytes, dataOffset + 1, bytes[dataOffset]);
          if (bytes[dataOffset + 1] === 1) {
            loopCount = readUint16(bytes, dataOffset + 2);
          }
        }

        offset = skipSubBlocks(bytes, dataOffset);
        continue;
      }

      offset = skipSubBlocks(bytes, offset + 2);
      continue;
    }

    if (marker === 0x2c) {
      assertReadable(bytes, offset, 10);
      const imagePackedFields = bytes[offset + 9];
      const hasLocalColorTable = (imagePackedFields & 0x80) !== 0;
      const localColorCount = hasLocalColorTable ? 1 << ((imagePackedFields & 0x07) + 1) : 0;

      frameCount += 1;
      durationMs += pendingDelayMs;
      pendingDelayMs = 100;
      offset += 10 + localColorCount * 3;
      assertReadable(bytes, offset, 1);
      offset += 1;
      offset = skipSubBlocks(bytes, offset);
      continue;
    }

    throw new Error('This GIF uses a block layout the browser could not read.');
  }

  if (width < 1 || height < 1 || frameCount < 1) {
    throw new Error('This GIF does not contain a readable image frame.');
  }

  const safeDuration = Math.max(durationMs, frameCount * 20);

  return {
    width,
    height,
    frameCount,
    durationMs: safeDuration,
    framesPerSecond: Number(((frameCount * 1000) / safeDuration).toFixed(1)),
    loopCount,
    globalColorCount,
    animated: frameCount > 1,
  };
}

export function bytesFromTarget(value: number, unit: TargetUnit): number {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  return Math.round(value * (unit === 'MB' ? 1024 * 1024 : 1024));
}

export function formatBytes(bytes: number, precision = 1): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 KB';
  }

  if (bytes < 1024) {
    return Math.round(bytes) + ' B';
  }

  if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(bytes < 10 * 1024 ? precision : 0) + ' KB';
  }

  return (bytes / (1024 * 1024)).toFixed(precision) + ' MB';
}

export function formatDuration(durationMs: number): string {
  if (durationMs < 1000) {
    return Math.round(durationMs) + ' ms';
  }

  return (durationMs / 1000).toFixed(durationMs < 10_000 ? 1 : 0) + ' s';
}

const PROFILE_LADDER = [
  { scale: 1, fps: 30, colors: 256, dither: 'sierra2_4a' as const },
  { scale: 0.92, fps: 24, colors: 256, dither: 'sierra2_4a' as const },
  { scale: 0.82, fps: 20, colors: 192, dither: 'sierra2_4a' as const },
  { scale: 0.7, fps: 16, colors: 128, dither: 'sierra2_4a' as const },
  { scale: 0.58, fps: 14, colors: 96, dither: 'sierra2_4a' as const },
  { scale: 0.48, fps: 12, colors: 64, dither: 'bayer' as const, ditherStrength: 3 },
  { scale: 0.38, fps: 10, colors: 48, dither: 'bayer' as const, ditherStrength: 4 },
  { scale: 0.3, fps: 8, colors: 32, dither: 'bayer' as const, ditherStrength: 4 },
  { scale: 0.22, fps: 6, colors: 24, dither: 'bayer' as const, ditherStrength: 5 },
];

function getMotionFpsCap(priority: MotionPriority): number {
  if (priority === 'smooth') return 30;
  if (priority === 'smallest') return 12;
  return 18;
}

export const OPTIMIZATION_LADDER_LENGTH = PROFILE_LADDER.length;

export function buildOptimizationProfile(
  ladderIndex: number,
  metadata: GifMetadata,
  settings: OptimizerSettings,
): OptimizationProfile {
  const index = Math.max(0, Math.min(PROFILE_LADDER.length - 1, ladderIndex));
  const step = PROFILE_LADDER[index];
  const sourceFps = Math.max(1, Math.ceil(metadata.framesPerSecond));
  const widthCeiling = Math.max(32, Math.min(metadata.width, settings.maxWidth));
  const minimumWidth = Math.min(120, widthCeiling);
  const paletteCeiling = settings.palette === 'auto' ? 256 : settings.palette;

  return {
    id: 'profile-' + index,
    ladderIndex: index,
    width: Math.max(minimumWidth, Math.min(widthCeiling, Math.round(widthCeiling * step.scale))),
    fps: Math.max(4, Math.min(sourceFps, getMotionFpsCap(settings.motionPriority), step.fps)),
    colors: Math.max(16, Math.min(paletteCeiling, step.colors)),
    dither: step.dither,
    ditherStrength: step.ditherStrength,
  };
}

export function getSuggestedTarget(fileSize: number): {
  value: string;
  unit: TargetUnit;
} {
  const suggestedBytes = Math.max(64 * 1024, Math.round(fileSize * 0.65));

  if (suggestedBytes < 1024 * 1024) {
    return {
      value: String(Math.max(10, Math.round(suggestedBytes / 1024 / 10) * 10)),
      unit: 'KB',
    };
  }

  return {
    value: (suggestedBytes / (1024 * 1024)).toFixed(1),
    unit: 'MB',
  };
}
