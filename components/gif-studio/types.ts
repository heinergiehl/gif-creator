export type StudioSourceKind = 'gif' | 'video' | 'images' | 'recording' | 'project';

export type StudioTool =
  | 'select'
  | 'transform'
  | 'text'
  | 'redact'
  | 'annotate'
  | 'effects'
  | 'timing'
  | 'demo';

export type StudioOverlayKind =
  | 'text'
  | 'blur'
  | 'pixelate'
  | 'spotlight'
  | 'callout'
  | 'cursor'
  | 'watermark';

export interface StudioCanvasSettings {
  width: number;
  height: number;
  background: string;
  fit: 'contain' | 'cover' | 'stretch';
}

export interface StudioFrameTransform {
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  rotation: 0 | 90 | 180 | 270;
  flipHorizontal: boolean;
  flipVertical: boolean;
  zoom: number;
  panX: number;
  panY: number;
}

export interface StudioFrameFilter {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: number;
  sepia: number;
}

export interface StudioFrame {
  id: string;
  name: string;
  blob: Blob;
  durationMs: number;
  transform: StudioFrameTransform;
  filter: StudioFrameFilter;
}

export interface StudioOverlay {
  id: string;
  kind: StudioOverlayKind;
  name: string;
  startMs: number;
  endMs: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  color: string;
  background: string;
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  textAlign: 'left' | 'center' | 'right';
  strokeColor: string;
  strokeWidth: number;
  cornerRadius: number;
  strength: number;
  imageBlob?: Blob;
}

export interface StudioProject {
  schemaVersion: 1;
  id: string;
  title: string;
  sourceKind: StudioSourceKind;
  sourceName: string;
  createdAt: string;
  updatedAt: string;
  canvas: StudioCanvasSettings;
  frames: StudioFrame[];
  overlays: StudioOverlay[];
}

export type StudioPhase =
  | 'empty'
  | 'importing'
  | 'ready'
  | 'saving'
  | 'saved'
  | 'rendering'
  | 'error';

export interface StudioProgress {
  phase: StudioPhase;
  value: number;
  message: string;
}

export type StudioExportFormat = 'gif' | 'webp' | 'apng' | 'mp4';

export interface StudioExportOptions {
  format: StudioExportFormat;
  quality: number;
  loop: number;
}

export interface StudioExportResult {
  blob: Blob;
  url: string;
  extension: string;
  mimeType: string;
  width: number;
  height: number;
  durationMs: number;
  frameCount: number;
}

export interface StoredStudioProjectSummary {
  id: string;
  title: string;
  sourceName: string;
  updatedAt: string;
  frameCount: number;
  durationMs: number;
}
