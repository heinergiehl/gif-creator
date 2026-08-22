import type {
  StoredStudioProjectSummary,
  StudioCanvasSettings,
  StudioFrame,
  StudioFrameFilter,
  StudioFrameTransform,
  StudioOverlay,
  StudioProject,
  StudioSourceKind,
} from '@/components/gif-studio/types';
import { getProjectDuration } from '@/components/gif-studio/model';

export const GIF_STUDIO_PACKAGE_FORMAT = 'gifstudio-project' as const;
export const GIF_STUDIO_PACKAGE_SCHEMA_VERSION = 1 as const;

export const GIF_STUDIO_LIMITS = Object.freeze({
  maxFrames: 1_200,
  maxOverlays: 300,
  maxCanvasDimension: 8_192,
  maxFrameDurationMs: 60_000,
  maxProjectDurationMs: 24 * 60 * 60 * 1_000,
  maxSingleBlobBytes: 24 * 1024 * 1024,
  maxStoredBlobBytes: 256 * 1024 * 1024,
  maxPackageBinaryBytes: 64 * 1024 * 1024,
  maxPackageBytes: 96 * 1024 * 1024,
  maxTextLength: 10_000,
});

const DATABASE_NAME = 'gif_creator_studio';
const AUTOSAVE_KEY = 'latest';
const STORAGE_VERSION = 1 as const;
const DEFAULT_AUTOSAVE_DEBOUNCE_MS = 600;

const SOURCE_KINDS = new Set<StudioSourceKind>(['gif', 'video', 'images', 'recording', 'project']);
const CANVAS_FITS = new Set<StudioCanvasSettings['fit']>(['contain', 'cover', 'stretch']);
const OVERLAY_KINDS = new Set<StudioOverlay['kind']>([
  'text',
  'blur',
  'pixelate',
  'spotlight',
  'callout',
  'cursor',
  'watermark',
]);
const TEXT_ALIGNS = new Set<StudioOverlay['textAlign']>(['left', 'center', 'right']);
const SAFE_IMAGE_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
const SAFE_PACKAGE_MIME_TYPES = new Set([
  '',
  'application/json',
  'text/plain',
  'application/vnd.gifstudio+json',
]);
const FORBIDDEN_JSON_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

type PersistenceErrorCode =
  | 'unsupported'
  | 'invalid-project'
  | 'invalid-package'
  | 'limit-exceeded'
  | 'unsafe-content'
  | 'storage-failed';

export class GifStudioPersistenceError extends Error {
  readonly code: PersistenceErrorCode;

  constructor(code: PersistenceErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'GifStudioPersistenceError';
    this.code = code;
  }
}

interface LocalForageInstance {
  setDriver(driver: string | string[]): Promise<void>;
  getItem<T>(key: string): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<T>;
  removeItem(key: string): Promise<void>;
  iterate<T, U>(iterator: (value: T, key: string, iterationNumber: number) => U): Promise<U>;
}

interface LocalForageFactory {
  INDEXEDDB: string;
  createInstance(options: {
    name: string;
    storeName: string;
    description?: string;
  }): LocalForageInstance;
}

interface StorageInstances {
  autosave: LocalForageInstance;
  projects: LocalForageInstance;
  summaries: LocalForageInstance;
}

interface StoredProjectRecord {
  storageVersion: typeof STORAGE_VERSION;
  savedAt: string;
  project: StudioProject;
}

interface SerializedStudioFrame extends Omit<StudioFrame, 'blob'> {
  blobDataUrl: string;
}

interface SerializedStudioOverlay extends Omit<StudioOverlay, 'imageBlob'> {
  imageDataUrl?: string;
}

interface SerializedStudioProject extends Omit<StudioProject, 'frames' | 'overlays'> {
  frames: SerializedStudioFrame[];
  overlays: SerializedStudioOverlay[];
}

interface StudioProjectPackageV1 {
  format: typeof GIF_STUDIO_PACKAGE_FORMAT;
  schemaVersion: typeof GIF_STUDIO_PACKAGE_SCHEMA_VERSION;
  exportedAt: string;
  project: SerializedStudioProject;
}

export interface SaveAutosaveOptions {
  /** Coalesces rapid editor updates. Use 0 when an immediate durability boundary is required. */
  debounceMs?: number;
}

let storagePromise: Promise<StorageInstances> | null = null;

function persistenceError(
  code: PersistenceErrorCode,
  message: string,
  cause?: unknown,
): GifStudioPersistenceError {
  return cause === undefined
    ? new GifStudioPersistenceError(code, message)
    : new GifStudioPersistenceError(code, message, { cause });
}

