import type { FFmpeg } from '@ffmpeg/ffmpeg';

export type GifConversionKind = 'gif-to-mp4' | 'gif-to-webp' | 'webp-to-gif';

export interface GifConversionProgress {
  value: number;
  message: string;
}

export interface GifConversionResult {
  blob: Blob;
  extension: 'mp4' | 'webp' | 'gif';
  mimeType: 'video/mp4' | 'image/webp' | 'image/gif';
}

export interface ExtractedGifFrame {
  index: number;
  name: string;
  blob: Blob;
}

interface ConvertAnimatedMediaOptions {
  file: File;
  kind: GifConversionKind;
  width: number;
  height: number;
  background?: string;
  webpQuality?: number;
  onProgress: (progress: GifConversionProgress) => void;
}

interface ExtractGifFramesOptions {
  file: File;
  onProgress: (progress: GifConversionProgress) => void;
}

const MIME_TYPES: Record<GifConversionKind, GifConversionResult['mimeType']> = {
  'gif-to-mp4': 'video/mp4',
  'gif-to-webp': 'image/webp',
  'webp-to-gif': 'image/gif',
};

const EXTENSIONS: Record<GifConversionKind, GifConversionResult['extension']> = {
  'gif-to-mp4': 'mp4',
  'gif-to-webp': 'webp',
  'webp-to-gif': 'gif',
};

function copyFileData(data: unknown): Uint8Array {
  if (data instanceof Uint8Array) return new Uint8Array(data);
  if (typeof data === 'string') return new TextEncoder().encode(data);
  throw new Error('The browser engine returned an unreadable file.');
}

async function removeVirtualFile(ffmpeg: FFmpeg, path: string): Promise<void> {
  try {
    await ffmpeg.deleteFile(path);
  } catch {
    // A failed conversion may not have produced every requested file.
  }
}

async function getBrowserEngine(): Promise<{
  ffmpeg: FFmpeg;
  fetchFile: (file: File | Blob | string) => Promise<Uint8Array>;
}> {
  const [{ ffmpegStore }, { fetchFile }] = await Promise.all([
    import('@/store/FFmpegStore'),
    import('@ffmpeg/util'),
  ]);

  return {
    ffmpeg: await ffmpegStore.ensureLoaded(),
    fetchFile,
  };
}

function attachProgress(
  ffmpeg: FFmpeg,
  onProgress: (progress: GifConversionProgress) => void,
  message: string,
): () => void {
  const listener = ({ progress }: { progress: number }) => {
    if (!Number.isFinite(progress)) return;
    const bounded = Math.max(0, Math.min(1, progress));
    onProgress({ value: 18 + bounded * 72, message });
  };

  ffmpeg.on('progress', listener);
  return () => ffmpeg.off('progress', listener);
}

function normalizeHexColor(value: string | undefined): string {
  const normalized = (value || '#ffffff').trim();
  return /^#[0-9a-f]{6}$/i.test(normalized) ? normalized : '#ffffff';
}

interface AnimatedWebpFrame {
  x: number;
  y: number;
  width: number;
  height: number;
  durationMs: number;
  disposeToBackground: boolean;
  blendWithPrevious: boolean;
  frameData: Uint8Array;
}

interface ParsedAnimatedWebp {
  width: number;
  height: number;
  background: { red: number; green: number; blue: number; alpha: number };
  frames: AnimatedWebpFrame[];
}

const MAX_WEBP_FRAME_COUNT = 600;
const MAX_WEBP_DECODED_PIXELS = 260_000_000;

function readFourCc(bytes: Uint8Array, offset: number): string {
  return String.fromCharCode(
    bytes[offset],
    bytes[offset + 1],
    bytes[offset + 2],
    bytes[offset + 3],
  );
}

function readUint24(bytes: Uint8Array, offset: number): number {
  return bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16);
}

function writeFourCc(bytes: Uint8Array, offset: number, value: string): void {
  for (let index = 0; index < 4; index += 1) bytes[offset + index] = value.charCodeAt(index);
}

