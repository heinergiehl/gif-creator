'use client';

/* eslint-disable @next/next/no-img-element -- Animated previews use local blob URLs that Next Image cannot optimize. */

import * as React from 'react';
import {
  ArrowDownToLine,
  Check,
  Crop,
  FileImage,
  FlipHorizontal,
  FlipVertical,
  LoaderCircle,
  LockKeyhole,
  Maximize2,
  RotateCcw,
  RotateCw,
  TriangleAlert,
  Upload,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import {
  MAX_GIF_BYTES,
  formatBytes,
  formatDuration,
  parseGifMetadata,
  type GifMetadata,
} from '@/lib/gif-optimizer';
import type {
  GifEditOperation,
  GifEditProgress,
  GifEditResult,
  GifRotation,
} from '@/lib/gif-edit-engine';

export type GifEditMode = 'resize' | 'crop' | 'rotate';
type ToolPhase = 'idle' | 'analyzing' | 'ready' | 'processing' | 'success' | 'error';

interface SourceGif {
  file: File;
  url: string;
  metadata: GifMetadata;
}

interface RenderedGif extends GifEditResult {
  url: string;
}

interface ResizeSettings {
  width: string;
  height: string;
  lockAspect: boolean;
}

type CropPreset = 'custom' | 'full' | '1:1' | '4:3' | '16:9';

interface CropSettings {
  x: string;
  y: string;
  width: string;
  height: string;
  preset: CropPreset;
}

interface RotateSettings {
  rotation: GifRotation;
  flipHorizontal: boolean;
  flipVertical: boolean;
}

interface ToolDetails {
  title: string;
  uploadTitle: string;
  uploadText: string;
  action: string;
  readyText: string;
  Icon: LucideIcon;
}

interface ValidationState {
  message: string;
  fields: Partial<Record<'width' | 'height' | 'x' | 'y', string>>;
}

const MAX_OUTPUT_DIMENSION = 4096;

const TOOL_DETAILS: Record<GifEditMode, ToolDetails> = {
  resize: {
    title: 'GIF Resizer',
    uploadTitle: 'Drop a GIF to resize every frame',
    uploadText:
      'Choose exact pixel dimensions or start with a practical preset. Animation and transparency stay intact.',
    action: 'Resize GIF',
    readyText: 'Choose the output dimensions, then resize the full animation.',
    Icon: Maximize2,
  },
  crop: {
    title: 'GIF Cropper',
    uploadTitle: 'Drop a GIF to crop the animation',
    uploadText:
      'Frame the exact area with coordinates or an aspect preset before rendering every GIF frame.',
    action: 'Crop GIF',
    readyText: 'Set the crop area. The blue frame shows exactly what will remain.',
    Icon: Crop,
  },
  rotate: {
    title: 'GIF Rotator',
    uploadTitle: 'Drop a GIF to rotate or flip it',
    uploadText:
      'Turn the complete animation by 90, 180, or 270 degrees and mirror it horizontally or vertically.',
    action: 'Rotate GIF',
    readyText: 'Choose an angle, a flip, or combine both transformations.',
    Icon: RotateCw,
  },
};

function integerFrom(value: string): number | null {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

function createResizeSettings(metadata: GifMetadata): ResizeSettings {
  return {
    width: String(metadata.width),
    height: String(metadata.height),
    lockAspect: true,
  };
}

function createCropSettings(metadata: GifMetadata): CropSettings {
  return {
    x: '0',
    y: '0',
    width: String(metadata.width),
    height: String(metadata.height),
    preset: 'full',
  };
}

function validateResize(settings: ResizeSettings): ValidationState {
  const fields: ValidationState['fields'] = {};
  const width = integerFrom(settings.width);
  const height = integerFrom(settings.height);

  if (width === null || width < 1 || width > MAX_OUTPUT_DIMENSION) {
    fields.width = `Enter a whole number from 1 to ${MAX_OUTPUT_DIMENSION}.`;
  }
  if (height === null || height < 1 || height > MAX_OUTPUT_DIMENSION) {
    fields.height = `Enter a whole number from 1 to ${MAX_OUTPUT_DIMENSION}.`;
  }

  return {
    fields,
    message:
      fields.width || fields.height
        ? `Output dimensions must be whole pixels between 1 and ${MAX_OUTPUT_DIMENSION}.`
        : '',
  };
}

function validateCrop(settings: CropSettings, metadata: GifMetadata): ValidationState {
  const fields: ValidationState['fields'] = {};
  const x = integerFrom(settings.x);
  const y = integerFrom(settings.y);
  const width = integerFrom(settings.width);
  const height = integerFrom(settings.height);

  if (x === null || x < 0 || x >= metadata.width) {
    fields.x = `Use a whole number from 0 to ${Math.max(0, metadata.width - 1)}.`;
  }
  if (y === null || y < 0 || y >= metadata.height) {
    fields.y = `Use a whole number from 0 to ${Math.max(0, metadata.height - 1)}.`;
  }
  if (width === null || width < 1 || width > metadata.width) {
    fields.width = `Use a whole number from 1 to ${metadata.width}.`;
  }
  if (height === null || height < 1 || height > metadata.height) {
    fields.height = `Use a whole number from 1 to ${metadata.height}.`;
  }

  if (!fields.x && !fields.width && x !== null && width !== null && x + width > metadata.width) {
    fields.width = `Width can be at most ${metadata.width - x} px from this X position.`;
  }
  if (
    !fields.y &&
    !fields.height &&
    y !== null &&
    height !== null &&
    y + height > metadata.height
  ) {
    fields.height = `Height can be at most ${metadata.height - y} px from this Y position.`;
  }

  return {
    fields,
    message:
      fields.x || fields.y || fields.width || fields.height
        ? 'Keep the complete crop area inside the source canvas.'
        : '',
  };
}

function cropForAspect(metadata: GifMetadata, ratio: number): CropSettings {
  let width = metadata.width;
  let height = Math.round(width / ratio);

  if (height > metadata.height) {
    height = metadata.height;
    width = Math.round(height * ratio);
  }

  return {
    x: String(Math.floor((metadata.width - width) / 2)),
    y: String(Math.floor((metadata.height - height) / 2)),
    width: String(width),
    height: String(height),
    preset: 'custom',
  };
}

function outputDimensions(
  mode: GifEditMode,
  source: SourceGif,
  resize: ResizeSettings,
  crop: CropSettings,
  rotate: RotateSettings,
): string {
  if (mode === 'resize') return `${resize.width || '—'} × ${resize.height || '—'} px`;
  if (mode === 'crop') return `${crop.width || '—'} × ${crop.height || '—'} px`;

  const swapped = rotate.rotation === 90 || rotate.rotation === 270;
  return swapped
    ? `${source.metadata.height} × ${source.metadata.width} px`
    : `${source.metadata.width} × ${source.metadata.height} px`;
}

function FileFacts({ source }: { source: SourceGif }): React.ReactElement {
  const facts = [
    { label: 'Size', value: formatBytes(source.file.size) },
    { label: 'Canvas', value: `${source.metadata.width} × ${source.metadata.height}` },
    { label: 'Frames', value: String(source.metadata.frameCount) },
    { label: 'Duration', value: formatDuration(source.metadata.durationMs) },
  ];

  return (
    <dl className="grid grid-cols-2 border-y border-slate-200 dark:border-slate-800">
      {facts.map((fact, index) => (
        <div
          key={fact.label}
          className={cn(
            'py-3',
            index % 2 === 0 ? 'border-r border-slate-200 pr-4 dark:border-slate-800' : 'pl-4',
            index > 1 && 'border-t border-slate-200 dark:border-slate-800',
          )}
        >
          <dt className="text-xs uppercase tracking-[0.14em] text-slate-400">{fact.label}</dt>
          <dd className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">
            {fact.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function NumberField({
  id,
  label,
  value,
  error,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  disabled: boolean;
  onChange: (value: string) => void;
}): React.ReactElement {
  const errorId = `${id}-error`;

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative mt-2">
        <Input
          id={id}
          type="number"
          inputMode="numeric"
          step="1"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          disabled={disabled}
          className="h-11 pr-10 font-mono"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400"
        >
          px
        </span>
      </div>
      {error ? (
        <p id={errorId} className="mt-1.5 text-xs leading-5 text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ResizeControls({
  metadata,
  settings,
  errors,
  disabled,
  onChange,
}: {
  metadata: GifMetadata;
  settings: ResizeSettings;
  errors: ValidationState['fields'];
  disabled: boolean;
  onChange: (settings: ResizeSettings) => void;
}): React.ReactElement {
  const ratio = metadata.width / metadata.height;

  const changeWidth = (width: string) => {
    const parsed = integerFrom(width);
    onChange({
      ...settings,
      width,
      height:
        settings.lockAspect && parsed !== null && parsed > 0
          ? String(Math.max(1, Math.round(parsed / ratio)))
          : settings.height,
    });
  };

  const changeHeight = (height: string) => {
    const parsed = integerFrom(height);
    onChange({
      ...settings,
      height,
      width:
        settings.lockAspect && parsed !== null && parsed > 0
          ? String(Math.max(1, Math.round(parsed * ratio)))
          : settings.width,
    });
  };

  const applyWidth = (width: number) => {
    const safeWidth = Math.max(1, Math.min(MAX_OUTPUT_DIMENSION, width));
    onChange({
      ...settings,
      width: String(safeWidth),
      height: String(Math.max(1, Math.round(safeWidth / ratio))),
    });
  };

  const presets = [
    { label: 'Original', width: metadata.width },
    { label: '50%', width: Math.round(metadata.width / 2) },
    { label: '480 px', width: 480 },
    { label: '320 px', width: 320 },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <NumberField
          id="resize-width"
          label="Width"
          value={settings.width}
          error={errors.width}
          disabled={disabled}
          onChange={changeWidth}
        />
        <NumberField
          id="resize-height"
          label="Height"
          value={settings.height}
          error={errors.height}
          disabled={disabled}
          onChange={changeHeight}
        />
      </div>

      <div className="mt-4 flex items-start justify-between gap-5">
        <div>
          <Label htmlFor="resize-lock-aspect">Lock aspect ratio</Label>
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            Changing either dimension updates the other.
          </p>
        </div>
        <Switch
          id="resize-lock-aspect"
          checked={settings.lockAspect}
          onCheckedChange={(lockAspect) => {
            const width = integerFrom(settings.width);
            onChange({
              ...settings,
              lockAspect,
              height:
                lockAspect && width !== null && width > 0
                  ? String(Math.max(1, Math.round(width / ratio)))
                  : settings.height,
            });
          }}
          disabled={disabled}
        />
      </div>

      <div className="mt-5">
        <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Quick sizes</p>
        <div className="mt-2 flex flex-wrap gap-2" aria-label="Resize presets">
          {presets.map((preset) => (
            <Button
              key={preset.label}
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-full px-3 text-xs"
              onClick={() => applyWidth(preset.width)}
              disabled={disabled}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CropControls({
  metadata,
  settings,
  errors,
  disabled,
  onChange,
}: {
  metadata: GifMetadata;
  settings: CropSettings;
  errors: ValidationState['fields'];
  disabled: boolean;
  onChange: (settings: CropSettings) => void;
}): React.ReactElement {
  const presets: Array<{ value: CropPreset; label: string; ratio?: number }> = [
    { value: 'full', label: 'Full frame' },
    { value: '1:1', label: 'Square', ratio: 1 },
    { value: '4:3', label: '4:3', ratio: 4 / 3 },
    { value: '16:9', label: '16:9', ratio: 16 / 9 },
  ];

  const applyPreset = (preset: (typeof presets)[number]) => {
    if (!preset.ratio) {
      onChange({ ...createCropSettings(metadata), preset: 'full' });
      return;
    }

    onChange({ ...cropForAspect(metadata, preset.ratio), preset: preset.value });
  };

  const update = (field: 'x' | 'y' | 'width' | 'height', value: string) => {
    onChange({ ...settings, [field]: value, preset: 'custom' });
  };

  return (
    <div>
      <fieldset>
        <legend className="text-sm font-medium text-slate-900 dark:text-slate-100">
          Aspect preset
        </legend>
        <div className="mt-2 grid grid-cols-2 gap-2" aria-label="Crop aspect presets">
          {presets.map((preset) => (
            <Button
              key={preset.value}
              type="button"
              variant="outline"
              size="sm"
              aria-pressed={settings.preset === preset.value}
              className={cn(
                'h-9',
                settings.preset === preset.value &&
                  'border-blue-600 bg-blue-50 text-blue-800 hover:bg-blue-50 dark:border-blue-500 dark:bg-blue-950/30 dark:text-blue-200',
              )}
              onClick={() => applyPreset(preset)}
              disabled={disabled}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </fieldset>

      <Separator className="my-5" />

      <div className="grid grid-cols-2 gap-x-3 gap-y-4">
        <NumberField
          id="crop-x"
          label="X position"
          value={settings.x}
          error={errors.x}
          disabled={disabled}
          onChange={(value) => update('x', value)}
        />
        <NumberField
          id="crop-y"
          label="Y position"
          value={settings.y}
          error={errors.y}
          disabled={disabled}
          onChange={(value) => update('y', value)}
        />
        <NumberField
          id="crop-width"
          label="Crop width"
          value={settings.width}
          error={errors.width}
          disabled={disabled}
          onChange={(value) => update('width', value)}
        />
        <NumberField
          id="crop-height"
          label="Crop height"
          value={settings.height}
          error={errors.height}
          disabled={disabled}
          onChange={(value) => update('height', value)}
        />
      </div>
    </div>
  );
}

function RotateControls({
  source,
  settings,
  disabled,
  onChange,
}: {
  source: SourceGif;
  settings: RotateSettings;
  disabled: boolean;
  onChange: (settings: RotateSettings) => void;
}): React.ReactElement {
  return (
    <div>
      <fieldset>
        <legend className="text-sm font-medium text-slate-900 dark:text-slate-100">
          Rotation angle
        </legend>
        <ToggleGroup
          type="single"
          value={String(settings.rotation)}
          onValueChange={(value) => {
            if (value) onChange({ ...settings, rotation: Number(value) as GifRotation });
          }}
          variant="outline"
          className="mt-2 grid grid-cols-4"
          aria-label="Rotation angle"
          disabled={disabled}
        >
          {([0, 90, 180, 270] as const).map((angle) => (
            <ToggleGroupItem
              key={angle}
              value={String(angle)}
              aria-label={angle === 0 ? 'No rotation' : `Rotate ${angle} degrees clockwise`}
              className="h-10 w-full px-2 data-[state=on]:border-blue-600 data-[state=on]:bg-blue-50 data-[state=on]:text-blue-800 dark:data-[state=on]:border-blue-500 dark:data-[state=on]:bg-blue-950/30 dark:data-[state=on]:text-blue-200"
            >
              {angle}°
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </fieldset>

      <Separator className="my-5" />

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-5">
          <Label htmlFor="flip-horizontal" className="inline-flex items-center gap-2">
            <FlipHorizontal className="h-4 w-4 text-slate-500" aria-hidden="true" />
            Flip horizontally
          </Label>
          <Switch
            id="flip-horizontal"
            checked={settings.flipHorizontal}
            onCheckedChange={(flipHorizontal) => onChange({ ...settings, flipHorizontal })}
            disabled={disabled}
          />
        </div>
        <div className="flex items-center justify-between gap-5">
          <Label htmlFor="flip-vertical" className="inline-flex items-center gap-2">
            <FlipVertical className="h-4 w-4 text-slate-500" aria-hidden="true" />
            Flip vertically
          </Label>
          <Switch
            id="flip-vertical"
            checked={settings.flipVertical}
            onCheckedChange={(flipVertical) => onChange({ ...settings, flipVertical })}
            disabled={disabled}
          />
        </div>
      </div>

      <p className="mt-5 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500 dark:border-slate-800 dark:text-slate-400">
        Output canvas:{' '}
        <span className="font-mono text-slate-700 dark:text-slate-200">
          {outputDimensions(
            'rotate',
            source,
            createResizeSettings(source.metadata),
            createCropSettings(source.metadata),
            settings,
          )}
        </span>
      </p>
    </div>
  );
}

function CropPreview({ source, crop }: { source: SourceGif; crop: CropSettings }) {
  const validation = validateCrop(crop, source.metadata);
  const x = integerFrom(crop.x);
  const y = integerFrom(crop.y);
  const width = integerFrom(crop.width);
  const height = integerFrom(crop.height);
  const valid =
    !validation.message && x !== null && y !== null && width !== null && height !== null;

  return (
    <div className="relative inline-block max-w-full overflow-hidden rounded-sm leading-none">
      <img
        src={source.url}
        alt={`Crop preview of ${source.file.name}`}
        className="block max-h-[420px] max-w-full object-contain"
      />
      {valid ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute border-2 border-blue-400 shadow-[0_0_0_9999px_rgba(2,6,23,0.62)]"
          style={{
            left: `${(x / source.metadata.width) * 100}%`,
            top: `${(y / source.metadata.height) * 100}%`,
            width: `${(width / source.metadata.width) * 100}%`,
            height: `${(height / source.metadata.height) * 100}%`,
          }}
        />
      ) : null}
    </div>
  );
}

function AnimatedPreview({
  mode,
  source,
  result,
  crop,
  rotate,
}: {
  mode: GifEditMode;
  source: SourceGif;
  result: RenderedGif | null;
  crop: CropSettings;
  rotate: RotateSettings;
}): React.ReactElement {
  const [tab, setTab] = React.useState('original');

  React.useEffect(() => {
    setTab(result ? 'result' : 'original');
  }, [result]);

  const transform =
    mode === 'rotate'
      ? `rotate(${rotate.rotation}deg) scaleX(${rotate.flipHorizontal ? -1 : 1}) scaleY(${rotate.flipVertical ? -1 : 1})`
      : undefined;

  return (
    <Tabs value={tab} onValueChange={setTab} className="flex min-h-[430px] flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800 sm:px-5">
        <TabsList className="h-9 bg-slate-100 p-1 dark:bg-slate-900">
          <TabsTrigger value="original" className="h-7 px-3 text-xs">
            {mode === 'crop' ? 'Crop frame' : 'Preview'}
          </TabsTrigger>
          <TabsTrigger value="result" disabled={!result} className="h-7 px-3 text-xs">
            Result
          </TabsTrigger>
        </TabsList>
        <span className="hidden text-xs text-slate-400 sm:inline">
          {mode === 'rotate' ? 'Live orientation preview' : 'Animated preview'}
        </span>
      </div>

      <TabsContent
        value="original"
        className="gif-checkerboard m-0 flex min-h-[370px] flex-1 items-center justify-center overflow-hidden p-5 sm:p-7"
      >
        {mode === 'crop' ? (
          <CropPreview source={source} crop={crop} />
        ) : (
          <img
            src={source.url}
            alt={`${mode === 'rotate' ? 'Orientation' : 'Original'} preview of ${source.file.name}`}
            className="max-h-[380px] max-w-full object-contain transition-transform duration-200 motion-reduce:transition-none"
            style={{ transform }}
          />
        )}
      </TabsContent>

      <TabsContent
        value="result"
        className="gif-checkerboard m-0 flex min-h-[370px] flex-1 items-center justify-center p-5 sm:p-7"
      >
        {result ? (
          <img
            src={result.url}
            alt={`Edited result preview of ${source.file.name}`}
            className="max-h-[420px] max-w-full object-contain"
          />
        ) : null}
      </TabsContent>
    </Tabs>
  );
}

export function GifEditTool({ mode }: { mode: GifEditMode }): React.ReactElement {
  const details = TOOL_DETAILS[mode];
  const { Icon } = details;
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const resultHeadingRef = React.useRef<HTMLHeadingElement>(null);
  const errorRef = React.useRef<HTMLDivElement>(null);
  const [source, setSource] = React.useState<SourceGif | null>(null);
  const [result, setResult] = React.useState<RenderedGif | null>(null);
  const [phase, setPhase] = React.useState<ToolPhase>('idle');
  const [dragActive, setDragActive] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [progress, setProgress] = React.useState<GifEditProgress>({ value: 0, message: '' });
  const [resize, setResize] = React.useState<ResizeSettings>({
    width: '1',
    height: '1',
    lockAspect: true,
  });
  const [crop, setCrop] = React.useState<CropSettings>({
    x: '0',
    y: '0',
    width: '1',
    height: '1',
    preset: 'full',
  });
  const [rotate, setRotate] = React.useState<RotateSettings>({
    rotation: 0,
    flipHorizontal: false,
    flipVertical: false,
  });

  React.useEffect(() => {
    return () => {
      if (source) URL.revokeObjectURL(source.url);
    };
  }, [source]);

  React.useEffect(() => {
    return () => {
      if (result) URL.revokeObjectURL(result.url);
    };
  }, [result]);

  React.useEffect(() => {
    if (phase === 'success') resultHeadingRef.current?.focus();
    if (phase === 'error') errorRef.current?.focus();
  }, [phase]);

  const busy = phase === 'analyzing' || phase === 'processing';
  const validation = source
    ? mode === 'resize'
      ? validateResize(resize)
      : mode === 'crop'
        ? validateCrop(crop, source.metadata)
        : {
            fields: {},
            message:
              rotate.rotation === 0 && !rotate.flipHorizontal && !rotate.flipVertical
                ? 'Choose a rotation or turn on at least one flip.'
                : '',
          }
    : { fields: {}, message: '' };

  const clearResult = React.useCallback(() => setResult(null), []);

  const invalidateResult = React.useCallback(() => {
    clearResult();
    setErrorMessage('');
    if (source) setPhase('ready');
  }, [clearResult, source]);

  const handleFile = React.useCallback(
    async (file: File) => {
      clearResult();
      setErrorMessage('');
      setPhase('analyzing');

      try {
        if (!file.name.toLowerCase().endsWith('.gif') && file.type !== 'image/gif') {
          throw new Error(
            'Choose a .gif file. Other image and video formats are not accepted here.',
          );
        }
        if (file.size < 1) throw new Error('This file is empty.');
        if (file.size > MAX_GIF_BYTES) {
          throw new Error('This GIF is larger than 50 MB. Choose a smaller source file.');
        }

        const metadata = parseGifMetadata(await file.arrayBuffer());
        const url = URL.createObjectURL(file);
        setSource({ file, url, metadata });
        setResize(createResizeSettings(metadata));
        setCrop(createCropSettings(metadata));
        setRotate({ rotation: 0, flipHorizontal: false, flipVertical: false });
        setPhase('ready');
      } catch (error) {
        setSource(null);
        setErrorMessage(error instanceof Error ? error.message : 'The GIF could not be analyzed.');
        setPhase('error');
      }
    },
    [clearResult],
  );

  const openFilePicker = React.useCallback(() => {
    if (!fileInputRef.current) return;
    fileInputRef.current.value = '';
    fileInputRef.current.click();
  }, []);

  const loadExample = React.useCallback(async () => {
    setErrorMessage('');
    setPhase('analyzing');
    try {
      const response = await fetch('/example.gif');
      if (!response.ok) throw new Error('The sample GIF is temporarily unavailable.');
      const blob = await response.blob();
      await handleFile(new File([blob], 'sample-animation.gif', { type: 'image/gif' }));
    } catch (error) {
      setSource(null);
      setErrorMessage(
        error instanceof Error ? error.message : 'The sample GIF could not be loaded.',
      );
      setPhase('error');
    }
  }, [handleFile]);

  const buildOperation = React.useCallback((): GifEditOperation => {
    if (!source) throw new Error('Choose a GIF first.');

    if (mode === 'resize') {
      return {
        type: 'resize',
        width: integerFrom(resize.width) as number,
        height: integerFrom(resize.height) as number,
      };
    }

    if (mode === 'crop') {
      return {
        type: 'crop',
        x: integerFrom(crop.x) as number,
        y: integerFrom(crop.y) as number,
        width: integerFrom(crop.width) as number,
        height: integerFrom(crop.height) as number,
      };
    }

    return { type: 'rotate', ...rotate };
  }, [crop, mode, resize, rotate, source]);

  const processGif = React.useCallback(async () => {
    if (!source || validation.message) return;

    clearResult();
    setErrorMessage('');
    setPhase('processing');
    setProgress({ value: 2, message: 'Loading the private browser engine…' });

    try {
      const { editGif } = await import('@/lib/gif-edit-engine');
      const nextResult = await editGif({
        file: source.file,
        metadata: source.metadata,
        operation: buildOperation(),
        onProgress: setProgress,
      });
      setResult({ ...nextResult, url: URL.createObjectURL(nextResult.blob) });
      setPhase('success');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'The browser could not finish this GIF edit.',
      );
      setPhase('error');
    }
  }, [buildOperation, clearResult, source, validation.message]);

  const reset = React.useCallback(() => {
    clearResult();
    setSource(null);
    setErrorMessage('');
    setProgress({ value: 0, message: '' });
    setPhase('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [clearResult]);

  const outputLabel = source ? outputDimensions(mode, source, resize, crop, rotate) : '';
  const downloadName = source
    ? `${source.file.name.replace(/\.gif$/i, '')}-${mode === 'rotate' ? 'rotated' : mode === 'crop' ? 'cropped' : 'resized'}.gif`
    : `edited-${mode}.gif`;
  const statusText =
    phase === 'success'
      ? `${details.action} complete. The result is ready to download.`
      : phase === 'error'
        ? errorMessage
        : busy
          ? progress.message || 'Analyzing GIF…'
          : '';

  return (
    <section
      aria-labelledby={`${mode}-tool-title`}
      aria-busy={busy}
      className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/20"
    >
      <h2 id={`${mode}-tool-title`} className="sr-only">
        {details.title}
      </h2>
      <input
        ref={fileInputRef}
        id={`${mode}-gif-file-input`}
        type="file"
        accept="image/gif,.gif"
        className="sr-only"
        tabIndex={-1}
        aria-label="Choose a GIF file"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {statusText}
      </p>

      {!source ? (
        <div
          className={cn(
            'flex min-h-[500px] items-center justify-center px-5 py-14 transition-colors sm:px-10',
            dragActive && 'bg-blue-50 dark:bg-blue-950/20',
          )}
          onDragEnter={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => {
            if (event.currentTarget === event.target) setDragActive(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragActive(false);
            const file = event.dataTransfer.files?.[0];
            if (file) void handleFile(file);
          }}
        >
          <div className="w-full max-w-lg text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-blue-400">
              {phase === 'analyzing' ? (
                <LoaderCircle className="h-6 w-6 animate-spin" aria-hidden="true" />
              ) : (
                <Upload className="h-6 w-6" aria-hidden="true" />
              )}
            </div>
            <h3 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
              {details.uploadTitle}
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
              {details.uploadText}
            </p>

            <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Button
                type="button"
                size="lg"
                className="h-12 bg-blue-600 px-6 text-white hover:bg-blue-500"
                onClick={openFilePicker}
                disabled={phase === 'analyzing'}
              >
                <FileImage className="mr-2 h-4 w-4" aria-hidden="true" />
                Choose GIF
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="h-12"
                onClick={() => void loadExample()}
                disabled={phase === 'analyzing'}
              >
                Try example
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
                Processed in your browser
              </span>
              <span>GIF only</span>
              <span>Up to 50 MB</span>
            </div>

            {phase === 'error' && errorMessage ? (
              <Alert ref={errorRef} tabIndex={-1} variant="destructive" className="mt-7 text-left">
                <TriangleAlert className="h-4 w-4" aria-hidden="true" />
                <AlertTitle>Could not open that GIF</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          <header className="flex min-w-0 items-center justify-between gap-4 border-b border-slate-200 px-4 py-3 dark:border-slate-800 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                <FileImage className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-950 dark:text-white">
                  {source.file.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatBytes(source.file.size)} · {source.metadata.frameCount} frames
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0"
              onClick={openFilePicker}
              disabled={busy}
            >
              <RotateCcw className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
              New GIF
            </Button>
          </header>

          <div className="grid min-w-0 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0 border-b border-slate-200 dark:border-slate-800 lg:border-b-0 lg:border-r">
              <AnimatedPreview
                mode={mode}
                source={source}
                result={result}
                crop={crop}
                rotate={rotate}
              />
            </div>

            <aside className="min-w-0 p-5 sm:p-6">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {details.title}
              </div>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
                Set the result
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {details.readyText}
              </p>

              <div className="mt-6">
                {mode === 'resize' ? (
                  <ResizeControls
                    metadata={source.metadata}
                    settings={resize}
                    errors={validation.fields}
                    disabled={busy}
                    onChange={(next) => {
                      invalidateResult();
                      setResize(next);
                    }}
                  />
                ) : mode === 'crop' ? (
                  <CropControls
                    metadata={source.metadata}
                    settings={crop}
                    errors={validation.fields}
                    disabled={busy}
                    onChange={(next) => {
                      invalidateResult();
                      setCrop(next);
                    }}
                  />
                ) : (
                  <RotateControls
                    source={source}
                    settings={rotate}
                    disabled={busy}
                    onChange={(next) => {
                      invalidateResult();
                      setRotate(next);
                    }}
                  />
                )}
              </div>

              <div className="mt-6">
                <FileFacts source={source} />
              </div>

              {busy ? (
                <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-900/60 dark:bg-blue-950/20">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="inline-flex min-w-0 items-center gap-2 font-medium text-blue-950 dark:text-blue-100">
                      <LoaderCircle className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
                      <span className="truncate">{progress.message || 'Analyzing GIF…'}</span>
                    </span>
                    <span className="font-mono text-xs text-blue-700 dark:text-blue-300">
                      {Math.round(progress.value)}%
                    </span>
                  </div>
                  <Progress value={progress.value} className="mt-3 h-1.5" />
                  <p className="mt-3 text-xs leading-5 text-blue-800/80 dark:text-blue-200/70">
                    Keep this tab open. Every frame is rendered locally.
                  </p>
                </div>
              ) : null}

              {phase === 'error' && errorMessage ? (
                <Alert ref={errorRef} tabIndex={-1} variant="destructive" className="mt-4">
                  <TriangleAlert className="h-4 w-4" aria-hidden="true" />
                  <AlertTitle>Editing stopped</AlertTitle>
                  <AlertDescription>
                    {errorMessage}
                    <Button
                      type="button"
                      variant="link"
                      className="mt-2 h-auto p-0 text-red-800 dark:text-red-200"
                      onClick={() => void processGif()}
                    >
                      Try again
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : null}

              {phase === 'success' && result ? (
                <Alert className="mt-4 border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-100">
                  <Check
                    className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
                    aria-hidden="true"
                  />
                  <AlertTitle>GIF ready</AlertTitle>
                  <AlertDescription>
                    {result.metadata.width} × {result.metadata.height} px ·{' '}
                    {formatBytes(result.blob.size)}
                  </AlertDescription>
                </Alert>
              ) : null}

              {validation.message && !busy ? (
                <p className="mt-4 text-xs leading-5 text-amber-700 dark:text-amber-300">
                  {validation.message}
                </p>
              ) : null}

              {result ? (
                <div className="mt-5 grid gap-2">
                  <Button
                    asChild
                    size="lg"
                    className="h-12 w-full bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                  >
                    <a href={result.url} download={downloadName}>
                      <ArrowDownToLine className="mr-2 h-4 w-4" aria-hidden="true" />
                      Download {formatBytes(result.blob.size)}
                    </a>
                  </Button>
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    className="h-11 w-full"
                    onClick={() => void processGif()}
                    disabled={busy || Boolean(validation.message)}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                    Render again
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  size="lg"
                  className="mt-5 h-12 w-full bg-blue-600 text-white hover:bg-blue-500"
                  onClick={() => void processGif()}
                  disabled={busy || Boolean(validation.message)}
                  aria-describedby={validation.message ? `${mode}-action-blocker` : undefined}
                >
                  {busy ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      Rendering…
                    </>
                  ) : (
                    <>
                      <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
                      {details.action} to {outputLabel}
                    </>
                  )}
                </Button>
              )}
              {validation.message ? (
                <span id={`${mode}-action-blocker`} className="sr-only">
                  {validation.message}
                </span>
              ) : null}
            </aside>
          </div>

          {result ? (
            <section className="border-t border-slate-200 px-4 py-5 dark:border-slate-800 sm:px-6">
              <h3
                ref={resultHeadingRef}
                tabIndex={-1}
                className="text-lg font-semibold tracking-tight text-slate-950 outline-none dark:text-white"
              >
                Your edited GIF is ready
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                The complete animation was rendered at {result.metadata.width} ×{' '}
                {result.metadata.height} px. Download it above or adjust the controls and render
                again.
              </p>
            </section>
          ) : null}

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:px-6">
            <span className="inline-flex items-center gap-1.5">
              <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
              Source stays in this browser
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={reset}
              disabled={busy}
            >
              <X className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Clear
            </Button>
          </footer>
        </>
      )}
    </section>
  );
}
