import type { FFmpeg } from '@ffmpeg/ffmpeg';
import {
  clampFrameDuration,
  createStudioFrame,
  createStudioId,
  createStudioProject,
  getFrameStartTime,
  getProjectDuration,
  isOverlayActive,
} from '@/components/gif-studio/model';
import type {
  StudioExportFormat,
  StudioExportOptions,
  StudioExportResult,
  StudioFrame,
  StudioOverlay,
  StudioProgress,
  StudioProject,
  StudioSourceKind,
} from '@/components/gif-studio/types';
import { parseGifFrameTiming } from '@/lib/gif-frame-timing';
import { MAX_GIF_BYTES } from '@/lib/gif-optimizer';

export type StudioProgressCallback = (progress: StudioProgress) => void;

export interface StudioImportOptions {
  fps?: number;
  onProgress?: StudioProgressCallback;
}

export interface DrawStudioFrameOptions {
  preview?: boolean;
}

export interface BlendFrameOptions {
  width?: number;
  height?: number;
  durationMs?: number;
  name?: string;
}

export interface StudioExportCapability {
  supported: boolean;
  reason?: string;
}

export type StudioExportCapabilities = Record<StudioExportFormat, StudioExportCapability>;

type StudioMediaCollection = FileList | readonly Blob[];

interface DecodedImage {
  source: CanvasImageSource;
  width: number;
  height: number;
  close: () => void;
}

interface VideoMetadata {
  width: number;
  height: number;
  durationSeconds: number;
}

interface RenderSlice {
  frameIndex: number;
  startMs: number;
  durationMs: number;
  sampleTimeMs: number;
}

const MAX_IMAGE_OR_GIF_BYTES = MAX_GIF_BYTES;
const MAX_VIDEO_BYTES = 180 * 1024 * 1024;
const MAX_SEQUENCE_BYTES = 120 * 1024 * 1024;
const MAX_IMPORT_FRAMES = 600;
const MAX_EXPORT_SLICES = 900;
const MAX_DECODED_PIXELS = 260_000_000;
const MAX_EXPORT_PIXELS = 360_000_000;
const MAX_CANVAS_DIMENSION = 4096;
const MAX_PREVIEW_DIMENSION = 960;
const FALLBACK_VIDEO_WIDTH = 800;
const DIFFERENCE_SAMPLE_SIZE = 64;

let studioJobQueue: Promise<void> = Promise.resolve();
let capabilityPromise: Promise<StudioExportCapabilities> | null = null;

function report(
  callback: StudioProgressCallback | undefined,
  phase: StudioProgress['phase'],
  value: number,
  message: string,
): void {
  callback?.({ phase, value: Math.max(0, Math.min(100, value)), message });
}

function runStudioJob<T>(job: () => Promise<T>): Promise<T> {
  const result = studioJobQueue.then(job, job);
  studioJobQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

function createCanvas(width: number, height: number): HTMLCanvasElement {
  if (typeof document === 'undefined') {
    throw new Error('GIF Studio rendering is only available in a browser tab.');
  }
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = 'image/png',
  quality?: number,
): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error('The rendered frame could not be encoded.')),
      type,
      quality,
    );
  });
}

