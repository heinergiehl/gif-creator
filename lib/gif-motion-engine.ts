import type { FFmpeg } from '@ffmpeg/ffmpeg';
import { parseGifMetadata, type GifMetadata } from '@/lib/gif-optimizer';

export type ReverseMode = 'reverse' | 'boomerang';

export type GifMotionOperation =
  | { kind: 'speed'; speed: number }
  | { kind: 'trim'; startSeconds: number; endSeconds: number }
  | { kind: 'reverse'; mode: ReverseMode };

export interface GifMotionProgress {
  stage: 'loading' | 'processing' | 'finishing';
  value: number;
  message: string;
}

export interface GifMotionResult {
  blob: Blob;
  size: number;
  metadata: GifMetadata;
}

interface ProcessGifMotionOptions {
  file: File;
  metadata: GifMetadata;
  operation: GifMotionOperation;
  onProgress: (progress: GifMotionProgress) => void;
}

interface FFmpegProgressEvent {
  progress: number;
  time: number;
}

interface GifFrameTiming {
  imageOffset: number;
  delayOffset: number | null;
  delayCentiseconds: number;
}

function copyFileData(data: unknown): Uint8Array {
  if (data instanceof Uint8Array) return new Uint8Array(data);
  if (typeof data === 'string') return new TextEncoder().encode(data);
  throw new Error('The browser engine returned an unreadable GIF.');
}

async function removeVirtualFile(ffmpeg: FFmpeg, path: string): Promise<void> {
  try {
    await ffmpeg.deleteFile(path);
  } catch {
    // A failed run may stop before creating every virtual file.
  }
}

function finiteDecimal(value: number): string {
  return Number(value.toFixed(5)).toString();
}

