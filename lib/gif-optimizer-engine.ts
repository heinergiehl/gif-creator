import type { FFmpeg } from '@ffmpeg/ffmpeg';
import {
  OPTIMIZATION_LADDER_LENGTH,
  buildOptimizationProfile,
  type GifMetadata,
  type OptimizationOutcome,
  type OptimizationProfile,
  type OptimizationProgress,
  type OptimizationVariant,
  type OptimizerSettings,
} from '@/lib/gif-optimizer';

interface OptimizeGifOptions {
  file: File;
  fileUrl: string;
  metadata: GifMetadata;
  targetBytes: number;
  settings: OptimizerSettings;
  onProgress: (progress: OptimizationProgress) => void;
}

interface EncodedCandidate {
  profile: OptimizationProfile;
  blob: Blob;
  size: number;
}

function getOutputDescription(profile: OptimizationProfile, source: GifMetadata): string {
  const changes: string[] = [];

  if (profile.width < source.width) {
    changes.push(profile.width + ' px wide');
  } else {
    changes.push('original width');
  }

  changes.push('up to ' + profile.fps + ' fps');
  changes.push(profile.colors + ' colors');
  return changes.join(' · ');
}

function copyFileData(data: unknown): Uint8Array {
  if (data instanceof Uint8Array) {
    return new Uint8Array(data);
  }

  if (typeof data === 'string') {
    return new TextEncoder().encode(data);
  }

  throw new Error('The optimizer returned an unreadable GIF.');
}

async function removeVirtualFile(ffmpeg: FFmpeg, path: string): Promise<void> {
  try {
    await ffmpeg.deleteFile(path);
  } catch {
    // The file may not exist after a failed encode.
  }
}

async function encodeCandidate(
  ffmpeg: FFmpeg,
  inputName: string,
  runId: string,
  profile: OptimizationProfile,
  metadata: GifMetadata,
  settings: OptimizerSettings,
): Promise<EncodedCandidate> {
  const outputName = 'optimizer-output-' + runId + '-' + profile.ladderIndex + '.gif';
  const dither =
    profile.dither === 'bayer'
      ? 'bayer:bayer_scale=' + (profile.ditherStrength ?? 4)
      : profile.dither;
  const reserveTransparency = settings.preserveTransparency ? '1' : '0';
  const alphaThreshold = settings.preserveTransparency ? '128' : '255';
  const filter =
    '[0:v]fps=' +
    profile.fps +
    ',scale=' +
    profile.width +
    ':-2:flags=lanczos,split[frames][paletteInput];' +
    '[paletteInput]palettegen=max_colors=' +
    profile.colors +
    ':stats_mode=diff:reserve_transparent=' +
    reserveTransparency +
    '[palette];' +
    '[frames][palette]paletteuse=dither=' +
    dither +
    ':diff_mode=rectangle:alpha_threshold=' +
    alphaThreshold;
  const loopValue = metadata.loopCount === null ? '0' : String(metadata.loopCount);

  try {
    const exitCode = await ffmpeg.exec([
      '-i',
      inputName,
      '-filter_complex',
      filter,
      '-loop',
      loopValue,
      '-gifflags',
      '+transdiff',
      outputName,
    ]);

    if (exitCode !== 0) {
      throw new Error('GIF encoding stopped before the file was ready.');
    }

    const data = copyFileData(await ffmpeg.readFile(outputName));
    const blob = new Blob([data], { type: 'image/gif' });
    return { profile, blob, size: blob.size };
  } finally {
    await removeVirtualFile(ffmpeg, outputName);
  }
}

function createVariant(
  candidate: EncodedCandidate,
  label: string,
  description: string,
  metadata: GifMetadata,
  targetBytes: number,
): OptimizationVariant {
  return {
    id: candidate.profile.id,
    label,
    description,
    blob: candidate.blob,
    url: URL.createObjectURL(candidate.blob),
    size: candidate.size,
    width: candidate.profile.width,
    fps: candidate.profile.fps,
    colors: candidate.profile.colors,
    underTarget: candidate.size <= targetBytes,
    original: false,
  };
}

function chooseCandidates(
  cache: Map<number, EncodedCandidate>,
  bestIndex: number | null,
): EncodedCandidate[] {
  const candidates = [...cache.values()].sort(
    (left, right) => left.profile.ladderIndex - right.profile.ladderIndex,
  );
  if (candidates.length <= 3) return candidates;

  const indexes = new Set<number>();
  if (bestIndex !== null) {
    indexes.add(bestIndex);
    indexes.add(Math.min(OPTIMIZATION_LADDER_LENGTH - 1, bestIndex + 2));
  }

  const smallest = [...candidates].sort((left, right) => left.size - right.size)[0];
  indexes.add(smallest.profile.ladderIndex);

  if (indexes.size < 3) {
    indexes.add(candidates[Math.floor(candidates.length / 2)].profile.ladderIndex);
  }

  return candidates.filter((candidate) => indexes.has(candidate.profile.ladderIndex)).slice(0, 3);
}