async function decodeImage(blob: Blob): Promise<DecodedImage> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(blob);
      if (bitmap.width > 0 && bitmap.height > 0) {
        return {
          source: bitmap,
          width: bitmap.width,
          height: bitmap.height,
          close: () => bitmap.close(),
        };
      }
      bitmap.close();
    } catch {
      // Some Safari/WebP combinations need the HTMLImageElement fallback.
    }
  }

  if (typeof Image === 'undefined') throw new Error('This browser cannot decode image frames.');
  const url = URL.createObjectURL(blob);
  const image = new Image();
  try {
    image.src = url;
    await image.decode();
    if (image.naturalWidth < 1 || image.naturalHeight < 1) {
      throw new Error('This image has no readable dimensions.');
    }
    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      close: () => URL.revokeObjectURL(url),
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

function copyFileData(data: unknown): Uint8Array {
  if (data instanceof Uint8Array) return new Uint8Array(data);
  if (typeof data === 'string') return new TextEncoder().encode(data);
  throw new Error('The browser media engine returned an unreadable file.');
}

async function removeVirtualFile(ffmpeg: FFmpeg, path: string): Promise<void> {
  try {
    await ffmpeg.deleteFile(path);
  } catch {
    // Failed jobs do not necessarily create every planned file.
  }
}

async function getBrowserEngine(): Promise<{
  ffmpeg: FFmpeg;
  fetchFile: (file: Blob | File | string) => Promise<Uint8Array>;
}> {
  const [{ ffmpegStore }, { fetchFile }] = await Promise.all([
    import('@/store/FFmpegStore'),
    import('@ffmpeg/util'),
  ]);
  return { ffmpeg: await ffmpegStore.ensureLoaded(), fetchFile };
}

function isFile(value: Blob): value is File {
  return typeof File !== 'undefined' && value instanceof File;
}

function mediaName(blob: Blob, index = 0): string {
  return isFile(blob) && blob.name ? blob.name : `recording-${index + 1}`;
}

function normalizedExtension(blob: Blob): string {
  const name = mediaName(blob).toLowerCase();
  const extension = name.match(/\.([a-z0-9]{1,5})$/)?.[1];
  if (
    extension &&
    ['gif', 'png', 'jpg', 'jpeg', 'webp', 'avif', 'mp4', 'webm', 'mov', 'avi', 'mkv'].includes(
      extension,
    )
  ) {
    return extension;
  }
  const mime = blob.type.toLowerCase();
  if (mime.includes('webm')) return 'webm';
  if (mime.includes('quicktime')) return 'mov';
  if (mime.includes('matroska')) return 'mkv';
  if (mime.startsWith('video/')) return 'mp4';
  if (mime.includes('jpeg')) return 'jpg';
  if (mime.includes('webp')) return 'webp';
  if (mime.includes('avif')) return 'avif';
  if (mime.includes('gif')) return 'gif';
  return 'png';
}

async function hasGifSignature(blob: Blob): Promise<boolean> {
  if (blob.size < 6) return false;
  const bytes = new Uint8Array(await blob.slice(0, 6).arrayBuffer());
  const signature = String.fromCharCode(...bytes);
  return signature === 'GIF87a' || signature === 'GIF89a';
}

function looksLikeVideo(blob: Blob): boolean {
  if (blob.type.toLowerCase().startsWith('video/')) return true;
  return /\.(mp4|webm|mov|avi|mkv)$/i.test(mediaName(blob));
}

function looksLikeImage(blob: Blob): boolean {
  if (blob.type.toLowerCase().startsWith('image/')) return !blob.type.includes('svg');
  return /\.(png|jpe?g|webp|avif)$/i.test(mediaName(blob));
}

function safeFps(value: number | undefined): number {
  return Math.max(1, Math.min(30, Math.round(Number.isFinite(value) ? (value as number) : 12)));
}

function checkCanvasLimits(width: number, height: number): void {
  if (width < 1 || height < 1 || width > MAX_CANVAS_DIMENSION || height > MAX_CANVAS_DIMENSION) {
    throw new Error(
      `Use media no larger than ${MAX_CANVAS_DIMENSION} × ${MAX_CANVAS_DIMENSION} pixels.`,
    );
  }
}

async function readVideoMetadata(blob: Blob): Promise<VideoMetadata | null> {
  if (typeof document === 'undefined') return null;
  const url = URL.createObjectURL(blob);
  const video = document.createElement('video');
  video.preload = 'metadata';
  video.muted = true;

  try {
    return await new Promise<VideoMetadata | null>((resolve) => {
      let settled = false;
      const finish = (value: VideoMetadata | null) => {
        if (settled) return;
        settled = true;
        resolve(value);
      };
      const timeout = window.setTimeout(() => finish(null), 6_000);
      video.onloadedmetadata = () => {
        window.clearTimeout(timeout);
        const durationSeconds = Number(video.duration);
        finish(
          video.videoWidth > 0 && video.videoHeight > 0 && Number.isFinite(durationSeconds)
            ? { width: video.videoWidth, height: video.videoHeight, durationSeconds }
            : null,
        );
      };
      video.onerror = () => {
        window.clearTimeout(timeout);
        finish(null);
      };
      video.src = url;
    });
  } finally {
    video.removeAttribute('src');
    video.load();
    URL.revokeObjectURL(url);
  }
}

function scaledVideoDimensions(
  metadata: VideoMetadata,
  estimatedFrames: number,
): { width: number; height: number } {
  const sourcePixels = metadata.width * metadata.height;
  const pixelsPerFrame = Math.max(1, Math.floor(MAX_DECODED_PIXELS / Math.max(1, estimatedFrames)));
  const scale = Math.min(
    1,
    MAX_CANVAS_DIMENSION / metadata.width,
    MAX_CANVAS_DIMENSION / metadata.height,
    Math.sqrt(pixelsPerFrame / sourcePixels),
  );
  return {
    width: Math.max(2, Math.floor(metadata.width * scale)),
    height: Math.max(2, Math.floor(metadata.height * scale)),
  };
}

async function importGif(file: Blob, options: StudioImportOptions): Promise<StudioProject> {
  if (file.size < 1) throw new Error('This GIF is empty.');
  if (file.size > MAX_IMAGE_OR_GIF_BYTES) throw new Error('Choose a GIF smaller than 50 MB.');

  report(options.onProgress, 'importing', 3, 'Reading GIF frame timing…');
  const timing = parseGifFrameTiming(await file.arrayBuffer());
  checkCanvasLimits(timing.width, timing.height);
  if (timing.frameDurationsMs.length > MAX_IMPORT_FRAMES) {
    throw new Error(`Use a GIF with ${MAX_IMPORT_FRAMES} frames or fewer.`);
  }
  if (timing.width * timing.height * timing.frameDurationsMs.length > MAX_DECODED_PIXELS) {
    throw new Error(
      'This GIF is too large to expand safely in one browser tab. Resize or trim it first.',
    );
  }

  const extracted = await runStudioJob(async () => {
    const { extractGifFrames } = await import('@/lib/gif-conversion-engine');
    return extractGifFrames({
      file: isFile(file) ? file : new File([file], `${mediaName(file)}.gif`, { type: 'image/gif' }),
      onProgress: ({ value, message }) =>
        report(options.onProgress, 'importing', 8 + value * 0.78, message),
    });
  });

  if (extracted.length !== timing.frameDurationsMs.length) {
    throw new Error(
      'The GIF decoder returned a different frame count than its timing table. Try another GIF.',
    );
  }

  const frames = extracted.map((frame, index) =>
    createStudioFrame(frame.blob, frame.name, timing.frameDurationsMs[index]),
  );
  const name = mediaName(file);
  report(options.onProgress, 'ready', 100, `${frames.length} GIF frames are ready.`);
  return createStudioProject({
    sourceKind: 'gif',
    sourceName: name,
    width: timing.width,
    height: timing.height,
    frames,
  });
}

async function importImageSequence(
  files: Blob[],
  options: StudioImportOptions,
): Promise<StudioProject> {
  if (files.length > MAX_IMPORT_FRAMES) {
    throw new Error(`Use ${MAX_IMPORT_FRAMES} images or fewer in one sequence.`);
  }
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  if (totalBytes < 1) throw new Error('The selected images are empty.');
  if (totalBytes > MAX_SEQUENCE_BYTES)
    throw new Error('Choose an image sequence smaller than 120 MB.');

  const durationMs = clampFrameDuration(1000 / safeFps(options.fps));
  const frames: StudioFrame[] = [];
  let width = 0;
  let height = 0;
  let decodedPixels = 0;

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    if (!looksLikeImage(file))
      throw new Error(`${mediaName(file, index)} is not a supported image file.`);
    const decoded = await decodeImage(file);
    try {
      checkCanvasLimits(decoded.width, decoded.height);
      decodedPixels += decoded.width * decoded.height;
      if (decodedPixels > MAX_DECODED_PIXELS) {
        throw new Error('This image sequence is too large to decode safely in one browser tab.');
      }
      width = Math.max(width, decoded.width);
      height = Math.max(height, decoded.height);
      frames.push(createStudioFrame(file, mediaName(file, index), durationMs));
    } finally {
      decoded.close();
    }
    report(
      options.onProgress,
      'importing',
      5 + ((index + 1) / files.length) * 90,
      `Reading image ${index + 1} of ${files.length}…`,
    );
  }

  const sourceName = files.length === 1 ? mediaName(files[0]) : `${mediaName(files[0])} sequence`;
  report(options.onProgress, 'ready', 100, `${frames.length} image frames are ready.`);
  return createStudioProject({ sourceKind: 'images', sourceName, width, height, frames });
}