async function getStorage(): Promise<StorageInstances> {
  if (typeof indexedDB === 'undefined') {
    throw persistenceError(
      'unsupported',
      'Local projects require a browser with IndexedDB enabled.',
    );
  }

  if (!storagePromise) {
    storagePromise = (async () => {
      try {
        const imported = await import('localforage');
        const localforage = (imported.default ?? imported) as unknown as LocalForageFactory;
        const autosave = localforage.createInstance({
          name: DATABASE_NAME,
          storeName: 'autosave_v1',
          description: 'Automatic GIF Studio recovery document',
        });
        const projects = localforage.createInstance({
          name: DATABASE_NAME,
          storeName: 'projects_v1',
          description: 'Named local GIF Studio projects',
        });
        const summaries = localforage.createInstance({
          name: DATABASE_NAME,
          storeName: 'project_summaries_v1',
          description: 'Lightweight GIF Studio project index',
        });

        await Promise.all([
          autosave.setDriver(localforage.INDEXEDDB),
          projects.setDriver(localforage.INDEXEDDB),
          summaries.setDriver(localforage.INDEXEDDB),
        ]);

        return { autosave, projects, summaries };
      } catch (error) {
        storagePromise = null;
        throw persistenceError(
          'storage-failed',
          'The local project database could not be opened.',
          error,
        );
      }
    })();
  }

  return storagePromise;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertRecord(value: unknown, label: string): asserts value is Record<string, unknown> {
  if (!isRecord(value)) {
    throw persistenceError('invalid-project', `${label} must be an object.`);
  }
}

function assertExactKeys(
  value: Record<string, unknown>,
  required: readonly string[],
  optional: readonly string[] = [],
  label = 'Value',
  errorCode: PersistenceErrorCode = 'invalid-project',
): void {
  const allowed = new Set([...required, ...optional]);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key) || FORBIDDEN_JSON_KEYS.has(key)) {
      throw persistenceError(errorCode, `${label} contains an unsupported field: ${key}.`);
    }
  }
  for (const key of required) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) {
      throw persistenceError(errorCode, `${label} is missing the required field: ${key}.`);
    }
  }
}

function assertFiniteNumber(
  value: unknown,
  label: string,
  minimum: number,
  maximum: number,
  integer = false,
): number {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < minimum ||
    value > maximum ||
    (integer && !Number.isInteger(value))
  ) {
    const qualifier = integer ? 'whole number' : 'number';
    throw persistenceError(
      'invalid-project',
      `${label} must be a ${qualifier} between ${minimum} and ${maximum}.`,
    );
  }
  return value;
}

function assertDisplayString(
  value: unknown,
  label: string,
  maximumLength: number,
  { allowEmpty = false }: { allowEmpty?: boolean } = {},
): string {
  if (typeof value !== 'string' || (!allowEmpty && value.trim().length === 0)) {
    throw persistenceError('invalid-project', `${label} must be text.`);
  }
  if (value.length > maximumLength) {
    throw persistenceError(
      'limit-exceeded',
      `${label} cannot be longer than ${maximumLength.toLocaleString()} characters.`,
    );
  }
  if (/\u0000|<\s*\/?\s*(?:script|iframe|object|embed|link|style|svg)\b/i.test(value)) {
    throw persistenceError('unsafe-content', `${label} contains unsafe markup.`);
  }
  return value;
}

function assertIdentifier(value: unknown, label: string): string {
  const identifier = assertDisplayString(value, label, 160);
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(identifier)) {
    throw persistenceError('invalid-project', `${label} contains unsupported characters.`);
  }
  return identifier;
}

function assertIsoDate(value: unknown, label: string): string {
  const dateText = assertDisplayString(value, label, 40);
  const timestamp = Date.parse(dateText);
  if (!Number.isFinite(timestamp)) {
    throw persistenceError('invalid-project', `${label} must be a valid ISO date.`);
  }
  return dateText;
}

function assertSafeColor(value: unknown, label: string): string {
  const color = assertDisplayString(value, label, 32);
  if (
    color !== 'transparent' &&
    !/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(color)
  ) {
    throw persistenceError(
      'unsafe-content',
      `${label} must be a hexadecimal color or transparent.`,
    );
  }
  return color;
}

