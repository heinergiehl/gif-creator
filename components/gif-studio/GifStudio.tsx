'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  CloudOff,
  Download,
  FilePlus2,
  FolderOpen,
  LoaderCircle,
  Redo2,
  Save,
  Undo2,
  Upload,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { trackProductEvent } from '@/lib/product-analytics';
import { EDITOR_INTENTS, isEditorIntent, type EditorIntent } from '@/lib/editor-intents';
import {
  createCrossfadeFrames,
  importStudioMedia,
  removeDuplicateFrames,
} from '@/lib/gif-studio-engine';
import {
  clearAutosave,
  flushAutosave,
  importProjectPackage,
  loadAutosave,
  saveAutosave,
} from '@/lib/gif-studio-persistence';
import {
  createPingPong,
  deleteFrames,
  duplicateFrames,
  getFrameAtTime,
  getProjectDuration,
  reorderFrames,
  reverseFrames,
  touchProject,
} from '@/components/gif-studio/model';
import { useStudioHistory } from '@/components/gif-studio/use-studio-history';
import { StudioEmptyState } from '@/components/gif-studio/StudioEmptyState';
import { StudioExportDialog } from '@/components/gif-studio/StudioExportDialog';
import { StudioInspector } from '@/components/gif-studio/StudioInspector';
import { StudioProjectsDialog } from '@/components/gif-studio/StudioProjectsDialog';
import { StudioRecorderDialog } from '@/components/gif-studio/StudioRecorderDialog';
import { StudioStage } from '@/components/gif-studio/StudioStage';
import { StudioTimeline } from '@/components/gif-studio/StudioTimeline';
import { StudioToolRail } from '@/components/gif-studio/StudioToolRail';
import type { StudioProgress, StudioProject, StudioTool } from '@/components/gif-studio/types';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const INTENT_TOOL: Partial<Record<EditorIntent, StudioTool>> = {
  'add-text': 'text',
  crop: 'transform',
  resize: 'transform',
  rotate: 'transform',
  speed: 'timing',
  trim: 'timing',
  reverse: 'timing',
  optimize: 'select',
  export: 'select',
  'record-demo': 'demo',
  edit: 'select',
};

function isTypingTarget(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null;
  return Boolean(
    element &&
      (element.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName)),
  );
}