async function importVideo(file: Blob, options: StudioImportOptions): Promise<StudioProject> {
  if (file.size < 1) throw new Error('This video is empty.');
  if (file.size > MAX_VIDEO_BYTES)
    throw new Error('Choose a recording or video smaller than 180 MB.');
  const fps = safeFps(options.fps);
  const durationMs = clampFrameDuration(1000 / fps);
  const metadata = await readVideoMetadata(file);
  const estimatedFrames = metadata ? Math.max(1, Math.ceil(metadata.durationSeconds * fps)) : null;
  if (estimatedFrames !== null && estimatedFrames > MAX_IMPORT_FRAMES) {
    throw new Error(
      `At ${fps} fps this video would create ${estimatedFrames} frames. Trim it or choose a lower frame rate.`,
    );
  }
  const target = metadata
    ? scaledVideoDimensions(metadata, estimatedFrames ?? MAX_IMPORT_FRAMES)
    : null;

  return runStudioJob(async () => {
    report(options.onProgress, 'importing', 3, 'Loading the private browser engine…');
    const { ffmpeg, fetchFile } = await getBrowserEngine();
    const runId = createStudioId('studio-video').replace(/[^a-z0-9-]/gi, '');
    const inputName = `${runId}.${normalizedExtension(file)}`;
    const framePrefix = `${runId}-frame-`;
    const framePattern = `${framePrefix}%05d.png`;
    const createdFiles: string[] = [];
    const progressListener = ({ progress }: { progress: number }) => {
      if (!Number.isFinite(progress)) return;
      report(
        options.onProgress,
        'importing',
        14 + Math.max(0, Math.min(1, progress)) * 66,
        'Extracting editable video frames…',
      );
    };

    try {
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      ffmpeg.on('progress', progressListener);
      const scaleFilter = target
        ? `scale=${target.width}:${target.height}:flags=lanczos`
        : `scale=w='min(iw,${FALLBACK_VIDEO_WIDTH})':h=-2:flags=lanczos`;
      const exitCode = await ffmpeg.exec([
        '-y',
        '-i',
        inputName,
        '-an',
        '-vf',
        `fps=${fps},${scaleFilter},format=rgba`,
        '-vsync',
        '0',
        '-frames:v',
        String(MAX_IMPORT_FRAMES + 1),
        framePattern,
      ]);
      if (exitCode !== 0) throw new Error('Video frame extraction stopped before it was complete.');

      const directory = await ffmpeg.listDir('/');
      const frameNames = directory
        .filter(
          (entry) =>
            !entry.isDir && entry.name.startsWith(framePrefix) && entry.name.endsWith('.png'),
        )
        .map((entry) => entry.name)
        .sort((left, right) => left.localeCompare(right));
      createdFiles.push(...frameNames);
      if (frameNames.length === 0) throw new Error('No readable video frames were found.');
      if (frameNames.length > MAX_IMPORT_FRAMES) {
        throw new Error(
          `This video is too long at ${fps} fps. Trim it to ${MAX_IMPORT_FRAMES} frames or fewer.`,
        );
      }

      const frames: StudioFrame[] = [];
      let width = 0;
      let height = 0;
      for (let index = 0; index < frameNames.length; index += 1) {
        const bytes = copyFileData(await ffmpeg.readFile(frameNames[index]));
        const blob = new Blob([bytes], { type: 'image/png' });
        if (index === 0) {
          const decoded = await decodeImage(blob);
          try {
            width = decoded.width;
            height = decoded.height;
            checkCanvasLimits(width, height);
            if (width * height * frameNames.length > MAX_DECODED_PIXELS) {
              throw new Error('This video is too large to expand safely in one browser tab.');
            }
          } finally {
            decoded.close();
          }
        }
        frames.push(
          createStudioFrame(blob, `frame-${String(index + 1).padStart(4, '0')}.png`, durationMs),
        );
        report(
          options.onProgress,
          'importing',
          80 + ((index + 1) / frameNames.length) * 18,
          `Loading frame ${index + 1} of ${frameNames.length}…`,
        );
      }

      const sourceKind: StudioSourceKind = isFile(file) ? 'video' : 'recording';
      report(options.onProgress, 'ready', 100, `${frames.length} video frames are ready.`);
      return createStudioProject({
        sourceKind,
        sourceName: mediaName(file),
        width,
        height,
        frames,
      });
    } finally {
      ffmpeg.off('progress', progressListener);
      if (createdFiles.length === 0) {
        try {
          const directory = await ffmpeg.listDir('/');
          createdFiles.push(
            ...directory
              .filter((entry) => !entry.isDir && entry.name.startsWith(framePrefix))
              .map((entry) => entry.name),
          );
        } catch {
          // The virtual filesystem can be unavailable after a fatal worker error.
        }
      }
      await removeVirtualFile(ffmpeg, inputName);
      await Promise.all(createdFiles.map((name) => removeVirtualFile(ffmpeg, name)));
    }
  });
}

export async function importStudioMedia(
  files: StudioMediaCollection,
  options: StudioImportOptions = {},
): Promise<StudioProject> {
  const inputs = Array.from(files as ArrayLike<Blob>);
  if (inputs.length === 0) throw new Error('Choose at least one GIF, image, video, or recording.');
  report(options.onProgress, 'importing', 1, 'Inspecting the selected media…');

  if (inputs.length === 1 && (await hasGifSignature(inputs[0]))) {
    return importGif(inputs[0], options);
  }
  if (inputs.length === 1 && looksLikeVideo(inputs[0])) {
    return importVideo(inputs[0], options);
  }
  if (inputs.every(looksLikeImage)) {
    return importImageSequence(inputs, options);
  }
  throw new Error('Combine image files as a sequence, or choose one GIF, video, or recording.');
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, Number.isFinite(value) ? value : minimum));
}

function roundedRectPath(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const safeRadius = Math.max(0, Math.min(radius, width / 2, height / 2));
  context.beginPath();
  context.roundRect(x, y, width, height, safeRadius);
}

