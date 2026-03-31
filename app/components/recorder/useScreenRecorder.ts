'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type RecorderStatus = 'idle' | 'recording' | 'stopped';

interface UseScreenRecorderOptions {
  onStop?: (blobUrl: string, blob: Blob) => void;
}

/**
 * Custom screen-recording hook using the native getDisplayMedia + MediaRecorder
 * APIs. Replaces `react-media-recorder` which crashes in React 18 strict mode
 * due to a duplicate encoder registration bug.
 */
export function useScreenRecorder({ onStop }: UseScreenRecorderOptions = {}) {
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Keep a stable reference to the callback so startRecording doesn't
  // need to be recreated when `onStop` changes.
  const onStopRef = useRef(onStop);
  useEffect(() => {
    onStopRef.current = onStop;
  }, [onStop]);

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const stopRecording = useCallback(() => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state === 'recording') {
      mr.stop();
    }
    releaseStream();
  }, [releaseStream]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);

      // Clean up any previous session
      releaseStream();
      mediaRecorderRef.current = null;
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' } as MediaTrackConstraints,
        audio: false,
      });

      streamRef.current = stream;
      setPreviewStream(stream);

      // If the user clicks the native browser "Stop sharing" button the
      // track ends — treat that as a normal stop.
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        // The MediaRecorder.onstop handler will fire after this.
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state === 'recording'
        ) {
          mediaRecorderRef.current.stop();
        }
      });

      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm')
          ? 'video/webm'
          : '';

      const mr = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mr.mimeType || 'video/webm',
        });
        const blobUrl = URL.createObjectURL(blob);
        setStatus('stopped');
        onStopRef.current?.(blobUrl, blob);
      };

      mediaRecorderRef.current = mr;
      mr.start(100); // collect data every 100 ms
      setStatus('recording');
    } catch (err: unknown) {
      const asError = err instanceof Error ? err : new Error(String(err));

      // User cancelled the screen-picker — not an error
      if (asError.name === 'NotAllowedError') {
        setStatus('idle');
        setPreviewStream(null);
        return;
      }

      setError(asError.message);
      setStatus('idle');
      setPreviewStream(null);
    }
  }, [releaseStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      releaseStream();
      mediaRecorderRef.current = null;
    };
  }, [releaseStream]);

  return { startRecording, stopRecording, previewStream, status, error };
}