function writeUint24(bytes: Uint8Array, offset: number, value: number): void {
  bytes[offset] = value & 0xff;
  bytes[offset + 1] = (value >>> 8) & 0xff;
  bytes[offset + 2] = (value >>> 16) & 0xff;
}

function parseAnimatedWebp(buffer: ArrayBuffer): ParsedAnimatedWebp | null {
  const bytes = new Uint8Array(buffer);
  if (bytes.length < 12 || readFourCc(bytes, 0) !== 'RIFF' || readFourCc(bytes, 8) !== 'WEBP') {
    throw new Error('Choose a valid WebP file.');
  }

  const view = new DataView(buffer);
  let width = 0;
  let height = 0;
  let background = { red: 0, green: 0, blue: 0, alpha: 0 };
  const frames: AnimatedWebpFrame[] = [];

  for (let offset = 12; offset + 8 <= bytes.length; ) {
    const chunkType = readFourCc(bytes, offset);
    const chunkSize = view.getUint32(offset + 4, true);
    const payloadOffset = offset + 8;
    const payloadEnd = payloadOffset + chunkSize;

    if (payloadEnd > bytes.length) throw new Error('This WebP file is incomplete or damaged.');

    if (chunkType === 'VP8X') {
      if (chunkSize < 10) throw new Error('This WebP file has an invalid canvas header.');
      width = readUint24(bytes, payloadOffset + 4) + 1;
      height = readUint24(bytes, payloadOffset + 7) + 1;
    } else if (chunkType === 'ANIM') {
      if (chunkSize < 6) throw new Error('This WebP file has invalid animation settings.');
      background = {
        blue: bytes[payloadOffset],
        green: bytes[payloadOffset + 1],
        red: bytes[payloadOffset + 2],
        alpha: bytes[payloadOffset + 3],
      };
    } else if (chunkType === 'ANMF') {
      if (chunkSize < 16) throw new Error('This WebP file contains an invalid animation frame.');
      const flags = bytes[payloadOffset + 15];
      frames.push({
        x: readUint24(bytes, payloadOffset) * 2,
        y: readUint24(bytes, payloadOffset + 3) * 2,
        width: readUint24(bytes, payloadOffset + 6) + 1,
        height: readUint24(bytes, payloadOffset + 9) + 1,
        durationMs: readUint24(bytes, payloadOffset + 12),
        disposeToBackground: (flags & 1) === 1,
        blendWithPrevious: (flags & 2) === 0,
        frameData: bytes.slice(payloadOffset + 16, payloadEnd),
      });
    }

    offset = payloadEnd + (chunkSize % 2);
  }

  if (frames.length === 0) return null;
  if (width < 1 || height < 1) throw new Error('This animated WebP has no valid canvas size.');
  if (frames.length > MAX_WEBP_FRAME_COUNT) {
    throw new Error(
      `This WebP has ${frames.length} frames. Use an animation with ${MAX_WEBP_FRAME_COUNT} frames or fewer.`,
    );
  }
  if (width * height * frames.length > MAX_WEBP_DECODED_PIXELS) {
    throw new Error('This WebP is too large to decode safely in a browser tab.');
  }

  for (const frame of frames) {
    if (
      frame.width < 1 ||
      frame.height < 1 ||
      frame.frameData.length < 8 ||
      frame.x + frame.width > width ||
      frame.y + frame.height > height
    ) {
      throw new Error('This WebP contains a frame outside its animation canvas.');
    }
  }

  return { width, height, background, frames };
}

function frameHasSeparateAlpha(frameData: Uint8Array): boolean {
  for (let offset = 0; offset + 8 <= frameData.length; ) {
    const chunkType = readFourCc(frameData, offset);
    const chunkSize = new DataView(
      frameData.buffer,
      frameData.byteOffset + offset + 4,
      4,
    ).getUint32(0, true);
    if (chunkType === 'ALPH') return true;
    const nextOffset = offset + 8 + chunkSize + (chunkSize % 2);
    if (nextOffset <= offset || nextOffset > frameData.length) break;
    offset = nextOffset;
  }
  return false;
}