function outputDimensions(
  project: StudioProject,
  preview: boolean,
): { width: number; height: number } {
  const width = Math.max(1, Math.round(project.canvas.width));
  const height = Math.max(1, Math.round(project.canvas.height));
  if (!preview || Math.max(width, height) <= MAX_PREVIEW_DIMENSION) return { width, height };
  const scale = MAX_PREVIEW_DIMENSION / Math.max(width, height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function fillCanvasBackground(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
): void {
  context.clearRect(0, 0, width, height);
  if (!color || color === 'transparent') return;
  context.save();
  context.fillStyle = color;
  context.fillRect(0, 0, width, height);
  context.restore();
}

async function drawBaseFrame(
  canvas: HTMLCanvasElement,
  project: StudioProject,
  frameIndex: number,
  backgroundOverride?: string,
): Promise<void> {
  const frame = project.frames[frameIndex];
  if (!frame) throw new Error('The selected studio frame no longer exists.');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('This browser could not create a 2D rendering canvas.');
  fillCanvasBackground(
    context,
    canvas.width,
    canvas.height,
    backgroundOverride ?? project.canvas.background,
  );

  const decoded = await decodeImage(frame.blob);
  try {
    const transform = frame.transform;
    const cropX = clamp(transform.cropX, 0, 99.99);
    const cropY = clamp(transform.cropY, 0, 99.99);
    const cropWidthPercent = clamp(transform.cropWidth, 0.01, 100 - cropX);
    const cropHeightPercent = clamp(transform.cropHeight, 0.01, 100 - cropY);
    const sourceX = (cropX / 100) * decoded.width;
    const sourceY = (cropY / 100) * decoded.height;
    const sourceWidth = Math.max(1, (cropWidthPercent / 100) * decoded.width);
    const sourceHeight = Math.max(1, (cropHeightPercent / 100) * decoded.height);
    const swapsAxes = transform.rotation === 90 || transform.rotation === 270;
    const rotatedWidth = swapsAxes ? sourceHeight : sourceWidth;
    const rotatedHeight = swapsAxes ? sourceWidth : sourceHeight;
    const transformed = createCanvas(Math.ceil(rotatedWidth), Math.ceil(rotatedHeight));
    const transformedContext = transformed.getContext('2d');
    if (!transformedContext)
      throw new Error('This browser could not prepare the transformed frame.');

    transformedContext.translate(transformed.width / 2, transformed.height / 2);
    transformedContext.rotate((transform.rotation * Math.PI) / 180);
    transformedContext.scale(transform.flipHorizontal ? -1 : 1, transform.flipVertical ? -1 : 1);
    transformedContext.drawImage(
      decoded.source,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      -sourceWidth / 2,
      -sourceHeight / 2,
      sourceWidth,
      sourceHeight,
    );

    const containScale = Math.min(
      canvas.width / transformed.width,
      canvas.height / transformed.height,
    );
    const coverScale = Math.max(
      canvas.width / transformed.width,
      canvas.height / transformed.height,
    );
    const fitScale = project.canvas.fit === 'cover' ? coverScale : containScale;
    const zoom = clamp(transform.zoom, 0.1, 10);
    const drawWidth =
      project.canvas.fit === 'stretch' ? canvas.width * zoom : transformed.width * fitScale * zoom;
    const drawHeight =
      project.canvas.fit === 'stretch'
        ? canvas.height * zoom
        : transformed.height * fitScale * zoom;
    const drawX =
      (canvas.width - drawWidth) / 2 + (clamp(transform.panX, -200, 200) / 100) * canvas.width;
    const drawY =
      (canvas.height - drawHeight) / 2 + (clamp(transform.panY, -200, 200) / 100) * canvas.height;
    const scale = canvas.width / Math.max(1, project.canvas.width);
    const filter = frame.filter;

    context.save();
    context.filter = [
      `brightness(${clamp(filter.brightness, 0, 300)}%)`,
      `contrast(${clamp(filter.contrast, 0, 300)}%)`,
      `saturate(${clamp(filter.saturation, 0, 300)}%)`,
      `blur(${clamp(filter.blur, 0, 100) * scale}px)`,
      `grayscale(${clamp(filter.grayscale, 0, 100)}%)`,
      `sepia(${clamp(filter.sepia, 0, 100)}%)`,
    ].join(' ');
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(transformed, drawX, drawY, drawWidth, drawHeight);
    context.restore();
  } finally {
    decoded.close();
  }
}

function overlayGeometry(canvas: HTMLCanvasElement, overlay: StudioOverlay) {
  return {
    centerX: (clamp(overlay.x, -100, 200) / 100) * canvas.width,
    centerY: (clamp(overlay.y, -100, 200) / 100) * canvas.height,
    width: Math.max(1, (clamp(overlay.width, 0.1, 300) / 100) * canvas.width),
    height: Math.max(1, (clamp(overlay.height, 0.1, 300) / 100) * canvas.height),
  };
}

function clipOverlayRegion(
  context: CanvasRenderingContext2D,
  overlay: StudioOverlay,
  geometry: ReturnType<typeof overlayGeometry>,
  ellipse = false,
): void {
  context.translate(geometry.centerX, geometry.centerY);
  context.rotate((overlay.rotation * Math.PI) / 180);
  context.beginPath();
  if (ellipse) {
    context.ellipse(0, 0, geometry.width / 2, geometry.height / 2, 0, 0, Math.PI * 2);
  } else {
    context.roundRect(
      -geometry.width / 2,
      -geometry.height / 2,
      geometry.width,
      geometry.height,
      Math.min(overlay.cornerRadius, geometry.width / 2, geometry.height / 2),
    );
  }
  context.clip();
  context.rotate((-overlay.rotation * Math.PI) / 180);
  context.translate(-geometry.centerX, -geometry.centerY);
}

function canvasSnapshot(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const snapshot = createCanvas(canvas.width, canvas.height);
  snapshot.getContext('2d')?.drawImage(canvas, 0, 0);
  return snapshot;
}

function drawRegionEffect(canvas: HTMLCanvasElement, overlay: StudioOverlay): void {
  const context = canvas.getContext('2d');
  if (!context) return;
  const geometry = overlayGeometry(canvas, overlay);
  const snapshot = canvasSnapshot(canvas);
  const processed = createCanvas(canvas.width, canvas.height);
  const processedContext = processed.getContext('2d');
  if (!processedContext) return;

  if (overlay.kind === 'blur') {
    processedContext.filter = `blur(${clamp(overlay.strength, 1, 80)}px)`;
    processedContext.drawImage(snapshot, 0, 0);
  } else {
    const pixelSize = Math.max(2, Math.round(clamp(overlay.strength, 2, 80)));
    const smallWidth = Math.max(1, Math.round(canvas.width / pixelSize));
    const smallHeight = Math.max(1, Math.round(canvas.height / pixelSize));
    const small = createCanvas(smallWidth, smallHeight);
    const smallContext = small.getContext('2d');
    if (!smallContext) return;
    smallContext.imageSmoothingEnabled = false;
    smallContext.drawImage(snapshot, 0, 0, smallWidth, smallHeight);
    processedContext.imageSmoothingEnabled = false;
    processedContext.drawImage(small, 0, 0, canvas.width, canvas.height);
  }

  context.save();
  context.globalAlpha = clamp(overlay.opacity, 0, 100) / 100;
  clipOverlayRegion(context, overlay, geometry);
  context.drawImage(processed, 0, 0);
  context.restore();
}

function drawSpotlight(canvas: HTMLCanvasElement, overlay: StudioOverlay): void {
  const context = canvas.getContext('2d');
  if (!context) return;
  const snapshot = canvasSnapshot(canvas);
  const geometry = overlayGeometry(canvas, overlay);
  context.save();
  context.fillStyle = overlay.background || '#000000';
  context.globalAlpha = clamp(overlay.opacity, 0, 100) / 100;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.restore();
  context.save();
  clipOverlayRegion(context, overlay, geometry, true);
  context.drawImage(snapshot, 0, 0);
  context.restore();
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const paragraphs = (text || '').split(/\r?\n/);
  const lines: string[] = [];
  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push('');
      continue;
    }
    let line = words[0];
    for (let index = 1; index < words.length; index += 1) {
      const candidate = `${line} ${words[index]}`;
      if (context.measureText(candidate).width <= maxWidth) line = candidate;
      else {
        lines.push(line);
        line = words[index];
        if (lines.length >= maxLines) break;
      }
    }
    if (lines.length < maxLines) lines.push(line);
    if (lines.length >= maxLines) break;
  }
  return lines.slice(0, maxLines);
}