export async function optimizeGifToTarget({
  file,
  fileUrl,
  metadata,
  targetBytes,
  settings,
  onProgress,
}: OptimizeGifOptions): Promise<OptimizationOutcome> {
  onProgress({ stage: 'loading', value: 4, message: 'Loading the private browser engine…' });

  const [{ ffmpegStore }, { fetchFile }] = await Promise.all([
    import('@/store/FFmpegStore'),
    import('@ffmpeg/util'),
  ]);
  const ffmpeg = await ffmpegStore.ensureLoaded();
  const runId = Date.now().toString(36);
  const inputName = 'optimizer-input-' + runId + '.gif';
  const cache = new Map<number, EncodedCandidate>();
  let attempts = 0;

  const runProfile = async (index: number): Promise<EncodedCandidate> => {
    const cached = cache.get(index);
    if (cached) return cached;

    attempts += 1;
    onProgress({
      stage: 'encoding',
      value: Math.min(88, 12 + attempts * 13),
      message: 'Testing quality level ' + attempts + '…',
    });
    const profile = buildOptimizationProfile(index, metadata, settings);
    const candidate = await encodeCandidate(ffmpeg, inputName, runId, profile, metadata, settings);
    cache.set(index, candidate);
    return candidate;
  };

  try {
    await ffmpeg.writeFile(inputName, await fetchFile(file));

    if (file.size <= targetBytes) {
      await runProfile(3);
      await runProfile(6);
    } else {
      let low = 0;
      let high = OPTIMIZATION_LADDER_LENGTH - 1;
      let bestIndex: number | null = null;

      while (low <= high && attempts < 5) {
        const middle = Math.floor((low + high) / 2);
        const candidate = await runProfile(middle);

        if (candidate.size <= targetBytes) {
          bestIndex = middle;
          high = middle - 1;
        } else {
          low = middle + 1;
        }
      }

      if (bestIndex !== null) {
        await runProfile(bestIndex);
        const balancedIndex = Math.min(OPTIMIZATION_LADDER_LENGTH - 1, bestIndex + 2);
        await runProfile(balancedIndex);
        await runProfile(OPTIMIZATION_LADDER_LENGTH - 1);
      } else {
        await runProfile(OPTIMIZATION_LADDER_LENGTH - 1);
      }
    }

    onProgress({ stage: 'finishing', value: 94, message: 'Preparing the best variants…' });

    const successful = [...cache.values()]
      .filter((candidate) => candidate.size <= targetBytes)
      .sort((left, right) => right.size - left.size);
    const bestIndex = successful[0]?.profile.ladderIndex ?? null;
    const chosen = chooseCandidates(cache, bestIndex).sort((left, right) => right.size - left.size);
    const variants: OptimizationVariant[] = [];

    if (file.size <= targetBytes) {
      variants.push({
        id: 'original',
        label: 'Original',
        description: 'Already below your target · no re-encoding',
        blob: file,
        url: fileUrl,
        size: file.size,
        width: metadata.width,
        fps: metadata.framesPerSecond,
        colors: metadata.globalColorCount || 256,
        underTarget: true,
        original: true,
      });
    }

    chosen.forEach((candidate, index) => {
      const isLast = index === chosen.length - 1;
      const label =
        index === 0 && candidate.size <= targetBytes
          ? 'Best quality'
          : isLast
            ? 'Smallest file'
            : 'Balanced';
      const prefix = candidate.size <= targetBytes ? 'Meets target' : 'Closest generated result';

      variants.push(
        createVariant(
          candidate,
          label,
          prefix + ' · ' + getOutputDescription(candidate.profile, metadata),
          metadata,
          targetBytes,
        ),
      );
    });

    const uniqueVariants = variants
      .filter(
        (variant, index, all) =>
          all.findIndex((entry) => entry.size === variant.size && entry.width === variant.width) ===
          index,
      )
      .slice(0, 3);
    const targetReached = uniqueVariants.some((variant) => variant.underTarget);
    const selected =
      uniqueVariants.find((variant) => variant.underTarget) ??
      [...uniqueVariants].sort((left, right) => left.size - right.size)[0];

    if (!selected) {
      throw new Error('No readable result could be produced from this GIF.');
    }

    onProgress({ stage: 'finishing', value: 100, message: 'Optimization complete.' });

    return {
      variants: uniqueVariants,
      selectedId: selected.id,
      targetReached,
      attempts,
    };
  } finally {
    await removeVirtualFile(ffmpeg, inputName);
  }
}