function buildStillWebp(frame: AnimatedWebpFrame): Uint8Array {
  const hasSeparateAlpha = frameHasSeparateAlpha(frame.frameData);
  const extendedHeaderSize = hasSeparateAlpha ? 18 : 0;
  const totalSize = 12 + extendedHeaderSize + frame.frameData.length;
  const output = new Uint8Array(totalSize);
  const view = new DataView(output.buffer);

  writeFourCc(output, 0, 'RIFF');
  view.setUint32(4, totalSize - 8, true);
  writeFourCc(output, 8, 'WEBP');

  let outputOffset = 12;
  if (hasSeparateAlpha) {
    writeFourCc(output, outputOffset, 'VP8X');
    view.setUint32(outputOffset + 4, 10, true);
    output[outputOffset + 8] = 0x10;
    writeUint24(output, outputOffset + 12, frame.width - 1);
    writeUint24(output, outputOffset + 15, frame.height - 1);
    outputOffset += 18;
  }

  output.set(frame.frameData, outputOffset);
  return output;
}

function paintBackground(
  context: CanvasRenderingContext2D,
  background: ParsedAnimatedWebp['background'],
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  context.clearRect(x, y, width, height);
  if (background.alpha === 0) return;
  context.save();
  context.globalCompositeOperation = 'source-over';
  context.fillStyle = `rgba(${background.red}, ${background.green}, ${background.blue}, ${background.alpha / 255})`;
  context.fillRect(x, y, width, height);
  context.restore();
}

async function drawWebpFrame(
  context: CanvasRenderingContext2D,
  frame: AnimatedWebpFrame,
): Promise<void> {
  const url = URL.createObjectURL(new Blob([buildStillWebp(frame)], { type: 'image/webp' }));
  const image = new Image();

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('A WebP animation frame could not be decoded.'));
      image.src = url;
    });

    if (!frame.blendWithPrevious) context.clearRect(frame.x, frame.y, frame.width, frame.height);
    context.save();
    context.globalCompositeOperation = 'source-over';
    context.drawImage(image, frame.x, frame.y, frame.width, frame.height);
    context.restore();
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function canvasToPngBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result);
      else reject(new Error('A composited WebP frame could not be prepared.'));
    }, 'image/png');
  });
  return new Uint8Array(await blob.arrayBuffer());
}

function normalizeWebpDelay(durationMs: number): number {
  if (durationMs <= 10) return 100;
  return Math.max(20, durationMs);
}