function drawTextualOverlay(
  canvas: HTMLCanvasElement,
  overlay: StudioOverlay,
  callout: boolean,
): void {
  const context = canvas.getContext('2d');
  if (!context) return;
  const geometry = overlayGeometry(canvas, overlay);
  const scale = canvas.width / Math.max(1, 640);
  const fontSize = Math.max(8, overlay.fontSize * scale);
  const radius = Math.max(0, overlay.cornerRadius * scale);

  context.save();
  context.translate(geometry.centerX, geometry.centerY);
  context.rotate((overlay.rotation * Math.PI) / 180);
  context.globalAlpha = clamp(overlay.opacity, 0, 100) / 100;
  roundedRectPath(
    context,
    -geometry.width / 2,
    -geometry.height / 2,
    geometry.width,
    geometry.height,
    radius,
  );
  context.fillStyle = overlay.background || (callout ? '#2563eb' : 'transparent');
  context.fill();
  if (overlay.strokeWidth > 0 || callout) {
    context.strokeStyle = overlay.strokeColor || '#0f172a';
    context.lineWidth = Math.max(callout ? 2 : 0, overlay.strokeWidth * scale);
    context.stroke();
  }
  if (callout) {
    context.beginPath();
    context.moveTo(-geometry.width * 0.12, geometry.height / 2 - 1);
    context.lineTo(0, geometry.height / 2 + Math.min(geometry.height * 0.28, 28 * scale));
    context.lineTo(geometry.width * 0.12, geometry.height / 2 - 1);
    context.closePath();
    context.fillStyle = overlay.background || '#2563eb';
    context.fill();
  }

  context.font = `${clamp(overlay.fontWeight, 100, 900)} ${fontSize}px ${overlay.fontFamily}`;
  context.textBaseline = 'middle';
  context.textAlign = overlay.textAlign;
  const textX =
    overlay.textAlign === 'left'
      ? -geometry.width / 2 + fontSize * 0.5
      : overlay.textAlign === 'right'
        ? geometry.width / 2 - fontSize * 0.5
        : 0;
  const lines = wrapText(
    context,
    overlay.text,
    geometry.width - fontSize,
    Math.max(1, Math.floor(geometry.height / (fontSize * 1.18))),
  );
  const lineHeight = fontSize * 1.18;
  const firstY = -((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, index) => {
    const y = firstY + index * lineHeight;
    if (overlay.strokeWidth > 0) {
      context.strokeStyle = overlay.strokeColor;
      context.lineWidth = overlay.strokeWidth * scale;
      context.strokeText(line, textX, y, geometry.width - fontSize);
    }
    context.fillStyle = overlay.color || '#ffffff';
    context.fillText(line, textX, y, geometry.width - fontSize);
  });
  context.restore();
}

function drawCursor(canvas: HTMLCanvasElement, overlay: StudioOverlay): void {
  const context = canvas.getContext('2d');
  if (!context) return;
  const geometry = overlayGeometry(canvas, overlay);
  const size = Math.max(12, Math.min(geometry.width, geometry.height));
  context.save();
  context.translate(geometry.centerX, geometry.centerY);
  context.rotate((overlay.rotation * Math.PI) / 180);
  context.globalAlpha = clamp(overlay.opacity, 0, 100) / 100;
  context.strokeStyle = overlay.background || '#2563eb';
  context.lineWidth = Math.max(2, size * 0.08);
  context.beginPath();
  context.arc(0, 0, size * 0.42, 0, Math.PI * 2);
  context.stroke();
  context.beginPath();
  context.moveTo(-size * 0.26, -size * 0.42);
  context.lineTo(size * 0.34, size * 0.08);
  context.lineTo(size * 0.05, size * 0.12);
  context.lineTo(size * 0.23, size * 0.43);
  context.lineTo(size * 0.06, size * 0.52);
  context.lineTo(-size * 0.12, size * 0.2);
  context.lineTo(-size * 0.34, size * 0.42);
  context.closePath();
  context.fillStyle = overlay.color || '#ffffff';
  context.fill();
  context.strokeStyle = overlay.strokeColor || '#0f172a';
  context.lineWidth = Math.max(1, size * 0.035);
  context.stroke();
  context.restore();
}

async function drawWatermark(canvas: HTMLCanvasElement, overlay: StudioOverlay): Promise<void> {
  if (!overlay.imageBlob) {
    drawTextualOverlay(canvas, overlay, false);
    return;
  }
  const context = canvas.getContext('2d');
  if (!context) return;
  const geometry = overlayGeometry(canvas, overlay);
  const decoded = await decodeImage(overlay.imageBlob);
  try {
    const scale = Math.min(geometry.width / decoded.width, geometry.height / decoded.height);
    const width = decoded.width * scale;
    const height = decoded.height * scale;
    context.save();
    context.translate(geometry.centerX, geometry.centerY);
    context.rotate((overlay.rotation * Math.PI) / 180);
    context.globalAlpha = clamp(overlay.opacity, 0, 100) / 100;
    context.drawImage(decoded.source, -width / 2, -height / 2, width, height);
    context.restore();
  } finally {
    decoded.close();
  }
}

