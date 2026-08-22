'use client';

import { useCallback, useRef, useState } from 'react';
import type { StudioProject } from '@/components/gif-studio/types';
import { cloneStudioProjectWithSharedBlobs } from '@/lib/gif-studio-persistence';

export interface StudioHistoryMutationOptions {
  /** Defaults to true. Set false for load/recovery or other history boundaries. */
  record?: boolean;
}

export interface StudioHistoryOptions {
  /** Number of undo snapshots retained in memory. Defaults to 60. */
  limit?: number;
}

type ProjectUpdater = (project: StudioProject | null) => StudioProject | null;

function snapshot(project: StudioProject | null): StudioProject | null {
  return project ? cloneStudioProjectWithSharedBlobs(project) : null;
}

export function useStudioHistory(
  initialProject: StudioProject | null,
  options: StudioHistoryOptions = {},
) {
  const limit = Math.max(1, Math.min(200, Math.round(options.limit ?? 60)));
  const [project, setProjectState] = useState<StudioProject | null>(() => snapshot(initialProject));
  const projectRef = useRef<StudioProject | null>(project);
  const pastRef = useRef<Array<StudioProject | null>>([]);
  const futureRef = useRef<Array<StudioProject | null>>([]);
  const [, setHistoryRevision] = useState(0);

  const publish = useCallback((nextProject: StudioProject | null) => {
    projectRef.current = nextProject;
    setProjectState(nextProject);
    setHistoryRevision((revision) => revision + 1);
  }, []);

  const setProject = useCallback(
    (nextProject: StudioProject | null, mutationOptions: StudioHistoryMutationOptions = {}) => {
      const current = projectRef.current;
      if (Object.is(current, nextProject)) return;

      if (mutationOptions.record !== false) {
        pastRef.current.push(snapshot(current));
        if (pastRef.current.length > limit) {
          pastRef.current.splice(0, pastRef.current.length - limit);
        }
        futureRef.current = [];
      }
      publish(snapshot(nextProject));
    },
    [limit, publish],
  );

  const updateProject = useCallback(
    (updater: ProjectUpdater, mutationOptions: StudioHistoryMutationOptions = {}) => {
      const current = projectRef.current;
      const nextProject = updater(current);
      setProject(nextProject, mutationOptions);
    },
    [setProject],
  );

  const undo = useCallback(() => {
    if (pastRef.current.length === 0) return;
    const previous = pastRef.current.pop() ?? null;
    futureRef.current.push(snapshot(projectRef.current));
    publish(snapshot(previous));
  }, [publish]);

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    const next = futureRef.current.pop() ?? null;
    pastRef.current.push(snapshot(projectRef.current));
    if (pastRef.current.length > limit) {
      pastRef.current.splice(0, pastRef.current.length - limit);
    }
    publish(snapshot(next));
  }, [limit, publish]);

  const resetHistory = useCallback(() => {
    pastRef.current = [];
    futureRef.current = [];
    setHistoryRevision((revision) => revision + 1);
  }, []);

  return {
    project,
    setProject,
    updateProject,
    undo,
    redo,
    canUndo: pastRef.current.length > 0,
    canRedo: futureRef.current.length > 0,
    resetHistory,
  };
}