function assertSafeFontFamily(value: unknown): string {
  const fontFamily = assertDisplayString(value, 'Overlay font family', 180);
  if (!/^[\p{L}\p{N}\s,'"._-]+$/u.test(fontFamily)) {
    throw persistenceError('unsafe-content', 'Overlay font family contains unsafe content.');
  }
  return fontFamily;
}

function isBlob(value: unknown): value is Blob {
  return typeof Blob !== 'undefined' && value instanceof Blob;
}

function assertImageBlob(value: unknown, label: string): Blob {
  if (!isBlob(value)) {
    throw persistenceError('invalid-project', `${label} must be stored as a Blob.`);
  }
  if (value.size < 1 || value.size > GIF_STUDIO_LIMITS.maxSingleBlobBytes) {
    throw persistenceError(
      'limit-exceeded',
      `${label} must be between 1 byte and ${GIF_STUDIO_LIMITS.maxSingleBlobBytes} bytes.`,
    );
  }
  if (!SAFE_IMAGE_MIME_TYPES.has(value.type.toLowerCase())) {
    throw persistenceError('unsafe-content', `${label} uses an unsupported image MIME type.`);
  }
  return value;
}

function assertNoTransientUrls(value: unknown, path = 'project'): void {
  if (isBlob(value)) return;
  if (typeof value === 'string') {
    if (/\bblob:/i.test(value) || /\bdata:/i.test(value)) {
      throw persistenceError(
        'unsafe-content',
        `${path} contains a transient object URL or inline data instead of a Blob.`,
      );
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoTransientUrls(item, `${path}[${index}]`));
    return;
  }
  if (isRecord(value)) {
    Object.entries(value).forEach(([key, item]) => assertNoTransientUrls(item, `${path}.${key}`));
  }
}

function validateCanvas(value: unknown): StudioCanvasSettings {
  assertRecord(value, 'Canvas settings');
  assertExactKeys(value, ['width', 'height', 'background', 'fit'], [], 'Canvas settings');
  const fit = value.fit;
  if (typeof fit !== 'string' || !CANVAS_FITS.has(fit as StudioCanvasSettings['fit'])) {
    throw persistenceError('invalid-project', 'Canvas fit mode is unsupported.');
  }
  return {
    width: assertFiniteNumber(
      value.width,
      'Canvas width',
      1,
      GIF_STUDIO_LIMITS.maxCanvasDimension,
      true,
    ),
    height: assertFiniteNumber(
      value.height,
      'Canvas height',
      1,
      GIF_STUDIO_LIMITS.maxCanvasDimension,
      true,
    ),
    background: assertSafeColor(value.background, 'Canvas background'),
    fit: fit as StudioCanvasSettings['fit'],
  };
}

function validateFrameTransform(value: unknown, label: string): StudioFrameTransform {
  assertRecord(value, `${label} transform`);
  assertExactKeys(
    value,
    [
      'cropX',
      'cropY',
      'cropWidth',
      'cropHeight',
      'rotation',
      'flipHorizontal',
      'flipVertical',
      'zoom',
      'panX',
      'panY',
    ],
    [],
    `${label} transform`,
  );
  if (![0, 90, 180, 270].includes(value.rotation as number)) {
    throw persistenceError('invalid-project', `${label} rotation is unsupported.`);
  }
  if (typeof value.flipHorizontal !== 'boolean' || typeof value.flipVertical !== 'boolean') {
    throw persistenceError('invalid-project', `${label} flip settings must be booleans.`);
  }

  return {
    cropX: assertFiniteNumber(value.cropX, `${label} crop X`, -8_192, 8_192),
    cropY: assertFiniteNumber(value.cropY, `${label} crop Y`, -8_192, 8_192),
    cropWidth: assertFiniteNumber(value.cropWidth, `${label} crop width`, 0.01, 8_192),
    cropHeight: assertFiniteNumber(value.cropHeight, `${label} crop height`, 0.01, 8_192),
    rotation: value.rotation as StudioFrameTransform['rotation'],
    flipHorizontal: value.flipHorizontal,
    flipVertical: value.flipVertical,
    zoom: assertFiniteNumber(value.zoom, `${label} zoom`, 0.05, 50),
    panX: assertFiniteNumber(value.panX, `${label} pan X`, -100_000, 100_000),
    panY: assertFiniteNumber(value.panY, `${label} pan Y`, -100_000, 100_000),
  };
}

function validateFrameFilter(value: unknown, label: string): StudioFrameFilter {
  assertRecord(value, `${label} filter`);
  assertExactKeys(
    value,
    ['brightness', 'contrast', 'saturation', 'blur', 'grayscale', 'sepia'],
    [],
    `${label} filter`,
  );
  return {
    brightness: assertFiniteNumber(value.brightness, `${label} brightness`, 0, 400),
    contrast: assertFiniteNumber(value.contrast, `${label} contrast`, 0, 400),
    saturation: assertFiniteNumber(value.saturation, `${label} saturation`, 0, 400),
    blur: assertFiniteNumber(value.blur, `${label} blur`, 0, 100),
    grayscale: assertFiniteNumber(value.grayscale, `${label} grayscale`, 0, 100),
    sepia: assertFiniteNumber(value.sepia, `${label} sepia`, 0, 100),
  };
}

function validateFrame(value: unknown, index: number): StudioFrame {
  const label = `Frame ${index + 1}`;
  assertRecord(value, label);
  assertExactKeys(value, ['id', 'name', 'blob', 'durationMs', 'transform', 'filter'], [], label);
  return {
    id: assertIdentifier(value.id, `${label} ID`),
    name: assertDisplayString(value.name, `${label} name`, 300),
    blob: assertImageBlob(value.blob, `${label} image`),
    durationMs: assertFiniteNumber(
      value.durationMs,
      `${label} duration`,
      20,
      GIF_STUDIO_LIMITS.maxFrameDurationMs,
      true,
    ),
    transform: validateFrameTransform(value.transform, label),
    filter: validateFrameFilter(value.filter, label),
  };
}

function validateOverlay(value: unknown, index: number): StudioOverlay {
  const label = `Overlay ${index + 1}`;
  assertRecord(value, label);
  assertExactKeys(
    value,
    [
      'id',
      'kind',
      'name',
      'startMs',
      'endMs',
      'x',
      'y',
      'width',
      'height',
      'rotation',
      'opacity',
      'color',
      'background',
      'text',
      'fontSize',
      'fontFamily',
      'fontWeight',
      'textAlign',
      'strokeColor',
      'strokeWidth',
      'cornerRadius',
      'strength',
    ],
    ['imageBlob'],
    label,
  );

  if (typeof value.kind !== 'string' || !OVERLAY_KINDS.has(value.kind as StudioOverlay['kind'])) {
    throw persistenceError('invalid-project', `${label} kind is unsupported.`);
  }
  if (
    typeof value.textAlign !== 'string' ||
    !TEXT_ALIGNS.has(value.textAlign as StudioOverlay['textAlign'])
  ) {
    throw persistenceError('invalid-project', `${label} text alignment is unsupported.`);
  }

  const startMs = assertFiniteNumber(
    value.startMs,
    `${label} start`,
    0,
    GIF_STUDIO_LIMITS.maxProjectDurationMs,
    true,
  );
  const endMs = assertFiniteNumber(
    value.endMs,
    `${label} end`,
    0,
    GIF_STUDIO_LIMITS.maxProjectDurationMs,
    true,
  );
  if (endMs < startMs) {
    throw persistenceError('invalid-project', `${label} ends before it starts.`);
  }

  const overlay: StudioOverlay = {
    id: assertIdentifier(value.id, `${label} ID`),
    kind: value.kind as StudioOverlay['kind'],
    name: assertDisplayString(value.name, `${label} name`, 300),
    startMs,
    endMs,
    x: assertFiniteNumber(value.x, `${label} X`, -10_000, 10_000),
    y: assertFiniteNumber(value.y, `${label} Y`, -10_000, 10_000),
    width: assertFiniteNumber(value.width, `${label} width`, 0.01, 10_000),
    height: assertFiniteNumber(value.height, `${label} height`, 0.01, 10_000),
    rotation: assertFiniteNumber(value.rotation, `${label} rotation`, -3_600, 3_600),
    opacity: assertFiniteNumber(value.opacity, `${label} opacity`, 0, 100),
    color: assertSafeColor(value.color, `${label} color`),
    background: assertSafeColor(value.background, `${label} background`),
    text: assertDisplayString(value.text, `${label} text`, GIF_STUDIO_LIMITS.maxTextLength, {
      allowEmpty: true,
    }),
    fontSize: assertFiniteNumber(value.fontSize, `${label} font size`, 1, 1_000),
    fontFamily: assertSafeFontFamily(value.fontFamily),
    fontWeight: assertFiniteNumber(value.fontWeight, `${label} font weight`, 1, 1_000),
    textAlign: value.textAlign as StudioOverlay['textAlign'],
    strokeColor: assertSafeColor(value.strokeColor, `${label} stroke color`),
    strokeWidth: assertFiniteNumber(value.strokeWidth, `${label} stroke width`, 0, 100),
    cornerRadius: assertFiniteNumber(value.cornerRadius, `${label} corner radius`, 0, 10_000),
    strength: assertFiniteNumber(value.strength, `${label} strength`, 0, 1_000),
  };

  if (value.imageBlob !== undefined) {
    overlay.imageBlob = assertImageBlob(value.imageBlob, `${label} image`);
  }
  return overlay;
}

/**
 * Creates a structural snapshot while intentionally sharing immutable Blob instances.
 * This is suitable for React state/history and avoids multiplying large frame payloads.
 */
export function cloneStudioProjectWithSharedBlobs(project: StudioProject): StudioProject {
  return {
    schemaVersion: 1,
    id: project.id,
    title: project.title,
    sourceKind: project.sourceKind,
    sourceName: project.sourceName,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    canvas: { ...project.canvas },
    frames: project.frames.map((frame) => ({
      ...frame,
      blob: frame.blob,
      transform: { ...frame.transform },
      filter: { ...frame.filter },
    })),
    overlays: project.overlays.map((overlay) => ({
      ...overlay,
      ...(overlay.imageBlob ? { imageBlob: overlay.imageBlob } : {}),
    })),
  };
}

export function validateStudioProject(
  value: unknown,
  options: { maxBlobBytes?: number } = {},
): StudioProject {
  assertNoTransientUrls(value);
  assertRecord(value, 'Project');
  assertExactKeys(
    value,
    [
      'schemaVersion',
      'id',
      'title',
      'sourceKind',
      'sourceName',
      'createdAt',
      'updatedAt',
      'canvas',
      'frames',
      'overlays',
    ],
    [],
    'Project',
  );
  if (value.schemaVersion !== GIF_STUDIO_PACKAGE_SCHEMA_VERSION) {
    throw persistenceError('invalid-project', 'This project schema version is not supported.');
  }
  if (
    typeof value.sourceKind !== 'string' ||
    !SOURCE_KINDS.has(value.sourceKind as StudioSourceKind)
  ) {
    throw persistenceError('invalid-project', 'Project source kind is unsupported.');
  }
  if (!Array.isArray(value.frames) || value.frames.length < 1) {
    throw persistenceError('invalid-project', 'A project must contain at least one frame.');
  }
  if (value.frames.length > GIF_STUDIO_LIMITS.maxFrames) {
    throw persistenceError(
      'limit-exceeded',
      `A project can contain at most ${GIF_STUDIO_LIMITS.maxFrames} frames.`,
    );
  }
  if (!Array.isArray(value.overlays)) {
    throw persistenceError('invalid-project', 'Project overlays must be a list.');
  }
  if (value.overlays.length > GIF_STUDIO_LIMITS.maxOverlays) {
    throw persistenceError(
      'limit-exceeded',
      `A project can contain at most ${GIF_STUDIO_LIMITS.maxOverlays} overlays.`,
    );
  }

  const frames = value.frames.map(validateFrame);
  const overlays = value.overlays.map(validateOverlay);
  const frameIds = new Set(frames.map((frame) => frame.id));
  const overlayIds = new Set(overlays.map((overlay) => overlay.id));
  if (frameIds.size !== frames.length || overlayIds.size !== overlays.length) {
    throw persistenceError('invalid-project', 'Frame and overlay IDs must be unique.');
  }

  const totalDuration = frames.reduce((total, frame) => total + frame.durationMs, 0);
  if (totalDuration > GIF_STUDIO_LIMITS.maxProjectDurationMs) {
    throw persistenceError('limit-exceeded', 'The project duration exceeds the safe limit.');
  }
  const totalBlobBytes =
    frames.reduce((total, frame) => total + frame.blob.size, 0) +
    overlays.reduce((total, overlay) => total + (overlay.imageBlob?.size ?? 0), 0);
  const maxBlobBytes = options.maxBlobBytes ?? GIF_STUDIO_LIMITS.maxStoredBlobBytes;
  if (totalBlobBytes > maxBlobBytes) {
    throw persistenceError(
      'limit-exceeded',
      `Project media exceeds the ${Math.round(maxBlobBytes / 1024 / 1024)} MB limit.`,
    );
  }

  return {
    schemaVersion: 1,
    id: assertIdentifier(value.id, 'Project ID'),
    title: assertDisplayString(value.title, 'Project title', 300),
    sourceKind: value.sourceKind as StudioSourceKind,
    sourceName: assertDisplayString(value.sourceName, 'Project source name', 500),
    createdAt: assertIsoDate(value.createdAt, 'Project creation date'),
    updatedAt: assertIsoDate(value.updatedAt, 'Project update date'),
    canvas: validateCanvas(value.canvas),
    frames,
    overlays,
  };
}

function createStoredRecord(project: StudioProject): StoredProjectRecord {
  return {
    storageVersion: STORAGE_VERSION,
    savedAt: new Date().toISOString(),
    project: validateStudioProject(project),
  };
}

function readStoredRecord(value: unknown): StudioProject {
  assertRecord(value, 'Stored project');
  assertExactKeys(value, ['storageVersion', 'savedAt', 'project'], [], 'Stored project');
  if (value.storageVersion !== STORAGE_VERSION) {
    throw persistenceError('invalid-project', 'The stored project version is unsupported.');
  }
  assertIsoDate(value.savedAt, 'Stored project save date');
  return validateStudioProject(value.project);
}

function createSummary(project: StudioProject): StoredStudioProjectSummary {
  return {
    id: project.id,
    title: project.title,
    sourceName: project.sourceName,
    updatedAt: project.updatedAt,
    frameCount: project.frames.length,
    durationMs: getProjectDuration(project),
  };
}

function readSummary(value: unknown): StoredStudioProjectSummary {
  assertRecord(value, 'Project summary');
  assertExactKeys(
    value,
    ['id', 'title', 'sourceName', 'updatedAt', 'frameCount', 'durationMs'],
    [],
    'Project summary',
  );
  return {
    id: assertIdentifier(value.id, 'Project summary ID'),
    title: assertDisplayString(value.title, 'Project summary title', 300),
    sourceName: assertDisplayString(value.sourceName, 'Project summary source name', 500),
    updatedAt: assertIsoDate(value.updatedAt, 'Project summary update date'),
    frameCount: assertFiniteNumber(
      value.frameCount,
      'Project summary frame count',
      1,
      GIF_STUDIO_LIMITS.maxFrames,
      true,
    ),
    durationMs: assertFiniteNumber(
      value.durationMs,
      'Project summary duration',
      20,
      GIF_STUDIO_LIMITS.maxProjectDurationMs,
      true,
    ),
  };
}

interface AutosaveWaiter {
  resolve: () => void;
  reject: (reason: unknown) => void;
}

let pendingAutosaveProject: StudioProject | null = null;
let pendingAutosaveWaiters: AutosaveWaiter[] = [];
let autosaveTimer: ReturnType<typeof setTimeout> | null = null;
let autosaveWriteQueue: Promise<void> = Promise.resolve();

function takePendingAutosave(): {
  project: StudioProject;
  waiters: AutosaveWaiter[];
} | null {
  if (!pendingAutosaveProject) return null;
  const payload = {
    project: pendingAutosaveProject,
    waiters: pendingAutosaveWaiters,
  };
  pendingAutosaveProject = null;
  pendingAutosaveWaiters = [];
  return payload;
}

function queueAutosaveWrite(): Promise<void> {
  const pending = takePendingAutosave();
  if (!pending) return autosaveWriteQueue;

  const operation = autosaveWriteQueue.then(async () => {
    const storage = await getStorage();
    await storage.autosave.setItem(AUTOSAVE_KEY, createStoredRecord(pending.project));
  });

  operation.then(
    () => pending.waiters.forEach(({ resolve }) => resolve()),
    (error) => pending.waiters.forEach(({ reject }) => reject(error)),
  );
  autosaveWriteQueue = operation.catch(() => undefined);
  return operation;
}

export function saveAutosave(
  project: StudioProject,
  options: SaveAutosaveOptions = {},
): Promise<void> {
  const snapshot = validateStudioProject(project);
  const debounceMs = Math.max(
    0,
    Math.min(10_000, Math.round(options.debounceMs ?? DEFAULT_AUTOSAVE_DEBOUNCE_MS)),
  );

  pendingAutosaveProject = snapshot;
  if (autosaveTimer) clearTimeout(autosaveTimer);

  const promise = new Promise<void>((resolve, reject) => {
    pendingAutosaveWaiters.push({ resolve, reject });
  });
  autosaveTimer = setTimeout(() => {
    autosaveTimer = null;
    void queueAutosaveWrite();
  }, debounceMs);
  return promise;
}

/** Forces a pending debounced autosave to cross the IndexedDB durability boundary. */
export async function flushAutosave(): Promise<void> {
  if (autosaveTimer) {
    clearTimeout(autosaveTimer);
    autosaveTimer = null;
  }
  if (pendingAutosaveProject) {
    await queueAutosaveWrite();
  }
  await autosaveWriteQueue;
}

export async function loadAutosave(): Promise<StudioProject | null> {
  await flushAutosave();
  const storage = await getStorage();
  const record = await storage.autosave.getItem<unknown>(AUTOSAVE_KEY);
  return record === null ? null : readStoredRecord(record);
}

export async function clearAutosave(): Promise<void> {
  if (autosaveTimer) {
    clearTimeout(autosaveTimer);
    autosaveTimer = null;
  }
  pendingAutosaveProject = null;
  const waiters = pendingAutosaveWaiters;
  pendingAutosaveWaiters = [];
  waiters.forEach(({ resolve }) => resolve());
  await autosaveWriteQueue;
  const storage = await getStorage();
  await storage.autosave.removeItem(AUTOSAVE_KEY);
}

export async function saveNamedProject(
  project: StudioProject,
  title = project.title,
): Promise<StudioProject> {
  const updated = validateStudioProject({
    ...project,
    title: title.trim(),
    updatedAt: new Date().toISOString(),
  });
  const storage = await getStorage();
  const record = createStoredRecord(updated);
  await storage.projects.setItem(updated.id, record);
  await storage.summaries.setItem(updated.id, createSummary(updated));
  return cloneStudioProjectWithSharedBlobs(updated);
}

export async function listNamedProjects(): Promise<StoredStudioProjectSummary[]> {
  const storage = await getStorage();
  const summaries: StoredStudioProjectSummary[] = [];
  await storage.summaries.iterate<unknown, void>((value) => {
    try {
      summaries.push(readSummary(value));
    } catch {
      // A malformed index row is ignored without deleting user data.
    }
  });
  return summaries.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export async function loadNamedProject(id: string): Promise<StudioProject | null> {
  const safeId = assertIdentifier(id, 'Project ID');
  const storage = await getStorage();
  const record = await storage.projects.getItem<unknown>(safeId);
  return record === null ? null : readStoredRecord(record);
}

export async function deleteNamedProject(id: string): Promise<void> {
  const safeId = assertIdentifier(id, 'Project ID');
  const storage = await getStorage();
  await Promise.all([storage.projects.removeItem(safeId), storage.summaries.removeItem(safeId)]);
}

function sniffImageMime(bytes: Uint8Array): string | null {
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'image/png';
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    bytes.length >= 6 &&
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38 &&
    (bytes[4] === 0x37 || bytes[4] === 0x39) &&
    bytes[5] === 0x61
  ) {
    return 'image/gif';
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'image/webp';
  }
  return null;
}

function bytesToBase64(bytes: Uint8Array): string {
  if (typeof btoa !== 'function') {
    throw persistenceError('unsupported', 'This browser cannot encode project packages.');
  }
  const chunkSize = 3 * 8_192;
  let result = '';
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.subarray(offset, Math.min(offset + chunkSize, bytes.length));
    let binary = '';
    for (let index = 0; index < chunk.length; index += 1) {
      binary += String.fromCharCode(chunk[index]);
    }
    result += btoa(binary);
  }
  return result;
}