async function drawOverlays(
  canvas: HTMLCanvasElement,
  project: StudioProject,
  timeMs: number,
): Promise<void> {
  const active = project.overlays.filter((overlay) => isOverlayActive(overlay, timeMs));
  for (const overlay of active) {
    if (overlay.kind === 'blur' || overlay.kind === 'pixelate') drawRegionEffect(canvas, overlay);
    else if (overlay.kind === 'spotlight') drawSpotlight(canvas, overlay);
    else if (overlay.kind === 'text') drawTextualOverlay(canvas, overlay, false);
    else if (overlay.kind === 'callout') drawTextualOverlay(canvas, overlay, true);
    else if (overlay.kind === 'cursor') drawCursor(canvas, overlay);
    else if (overlay.kind === 'watermark') await drawWatermark(canvas, overlay);
  }
}

async function drawStudioFrameAtSize(
  canvas: HTMLCanvasElement,
  project: StudioProject,
  frameIndex: number,
  timeMs: number,
  width: number,
  height: number,
  includeOverlays: boolean,
  backgroundOverride?: string,
): Promise<void> {
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  await drawBaseFrame(canvas, project, frameIndex, backgroundOverride);
  if (includeOverlays) await drawOverlays(canvas, project, timeMs);
}

export async function drawStudioFrame(
  canvas: HTMLCanvasElement,
  project: StudioProject,
  frameIndex: number,
  timeMs: number,
  options: DrawStudioFrameOptions = {},
): Promise<void> {
  const dimensions = outputDimensions(project, Boolean(options.preview));
  await drawStudioFrameAtSize(
    canvas,
    project,
    frameIndex,
    timeMs,
    dimensions.width,
    dimensions.height,
    true,
  );
}

export async function renderStudioFrame(
  project: StudioProject,
  frameIndex: number,
  timeMs: number,
): Promise<Blob> {
  const canvas = createCanvas(project.canvas.width, project.canvas.height);
  await drawStudioFrame(canvas, project, frameIndex, timeMs);
  return canvasToBlob(canvas, 'image/png');
}

async function renderBaseFrame(project: StudioProject, frameIndex: number): Promise<Blob> {
  const canvas = createCanvas(project.canvas.width, project.canvas.height);
  await drawStudioFrameAtSize(
    canvas,
    project,
    frameIndex,
    getFrameStartTime(project.frames, frameIndex),
    project.canvas.width,
    project.canvas.height,
    false,
  );
  return canvasToBlob(canvas, 'image/png');
}

export async function blendFrame(
  left: StudioFrame | Blob,
  right: StudioFrame | Blob,
  ratio: number,
  options: BlendFrameOptions = {},
): Promise<StudioFrame> {
  const leftBlob = left instanceof Blob ? left : left.blob;
  const rightBlob = right instanceof Blob ? right : right.blob;
  const [leftImage, rightImage] = await Promise.all([
    decodeImage(leftBlob),
    decodeImage(rightBlob),
  ]);
  try {
    const width = options.width ?? Math.max(leftImage.width, rightImage.width);
    const height = options.height ?? Math.max(leftImage.height, rightImage.height);
    checkCanvasLimits(width, height);
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('This browser could not blend animation frames.');
    const amount = clamp(ratio, 0, 1);
    context.globalAlpha = 1;
    context.drawImage(leftImage.source, 0, 0, width, height);
    context.globalAlpha = amount;
    context.drawImage(rightImage.source, 0, 0, width, height);
    context.globalAlpha = 1;
    return createStudioFrame(
      await canvasToBlob(canvas, 'image/png'),
      options.name || `Crossfade ${Math.round(amount * 100)}%`,
      options.durationMs ?? 100,
    );
  } finally {
    leftImage.close();
    rightImage.close();
  }
}

export async function createCrossfadeFrames(
  project: StudioProject,
  leftIndex: number,
  rightIndex: number,
  count: number,
  onProgress?: StudioProgressCallback,
): Promise<StudioFrame[]> {
  if (!project.frames[leftIndex] || !project.frames[rightIndex]) {
    throw new Error('Choose two existing frames for the crossfade.');
  }
  const frameCount = Math.max(1, Math.min(24, Math.round(count)));
  report(onProgress, 'rendering', 2, 'Preparing crossfade endpoints…');
  const [leftBlob, rightBlob] = await Promise.all([
    renderBaseFrame(project, leftIndex),
    renderBaseFrame(project, rightIndex),
  ]);
  const durationMs = clampFrameDuration(
    Math.min(project.frames[leftIndex].durationMs, project.frames[rightIndex].durationMs) /
      (frameCount + 1),
  );
  const frames: StudioFrame[] = [];
  for (let index = 0; index < frameCount; index += 1) {
    frames.push(
      await blendFrame(leftBlob, rightBlob, (index + 1) / (frameCount + 1), {
        width: project.canvas.width,
        height: project.canvas.height,
        durationMs,
        name: `Crossfade ${index + 1}`,
      }),
    );
    report(
      onProgress,
      'rendering',
      10 + ((index + 1) / frameCount) * 90,
      `Blending frame ${index + 1} of ${frameCount}…`,
    );
  }
  return frames;
}

async function differencePixels(
  project: StudioProject,
  frameIndex: number,
  timeMs: number,
): Promise<Uint8ClampedArray> {
  const source = createCanvas(project.canvas.width, project.canvas.height);
  await drawStudioFrame(source, project, frameIndex, timeMs);
  const sample = createCanvas(DIFFERENCE_SAMPLE_SIZE, DIFFERENCE_SAMPLE_SIZE);
  const context = sample.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('This browser cannot compare rendered frames.');
  context.drawImage(source, 0, 0, sample.width, sample.height);
  return context.getImageData(0, 0, sample.width, sample.height).data;
}

function conservativelySimilar(
  left: Uint8ClampedArray,
  right: Uint8ClampedArray,
  threshold: number,
): boolean {
  if (left.length !== right.length) return false;
  const normalizedThreshold = clamp(threshold > 1 ? threshold / 100 : threshold, 0, 0.2);
  const pixelThreshold = Math.max(2 / 255, normalizedThreshold * 2);
  const changedLimit = Math.min(0.12, 0.001 + normalizedThreshold * 2);
  let totalDifference = 0;
  let changedPixels = 0;
  const pixelCount = left.length / 4;

  for (let offset = 0; offset < left.length; offset += 4) {
    const red = Math.abs(left[offset] - right[offset]) / 255;
    const green = Math.abs(left[offset + 1] - right[offset + 1]) / 255;
    const blue = Math.abs(left[offset + 2] - right[offset + 2]) / 255;
    const alpha = Math.abs(left[offset + 3] - right[offset + 3]) / 255;
    const difference = Math.max(red, green, blue, alpha);
    totalDifference += (red + green + blue + alpha) / 4;
    if (difference > pixelThreshold) changedPixels += 1;
  }

  return (
    totalDifference / pixelCount <= normalizedThreshold &&
    changedPixels / pixelCount <= changedLimit
  );
}

