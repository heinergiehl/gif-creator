export interface GifFrameTimingMetadata {
  width: number;
  height: number;
  frameDurationsMs: number[];
  loopCount: number | null;
}

function ensureReadable(bytes: Uint8Array, offset: number, length = 1): void {
  if (offset < 0 || length < 0 || offset + length > bytes.length) {
    throw new Error('This GIF appears to be incomplete or damaged.');
  }
}

function readAscii(bytes: Uint8Array, offset: number, length: number): string {
  ensureReadable(bytes, offset, length);
  return String.fromCharCode(...bytes.subarray(offset, offset + length));
}

function readUint16(bytes: Uint8Array, offset: number): number {
  ensureReadable(bytes, offset, 2);
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function skipSubBlocks(bytes: Uint8Array, start: number): number {
  let offset = start;

  while (offset < bytes.length) {
    const length = bytes[offset];
    offset += 1;
    if (length === 0) return offset;
    ensureReadable(bytes, offset, length);
    offset += length;
  }

  throw new Error('This GIF contains an incomplete data block.');
}

/**
 * Parses the structural timing data without decoding image pixels. GIF delays
 * are stored in centiseconds. Browsers commonly treat missing or zero delays as
 * roughly 100 ms, while very small non-zero delays are clamped to 20 ms here so
 * preview and export use the same safe timing floor as the studio model.
 */
export function parseGifFrameTiming(buffer: ArrayBuffer): GifFrameTimingMetadata {
  const bytes = new Uint8Array(buffer);
  ensureReadable(bytes, 0, 13);

  const signature = readAscii(bytes, 0, 6);
  if (signature !== 'GIF87a' && signature !== 'GIF89a') {
    throw new Error('Choose a valid GIF file.');
  }

  const width = readUint16(bytes, 6);
  const height = readUint16(bytes, 8);
  const logicalScreenPacked = bytes[10];
  const hasGlobalPalette = (logicalScreenPacked & 0x80) !== 0;
  const globalPaletteEntries = hasGlobalPalette ? 1 << ((logicalScreenPacked & 0x07) + 1) : 0;
  let offset = 13 + globalPaletteEntries * 3;
  let pendingDelayMs = 100;
  let loopCount: number | null = null;
  const frameDurationsMs: number[] = [];

  ensureReadable(bytes, 0, offset);

  while (offset < bytes.length) {
    const marker = bytes[offset];

    if (marker === 0x3b) break;

    if (marker === 0x21) {
      ensureReadable(bytes, offset, 2);
      const label = bytes[offset + 1];

      if (label === 0xf9) {
        ensureReadable(bytes, offset, 8);
        if (bytes[offset + 2] !== 4 || bytes[offset + 7] !== 0) {
          throw new Error('This GIF contains an invalid frame timing block.');
        }
        const centiseconds = readUint16(bytes, offset + 4);
        pendingDelayMs = centiseconds === 0 ? 100 : Math.max(20, centiseconds * 10);
        offset += 8;
        continue;
      }

      if (label === 0xff) {
        ensureReadable(bytes, offset + 2, 1);
        const applicationLength = bytes[offset + 2];
        ensureReadable(bytes, offset + 3, applicationLength);
        const applicationName = readAscii(bytes, offset + 3, applicationLength);
        const dataStart = offset + 3 + applicationLength;

        if (
          (applicationName.startsWith('NETSCAPE') || applicationName.startsWith('ANIMEXTS')) &&
          dataStart < bytes.length
        ) {
          const firstBlockLength = bytes[dataStart];
          if (firstBlockLength >= 3) {
            ensureReadable(bytes, dataStart + 1, firstBlockLength);
            if (bytes[dataStart + 1] === 1) loopCount = readUint16(bytes, dataStart + 2);
          }
        }

        offset = skipSubBlocks(bytes, dataStart);
        continue;
      }

      offset = skipSubBlocks(bytes, offset + 2);
      // A graphic control extension applies to the next rendered block. Plain
      // text (0x01) is such a block, so its delay must not leak into a later
      // image descriptor.
      if (label === 0x01) pendingDelayMs = 100;
      continue;
    }

    if (marker === 0x2c) {
      ensureReadable(bytes, offset, 10);
      const imagePacked = bytes[offset + 9];
      const hasLocalPalette = (imagePacked & 0x80) !== 0;
      const localPaletteEntries = hasLocalPalette ? 1 << ((imagePacked & 0x07) + 1) : 0;
      offset += 10 + localPaletteEntries * 3;
      ensureReadable(bytes, offset, 1);
      offset += 1; // LZW minimum code size
      offset = skipSubBlocks(bytes, offset);
      frameDurationsMs.push(pendingDelayMs);
      pendingDelayMs = 100;
      continue;
    }

    throw new Error('This GIF uses a block layout the browser could not read.');
  }

  if (width < 1 || height < 1 || frameDurationsMs.length === 0) {
    throw new Error('This GIF does not contain a readable image frame.');
  }

  return { width, height, frameDurationsMs, loopCount };
}