function SaveStatus({ state }: { state: SaveState }) {
  const config = {
    idle: { Icon: Save, label: 'Autosave ready', className: 'text-slate-500' },
    saving: { Icon: LoaderCircle, label: 'Saving locally…', className: 'text-slate-400' },
    saved: { Icon: Check, label: 'Saved locally', className: 'text-emerald-400' },
    error: { Icon: CloudOff, label: 'Autosave failed', className: 'text-red-400' },
  }[state];
  return (
    <span
      className={cn('hidden items-center gap-1.5 text-[11px] sm:flex', config.className)}
      aria-live="polite"
    >
      <config.Icon
        className={cn('h-3.5 w-3.5', state === 'saving' && 'animate-spin')}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
}

function StudioTopBar({
  project,
  embedded,
  saveState,
  canUndo,
  canRedo,
  onTitleChange,
  onUndo,
  onRedo,
  onOpenMedia,
  onOpenProjects,
  onOpenExport,
  projectsButtonRef,
  exportButtonRef,
}: {
  project: StudioProject;
  embedded: boolean;
  saveState: SaveState;
  canUndo: boolean;
  canRedo: boolean;
  onTitleChange: (title: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onOpenMedia: () => void;
  onOpenProjects: () => void;
  onOpenExport: () => void;
  projectsButtonRef: React.Ref<HTMLButtonElement>;
  exportButtonRef: React.Ref<HTMLButtonElement>;
}) {
  const Heading = embedded ? 'h2' : 'h1';

  return (
    <TooltipProvider delayDuration={350}>
      <header className="flex h-[52px] shrink-0 items-center gap-2 border-b border-slate-800 bg-slate-950 px-2 text-slate-100 sm:px-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button asChild size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-slate-400">
              <Link href="/edit-gifs" aria-label="Back to GIF editor page">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Back to GIF editor page</TooltipContent>
        </Tooltip>
        <Heading className="sr-only text-xs font-semibold uppercase tracking-[0.18em] text-sky-300 md:not-sr-only md:inline">
          GIF Studio
        </Heading>
        <span className="hidden h-4 w-px bg-slate-800 md:block" aria-hidden="true" />
        <Input
          value={project.title}
          onChange={(event) => onTitleChange(event.target.value)}
          aria-label="Project name"
          className="h-8 min-w-0 max-w-[260px] border-transparent bg-transparent px-2 text-sm font-medium text-slate-200 hover:border-slate-800 focus-visible:border-slate-700 focus-visible:bg-slate-900"
        />
        <SaveStatus state={saveState} />
        <div className="min-w-0 flex-1" />
        <div className="flex items-center gap-0.5 border-r border-slate-800 pr-1 sm:pr-2">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-slate-400"
            onClick={onUndo}
            disabled={!canUndo}
            aria-label="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-slate-400"
            onClick={onRedo}
            disabled={!canRedo}
            aria-label="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 px-2 text-slate-400 sm:px-3"
          onClick={onOpenMedia}
          aria-label="Open media"
        >
          <Upload className="h-4 w-4 sm:mr-2" aria-hidden="true" />
          <span className="hidden sm:inline">Open</span>
        </Button>
        <Button
          ref={projectsButtonRef}
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 px-2 text-slate-400 sm:px-3"
          onClick={onOpenProjects}
          aria-label="Open projects"
        >
          <FolderOpen className="h-4 w-4 sm:mr-2" aria-hidden="true" />
          <span className="hidden sm:inline">Projects</span>
        </Button>
        <Button
          ref={exportButtonRef}
          type="button"
          size="sm"
          className="h-8 bg-sky-400 px-2 text-slate-950 hover:bg-sky-300 sm:px-3"
          onClick={onOpenExport}
          aria-label="Export animation"
        >
          <Download className="h-4 w-4 sm:mr-2" aria-hidden="true" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </header>
    </TooltipProvider>
  );
}

export function GifStudio({
  initialIntent,
  embedded = false,
}: {
  initialIntent?: EditorIntent;
  embedded?: boolean;
}) {
  const searchParams = useSearchParams();
  const queryIntent = searchParams.get('intent');
  const intent: EditorIntent =
    initialIntent ?? (isEditorIntent(queryIntent) ? queryIntent : EDITOR_INTENTS[0]);
  const { toast } = useToast();
  const { project, setProject, undo, redo, canUndo, canRedo, resetHistory } =
    useStudioHistory(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const projectsButtonRef = React.useRef<HTMLButtonElement>(null);
  const exportButtonRef = React.useRef<HTMLButtonElement>(null);
  const mobileToolTriggerRef = React.useRef<HTMLButtonElement | null>(null);
  const saveSequenceRef = React.useRef(0);
  const currentTimeRef = React.useRef(0);
  const editTrackedRef = React.useRef(false);
  const [activeTool, setActiveTool] = React.useState<StudioTool>(INTENT_TOOL[intent] ?? 'select');
  const [selectedFrameIds, setSelectedFrameIds] = React.useState<Set<string>>(new Set());
  const [selectedOverlayId, setSelectedOverlayId] = React.useState<string | null>(null);
  const [currentTimeMs, setCurrentTimeMs] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState<StudioProgress>({
    phase: 'empty',
    value: 0,
    message: '',
  });
  const [error, setError] = React.useState('');
  const [saveState, setSaveState] = React.useState<SaveState>('idle');
  const [exportOpen, setExportOpen] = React.useState(false);
  const [projectsOpen, setProjectsOpen] = React.useState(false);
  const [recorderOpen, setRecorderOpen] = React.useState(intent === 'record-demo');
  const [mobileInspectorOpen, setMobileInspectorOpen] = React.useState(false);
  const [recoveryCandidate, setRecoveryCandidate] = React.useState<StudioProject | null>(null);
  const [recoveryOpen, setRecoveryOpen] = React.useState(false);

  const duration = project ? getProjectDuration(project) : 0;
  const frameAtTime = project ? getFrameAtTime(project.frames, currentTimeMs) : null;
  const currentFrameIndex = frameAtTime?.index ?? 0;
  const selectedOverlay = project?.overlays.find((item) => item.id === selectedOverlayId) ?? null;
  const busy = ['importing', 'rendering'].includes(progress.phase);
  const Workspace = embedded ? 'section' : 'main';

  React.useEffect(() => {
    currentTimeRef.current = currentTimeMs;
  }, [currentTimeMs]);

  React.useEffect(() => {
    trackProductEvent('gif_editor_view', { intent, embedded });
  }, [embedded, intent]);

  React.useEffect(() => {
    let cancelled = false;
    void loadAutosave()
      .then((candidate) => {
        if (cancelled || !candidate || candidate.frames.length === 0) return;
        setRecoveryCandidate(candidate);
        setRecoveryOpen(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (!project) return;
    const sequence = ++saveSequenceRef.current;
    setSaveState('saving');
    void saveAutosave(project, { debounceMs: 700 }).then(
      () => {
        if (sequence === saveSequenceRef.current) setSaveState('saved');
      },
      () => {
        if (sequence === saveSequenceRef.current) setSaveState('error');
      },
    );
  }, [project]);

  React.useEffect(() => {
    const onPageHide = () => void flushAutosave();
    window.addEventListener('pagehide', onPageHide);
    return () => window.removeEventListener('pagehide', onPageHide);
  }, []);

  React.useEffect(() => {
    if (!project) return;
    const valid = new Set(project.frames.map((frame) => frame.id));
    setSelectedFrameIds((current) => {
      const next = new Set([...current].filter((id) => valid.has(id)));
      if (next.size === 0 && project.frames[0]) next.add(project.frames[0].id);
      return next;
    });
    if (currentTimeMs >= duration) setCurrentTimeMs(Math.max(0, duration - 1));
  }, [currentTimeMs, duration, project]);

  React.useEffect(() => {
    if (!playing || !project || duration <= 0) return;
    const baseTime = currentTimeRef.current;
    const startedAt = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      setCurrentTimeMs((baseTime + now - startedAt) % duration);
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [duration, playing, project]);

  const openProject = React.useCallback(
    (next: StudioProject) => {
      setProject(next, { record: false });
      resetHistory();
      setCurrentTimeMs(0);
      setPlaying(false);
      setSelectedFrameIds(new Set(next.frames[0] ? [next.frames[0].id] : []));
      setSelectedOverlayId(null);
      setActiveTool(INTENT_TOOL[intent] ?? 'select');
      setProgress({ phase: 'ready', value: 100, message: 'Project ready.' });
      setError('');
      editTrackedRef.current = false;
      trackProductEvent('gif_media_ready', {
        source: next.sourceKind,
        frames: next.frames.length,
      });
      if (intent === 'export') setExportOpen(true);
    },
    [intent, resetHistory, setProject],
  );

  const importFiles = React.useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      const source = files[0].name.toLowerCase().endsWith('.gifstudio')
        ? 'project'
        : files.some((file) => file.type.startsWith('video/'))
          ? 'video'
          : files.length > 1
            ? 'images'
            : files[0].type === 'image/gif'
              ? 'gif'
              : 'image';
      trackProductEvent('gif_upload_started', { source, files: files.length });
      setPlaying(false);
      setError('');
      setProgress({ phase: 'importing', value: 2, message: 'Inspecting local media…' });
      try {
        if (files[0].name.toLowerCase().endsWith('.gifstudio')) {
          openProject(await importProjectPackage(files[0]));
          return;
        }
        const next = await importStudioMedia(files, {
          fps: files.some((file) => file.type.startsWith('video/')) ? 10 : undefined,
          onProgress: setProgress,
        });
        openProject(next);
      } catch (caught) {
        setProgress({ phase: project ? 'ready' : 'empty', value: 0, message: '' });
        setError(caught instanceof Error ? caught.message : 'The media could not be opened.');
        trackProductEvent('gif_upload_failed', { source });
      }
    },
    [openProject, project],
  );

  const loadExample = React.useCallback(async () => {
    setError('');
    try {
      const response = await fetch('/example.gif');
      if (!response.ok) throw new Error('The example GIF is unavailable.');
      const blob = await response.blob();
      await importFiles([new File([blob], 'example.gif', { type: 'image/gif' })]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The example GIF could not be opened.');
    }
  }, [importFiles]);

  const changeProject = React.useCallback(
    (next: StudioProject) => {
      if (!editTrackedRef.current) {
        editTrackedRef.current = true;
        trackProductEvent('gif_edit_started', { tool: activeTool });
      }
      setProject(next);
      setProgress({ phase: 'ready', value: 100, message: 'Changes applied.' });
    },
    [activeTool, setProject],
  );

  const openExport = React.useCallback(() => {
    trackProductEvent('gif_export_opened', { frames: project?.frames.length ?? 0 });
    setExportOpen(true);
  }, [project?.frames.length]);

  const handleExportOpenChange = React.useCallback((nextOpen: boolean) => {
    setExportOpen(nextOpen);
    if (!nextOpen) window.requestAnimationFrame(() => exportButtonRef.current?.focus());
  }, []);

  const handleProjectsOpenChange = React.useCallback((nextOpen: boolean) => {
    setProjectsOpen(nextOpen);
    if (!nextOpen) window.requestAnimationFrame(() => projectsButtonRef.current?.focus());
  }, []);

  const handleMobileInspectorOpenChange = React.useCallback((nextOpen: boolean) => {
    setMobileInspectorOpen(nextOpen);
    if (!nextOpen) window.requestAnimationFrame(() => mobileToolTriggerRef.current?.focus());
  }, []);

  const newProject = React.useCallback(() => {
    setProject(null, { record: false });
    resetHistory();
    setSelectedFrameIds(new Set());
    setSelectedOverlayId(null);
    setCurrentTimeMs(0);
    setPlaying(false);
    setProgress({ phase: 'empty', value: 0, message: '' });
    setError('');
    void clearAutosave();
  }, [resetHistory, setProject]);

  const runCrossfade = React.useCallback(
    async (cleanLoop = false) => {
      if (!project || project.frames.length < 2) return;
      const selectedIndexes = project.frames
        .map((frame, index) => (selectedFrameIds.has(frame.id) ? index : -1))
        .filter((index) => index >= 0);
      const left = cleanLoop
        ? project.frames.length - 1
        : selectedIndexes.length >= 2
          ? selectedIndexes[0]
          : currentFrameIndex;
      const right = cleanLoop
        ? 0
        : selectedIndexes.length >= 2
          ? selectedIndexes[selectedIndexes.length - 1]
          : Math.min(project.frames.length - 1, currentFrameIndex + 1);
      if (left === right) {
        setError('Select two different frames for a crossfade.');
        return;
      }
      setProgress({ phase: 'rendering', value: 2, message: 'Building transition frames…' });
      setError('');
      try {
        const transitionFrames = await createCrossfadeFrames(project, left, right, 3, setProgress);
        const frames = [...project.frames];
        const insertAt = cleanLoop ? frames.length : Math.min(left, right) + 1;
        frames.splice(insertAt, 0, ...transitionFrames);
        changeProject(touchProject({ ...project, frames }));
        setSelectedFrameIds(new Set(transitionFrames.map((frame) => frame.id)));
        toast({
          title: cleanLoop ? 'Clean loop added' : 'Crossfade added',
          description: `${transitionFrames.length} rendered transition frames were inserted.`,
        });
      } catch (caught) {
        setProgress({ phase: 'ready', value: 0, message: '' });
        setError(
          caught instanceof Error ? caught.message : 'The transition could not be rendered.',
        );
      }
    },
    [changeProject, currentFrameIndex, project, selectedFrameIds, toast],
  );

  const removeDuplicates = React.useCallback(async () => {
    if (!project) return;
    setProgress({ phase: 'rendering', value: 2, message: 'Comparing consecutive frames…' });
    setError('');
    try {
      const outcome = await removeDuplicateFrames(project, 0.018, setProgress);
      changeProject(touchProject({ ...project, frames: outcome.frames }));
      setSelectedFrameIds(new Set(outcome.frames[0] ? [outcome.frames[0].id] : []));
      toast({
        title: outcome.removed ? 'Idle frames removed' : 'No idle duplicates found',
        description: outcome.removed
          ? `${outcome.removed} visually unchanged frames were merged into neighboring frame timing.`
          : 'The current sequence was left unchanged.',
      });
    } catch (caught) {
      setProgress({ phase: 'ready', value: 0, message: '' });
      setError(caught instanceof Error ? caught.message : 'Duplicate detection could not finish.');
    }
  }, [changeProject, project, toast]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      const modifier = event.metaKey || event.ctrlKey;
      if (modifier && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        event.shiftKey ? redo() : undo();
        return;
      }
      if (modifier && event.key.toLowerCase() === 'o') {
        event.preventDefault();
        fileInputRef.current?.click();
        return;
      }
      if (modifier && event.shiftKey && event.key.toLowerCase() === 'e' && project) {
        event.preventDefault();
        openExport();
        return;
      }
      if (event.code === 'Space' && project) {
        event.preventDefault();
        setPlaying((value) => !value);
        return;
      }
      if ((event.key === 'Delete' || event.key === 'Backspace') && project) {
        event.preventDefault();
        if (selectedOverlayId) {
          changeProject(
            touchProject({
              ...project,
              overlays: project.overlays.filter((item) => item.id !== selectedOverlayId),
            }),
          );
          setSelectedOverlayId(null);
        } else if (selectedFrameIds.size > 0 && selectedFrameIds.size < project.frames.length) {
          changeProject(deleteFrames(project, selectedFrameIds));
        }
        return;
      }
      const shortcut: Record<string, StudioTool> = {
        v: 'select',
        c: 'transform',
        t: 'text',
        r: 'redact',
        a: 'annotate',
        f: 'effects',
        g: 'timing',
        d: 'demo',
      };
      const tool = shortcut[event.key.toLowerCase()];
      if (tool) setActiveTool(tool);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeProject, openExport, project, redo, selectedFrameIds, selectedOverlayId, undo]);

  const inspector = project ? (
    <StudioInspector
      project={project}
      activeTool={activeTool}
      selectedFrameIds={selectedFrameIds}
      selectedOverlayId={selectedOverlayId}
      onProjectChange={changeProject}
      onOverlaySelect={setSelectedOverlayId}
      onReverse={() => changeProject(reverseFrames(project))}
      onPingPong={() => changeProject(createPingPong(project))}
      onCrossfade={(cleanLoop) => void runCrossfade(cleanLoop)}
      onRemoveDuplicates={() => void removeDuplicates()}
      onTrimToSelection={() => {
        if (selectedFrameIds.size === 0 || selectedFrameIds.size === project.frames.length) return;
        const frames = project.frames.filter((frame) => selectedFrameIds.has(frame.id));
        changeProject(touchProject({ ...project, frames }));
        setCurrentTimeMs(0);
      }}
      onRecordScreen={() => setRecorderOpen(true)}
      onImportMedia={() => fileInputRef.current?.click()}
    />
  ) : null;

  return (
    <div
      className={cn(
        'flex min-h-0 w-full flex-col overflow-hidden bg-[#090d14]',
        embedded
          ? cn(
              'rounded-xl border border-slate-800',
              project ? 'h-[min(900px,85dvh)]' : 'min-h-[390px]',
            )
          : 'h-dvh',
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/gif,image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime,.gif,.png,.jpg,.jpeg,.webp,.mp4,.webm,.mov,.gifstudio"
        className="sr-only"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length) void importFiles(files);
          event.currentTarget.value = '';
        }}
      />

      {project ? (
        <>
          <StudioTopBar
            project={project}
            embedded={embedded}
            saveState={saveState}
            canUndo={canUndo}
            canRedo={canRedo}
            onTitleChange={(title) => changeProject(touchProject({ ...project, title }))}
            onUndo={undo}
            onRedo={redo}
            onOpenMedia={() => fileInputRef.current?.click()}
            onOpenProjects={() => setProjectsOpen(true)}
            onOpenExport={openExport}
            projectsButtonRef={projectsButtonRef}
            exportButtonRef={exportButtonRef}
          />
          <Workspace aria-label="GIF editor workspace" className="flex min-h-0 flex-1 flex-col">
            <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[76px_minmax(0,1fr)_320px]">
              <StudioToolRail
                activeTool={activeTool}
                onToolChange={(tool) => setActiveTool(tool)}
                className="hidden lg:flex"
              />
              <StudioStage
                project={project}
                frameIndex={currentFrameIndex}
                currentTimeMs={Math.round(currentTimeMs / 40) * 40}
                activeTool={activeTool}
                selectedOverlay={selectedOverlay}
                isBusy={busy}
                onOverlayMove={(x, y) => {
                  if (!selectedOverlay) return;
                  changeProject(
                    touchProject({
                      ...project,
                      overlays: project.overlays.map((item) =>
                        item.id === selectedOverlay.id ? { ...item, x, y } : item,
                      ),
                    }),
                  );
                }}
              />
              <div className="hidden min-h-0 lg:block">{inspector}</div>
            </div>
            {error ? (
              <div
                role="alert"
                className="shrink-0 border-t border-red-500/20 bg-red-950/50 px-4 py-2 text-center text-xs text-red-200"
              >
                {error}
              </div>
            ) : null}
            <StudioTimeline
              project={project}
              selectedIds={selectedFrameIds}
              currentFrameIndex={currentFrameIndex}
              currentTimeMs={currentTimeMs}
              playing={playing}
              onPlayingChange={setPlaying}
              onSeek={(time) => {
                setPlaying(false);
                setCurrentTimeMs(Math.max(0, Math.min(time, Math.max(0, duration - 1))));
              }}
              onSelectionChange={setSelectedFrameIds}
              onReorder={(activeId, overId) =>
                changeProject(reorderFrames(project, activeId, overId))
              }
              onDuplicate={() => changeProject(duplicateFrames(project, selectedFrameIds))}
              onDelete={() => changeProject(deleteFrames(project, selectedFrameIds))}
            />
            <div className="relative border-t border-slate-800 lg:hidden">
              <p id="mobile-tool-hint" className="sr-only">
                Swipe horizontally to reveal every editing tool.
              </p>
              <StudioToolRail
                activeTool={activeTool}
                onToolChange={(tool, trigger) => {
                  mobileToolTriggerRef.current = trigger;
                  setActiveTool(tool);
                  setMobileInspectorOpen(true);
                }}
                className="overflow-x-auto border-0 pr-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                describedBy="mobile-tool-hint"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 right-0 flex w-12 items-center justify-end bg-gradient-to-l from-slate-950 via-slate-950/90 to-transparent pr-1.5 text-slate-400"
              >
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </Workspace>
          <Sheet open={mobileInspectorOpen} onOpenChange={handleMobileInspectorOpenChange}>
            <SheetContent
              side="bottom"
              className="h-[72dvh] border-slate-800 bg-slate-950 p-0 text-slate-100 lg:hidden"
            >
              <SheetHeader className="sr-only">
                <SheetTitle>Editing controls</SheetTitle>
                <SheetDescription>Settings for the active GIF editing tool.</SheetDescription>
              </SheetHeader>
              {inspector}
            </SheetContent>
          </Sheet>
          <StudioExportDialog
            open={exportOpen}
            onOpenChange={handleExportOpenChange}
            project={project}
          />
          <StudioProjectsDialog
            open={projectsOpen}
            onOpenChange={handleProjectsOpenChange}
            project={project}
            onProjectOpen={openProject}
            onNewProject={newProject}
          />
        </>
      ) : (
        <StudioEmptyState
          progress={progress}
          error={error}
          embedded={embedded}
          onFiles={(files) => void importFiles(files)}
          onLoadExample={() => void loadExample()}
          onRecordScreen={() => setRecorderOpen(true)}
        />
      )}

      <StudioRecorderDialog
        open={recorderOpen}
        onOpenChange={setRecorderOpen}
        onUseRecording={(blob) =>
          void importFiles([
            new File([blob], `screen-recording-${Date.now()}.webm`, {
              type: blob.type || 'video/webm',
            }),
          ])
        }
      />

      <AlertDialog open={recoveryOpen} onOpenChange={setRecoveryOpen}>
        <AlertDialogContent className="border-slate-800 bg-slate-950 text-slate-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Restore your last local project?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              GIF Studio found an autosaved project named “{recoveryCandidate?.title}”. It stayed in
              this browser and can be restored with its media.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setRecoveryCandidate(null);
                void clearAutosave();
              }}
              className="border-slate-700 bg-transparent"
            >
              Discard autosave
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (recoveryCandidate) openProject(recoveryCandidate);
                setRecoveryCandidate(null);
              }}
            >
              Restore project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
