import type {
  StudioFrame,
  StudioFrameFilter,
  StudioFrameTransform,
  StudioOverlay,
  StudioOverlayKind,
  StudioProject,
  StudioSourceKind,
} from '@/components/gif-studio/types';

export function createStudioId(prefix: string): string {
  const suffix =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${suffix}`;
}

export function defaultFrameTransform(): StudioFrameTransform {
  return {
    cropX: 0,
    cropY: 0,
    cropWidth: 100,
    cropHeight: 100,
    rotation: 0,
    flipHorizontal: false,
    flipVertical: false,
    zoom: 1,
    panX: 0,
    panY: 0,
  };
}

export function defaultFrameFilter(): StudioFrameFilter {
  return {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: 0,
    sepia: 0,
  };
}

export function createStudioFrame(blob: Blob, name: string, durationMs = 100): StudioFrame {
  return {
    id: createStudioId('frame'),
    name,
    blob,
    durationMs: clampFrameDuration(durationMs),
    transform: defaultFrameTransform(),
    filter: defaultFrameFilter(),
  };
}

export function createStudioProject({
  title,
  sourceName,
  sourceKind,
  width,
  height,
  frames,
}: {
  title?: string;
  sourceName: string;
  sourceKind: StudioSourceKind;
  width: number;
  height: number;
  frames: StudioFrame[];
}): StudioProject {
  const now = new Date().toISOString();
  return {
    schemaVersion: 1,
    id: createStudioId('project'),
    title: title || sourceName.replace(/\.[^.]+$/, '') || 'Untitled GIF',
    sourceKind,
    sourceName,
    createdAt: now,
    updatedAt: now,
    canvas: {
      width: Math.max(1, Math.round(width)),
      height: Math.max(1, Math.round(height)),
      background: 'transparent',
      fit: 'contain',
    },
    frames,
    overlays: [],
  };
}

export function touchProject(project: StudioProject): StudioProject {
  return { ...project, updatedAt: new Date().toISOString() };
}

export function clampFrameDuration(value: number): number {
  return Math.max(20, Math.min(60_000, Math.round(Number.isFinite(value) ? value : 100)));
}

export function getProjectDuration(project: Pick<StudioProject, 'frames'>): number {
  return project.frames.reduce((total, frame) => total + clampFrameDuration(frame.durationMs), 0);
}

export function formatDuration(durationMs: number): string {
  if (!Number.isFinite(durationMs) || durationMs <= 0) return '0.0s';
  if (durationMs < 1000) return `${Math.round(durationMs)}ms`;
  const totalSeconds = durationMs / 1000;
  if (totalSeconds < 60) return `${totalSeconds.toFixed(totalSeconds < 10 ? 1 : 0)}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function getFrameStartTime(frames: StudioFrame[], index: number): number {
  return frames.slice(0, Math.max(0, index)).reduce((total, frame) => total + frame.durationMs, 0);
}

export function getFrameAtTime(
  frames: StudioFrame[],
  timeMs: number,
): {
  frame: StudioFrame;
  index: number;
  startMs: number;
} | null {
  if (frames.length === 0) return null;
  const duration = frames.reduce((total, frame) => total + frame.durationMs, 0);
  const normalized = duration > 0 ? ((timeMs % duration) + duration) % duration : 0;
  let cursor = 0;

  for (let index = 0; index < frames.length; index += 1) {
    const frame = frames[index];
    if (normalized < cursor + frame.durationMs || index === frames.length - 1) {
      return { frame, index, startMs: cursor };
    }
    cursor += frame.durationMs;
  }

  return null;
}

export function duplicateFrames(project: StudioProject, selectedIds: Set<string>): StudioProject {
  if (selectedIds.size === 0) return project;
  const frames = project.frames.flatMap((frame) => {
    if (!selectedIds.has(frame.id)) return [frame];
    return [
      frame,
      {
        ...frame,
        id: createStudioId('frame'),
        name: `${frame.name} copy`,
      },
    ];
  });
  return touchProject({ ...project, frames });
}

export function deleteFrames(project: StudioProject, selectedIds: Set<string>): StudioProject {
  if (selectedIds.size === 0 || selectedIds.size >= project.frames.length) return project;
  return touchProject({
    ...project,
    frames: project.frames.filter((frame) => !selectedIds.has(frame.id)),
  });
}

export function reorderFrames(
  project: StudioProject,
  activeId: string,
  overId: string,
): StudioProject {
  const from = project.frames.findIndex((frame) => frame.id === activeId);
  const to = project.frames.findIndex((frame) => frame.id === overId);
  if (from < 0 || to < 0 || from === to) return project;
  const frames = [...project.frames];
  const [moved] = frames.splice(from, 1);
  frames.splice(to, 0, moved);
  return touchProject({ ...project, frames });
}

export function reverseFrames(project: StudioProject): StudioProject {
  return touchProject({ ...project, frames: [...project.frames].reverse() });
}

export function createPingPong(project: StudioProject): StudioProject {
  if (project.frames.length < 3) return project;
  const returnFrames = project.frames
    .slice(1, -1)
    .reverse()
    .map((frame) => ({ ...frame, id: createStudioId('frame'), name: `${frame.name} return` }));
  return touchProject({ ...project, frames: [...project.frames, ...returnFrames] });
}

export function setSelectedFrameDuration(
  project: StudioProject,
  selectedIds: Set<string>,
  durationMs: number,
): StudioProject {
  if (selectedIds.size === 0) return project;
  const duration = clampFrameDuration(durationMs);
  return touchProject({
    ...project,
    frames: project.frames.map((frame) =>
      selectedIds.has(frame.id) ? { ...frame, durationMs: duration } : frame,
    ),
  });
}

export function updateSelectedFrames(
  project: StudioProject,
  selectedIds: Set<string>,
  updater: (frame: StudioFrame) => StudioFrame,
): StudioProject {
  if (selectedIds.size === 0) return project;
  return touchProject({
    ...project,
    frames: project.frames.map((frame) => (selectedIds.has(frame.id) ? updater(frame) : frame)),
  });
}

export function createOverlay(
  kind: StudioOverlayKind,
  project: Pick<StudioProject, 'frames'>,
): StudioOverlay {
  const duration = Math.max(100, getProjectDuration(project));
  const shared = {
    id: createStudioId('overlay'),
    kind,
    name: kind === 'text' ? 'Caption' : kind === 'watermark' ? 'Logo' : 'Annotation',
    startMs: 0,
    endMs: duration,
    x: 50,
    y: 50,
    width: kind === 'text' ? 58 : 24,
    height: kind === 'text' ? 18 : 24,
    rotation: 0,
    opacity: kind === 'spotlight' ? 72 : 100,
    color: '#ffffff',
    background: kind === 'text' ? '#0f172acc' : '#2563eb',
    text: kind === 'text' ? 'Type your caption' : kind === 'callout' ? 'Look here' : '',
    fontSize: 42,
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    fontWeight: 700,
    textAlign: 'center' as const,
    strokeColor: '#0f172a',
    strokeWidth: 0,
    cornerRadius: 16,
    strength: kind === 'blur' ? 18 : kind === 'pixelate' ? 12 : 8,
  };
  return shared;
}

export function isOverlayActive(overlay: StudioOverlay, timeMs: number): boolean {
  return timeMs >= overlay.startMs && timeMs <= overlay.endMs;
}

export function projectFileName(project: StudioProject, extension: string): string {
  const safe = project.title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64);
  return `${safe || 'gif-studio-project'}.${extension}`;
}