async function convertAnimatedWebpToGif(
  file: File,
  onProgress: (progress: GifConversionProgress) => void,
): Promise<GifConversionResult | null> {
  onProgress({ value: 4, message: 'Reading the WebP animation structure…' });
  const parsed = parseAnimatedWebp(await file.arrayBuffer());
  if (!parsed) return null;

  onProgress({ value: 7, message: 'Loading the private browser engine…' });
  const { ffmpeg } = await getBrowserEngine();
  const runId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const canvas = document.createElement('canvas');
  canvas.width = parsed.width;
  canvas.height = parsed.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('This browser could not create an animation canvas.');

  const frameNames: string[] = [];
  const concatName = `webp-frames-${runId}.txt`;
  const outputName = `conversion-output-${runId}.gif`;
  let previousFrame: AnimatedWebpFrame | null = null;

  paintBackground(context, parsed.background, 0, 0, parsed.width, parsed.height);

  try {
    for (let index = 0; index < parsed.frames.length; index += 1) {
      const frame = parsed.frames[index];
      if (previousFrame?.disposeToBackground) {
        paintBackground(
          context,
          parsed.background,
          previousFrame.x,
          previousFrame.y,
          previousFrame.width,
          previousFrame.height,
        );
      }

      await drawWebpFrame(context, frame);
      const frameName = `webp-frame-${runId}-${String(index + 1).padStart(4, '0')}.png`;
      await ffmpeg.writeFile(frameName, await canvasToPngBytes(canvas));
      frameNames.push(frameName);
      previousFrame = frame;
      onProgress({
        value: 12 + ((index + 1) / parsed.frames.length) * 48,
        message: `Compositing WebP frame ${index + 1} of ${parsed.frames.length}…`,
      });
    }

    const concatLines: string[] = [];
    parsed.frames.forEach((frame, index) => {
      concatLines.push(`file '${frameNames[index]}'`);
      concatLines.push(`duration ${(normalizeWebpDelay(frame.durationMs) / 1000).toFixed(3)}`);
    });
    concatLines.push(`file '${frameNames[frameNames.length - 1]}'`);
    await ffmpeg.writeFile(concatName, new TextEncoder().encode(`${concatLines.join('\n')}\n`));

    const paletteFilter =
      '[0:v]split[frames][paletteInput];' +
      '[paletteInput]palettegen=stats_mode=diff:reserve_transparent=1[palette];' +
      '[frames][palette]paletteuse=dither=sierra2_4a:diff_mode=rectangle';

    onProgress({ value: 64, message: 'Encoding the composited frames as a GIF…' });
    const exitCode = await ffmpeg.exec([
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      concatName,
      '-filter_complex',
      paletteFilter,
      '-vsync',
      'vfr',
      '-loop',
      '0',
      '-gifflags',
      '+transdiff',
      outputName,
    ]);

    if (exitCode !== 0) {
      throw new Error('The browser engine stopped while encoding the composited WebP frames.');
    }

    onProgress({ value: 95, message: 'Preparing the converted GIF…' });
    const bytes = copyFileData(await ffmpeg.readFile(outputName));
    const blob = new Blob([bytes], { type: 'image/gif' });
    if (blob.size === 0) throw new Error('The converted GIF is empty. Try another source file.');

    onProgress({ value: 100, message: 'Conversion complete.' });
    return { blob, extension: 'gif', mimeType: 'image/gif' };
  } finally {
    await Promise.all([
      ...frameNames.map((name) => removeVirtualFile(ffmpeg, name)),
      removeVirtualFile(ffmpeg, concatName),
      removeVirtualFile(ffmpeg, outputName),
    ]);
  }
}

function getConversionCommand(
  kind: GifConversionKind,
  inputName: string,
  outputName: string,
  options: Pick<ConvertAnimatedMediaOptions, 'width' | 'height' | 'background' | 'webpQuality'>,
): string[] {
  if (kind === 'gif-to-mp4') {
    const width = Math.max(2, Math.ceil(options.width / 2) * 2);
    const height = Math.max(2, Math.ceil(options.height / 2) * 2);
    const background = normalizeHexColor(options.background).replace('#', '0x');
    const filter =
      `color=c=${background}:s=${width}x${height}:r=30[background];` +
      `[0:v]scale=${width}:${height}:force_original_aspect_ratio=decrease:flags=lanczos,` +
      'format=rgba[foreground];' +
      '[background][foreground]overlay=(W-w)/2:(H-h)/2:shortest=1,format=yuv420p[video]';

    return [
      '-i',
      inputName,
      '-filter_complex',
      filter,
      '-map',
      '[video]',
      '-an',
      '-c:v',
      'libx264',
      '-preset',
      'veryfast',
      '-crf',
      '23',
      '-movflags',
      '+faststart',
      outputName,
    ];
  }

  if (kind === 'gif-to-webp') {
    const quality = Math.max(20, Math.min(100, Math.round(options.webpQuality ?? 82)));
    return [
      '-i',
      inputName,
      '-an',
      '-c:v',
      'libwebp',
      '-quality',
      String(quality),
      '-compression_level',
      '4',
      '-loop',
      '0',
      '-vsync',
      '0',
      outputName,
    ];
  }

  const paletteFilter =
    '[0:v]split[frames][paletteInput];' +
    '[paletteInput]palettegen=stats_mode=diff:reserve_transparent=1[palette];' +
    '[frames][palette]paletteuse=dither=sierra2_4a:diff_mode=rectangle';

  return [
    '-i',
    inputName,
    '-filter_complex',
    paletteFilter,
    '-loop',
    '0',
    '-gifflags',
    '+transdiff',
    outputName,
  ];
}