function base64ToBytes(base64: string, label: string): Uint8Array {
  if (typeof atob !== 'function') {
    throw persistenceError('unsupported', 'This browser cannot decode project packages.');
  }
  if (base64.length === 0 || base64.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) {
    throw persistenceError('invalid-package', `${label} contains invalid base64 data.`);
  }
  const estimatedSize =
    Math.floor((base64.length * 3) / 4) -
    (base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0);
  if (estimatedSize > GIF_STUDIO_LIMITS.maxSingleBlobBytes) {
    throw persistenceError('limit-exceeded', `${label} exceeds the per-image size limit.`);
  }
  let binary: string;
  try {
    binary = atob(base64);
  } catch (error) {
    throw persistenceError('invalid-package', `${label} contains invalid base64 data.`, error);
  }
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function blobToSafeDataUrl(blob: Blob, label: string): Promise<string> {
  assertImageBlob(blob, label);
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const sniffedMime = sniffImageMime(bytes);
  if (!sniffedMime || sniffedMime !== blob.type.toLowerCase()) {
    throw persistenceError(
      'unsafe-content',
      `${label} content does not match its declared MIME type.`,
    );
  }
  return `data:${sniffedMime};base64,${bytesToBase64(bytes)}`;
}

function decodeSafeImageDataUrl(dataUrl: unknown, label: string): Blob {
  if (typeof dataUrl !== 'string') {
    throw persistenceError('invalid-package', `${label} must be an inline image.`);
  }
  const match = /^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/]+={0,2})$/.exec(dataUrl);
  if (!match || !SAFE_IMAGE_MIME_TYPES.has(match[1])) {
    throw persistenceError(
      'unsafe-content',
      `${label} must use an approved base64 image data URL.`,
    );
  }
  const bytes = base64ToBytes(match[2], label);
  if (sniffImageMime(bytes) !== match[1]) {
    throw persistenceError('unsafe-content', `${label} MIME type does not match its content.`);
  }
  return new Blob([bytes], { type: match[1] });
}

