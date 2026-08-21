import type { FFmpeg } from '@ffmpeg/ffmpeg';
import { parseGifMetadata, type GifMetadata } from '@/lib/gif-optimizer';

export type GifRotation = 0 | 90 | 180 | 270;

export type GifEditOperation =
  | {
      type: 'resize';
      width: number;
      height: number;
    }
  | {
      type: 'crop';
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: 'rotate';
      rotation: GifRotation;
      flipHorizontal: boolean;
      flipVertical: boolean;
    };

export interface GifEditProgress {
  value: number;
  message: string;
}

export interface GifEditResult {
  blob: Blob;
  metadata: GifMetadata;
}

interface EditGifOptions {
  file: File;
  metadata: GifMetadata;
  operation: GifEditOperation;
  onProgress: (progress: GifEditProgress) => void;
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
    // A failed encode may stop before the virtual file is created.
  }
}

function buildTransformFilter(operation: GifEditOperation): string {
  if (operation.type === 'resize') {
    return `scale=${operation.width}:${operation.height}:flags=lanczos`;
  }

  if (operation.type === 'crop') {
    return `crop=${operation.width}:${operation.height}:${operation.x}:${operation.y}`;
  }

  const filters: string[] = [];

  if (operation.rotation === 90) filters.push('transpose=clock');
  if (operation.rotation === 180) filters.push('hflip', 'vflip');
  if (operation.rotation === 270) filters.push('transpose=cclock');
  if (operation.flipHorizontal) filters.push('hflip');
  if (operation.flipVertical) filters.push('vflip');

  if (filters.length === 0) {
    throw new Error('Choose a rotation or flip before creating the result.');
  }

  return filters.join(',');
}

function buildFilter(operation: GifEditOperation): string {
  const transform = buildTransformFilter(operation);

  return (
    `[0:v]${transform},split[frames][paletteInput];` +
    '[paletteInput]palettegen=max_colors=256:stats_mode=diff:reserve_transparent=1[palette];' +
    '[frames][palette]paletteuse=dither=sierra2_4a:diff_mode=rectangle:' +
    'alpha_threshold=128[out]'
  );
}

export async function editGif({
  file,
  metadata,
  operation,
  onProgress,
}: EditGifOptions): Promise<GifEditResult> {
  onProgress({ value: 3, message: 'Loading the private browser engine…' });

  const [{ ffmpegStore }, { fetchFile }] = await Promise.all([
    import('@/store/FFmpegStore'),
    import('@ffmpeg/util'),
  ]);
  const ffmpeg = await ffmpegStore.ensureLoaded();
  const runId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const inputName = `gif-edit-input-${runId}.gif`;
  const outputName = `gif-edit-output-${runId}.gif`;
  const progressListener = ({ progress }: { progress: number }) => {
    if (!Number.isFinite(progress)) return;
    onProgress({
      value: Math.max(14, Math.min(92, 14 + progress * 78)),
      message: 'Rendering every animation frame…',
    });
  };

  try {
    onProgress({ value: 10, message: 'Preparing the source GIF…' });
    await ffmpeg.writeFile(inputName, await fetchFile(file));
    ffmpeg.on('progress', progressListener);

    const args = [
      '-i',
      inputName,
      '-filter_complex',
      buildFilter(operation),
      '-map',
      '[out]',
      '-an',
    ];

    args.push('-loop', metadata.loopCount === null ? '-1' : String(metadata.loopCount));

    args.push('-gifflags', '+transdiff', outputName);

    const exitCode = await ffmpeg.exec(args);
    if (exitCode !== 0) {
      throw new Error('GIF rendering stopped before the result was ready.');
    }

    onProgress({ value: 95, message: 'Checking the finished GIF…' });
    const data = copyFileData(await ffmpeg.readFile(outputName));
    const blob = new Blob([data], { type: 'image/gif' });
    const resultMetadata = parseGifMetadata(await blob.arrayBuffer());

    onProgress({ value: 100, message: 'Your GIF is ready.' });
    return { blob, metadata: resultMetadata };
  } finally {
    ffmpeg.off('progress', progressListener);
    await removeVirtualFile(ffmpeg, inputName);
    await removeVirtualFile(ffmpeg, outputName);
  }
}
