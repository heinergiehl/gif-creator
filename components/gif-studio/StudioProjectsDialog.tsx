'use client';

import * as React from 'react';
import {
  Download,
  FilePlus2,
  FolderOpen,
  HardDrive,
  LoaderCircle,
  Save,
  Trash2,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDuration, projectFileName } from '@/components/gif-studio/model';
import type { StoredStudioProjectSummary, StudioProject } from '@/components/gif-studio/types';
import {
  deleteNamedProject,
  exportProjectPackage,
  importProjectPackage,
  listNamedProjects,
  loadNamedProject,
  saveNamedProject,
} from '@/lib/gif-studio-persistence';

function downloadPackage(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function StudioProjectsDialog({
  open,
  onOpenChange,
  project,
  onProjectOpen,
  onNewProject,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: StudioProject;
  onProjectOpen: (project: StudioProject) => void;
  onNewProject: () => void;
}) {
  const importRef = React.useRef<HTMLInputElement>(null);
  const [title, setTitle] = React.useState(project.title);
  const [items, setItems] = React.useState<StoredStudioProjectSummary[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [newConfirmOpen, setNewConfirmOpen] = React.useState(false);
  const [persistentStorage, setPersistentStorage] = React.useState<boolean | null>(null);
  const canPersistStorage =
    typeof navigator !== 'undefined' && typeof navigator.storage?.persist === 'function';

  const refresh = React.useCallback(async () => {
    setItems(await listNamedProjects());
  }, []);

  React.useEffect(() => {
    if (!open) return;
    setTitle(project.title);
    setError('');
    void refresh().catch((caught) =>
      setError(caught instanceof Error ? caught.message : 'Local projects could not be read.'),
    );
    if (navigator.storage?.persisted) {
      void navigator.storage
        .persisted()
        .then(setPersistentStorage)
        .catch(() => setPersistentStorage(null));
    }
  }, [open, project.title, refresh]);

  const run = async (operation: () => Promise<void>) => {
    setBusy(true);
    setError('');
    try {
      await operation();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'The project action could not be completed.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="h-[min(720px,90dvh)] max-w-2xl gap-0 overflow-hidden border-slate-800 bg-slate-950 p-0 text-slate-100">
          <DialogHeader className="border-b border-slate-800 px-6 py-5 pr-12">
            <DialogTitle>Local projects</DialogTitle>
            <DialogDescription className="text-slate-400">
              Autosave and named projects stay in this browser. Export a validated package when you
              want a portable remix file.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-7 p-6">
              <section>
                <Label htmlFor="project-title" className="text-xs text-slate-400">
                  Project name
                </Label>
                <div className="mt-2 flex gap-2">
                  <Input
                    id="project-title"
                    value={title}
                    maxLength={100}
                    onChange={(event) => setTitle(event.target.value)}
                    className="border-slate-700 bg-slate-900"
                  />
                  <Button
                    type="button"
                    disabled={busy || !title.trim()}
                    onClick={() =>
                      void run(async () => {
                        const saved = await saveNamedProject(project, title);
                        onProjectOpen(saved);
                        await refresh();
                      })
                    }
                  >
                    {busy ? (
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save
                  </Button>
                </div>
              </section>

              <section className="border-y border-slate-800 py-5">
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-slate-700"
                    onClick={() =>
                      void run(async () =>
                        downloadPackage(
                          await exportProjectPackage(project),
                          projectFileName(project, 'gifstudio'),
                        ),
                      )
                    }
                  >
                    <Download className="mr-2 h-4 w-4" /> Export project file
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-slate-700"
                    onClick={() => importRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" /> Import project file
                  </Button>
                  <input
                    ref={importRef}
                    type="file"
                    accept=".gifstudio,application/json"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file)
                        void run(async () => {
                          const imported = await importProjectPackage(file);
                          onProjectOpen(imported);
                          onOpenChange(false);
                        });
                      event.currentTarget.value = '';
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-slate-400"
                    onClick={() => setNewConfirmOpen(true)}
                  >
                    <FilePlus2 className="mr-2 h-4 w-4" /> New project
                  </Button>
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Saved in this browser</h3>
                    <p className="mt-1 text-xs text-slate-500">Newest projects appear first.</p>
                  </div>
                  {canPersistStorage && persistentStorage !== true ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-slate-400"
                      onClick={() =>
                        void navigator.storage
                          .persist()
                          .then(setPersistentStorage)
                          .catch(() => setPersistentStorage(false))
                      }
                    >
                      <HardDrive className="mr-2 h-4 w-4" /> Protect storage
                    </Button>
                  ) : persistentStorage ? (
                    <span className="text-xs text-emerald-400">Persistent storage</span>
                  ) : null}
                </div>
                {items.length === 0 ? (
                  <div className="mt-5 rounded-md border border-dashed border-slate-700 px-5 py-8 text-center text-sm text-slate-500">
                    No named projects yet. Autosave still protects the open project.
                  </div>
                ) : (
                  <div className="mt-4 divide-y divide-slate-800 border-y border-slate-800">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 py-4">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-900 text-slate-500">
                          <FolderOpen className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-100">
                            {item.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.frameCount} frames · {formatDuration(item.durationMs)} ·{' '}
                            {new Date(item.updatedAt).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="border-slate-700"
                          disabled={busy}
                          onClick={() =>
                            void run(async () => {
                              const loaded = await loadNamedProject(item.id);
                              if (!loaded) throw new Error('This local project no longer exists.');
                              onProjectOpen(loaded);
                              onOpenChange(false);
                            })
                          }
                        >
                          Open
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 text-slate-500 hover:text-red-300"
                          onClick={() => setDeleteId(item.id)}
                          aria-label={`Delete ${item.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
              {error ? (
                <p role="alert" className="text-sm text-red-300">
                  {error}
                </p>
              ) : null}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteId)}
        onOpenChange={(next) => {
          if (!next) setDeleteId(null);
        }}
      >
        <AlertDialogContent className="border-slate-800 bg-slate-950 text-slate-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this local project?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This removes the named snapshot from this browser. It does not delete an exported
              .gifstudio file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 bg-transparent">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-500"
              onClick={() => {
                const id = deleteId;
                setDeleteId(null);
                if (id)
                  void run(async () => {
                    await deleteNamedProject(id);
                    await refresh();
                  });
              }}
            >
              Delete project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={newConfirmOpen} onOpenChange={setNewConfirmOpen}>
        <AlertDialogContent className="border-slate-800 bg-slate-950 text-slate-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Start a new project?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              The current project has been autosaved locally. Save a named snapshot first if you
              want it in the project list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 bg-transparent">
              Keep editing
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onNewProject();
                onOpenChange(false);
              }}
            >
              Start new
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