function serializeFrame(frame: StudioFrame, blobDataUrl: string): SerializedStudioFrame {
  return {
    id: frame.id,
    name: frame.name,
    durationMs: frame.durationMs,
    transform: { ...frame.transform },
    filter: { ...frame.filter },
    blobDataUrl,
  };
}

function serializeOverlay(overlay: StudioOverlay, imageDataUrl?: string): SerializedStudioOverlay {
  const { imageBlob: _imageBlob, ...serializable } = overlay;
  return imageDataUrl ? { ...serializable, imageDataUrl } : serializable;
}

export async function exportProjectPackage(project: StudioProject): Promise<Blob> {
  const safeProject = validateStudioProject(project, {
    maxBlobBytes: GIF_STUDIO_LIMITS.maxPackageBinaryBytes,
  });
  const frames: SerializedStudioFrame[] = [];
  const overlays: SerializedStudioOverlay[] = [];

  for (let index = 0; index < safeProject.frames.length; index += 1) {
    const frame = safeProject.frames[index];
    frames.push(
      serializeFrame(frame, await blobToSafeDataUrl(frame.blob, `Frame ${index + 1} image`)),
    );
  }
  for (let index = 0; index < safeProject.overlays.length; index += 1) {
    const overlay = safeProject.overlays[index];
    const imageDataUrl = overlay.imageBlob
      ? await blobToSafeDataUrl(overlay.imageBlob, `Overlay ${index + 1} image`)
      : undefined;
    overlays.push(serializeOverlay(overlay, imageDataUrl));
  }

  const packageValue: StudioProjectPackageV1 = {
    format: GIF_STUDIO_PACKAGE_FORMAT,
    schemaVersion: GIF_STUDIO_PACKAGE_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    project: {
      schemaVersion: 1,
      id: safeProject.id,
      title: safeProject.title,
      sourceKind: safeProject.sourceKind,
      sourceName: safeProject.sourceName,
      createdAt: safeProject.createdAt,
      updatedAt: safeProject.updatedAt,
      canvas: { ...safeProject.canvas },
      frames,
      overlays,
    },
  };
  const json = JSON.stringify(packageValue);
  const blob = new Blob([json], { type: 'application/vnd.gifstudio+json' });
  if (blob.size > GIF_STUDIO_LIMITS.maxPackageBytes) {
    throw persistenceError('limit-exceeded', 'The exported .gifstudio package is too large.');
  }
  return blob;
}