export async function convertAnimatedMedia({
  file,
  kind,
  width,
  height,
  background,
  webpQuality,
  onProgress,
}: ConvertAnimatedMediaOptions): Promise<GifConversionResult> {
  if (kind === 'webp-to-gif') {
    const browserDecodedResult = await convertAnimatedWebpToGif(file, onProgress);
    if (browserDecodedResult) return browserDecodedResult;
  }

  onProgress({ value: 3, message: 'Loading the private browser engine…' });
  const { ffmpeg, fetchFile } = await getBrowserEngine();
  const runId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const inputExtension = kind === 'webp-to-gif' ? 'webp' : 'gif';
  const inputName = `conversion-input-${runId}.${inputExtension}`;
  const outputName = `conversion-output-${runId}.${EXTENSIONS[kind]}`;
  const detachProgress = attachProgress(ffmpeg, onProgress, 'Converting every animation frame…');

  try {
    onProgress({ value: 10, message: 'Reading the source file locally…' });
    await ffmpeg.writeFile(inputName, await fetchFile(file));
    onProgress({ value: 18, message: 'Converting every animation frame…' });

    const exitCode = await ffmpeg.exec(
      getConversionCommand(kind, inputName, outputName, {
        width,
        height,
        background,
        webpQuality,
      }),
    );

    if (exitCode !== 0) {
      throw new Error('The browser engine stopped before the converted file was ready.');
    }

    onProgress({ value: 94, message: 'Preparing the converted file…' });
    const bytes = copyFileData(await ffmpeg.readFile(outputName));
    const blob = new Blob([bytes], { type: MIME_TYPES[kind] });

    if (blob.size === 0) throw new Error('The converted file is empty. Try another source file.');

    onProgress({ value: 100, message: 'Conversion complete.' });
    return {
      blob,
      extension: EXTENSIONS[kind],
      mimeType: MIME_TYPES[kind],
    };
  } finally {
    detachProgress();
    await Promise.all([
      removeVirtualFile(ffmpeg, inputName),
      removeVirtualFile(ffmpeg, outputName),
    ]);
  }
}

export async function extractGifFrames({
  file,
  onProgress,
}: ExtractGifFramesOptions): Promise<ExtractedGifFrame[]> {
  onProgress({ value: 3, message: 'Loading the private browser engine…' });
  const { ffmpeg, fetchFile } = await getBrowserEngine();
  const runId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const inputName = `frame-source-${runId}.gif`;
  const framePrefix = `frame-${runId}-`;
  const outputPattern = `${framePrefix}%05d.png`;
  const createdFiles: string[] = [];
  const detachProgress = attachProgress(
    ffmpeg,
    onProgress,
    'Compositing and extracting PNG frames…',
  );

  try {
    onProgress({ value: 10, message: 'Reading the GIF locally…' });
    await ffmpeg.writeFile(inputName, await fetchFile(file));
    onProgress({ value: 18, message: 'Compositing and extracting PNG frames…' });

    const exitCode = await ffmpeg.exec([
      '-i',
      inputName,
      '-vf',
      'format=rgba',
      '-vsync',
      '0',
      outputPattern,
    ]);

    if (exitCode !== 0) {
      throw new Error('Frame extraction stopped before the PNG files were ready.');
    }

    onProgress({ value: 92, message: 'Collecting the extracted PNG frames…' });
    const directory = await ffmpeg.listDir('/');
    const frameNames = directory
      .filter(
        (entry) =>
          !entry.isDir && entry.name.startsWith(framePrefix) && entry.name.endsWith('.png'),
      )
      .map((entry) => entry.name)
      .sort((left, right) => left.localeCompare(right));

    if (frameNames.length === 0) {
      throw new Error('No readable frames were found in this GIF.');
    }

    const frames: ExtractedGifFrame[] = [];
    for (let index = 0; index < frameNames.length; index += 1) {
      const virtualName = frameNames[index];
      createdFiles.push(virtualName);
      const bytes = copyFileData(await ffmpeg.readFile(virtualName));
      const number = String(index + 1).padStart(4, '0');
      frames.push({
        index,
        name: `frame-${number}.png`,
        blob: new Blob([bytes], { type: 'image/png' }),
      });
    }

    onProgress({ value: 100, message: `${frames.length} PNG frames are ready.` });
    return frames;
  } finally {
    detachProgress();
    await removeVirtualFile(ffmpeg, inputName);
    await Promise.all(createdFiles.map((path) => removeVirtualFile(ffmpeg, path)));
  }
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = (value & 1) !== 0 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
})();