export async function removeDuplicateFrames(
  project: StudioProject,
  threshold: number,
  onProgress?: StudioProgressCallback,
): Promise<{ frames: StudioFrame[]; removed: number }> {
  if (project.frames.length < 2) return { frames: [...project.frames], removed: 0 };
  const starts = project.frames.map((_, index) => getFrameStartTime(project.frames, index));
  const kept: Array<{ frame: StudioFrame; originalIndex: number; pixels: Uint8ClampedArray }> = [];
  let removed = 0;

  for (let index = 0; index < project.frames.length; index += 1) {
    const frame = project.frames[index];
    const sampleTime = starts[index] + frame.durationMs / 2;
    const pixels = await differencePixels(project, index, sampleTime);
    const previous = kept[kept.length - 1];
    const combinedDuration = previous ? previous.frame.durationMs + frame.durationMs : 0;
    const duplicate =
      previous &&
      combinedDuration <= 60_000 &&
      conservativelySimilar(previous.pixels, pixels, threshold);

    if (duplicate) {
      previous.frame = { ...previous.frame, durationMs: combinedDuration };
      removed += 1;
    } else {
      kept.push({ frame: { ...frame }, originalIndex: index, pixels });
    }
    report(
      onProgress,
      'rendering',
      ((index + 1) / project.frames.length) * 100,
      `Comparing frame ${index + 1} of ${project.frames.length}…`,
    );
  }

  return { frames: kept.map((entry) => entry.frame), removed };
}

function buildRenderSlices(project: StudioProject): RenderSlice[] {
  const slices: RenderSlice[] = [];
  let frameStart = 0;

  project.frames.forEach((frame, frameIndex) => {
    const frameEnd = frameStart + clampFrameDuration(frame.durationMs);
    const candidates = project.overlays.flatMap((overlay) => [overlay.startMs, overlay.endMs]);
    const boundaries = [...new Set([frameStart, frameEnd, ...candidates])]
      .filter((value) => value >= frameStart && value <= frameEnd)
      .sort((left, right) => left - right);
    const safeBoundaries = [frameStart];
    boundaries.slice(1, -1).forEach((boundary) => {
      const previous = safeBoundaries[safeBoundaries.length - 1];
      if (boundary - previous >= 20 && frameEnd - boundary >= 20) safeBoundaries.push(boundary);
    });
    safeBoundaries.push(frameEnd);

    for (let index = 0; index < safeBoundaries.length - 1; index += 1) {
      const startMs = safeBoundaries[index];
      const endMs = safeBoundaries[index + 1];
      slices.push({
        frameIndex,
        startMs,
        durationMs: endMs - startMs,
        sampleTimeMs: startMs + (endMs - startMs) / 2,
      });
    }
    frameStart = frameEnd;
  });

  if (slices.length > MAX_EXPORT_SLICES) {
    throw new Error(
      `This export expands to ${slices.length} timed frames. Keep it below ${MAX_EXPORT_SLICES}.`,
    );
  }
  return slices;
}