function parseJsonPackage(text: string): unknown {
  try {
    return JSON.parse(text, (key, value) => {
      if (FORBIDDEN_JSON_KEYS.has(key)) {
        throw persistenceError(
          'unsafe-content',
          `Project package contains a forbidden key: ${key}.`,
        );
      }
      return value;
    });
  } catch (error) {
    if (error instanceof GifStudioPersistenceError) throw error;
    throw persistenceError('invalid-package', 'The .gifstudio file is not valid JSON.', error);
  }
}

function assertSerializedFrame(value: unknown, index: number): Record<string, unknown> {
  const label = `Serialized frame ${index + 1}`;
  assertRecord(value, label);
  assertExactKeys(
    value,
    ['id', 'name', 'durationMs', 'transform', 'filter', 'blobDataUrl'],
    [],
    label,
    'invalid-package',
  );
  return value;
}

function assertSerializedOverlay(value: unknown, index: number): Record<string, unknown> {
  const label = `Serialized overlay ${index + 1}`;
  assertRecord(value, label);
  assertExactKeys(
    value,
    [
      'id',
      'kind',
      'name',
      'startMs',
      'endMs',
      'x',
      'y',
      'width',
      'height',
      'rotation',
      'opacity',
      'color',
      'background',
      'text',
      'fontSize',
      'fontFamily',
      'fontWeight',
      'textAlign',
      'strokeColor',
      'strokeWidth',
      'cornerRadius',
      'strength',
    ],
    ['imageDataUrl'],
    label,
    'invalid-package',
  );
  return value;
}

