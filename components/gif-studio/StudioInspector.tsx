'use client';

import * as React from 'react';
import {
  AlignCenter,
  ArrowLeftRight,
  Blend,
  Captions,
  CircleDot,
  CopyPlus,
  Crop,
  EyeOff,
  Focus,
  ImagePlus,
  MousePointer2,
  RotateCcw,
  RotateCw,
  ScanEye,
  Sparkles,
  Trash2,
  Video,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  createOverlay,
  defaultFrameFilter,
  defaultFrameTransform,
  getProjectDuration,
  setSelectedFrameDuration,
  touchProject,
  updateSelectedFrames,
} from '@/components/gif-studio/model';
import type {
  StudioFrame,
  StudioOverlay,
  StudioOverlayKind,
  StudioProject,
  StudioTool,
} from '@/components/gif-studio/types';

interface StudioInspectorProps {
  project: StudioProject;
  activeTool: StudioTool;
  selectedFrameIds: Set<string>;
  selectedOverlayId: string | null;
  onProjectChange: (project: StudioProject) => void;
  onOverlaySelect: (id: string | null) => void;
  onReverse: () => void;
  onPingPong: () => void;
  onCrossfade: (cleanLoop?: boolean) => void;
  onRemoveDuplicates: () => void;
  onTrimToSelection: () => void;
  onRecordScreen: () => void;
  onImportMedia: () => void;
}

function InspectorSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-slate-800 px-4 py-5 last:border-b-0">
      <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
      {description ? <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p> : null}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function NumberControl({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  suffix,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-slate-400">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type="number"
          value={Number.isFinite(value) ? value : 0}
          min={min}
          max={max}
          step={step}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-9 border-slate-700 bg-slate-900 pr-10 text-sm text-slate-100"
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function RangeControl({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = '',
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="tabular-nums text-slate-300">
          {value}
          {suffix}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([next]) => onChange(next)}
        aria-label={label}
      />
    </div>
  );
}

function EmptySelection({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-slate-700 px-3 py-4 text-center text-xs leading-5 text-slate-500">
      {children}
    </div>
  );
}

function getSelectedFrames(project: StudioProject, selectedIds: Set<string>): StudioFrame[] {
  return project.frames.filter((frame) => selectedIds.has(frame.id));
}

function OverlayList({
  overlays,
  selectedId,
  onSelect,
}: {
  overlays: StudioOverlay[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (overlays.length === 0) return null;
  return (
    <div className="divide-y divide-slate-800 border-y border-slate-800">
      {overlays.map((overlay) => (
        <button
          type="button"
          key={overlay.id}
          onClick={() => onSelect(overlay.id)}
          className={cn(
            'flex min-h-10 w-full items-center justify-between px-1 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-400',
            selectedId === overlay.id ? 'text-sky-300' : 'text-slate-400 hover:text-slate-100',
          )}
        >
          <span className="truncate">{overlay.name}</span>
          <span className="ml-3 text-[10px] tabular-nums text-slate-600">
            {(overlay.startMs / 1000).toFixed(1)}–{(overlay.endMs / 1000).toFixed(1)}s
          </span>
        </button>
      ))}
    </div>
  );
}

export function StudioInspector({
  project,
  activeTool,
  selectedFrameIds,
  selectedOverlayId,
  onProjectChange,
  onOverlaySelect,
  onReverse,
  onPingPong,
  onCrossfade,
  onRemoveDuplicates,
  onTrimToSelection,
  onRecordScreen,
  onImportMedia,
}: StudioInspectorProps) {
  const selectedFrames = getSelectedFrames(project, selectedFrameIds);
  const firstFrame = selectedFrames[0] ?? null;
  const selectedOverlay = project.overlays.find((item) => item.id === selectedOverlayId) ?? null;
  const duration = getProjectDuration(project);

  const updateFrames = React.useCallback(
    (updater: (frame: StudioFrame) => StudioFrame) => {
      onProjectChange(updateSelectedFrames(project, selectedFrameIds, updater));
    },
    [onProjectChange, project, selectedFrameIds],
  );

  const addOverlay = React.useCallback(
    (kind: StudioOverlayKind, imageBlob?: Blob) => {
      const overlay = { ...createOverlay(kind, project), ...(imageBlob ? { imageBlob } : {}) };
      onProjectChange(touchProject({ ...project, overlays: [...project.overlays, overlay] }));
      onOverlaySelect(overlay.id);
    },
    [onOverlaySelect, onProjectChange, project],
  );

  const updateOverlay = React.useCallback(
    (patch: Partial<StudioOverlay>) => {
      if (!selectedOverlay) return;
      onProjectChange(
        touchProject({
          ...project,
          overlays: project.overlays.map((item) =>
            item.id === selectedOverlay.id ? { ...item, ...patch } : item,
          ),
        }),
      );
    },
    [onProjectChange, project, selectedOverlay],
  );

  const removeOverlay = React.useCallback(() => {
    if (!selectedOverlay) return;
    onProjectChange(
      touchProject({
        ...project,
        overlays: project.overlays.filter((item) => item.id !== selectedOverlay.id),
      }),
    );
    onOverlaySelect(null);
  }, [onOverlaySelect, onProjectChange, project, selectedOverlay]);

  const renderOverlayControls = () => {
    if (!selectedOverlay)
      return <EmptySelection>Select an overlay to edit its placement and timing.</EmptySelection>;
    return (
      <>
        {selectedOverlay.kind === 'text' || selectedOverlay.kind === 'callout' ? (
          <div className="space-y-1.5">
            <Label htmlFor="overlay-copy" className="text-xs text-slate-400">
              Copy
            </Label>
            <textarea
              id="overlay-copy"
              value={selectedOverlay.text}
              onChange={(event) => updateOverlay({ text: event.target.value })}
              rows={3}
              className="w-full resize-none rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            />
          </div>
        ) : null}
        <div className="grid grid-cols-2 gap-3">
          <NumberControl
            id="overlay-x"
            label="X position"
            value={selectedOverlay.x}
            min={0}
            max={100}
            suffix="%"
            onChange={(x) => updateOverlay({ x: Math.max(0, Math.min(100, x)) })}
          />
          <NumberControl
            id="overlay-y"
            label="Y position"
            value={selectedOverlay.y}
            min={0}
            max={100}
            suffix="%"
            onChange={(y) => updateOverlay({ y: Math.max(0, Math.min(100, y)) })}
          />
          <NumberControl
            id="overlay-width"
            label="Width"
            value={selectedOverlay.width}
            min={2}
            max={100}
            suffix="%"
            onChange={(width) => updateOverlay({ width: Math.max(2, Math.min(100, width)) })}
          />
          <NumberControl
            id="overlay-height"
            label="Height"
            value={selectedOverlay.height}
            min={2}
            max={100}
            suffix="%"
            onChange={(height) => updateOverlay({ height: Math.max(2, Math.min(100, height)) })}
          />
        </div>
        <RangeControl
          label="Opacity"
          value={selectedOverlay.opacity}
          min={5}
          max={100}
          suffix="%"
          onChange={(opacity) => updateOverlay({ opacity })}
        />
        <div className="grid grid-cols-2 gap-3">
          <NumberControl
            id="overlay-start"
            label="Starts"
            value={selectedOverlay.startMs}
            min={0}
            max={duration}
            step={20}
            suffix="ms"
            onChange={(startMs) =>
              updateOverlay({ startMs: Math.max(0, Math.min(startMs, selectedOverlay.endMs - 20)) })
            }
          />
          <NumberControl
            id="overlay-end"
            label="Ends"
            value={selectedOverlay.endMs}
            min={20}
            max={duration}
            step={20}
            suffix="ms"
            onChange={(endMs) =>
              updateOverlay({
                endMs: Math.min(duration, Math.max(endMs, selectedOverlay.startMs + 20)),
              })
            }
          />
        </div>
        {selectedOverlay.kind === 'text' || selectedOverlay.kind === 'callout' ? (
          <>
            <RangeControl
              label="Font size"
              value={selectedOverlay.fontSize}
              min={12}
              max={180}
              suffix="px"
              onChange={(fontSize) => updateOverlay({ fontSize })}
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="overlay-color" className="text-xs text-slate-400">
                  Text
                </Label>
                <Input
                  id="overlay-color"
                  type="color"
                  value={selectedOverlay.color.slice(0, 7)}
                  onChange={(event) => updateOverlay({ color: event.target.value })}
                  className="h-9 border-slate-700 bg-slate-900 p-1"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="overlay-background" className="text-xs text-slate-400">
                  Background
                </Label>
                <Input
                  id="overlay-background"
                  type="color"
                  value={selectedOverlay.background.slice(0, 7)}
                  onChange={(event) => updateOverlay({ background: event.target.value })}
                  className="h-9 border-slate-700 bg-slate-900 p-1"
                />
              </div>
            </div>
          </>
        ) : null}
        {selectedOverlay.kind === 'blur' || selectedOverlay.kind === 'pixelate' ? (
          <RangeControl
            label={selectedOverlay.kind === 'blur' ? 'Blur strength' : 'Pixel size'}
            value={selectedOverlay.strength}
            min={2}
            max={40}
            onChange={(strength) => updateOverlay({ strength })}
          />
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={removeOverlay}
          className="w-full justify-start text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
          Remove overlay
        </Button>
      </>
    );
  };

  return (
    <aside className="h-full min-h-0 border-l border-slate-800 bg-slate-950 text-slate-100">
      <ScrollArea className="h-full">
        {activeTool === 'select' ? (
          <>
            <InspectorSection
              title="Selection"
              description="Select one or more frames in the timeline. Shift-click selects a range; Ctrl/Cmd-click toggles frames."
            >
              <p className="text-sm text-slate-300">
                {selectedFrames.length === 0
                  ? 'No frames selected'
                  : `${selectedFrames.length} of ${project.frames.length} frames selected`}
              </p>
              <p className="text-xs leading-5 text-slate-500">
                Choose a tool on the left. Edits apply only to the selected frames unless the
                control says otherwise.
              </p>
            </InspectorSection>
            <InspectorSection title="Canvas">
              <div className="grid grid-cols-2 gap-3">
                <NumberControl
                  id="canvas-width"
                  label="Width"
                  value={project.canvas.width}
                  min={16}
                  max={4096}
                  suffix="px"
                  onChange={(width) =>
                    onProjectChange(
                      touchProject({
                        ...project,
                        canvas: {
                          ...project.canvas,
                          width: Math.max(16, Math.min(4096, Math.round(width))),
                        },
                      }),
                    )
                  }
                />
                <NumberControl
                  id="canvas-height"
                  label="Height"
                  value={project.canvas.height}
                  min={16}
                  max={4096}
                  suffix="px"
                  onChange={(height) =>
                    onProjectChange(
                      touchProject({
                        ...project,
                        canvas: {
                          ...project.canvas,
                          height: Math.max(16, Math.min(4096, Math.round(height))),
                        },
                      }),
                    )
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-400">Fit</Label>
                <Select
                  value={project.canvas.fit}
                  onValueChange={(fit: StudioProject['canvas']['fit']) =>
                    onProjectChange(
                      touchProject({ ...project, canvas: { ...project.canvas, fit } }),
                    )
                  }
                >
                  <SelectTrigger className="h-9 border-slate-700 bg-slate-900 text-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contain">Fit inside</SelectItem>
                    <SelectItem value="cover">Fill canvas</SelectItem>
                    <SelectItem value="stretch">Stretch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </InspectorSection>
          </>
        ) : null}

        {activeTool === 'transform' ? (
          <InspectorSection
            title="Transform frames"
            description="Crop, rotate, flip, zoom, and pan the selected frames."
          >
            {!firstFrame ? (
              <EmptySelection>Select at least one frame in the timeline.</EmptySelection>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <NumberControl
                    id="crop-x"
                    label="Crop X"
                    value={firstFrame.transform.cropX}
                    min={0}
                    max={99}
                    suffix="%"
                    onChange={(cropX) =>
                      updateFrames((frame) => ({
                        ...frame,
                        transform: {
                          ...frame.transform,
                          cropX: Math.min(cropX, 100 - frame.transform.cropWidth),
                        },
                      }))
                    }
                  />
                  <NumberControl
                    id="crop-y"
                    label="Crop Y"
                    value={firstFrame.transform.cropY}
                    min={0}
                    max={99}
                    suffix="%"
                    onChange={(cropY) =>
                      updateFrames((frame) => ({
                        ...frame,
                        transform: {
                          ...frame.transform,
                          cropY: Math.min(cropY, 100 - frame.transform.cropHeight),
                        },
                      }))
                    }
                  />
                  <NumberControl
                    id="crop-width"
                    label="Crop width"
                    value={firstFrame.transform.cropWidth}
                    min={1}
                    max={100}
                    suffix="%"
                    onChange={(cropWidth) =>
                      updateFrames((frame) => ({
                        ...frame,
                        transform: {
                          ...frame.transform,
                          cropWidth: Math.min(cropWidth, 100 - frame.transform.cropX),
                        },
                      }))
                    }
                  />
                  <NumberControl
                    id="crop-height"
                    label="Crop height"
                    value={firstFrame.transform.cropHeight}
                    min={1}
                    max={100}
                    suffix="%"
                    onChange={(cropHeight) =>
                      updateFrames((frame) => ({
                        ...frame,
                        transform: {
                          ...frame.transform,
                          cropHeight: Math.min(cropHeight, 100 - frame.transform.cropY),
                        },
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 90, 180, 270].map((rotation) => (
                    <Button
                      key={rotation}
                      type="button"
                      size="sm"
                      variant={firstFrame.transform.rotation === rotation ? 'secondary' : 'outline'}
                      onClick={() =>
                        updateFrames((frame) => ({
                          ...frame,
                          transform: {
                            ...frame.transform,
                            rotation: rotation as 0 | 90 | 180 | 270,
                          },
                        }))
                      }
                      className="border-slate-700 px-2"
                    >
                      {rotation}°
                    </Button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={firstFrame.transform.flipHorizontal ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() =>
                      updateFrames((frame) => ({
                        ...frame,
                        transform: {
                          ...frame.transform,
                          flipHorizontal: !frame.transform.flipHorizontal,
                        },
                      }))
                    }
                    className="border-slate-700"
                  >
                    <ArrowLeftRight className="mr-2 h-4 w-4" /> Flip X
                  </Button>
                  <Button
                    type="button"
                    variant={firstFrame.transform.flipVertical ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() =>
                      updateFrames((frame) => ({
                        ...frame,
                        transform: {
                          ...frame.transform,
                          flipVertical: !frame.transform.flipVertical,
                        },
                      }))
                    }
                    className="border-slate-700"
                  >
                    <ArrowLeftRight className="mr-2 h-4 w-4 rotate-90" /> Flip Y
                  </Button>
                </div>
                <RangeControl
                  label="Zoom"
                  value={Math.round(firstFrame.transform.zoom * 100)}
                  min={50}
                  max={300}
                  suffix="%"
                  onChange={(zoom) =>
                    updateFrames((frame) => ({
                      ...frame,
                      transform: { ...frame.transform, zoom: zoom / 100 },
                    }))
                  }
                />
                <div className="grid grid-cols-2 gap-3">
                  <NumberControl
                    id="pan-x"
                    label="Pan X"
                    value={firstFrame.transform.panX}
                    min={-100}
                    max={100}
                    suffix="%"
                    onChange={(panX) =>
                      updateFrames((frame) => ({
                        ...frame,
                        transform: { ...frame.transform, panX },
                      }))
                    }
                  />
                  <NumberControl
                    id="pan-y"
                    label="Pan Y"
                    value={firstFrame.transform.panY}
                    min={-100}
                    max={100}
                    suffix="%"
                    onChange={(panY) =>
                      updateFrames((frame) => ({
                        ...frame,
                        transform: { ...frame.transform, panY },
                      }))
                    }
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    updateFrames((frame) => ({ ...frame, transform: defaultFrameTransform() }))
                  }
                  className="w-full justify-start text-slate-400"
                >
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset transform
                </Button>
              </>
            )}
          </InspectorSection>
        ) : null}

        {activeTool === 'text' ? (
          <>
            <InspectorSection
              title="Timed captions"
              description="Captions are visible only inside their start and end time."
            >
              <Button
                type="button"
                onClick={() => addOverlay('text')}
                className="w-full bg-sky-500 text-slate-950 hover:bg-sky-400"
              >
                <Captions className="mr-2 h-4 w-4" /> Add caption
              </Button>
              <OverlayList
                overlays={project.overlays.filter((item) => item.kind === 'text')}
                selectedId={selectedOverlayId}
                onSelect={onOverlaySelect}
              />
            </InspectorSection>
            <InspectorSection title="Caption settings">{renderOverlayControls()}</InspectorSection>
          </>
        ) : null}

        {activeTool === 'redact' ? (
          <>
            <InspectorSection
              title="Redaction"
              description="Blur or pixelate a region for a precise time range. The pixels are baked into exports."
            >
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addOverlay('blur')}
                  className="border-slate-700"
                >
                  <EyeOff className="mr-2 h-4 w-4" /> Blur
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addOverlay('pixelate')}
                  className="border-slate-700"
                >
                  <ScanEye className="mr-2 h-4 w-4" /> Pixelate
                </Button>
              </div>
              <OverlayList
                overlays={project.overlays.filter(
                  (item) => item.kind === 'blur' || item.kind === 'pixelate',
                )}
                selectedId={selectedOverlayId}
                onSelect={onOverlaySelect}
              />
            </InspectorSection>
            <InspectorSection title="Redaction settings">
              {renderOverlayControls()}
            </InspectorSection>
          </>
        ) : null}

        {activeTool === 'annotate' ? (
          <>
            <InspectorSection
              title="Annotations"
              description="Place manual highlights where viewers should look. Click or drag on the canvas to reposition the active item."
            >
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addOverlay('spotlight')}
                  className="h-16 flex-col border-slate-700 px-1 text-[10px]"
                >
                  <Focus className="mb-1 h-4 w-4" /> Spotlight
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addOverlay('callout')}
                  className="h-16 flex-col border-slate-700 px-1 text-[10px]"
                >
                  <CircleDot className="mb-1 h-4 w-4" /> Callout
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addOverlay('cursor')}
                  className="h-16 flex-col border-slate-700 px-1 text-[10px]"
                >
                  <MousePointer2 className="mb-1 h-4 w-4" /> Cursor
                </Button>
              </div>
              <label className="flex min-h-10 cursor-pointer items-center justify-center rounded-md border border-slate-700 px-3 text-xs text-slate-300 transition focus-within:ring-2 focus-within:ring-sky-400 hover:bg-slate-900">
                <ImagePlus className="mr-2 h-4 w-4" /> Add logo watermark
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) addOverlay('watermark', file);
                    event.currentTarget.value = '';
                  }}
                />
              </label>
              <OverlayList
                overlays={project.overlays.filter((item) =>
                  ['spotlight', 'callout', 'cursor', 'watermark'].includes(item.kind),
                )}
                selectedId={selectedOverlayId}
                onSelect={onOverlaySelect}
              />
            </InspectorSection>
            <InspectorSection title="Annotation settings">
              {renderOverlayControls()}
            </InspectorSection>
          </>
        ) : null}

        {activeTool === 'effects' ? (
          <InspectorSection
            title="Frame effects"
            description="Effects apply to every selected frame and are rendered into every export."
          >
            {!firstFrame ? (
              <EmptySelection>Select at least one frame in the timeline.</EmptySelection>
            ) : (
              <>
                <RangeControl
                  label="Brightness"
                  value={firstFrame.filter.brightness}
                  min={0}
                  max={200}
                  suffix="%"
                  onChange={(brightness) =>
                    updateFrames((frame) => ({ ...frame, filter: { ...frame.filter, brightness } }))
                  }
                />
                <RangeControl
                  label="Contrast"
                  value={firstFrame.filter.contrast}
                  min={0}
                  max={200}
                  suffix="%"
                  onChange={(contrast) =>
                    updateFrames((frame) => ({ ...frame, filter: { ...frame.filter, contrast } }))
                  }
                />
                <RangeControl
                  label="Saturation"
                  value={firstFrame.filter.saturation}
                  min={0}
                  max={200}
                  suffix="%"
                  onChange={(saturation) =>
                    updateFrames((frame) => ({ ...frame, filter: { ...frame.filter, saturation } }))
                  }
                />
                <RangeControl
                  label="Blur"
                  value={firstFrame.filter.blur}
                  min={0}
                  max={24}
                  suffix="px"
                  onChange={(blur) =>
                    updateFrames((frame) => ({ ...frame, filter: { ...frame.filter, blur } }))
                  }
                />
                <RangeControl
                  label="Grayscale"
                  value={firstFrame.filter.grayscale}
                  min={0}
                  max={100}
                  suffix="%"
                  onChange={(grayscale) =>
                    updateFrames((frame) => ({ ...frame, filter: { ...frame.filter, grayscale } }))
                  }
                />
                <RangeControl
                  label="Sepia"
                  value={firstFrame.filter.sepia}
                  min={0}
                  max={100}
                  suffix="%"
                  onChange={(sepia) =>
                    updateFrames((frame) => ({ ...frame, filter: { ...frame.filter, sepia } }))
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    updateFrames((frame) => ({ ...frame, filter: defaultFrameFilter() }))
                  }
                  className="w-full justify-start text-slate-400"
                >
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset effects
                </Button>
              </>
            )}
          </InspectorSection>
        ) : null}

        {activeTool === 'timing' ? (
          <>
            <InspectorSection
              title="Frame timing"
              description="Use real per-frame durations. Selected frames can hold longer without duplicating the entire animation."
            >
              {!firstFrame ? (
                <EmptySelection>Select one or more frames.</EmptySelection>
              ) : (
                <>
                  <NumberControl
                    id="frame-duration"
                    label="Selected duration"
                    value={firstFrame.durationMs}
                    min={20}
                    max={60_000}
                    step={10}
                    suffix="ms"
                    onChange={(value) =>
                      onProjectChange(setSelectedFrameDuration(project, selectedFrameIds, value))
                    }
                  />
                  <div className="grid grid-cols-3 gap-2">
                    {[100, 250, 500].map((hold) => (
                      <Button
                        key={hold}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          onProjectChange(
                            setSelectedFrameDuration(
                              project,
                              selectedFrameIds,
                              firstFrame.durationMs + hold,
                            ),
                          )
                        }
                        className="border-slate-700 px-1 text-xs"
                      >
                        +{hold}ms
                      </Button>
                    ))}
                  </div>
                </>
              )}
            </InspectorSection>
            <InspectorSection title="Sequence">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onReverse}
                  className="border-slate-700"
                >
                  <RotateCcw className="mr-2 h-4 w-4" /> Reverse
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onPingPong}
                  className="border-slate-700"
                >
                  <RotateCw className="mr-2 h-4 w-4" /> Ping-pong
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onCrossfade(false)}
                  className="border-slate-700"
                >
                  <Blend className="mr-2 h-4 w-4" /> Crossfade
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onCrossfade(true)}
                  className="border-slate-700"
                >
                  <Sparkles className="mr-2 h-4 w-4" /> Clean loop
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={onRemoveDuplicates}
                className="w-full border-slate-700"
              >
                <CopyPlus className="mr-2 h-4 w-4" /> Remove idle duplicates
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onTrimToSelection}
                disabled={
                  selectedFrameIds.size === 0 || selectedFrameIds.size === project.frames.length
                }
                className="w-full border-slate-700"
              >
                <Crop className="mr-2 h-4 w-4" /> Trim to selected frames
              </Button>
            </InspectorSection>
          </>
        ) : null}

        {activeTool === 'demo' ? (
          <>
            <InspectorSection
              title="Demo Studio"
              description="Record or import a short product demo, then refine it with the same timeline and export pipeline."
            >
              <Button
                type="button"
                onClick={onRecordScreen}
                className="w-full bg-red-500 text-white hover:bg-red-400"
              >
                <Video className="mr-2 h-4 w-4" /> Record screen
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onImportMedia}
                className="w-full border-slate-700"
              >
                Import recording or video
              </Button>
            </InspectorSection>
            <InspectorSection
              title="Clean the story"
              description="Select the useful frame range first, then trim or remove visually unchanged frames."
            >
              <Button
                type="button"
                variant="outline"
                onClick={onTrimToSelection}
                disabled={
                  selectedFrameIds.size === 0 || selectedFrameIds.size === project.frames.length
                }
                className="w-full border-slate-700"
              >
                Trim to selected range
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onRemoveDuplicates}
                className="w-full border-slate-700"
              >
                Remove idle duplicates
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onCrossfade(true)}
                className="w-full border-slate-700"
              >
                Build clean loop
              </Button>
            </InspectorSection>
            <InspectorSection
              title="Guide attention"
              description="Browser security prevents automatic click tracking in other apps. Add honest post-edit highlights instead."
            >
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addOverlay('cursor')}
                  className="h-16 flex-col border-slate-700 px-1 text-[10px]"
                >
                  <MousePointer2 className="mb-1 h-4 w-4" /> Cursor
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addOverlay('spotlight')}
                  className="h-16 flex-col border-slate-700 px-1 text-[10px]"
                >
                  <Focus className="mb-1 h-4 w-4" /> Highlight
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addOverlay('callout')}
                  className="h-16 flex-col border-slate-700 px-1 text-[10px]"
                >
                  <CircleDot className="mb-1 h-4 w-4" /> Callout
                </Button>
              </div>
            </InspectorSection>
          </>
        ) : null}
      </ScrollArea>
    </aside>
  );
}