function readUint16(bytes: Uint8Array, offset: number): number {
  if (offset < 0 || offset + 1 >= bytes.length) {
    throw new Error('This GIF appears to be incomplete or damaged.');
  }
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function skipSubBlocks(bytes: Uint8Array, start: number): number {
  let offset = start;
  while (offset < bytes.length) {
    const blockLength = bytes[offset];
    offset += 1;
    if (blockLength === 0) return offset;
    offset += blockLength;
    if (offset > bytes.length) throw new Error('This GIF contains an incomplete data block.');
  }
  throw new Error('This GIF contains an incomplete data block.');
}

function scanFrameTimings(bytes: Uint8Array): GifFrameTiming[] {
  if (bytes.length < 13) throw new Error('This GIF appears to be incomplete or damaged.');
  const packedFields = bytes[10];
  const hasGlobalColorTable = (packedFields & 0x80) !== 0;
  const globalColorCount = hasGlobalColorTable ? 1 << ((packedFields & 0x07) + 1) : 0;
  let offset = 13 + globalColorCount * 3;
  let pendingDelayOffset: number | null = null;
  let pendingDelayCentiseconds = 10;
  const frames: GifFrameTiming[] = [];

  while (offset < bytes.length) {
    const marker = bytes[offset];
    if (marker === 0x3b) break;

    if (marker === 0x21) {
      if (offset + 2 >= bytes.length) throw new Error('This GIF contains an incomplete extension.');
      if (bytes[offset + 1] === 0xf9) {
        if (bytes[offset + 2] !== 4 || offset + 7 >= bytes.length) {
          throw new Error('This GIF contains an invalid timing block.');
        }
        const encodedDelay = readUint16(bytes, offset + 4);
        pendingDelayOffset = offset + 4;
        pendingDelayCentiseconds = encodedDelay > 0 ? Math.max(2, encodedDelay) : 10;
        offset += 8;
      } else {
        offset = skipSubBlocks(bytes, offset + 2);
      }
      continue;
    }

    if (marker === 0x2c) {
      if (offset + 9 >= bytes.length) throw new Error('This GIF contains an incomplete frame.');
      frames.push({
        imageOffset: offset,
        delayOffset: pendingDelayOffset,
        delayCentiseconds: pendingDelayCentiseconds,
      });
      pendingDelayOffset = null;
      pendingDelayCentiseconds = 10;

      const imagePackedFields = bytes[offset + 9];
      const hasLocalColorTable = (imagePackedFields & 0x80) !== 0;
      const localColorCount = hasLocalColorTable ? 1 << ((imagePackedFields & 0x07) + 1) : 0;
      offset += 10 + localColorCount * 3;
      if (offset >= bytes.length) throw new Error('This GIF contains incomplete image data.');
      offset += 1;
      offset = skipSubBlocks(bytes, offset);
      continue;
    }

    throw new Error('This GIF uses a block layout the browser could not read.');
  }

  return frames;
}

function allocateFrameDelays(frames: GifFrameTiming[], speed: number): number[] {
  const ideal = frames.map((frame) => frame.delayCentiseconds / speed);
  const delays = ideal.map((delay) => Math.max(2, Math.min(65535, Math.floor(delay))));
  const minimumTotal = frames.length * 2;
  const maximumTotal = frames.length * 65535;
  const idealTotal = Math.round(ideal.reduce((sum, delay) => sum + delay, 0));
  const targetTotal = Math.max(
    delays.reduce((sum, delay) => sum + delay, 0),
    Math.max(minimumTotal, Math.min(maximumTotal, idealTotal)),
  );
  let remaining = targetTotal - delays.reduce((sum, delay) => sum + delay, 0);
  const indexes = frames
    .map((_, index) => index)
    .sort(
      (left, right) =>
        ideal[right] - Math.floor(ideal[right]) - (ideal[left] - Math.floor(ideal[left])),
    );

  while (remaining > 0) {
    let changed = false;
    for (const index of indexes) {
      if (remaining === 0) break;
      if (delays[index] >= 65535) continue;
      delays[index] += 1;
      remaining -= 1;
      changed = true;
    }
    if (!changed) break;
  }

  return delays;
}

function retimeGifBytes(source: Uint8Array, speed: number): Uint8Array {
  const timings = scanFrameTimings(source);
  if (timings.length < 2) throw new Error('Choose an animated GIF with at least two frames.');
  const delays = allocateFrameDelays(timings, speed);
  const updated = new Uint8Array(source);

  timings.forEach((timing, index) => {
    if (timing.delayOffset === null) return;
    updated[timing.delayOffset] = delays[index] & 0xff;
    updated[timing.delayOffset + 1] = (delays[index] >> 8) & 0xff;
  });

  const missingTimings = timings.filter((timing) => timing.delayOffset === null);
  if (missingTimings.length === 0) return updated;

  const output = new Uint8Array(updated.length + missingTimings.length * 8);
  let sourceOffset = 0;
  let outputOffset = 0;

  timings.forEach((timing, index) => {
    if (timing.delayOffset !== null) return;
    const leadingBytes = updated.subarray(sourceOffset, timing.imageOffset);
    output.set(leadingBytes, outputOffset);
    outputOffset += leadingBytes.length;
    output.set(
      new Uint8Array([
        0x21,
        0xf9,
        0x04,
        0x00,
        delays[index] & 0xff,
        (delays[index] >> 8) & 0xff,
        0x00,
        0x00,
      ]),
      outputOffset,
    );
    outputOffset += 8;
    sourceOffset = timing.imageOffset;
  });

  output.set(updated.subarray(sourceOffset), outputOffset);
  return output;
}

function loopArgument(metadata: GifMetadata): string {
  // FFmpeg uses -1 for no loop extension and 0 for an infinite loop.
  return metadata.loopCount === null ? '-1' : String(metadata.loopCount);
}

function paletteTail(inputLabel = 'motion'): string {
  return (
    '[' +
    inputLabel +
    ']split[frames][paletteInput];' +
    '[paletteInput]palettegen=max_colors=256:stats_mode=diff:reserve_transparent=1[palette];' +
    '[frames][palette]paletteuse=dither=sierra2_4a:diff_mode=rectangle:alpha_threshold=128[out]'
  );
}

function buildFilter(operation: GifMotionOperation, metadata: GifMetadata): string {
  if (operation.kind === 'speed') {
    return (
      '[0:v]setpts=(PTS-STARTPTS)/' + finiteDecimal(operation.speed) + '[motion];' + paletteTail()
    );
  }

  if (operation.kind === 'trim') {
    return (
      '[0:v]trim=start=' +
      finiteDecimal(operation.startSeconds) +
      ':end=' +
      finiteDecimal(operation.endSeconds) +
      ',setpts=PTS-STARTPTS[motion];' +
      paletteTail()
    );
  }

  if (operation.mode === 'reverse') {
    return '[0:v]reverse,setpts=PTS-STARTPTS[motion];' + paletteTail();
  }

  const reverseTrim =
    metadata.frameCount > 2
      ? 'trim=start_frame=1:end_frame=' + (metadata.frameCount - 1) + ','
      : 'trim=start_frame=1,';

  return (
    '[0:v]split=2[forwardSource][reverseSource];' +
    '[forwardSource]setpts=PTS-STARTPTS[forward];' +
    '[reverseSource]reverse,' +
    reverseTrim +
    'setpts=PTS-STARTPTS[backward];' +
    '[forward][backward]concat=n=2:v=1:a=0[motion];' +
    paletteTail()
  );
}

function validateOperation(operation: GifMotionOperation, metadata: GifMetadata): void {
  if (!metadata.animated) {
    throw new Error('Choose an animated GIF with at least two frames.');
  }

  if (operation.kind === 'speed') {
    if (!Number.isFinite(operation.speed) || operation.speed < 0.25 || operation.speed > 4) {
      throw new Error('Choose a speed between 0.25× and 4×.');
    }
    return;
  }

  if (operation.kind === 'trim') {
    const durationSeconds = metadata.durationMs / 1000;
    if (
      !Number.isFinite(operation.startSeconds) ||
      !Number.isFinite(operation.endSeconds) ||
      operation.startSeconds < 0 ||
      operation.endSeconds > durationSeconds + 0.001 ||
      operation.endSeconds - operation.startSeconds < 0.1
    ) {
      throw new Error('Keep the selected clip inside the GIF and at least 0.1 seconds long.');
    }
  }
}

export async function processGifMotion({
  file,
  metadata,
  operation,
  onProgress,
}: ProcessGifMotionOptions): Promise<GifMotionResult> {
  validateOperation(operation, metadata);

  if (operation.kind === 'speed') {
    onProgress({ stage: 'processing', value: 18, message: 'Reading animation timing…' });
    const data = retimeGifBytes(new Uint8Array(await file.arrayBuffer()), operation.speed);
    onProgress({ stage: 'finishing', value: 92, message: 'Checking the finished GIF…' });
    const outputBuffer = data.buffer.slice(
      data.byteOffset,
      data.byteOffset + data.byteLength,
    ) as ArrayBuffer;
    const outputMetadata = parseGifMetadata(outputBuffer);
    const blob = new Blob([data], { type: 'image/gif' });
    onProgress({ stage: 'finishing', value: 100, message: 'Your GIF is ready.' });
    return { blob, size: blob.size, metadata: outputMetadata };
  }

  onProgress({ stage: 'loading', value: 4, message: 'Loading the private browser engine…' });

  const [{ ffmpegStore }, { fetchFile }] = await Promise.all([
    import('@/store/FFmpegStore'),
    import('@ffmpeg/util'),
  ]);
  const ffmpeg = await ffmpegStore.ensureLoaded();
  const runId = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  const inputName = 'motion-input-' + runId + '.gif';
  const outputName = 'motion-output-' + runId + '.gif';

  const handleProgress = ({ progress }: FFmpegProgressEvent) => {
    const normalized = Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0;
    onProgress({
      stage: 'processing',
      value: Math.round(14 + normalized * 74),
      message:
        operation.kind === 'trim'
          ? 'Cutting and rebuilding the selected clip…'
          : operation.mode === 'boomerang'
            ? 'Building the forward and backward loop…'
            : 'Reversing and rebuilding the animation…',
    });
  };

  try {
    await ffmpeg.writeFile(inputName, await fetchFile(file));
    ffmpeg.on('progress', handleProgress);
    onProgress({ stage: 'processing', value: 12, message: 'Reading animation frames…' });

    const exitCode = await ffmpeg.exec([
      '-i',
      inputName,
      '-filter_complex',
      buildFilter(operation, metadata),
      '-map',
      '[out]',
      '-loop',
      loopArgument(metadata),
      '-gifflags',
      '+transdiff',
      outputName,
    ]);

    if (exitCode !== 0) {
      throw new Error('Processing stopped before a complete GIF was produced.');
    }

    onProgress({ stage: 'finishing', value: 94, message: 'Checking the finished GIF…' });
    const data = copyFileData(await ffmpeg.readFile(outputName));
    const outputBuffer = data.buffer.slice(
      data.byteOffset,
      data.byteOffset + data.byteLength,
    ) as ArrayBuffer;
    const outputMetadata = parseGifMetadata(outputBuffer);
    const blob = new Blob([data], { type: 'image/gif' });

    onProgress({ stage: 'finishing', value: 100, message: 'Your GIF is ready.' });
    return { blob, size: blob.size, metadata: outputMetadata };
  } finally {
    ffmpeg.off('progress', handleProgress);
    await removeVirtualFile(ffmpeg, inputName);
    await removeVirtualFile(ffmpeg, outputName);
  }
}