function deserializePackage(value: unknown): StudioProject {
  assertRecord(value, 'Project package');
  assertExactKeys(
    value,
    ['format', 'schemaVersion', 'exportedAt', 'project'],
    [],
    'Project package',
    'invalid-package',
  );
  if (value.format !== GIF_STUDIO_PACKAGE_FORMAT) {
    throw persistenceError('invalid-package', 'This is not a GIF Studio project package.');
  }
  if (value.schemaVersion !== GIF_STUDIO_PACKAGE_SCHEMA_VERSION) {
    throw persistenceError('invalid-package', 'This .gifstudio version is not supported.');
  }
  assertIsoDate(value.exportedAt, 'Package export date');
  assertRecord(value.project, 'Serialized project');
  assertExactKeys(
    value.project,
    [
      'schemaVersion',
      'id',
      'title',
      'sourceKind',
      'sourceName',
      'createdAt',
      'updatedAt',
      'canvas',
      'frames',
      'overlays',
    ],
    [],
    'Serialized project',
    'invalid-package',
  );
  if (!Array.isArray(value.project.frames) || !Array.isArray(value.project.overlays)) {
    throw persistenceError('invalid-package', 'Serialized project media lists are invalid.');
  }
  if (
    value.project.frames.length < 1 ||
    value.project.frames.length > GIF_STUDIO_LIMITS.maxFrames
  ) {
    throw persistenceError(
      'limit-exceeded',
      'Serialized project frame count is outside the safe limit.',
    );
  }
  if (value.project.overlays.length > GIF_STUDIO_LIMITS.maxOverlays) {
    throw persistenceError(
      'limit-exceeded',
      'Serialized project overlay count exceeds the safe limit.',
    );
  }

  let decodedBytes = 0;
  const frames = value.project.frames.map((frameValue, index) => {
    const serialized = assertSerializedFrame(frameValue, index);
    const blob = decodeSafeImageDataUrl(serialized.blobDataUrl, `Frame ${index + 1} image`);
    decodedBytes += blob.size;
    const { blobDataUrl: _blobDataUrl, ...withoutData } = serialized;
    return { ...withoutData, blob };
  });
  const overlays = value.project.overlays.map((overlayValue, index) => {
    const serialized = assertSerializedOverlay(overlayValue, index);
    const imageBlob =
      serialized.imageDataUrl === undefined
        ? undefined
        : decodeSafeImageDataUrl(serialized.imageDataUrl, `Overlay ${index + 1} image`);
    decodedBytes += imageBlob?.size ?? 0;
    const { imageDataUrl: _imageDataUrl, ...withoutData } = serialized;
    return imageBlob ? { ...withoutData, imageBlob } : withoutData;
  });
  if (decodedBytes > GIF_STUDIO_LIMITS.maxPackageBinaryBytes) {
    throw persistenceError('limit-exceeded', 'Project package media exceeds the safe limit.');
  }

  return validateStudioProject(
    {
      ...value.project,
      frames,
      overlays,
    },
    { maxBlobBytes: GIF_STUDIO_LIMITS.maxPackageBinaryBytes },
  );
}

export async function importProjectPackage(input: Blob | string): Promise<StudioProject> {
  let text: string;
  if (typeof input === 'string') {
    const size = new Blob([input]).size;
    if (size > GIF_STUDIO_LIMITS.maxPackageBytes) {
      throw persistenceError('limit-exceeded', 'The .gifstudio package is too large.');
    }
    text = input;
  } else {
    if (!isBlob(input)) {
      throw persistenceError('invalid-package', 'Choose a .gifstudio project file.');
    }
    if (input.size < 2 || input.size > GIF_STUDIO_LIMITS.maxPackageBytes) {
      throw persistenceError(
        'limit-exceeded',
        'The .gifstudio package size is outside the safe limit.',
      );
    }
    if (!SAFE_PACKAGE_MIME_TYPES.has(input.type.toLowerCase())) {
      throw persistenceError('unsafe-content', 'The selected file has an unsupported MIME type.');
    }
    const possibleFile = input as Blob & { name?: string };
    if (possibleFile.name && !possibleFile.name.toLowerCase().endsWith('.gifstudio')) {
      throw persistenceError('invalid-package', 'Project files must use the .gifstudio extension.');
    }
    text = await input.text();
  }

  return deserializePackage(parseJsonPackage(text));
}