function getCrc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let index = 0; index < bytes.length; index += 1) {
    crc = CRC_TABLE[(crc ^ bytes[index]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function getDosDateTime(date: Date): { date: number; time: number } {
  const year = Math.max(1980, date.getFullYear());
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
    date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  };
}

function makeZipHeader(length: number, writer: (view: DataView) => void): Uint8Array {
  const bytes = new Uint8Array(length);
  writer(new DataView(bytes.buffer));
  return bytes;
}

export async function createPngFramesZip(
  frames: Array<Pick<ExtractedGifFrame, 'name' | 'blob'>>,
  onProgress?: (value: number) => void,
): Promise<Blob> {
  if (frames.length === 0) throw new Error('Extract frames before creating a ZIP file.');

  const encoder = new TextEncoder();
  const now = getDosDateTime(new Date());
  const localParts: BlobPart[] = [];
  const centralParts: BlobPart[] = [];
  let localOffset = 0;
  let centralSize = 0;

  for (let index = 0; index < frames.length; index += 1) {
    const frame = frames[index];
    const fileName = encoder.encode(frame.name);
    const data = new Uint8Array(await frame.blob.arrayBuffer());
    const crc = getCrc32(data);
    const localHeader = makeZipHeader(30, (view) => {
      view.setUint32(0, 0x04034b50, true);
      view.setUint16(4, 20, true);
      view.setUint16(6, 0, true);
      view.setUint16(8, 0, true);
      view.setUint16(10, now.time, true);
      view.setUint16(12, now.date, true);
      view.setUint32(14, crc, true);
      view.setUint32(18, data.byteLength, true);
      view.setUint32(22, data.byteLength, true);
      view.setUint16(26, fileName.byteLength, true);
      view.setUint16(28, 0, true);
    });
    const centralHeader = makeZipHeader(46, (view) => {
      view.setUint32(0, 0x02014b50, true);
      view.setUint16(4, 20, true);
      view.setUint16(6, 20, true);
      view.setUint16(8, 0, true);
      view.setUint16(10, 0, true);
      view.setUint16(12, now.time, true);
      view.setUint16(14, now.date, true);
      view.setUint32(16, crc, true);
      view.setUint32(20, data.byteLength, true);
      view.setUint32(24, data.byteLength, true);
      view.setUint16(28, fileName.byteLength, true);
      view.setUint16(30, 0, true);
      view.setUint16(32, 0, true);
      view.setUint16(34, 0, true);
      view.setUint16(36, 0, true);
      view.setUint32(38, 0, true);
      view.setUint32(42, localOffset, true);
    });

    localParts.push(localHeader, fileName, frame.blob);
    centralParts.push(centralHeader, fileName);
    localOffset += localHeader.byteLength + fileName.byteLength + data.byteLength;
    centralSize += centralHeader.byteLength + fileName.byteLength;
    onProgress?.(((index + 1) / frames.length) * 100);
  }

  const endRecord = makeZipHeader(22, (view) => {
    view.setUint32(0, 0x06054b50, true);
    view.setUint16(4, 0, true);
    view.setUint16(6, 0, true);
    view.setUint16(8, frames.length, true);
    view.setUint16(10, frames.length, true);
    view.setUint32(12, centralSize, true);
    view.setUint32(16, localOffset, true);
    view.setUint16(20, 0, true);
  });

  return new Blob([...localParts, ...centralParts, endRecord], { type: 'application/zip' });
}
