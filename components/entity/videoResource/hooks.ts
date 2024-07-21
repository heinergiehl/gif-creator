import { useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { useStores } from '@/store';
import { fetchUserVideos } from '@/utils/supabase/fetchUserVideos';
import { toBlobURL } from '@ffmpeg/util';
export const useFFMPEG = (ffmpegRef: React.MutableRefObject<FFmpeg>, store: any) => {
  useEffect(() => {
    const loadFFMPEG = async () => {
      const ffmpeg = ffmpegRef.current;
      ffmpeg.on('log', ({ message }) => console.log(message));
      ffmpeg.on('progress', (e) => (store.progress.conversion = e.progress * 100));
      await ffmpeg.load({
        coreURL: await toBlobURL(
          'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
          'text/javascript',
        ),
        wasmURL: await toBlobURL(
          'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm',
          'application/wasm',
        ),
      });
    };
    loadFFMPEG();
  }, [ffmpegRef, store]);
};
export const useUserVideos = (
  supabase: any,
  editorStore: any,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  useEffect(() => {
    const loadUserVideos = async () => {
      const userId = (await supabase.auth.getUser())?.data?.user?.id;
      if (!userId) return;
      const videos = await fetchUserVideos(userId);
      editorStore.setVideos(videos);
      setLoading(false);
    };
    loadUserVideos();
  }, [supabase, editorStore, setLoading]);
};