function normalizeHexBackground(value: string): string {
  if (/^#[0-9a-f]{6}$/i.test(value)) return value;
  if (/^#[0-9a-f]{3}$/i.test(value)) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
  }
  return '#ffffff';
}

function exportCommand(
  format: StudioExportFormat,
  concatName: string,
  outputName: string,
  options: StudioExportOptions,
): string[] {
  const quality = Math.max(1, Math.min(100, Math.round(options.quality)));
  const loop = Math.max(0, Math.min(65_535, Math.round(options.loop)));
  const input = ['-y', '-f', 'concat', '-safe', '0', '-i', concatName];

  if (format === 'gif') {
    const colors = Math.max(32, Math.min(256, Math.round(32 + (quality / 100) * 224)));
    return [
      ...input,
      '-filter_complex',
      `[0:v]split[frames][paletteInput];[paletteInput]palettegen=max_colors=${colors}:stats_mode=diff:reserve_transparent=1[palette];[frames][palette]paletteuse=dither=sierra2_4a:diff_mode=rectangle:alpha_threshold=128[out]`,
      '-map',
      '[out]',
      '-vsync',
      'vfr',
      '-loop',
      String(loop),
      '-gifflags',
      '+transdiff',
      outputName,
    ];
  }

  if (format === 'webp') {
    return [
      ...input,
      '-an',
      '-c:v',
      'libwebp',
      '-quality',
      String(quality),
      '-compression_level',
      '4',
      '-loop',
      String(loop),
      '-vsync',
      'vfr',
      outputName,
    ];
  }

  if (format === 'apng') {
    return [
      ...input,
      '-an',
      '-c:v',
      'apng',
      '-plays',
      String(loop),
      '-vsync',
      'vfr',
      '-f',
      'apng',
      outputName,
    ];
  }

  const crf = Math.round(31 - (quality / 100) * 13);
  return [
    ...input,
    '-an',
    '-c:v',
    'libx264',
    '-preset',
    'veryfast',
    '-crf',
    String(crf),
    '-pix_fmt',
    'yuv420p',
    '-vsync',
    'vfr',
    '-movflags',
    '+faststart',
    outputName,
  ];
}

function exportDescriptor(format: StudioExportFormat): {
  extension: string;
  mimeType: string;
  label: string;
} {
  if (format === 'gif') return { extension: 'gif', mimeType: 'image/gif', label: 'GIF' };
  if (format === 'webp')
    return { extension: 'webp', mimeType: 'image/webp', label: 'animated WebP' };
  if (format === 'apng') return { extension: 'png', mimeType: 'image/png', label: 'APNG' };
  return { extension: 'mp4', mimeType: 'video/mp4', label: 'MP4' };
}

export async function exportStudioProject(
  project: StudioProject,
  options: StudioExportOptions,
  onProgress?: StudioProgressCallback,
): Promise<StudioExportResult> {
  if (project.frames.length === 0) throw new Error('Add at least one frame before exporting.');
  checkCanvasLimits(project.canvas.width, project.canvas.height);
  const slices = buildRenderSlices(project);
  const evenWidth =
    options.format === 'mp4'
      ? Math.max(2, Math.ceil(project.canvas.width / 2) * 2)
      : project.canvas.width;
  const evenHeight =
    options.format === 'mp4'
      ? Math.max(2, Math.ceil(project.canvas.height / 2) * 2)
      : project.canvas.height;
  if (evenWidth * evenHeight * slices.length > MAX_EXPORT_PIXELS) {
    throw new Error(
      'This export is too large for a browser tab. Reduce its dimensions or frame count.',
    );
  }

  return runStudioJob(async () => {
    report(onProgress, 'rendering', 1, 'Loading the private browser engine…');
    const { ffmpeg } = await getBrowserEngine();
    const runId = createStudioId('studio-export').replace(/[^a-z0-9-]/gi, '');
    const frameNames: string[] = [];
    const concatName = `${runId}-frames.txt`;
    const descriptor = exportDescriptor(options.format);
    const outputName = `${runId}.${descriptor.extension}`;
    const progressListener = ({ progress }: { progress: number }) => {
      if (!Number.isFinite(progress)) return;
      report(
        onProgress,
        'rendering',
        68 + Math.max(0, Math.min(1, progress)) * 26,
        `Encoding ${descriptor.label}…`,
      );
    };

    try {
      for (let index = 0; index < slices.length; index += 1) {
        const slice = slices[index];
        const canvas = createCanvas(evenWidth, evenHeight);
        const backgroundOverride =
          options.format === 'mp4' ? normalizeHexBackground(project.canvas.background) : undefined;
        await drawStudioFrameAtSize(
          canvas,
          project,
          slice.frameIndex,
          slice.sampleTimeMs,
          evenWidth,
          evenHeight,
          true,
          backgroundOverride,
        );
        const name = `${runId}-frame-${String(index + 1).padStart(5, '0')}.png`;
        const blob = await canvasToBlob(canvas, 'image/png');
        await ffmpeg.writeFile(name, new Uint8Array(await blob.arrayBuffer()));
        frameNames.push(name);
        report(
          onProgress,
          'rendering',
          5 + ((index + 1) / slices.length) * 58,
          `Rendering frame ${index + 1} of ${slices.length}…`,
        );
      }

      const concatLines: string[] = [];
      slices.forEach((slice, index) => {
        concatLines.push(`file '${frameNames[index]}'`);
        concatLines.push(`duration ${(slice.durationMs / 1000).toFixed(3)}`);
      });
      concatLines.push(`file '${frameNames[frameNames.length - 1]}'`);
      await ffmpeg.writeFile(concatName, new TextEncoder().encode(`${concatLines.join('\n')}\n`));

      ffmpeg.on('progress', progressListener);
      let exitCode: number;
      try {
        exitCode = await ffmpeg.exec(
          exportCommand(options.format, concatName, outputName, options),
        );
      } catch (error) {
        const detail = error instanceof Error ? error.message : 'unknown encoder error';
        throw new Error(`The browser engine cannot encode ${descriptor.label}: ${detail}`);
      }
      if (exitCode !== 0) {
        throw new Error(
          options.format === 'apng'
            ? 'APNG is not available in this browser engine. Choose GIF or WebP instead.'
            : `The browser engine does not provide a working ${descriptor.label} encoder.`,
        );
      }

      report(onProgress, 'rendering', 96, `Checking the finished ${descriptor.label}…`);
      let bytes: Uint8Array;
      try {
        bytes = copyFileData(await ffmpeg.readFile(outputName));
      } catch {
        throw new Error(
          options.format === 'apng'
            ? 'APNG encoding is not supported by this browser engine.'
            : `${descriptor.label} encoding finished without a readable output file.`,
        );
      }
      if (bytes.byteLength === 0) throw new Error(`The ${descriptor.label} output is empty.`);
      const blob = new Blob([bytes], { type: descriptor.mimeType });
      report(onProgress, 'ready', 100, `${descriptor.label} export complete.`);
      return {
        blob,
        url: URL.createObjectURL(blob),
        extension: descriptor.extension,
        mimeType: descriptor.mimeType,
        width: evenWidth,
        height: evenHeight,
        durationMs: getProjectDuration(project),
        frameCount: slices.length,
      };
    } finally {
      ffmpeg.off('progress', progressListener);
      await Promise.all([
        ...frameNames.map((name) => removeVirtualFile(ffmpeg, name)),
        removeVirtualFile(ffmpeg, concatName),
        removeVirtualFile(ffmpeg, outputName),
      ]);
    }
  });
}

async function capabilityTestProject(): Promise<StudioProject> {
  const canvas = createCanvas(4, 4);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is unavailable.');
  context.fillStyle = '#2563eb';
  context.fillRect(0, 0, 4, 4);
  const blob = await canvasToBlob(canvas, 'image/png');
  return createStudioProject({
    sourceKind: 'images',
    sourceName: 'capability-test.png',
    width: 4,
    height: 4,
    frames: [
      createStudioFrame(blob, 'test-1.png', 100),
      createStudioFrame(blob, 'test-2.png', 100),
    ],
  });
}

/** Performs real tiny encodes; callers should only show formats reported as supported. */
export function probeStudioExportCapabilities(
  onProgress?: StudioProgressCallback,
): Promise<StudioExportCapabilities> {
  if (capabilityPromise) return capabilityPromise;
  capabilityPromise = (async () => {
    const project = await capabilityTestProject();
    const formats: StudioExportFormat[] = ['gif', 'webp', 'apng', 'mp4'];
    const capabilities = {} as StudioExportCapabilities;
    for (let index = 0; index < formats.length; index += 1) {
      const format = formats[index];
      report(
        onProgress,
        'rendering',
        (index / formats.length) * 100,
        `Checking ${format.toUpperCase()} support…`,
      );
      try {
        const result = await exportStudioProject(project, { format, quality: 70, loop: 0 });
        URL.revokeObjectURL(result.url);
        capabilities[format] = { supported: result.blob.size > 0 };
      } catch (error) {
        capabilities[format] = {
          supported: false,
          reason:
            error instanceof Error ? error.message : `${format.toUpperCase()} is unavailable.`,
        };
      }
    }
    report(onProgress, 'ready', 100, 'Export capability check complete.');
    return capabilities;
  })().catch((error) => {
    capabilityPromise = null;
    throw error;
  });
  return capabilityPromise;
}
