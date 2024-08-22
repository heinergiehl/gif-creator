import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { fetchUserVideos } from '@/utils/supabase/fetchUserVideos';
import { SupabaseClient } from '@supabase/supabase-js';
import { EditorStore } from '@/store/EditorStore';
import { getUid } from '@/utils';
export const loadFFMPEG = async (ffmpegRef: React.MutableRefObject<FFmpeg>, store: any) => {
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
export const loadUserVideos = async (
  supabase: SupabaseClient,
  editorStore: EditorStore,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const videos = await fetchUserVideos(user.id);
  editorStore.setVideos(videos);
  setLoading(false);
};
export const handleFileChange = async (
  event: React.ChangeEvent<HTMLInputElement>,
  ffmpegRef: React.MutableRefObject<FFmpeg>,
  frameRate: number,
  quality: number,
  store: EditorStore,
  setInputKey: React.Dispatch<React.SetStateAction<number>>,
  supabase: SupabaseClient,
) => {
  if (!ffmpegRef.current.loaded) return;
  const file = event.target.files?.[0];
  if (!file) return;
  const ffmpeg = ffmpegRef.current;
  store.progress.conversion = 0;
  await ffmpeg.writeFile(file.name, await fetchFile(file));
  await ffmpeg.exec([
    '-i',
    file.name,
    '-vf',
    `fps=${frameRate},scale=iw*${quality}:ih*${quality}`,
    '-preset',
    'ultrafast',
    'out%d.png',
  ]);
  const files = await ffmpeg.listDir('/');
  const imageFiles = files.filter(
    (file) => file.name.startsWith('out') && file.name.endsWith('.png'),
  );
  await processFrames(ffmpeg, imageFiles, store, setInputKey, supabase);
};
const processFrames = async (
  ffmpeg: FFmpeg,
  files: { name: string }[],
  store: EditorStore,
  setInputKey: React.Dispatch<React.SetStateAction<number>>,
  supabase: SupabaseClient,
) => {
  const promises = files.map(async (file) => {
    const data = await ffmpeg.readFile(file.name);
    const blob = new Blob([data], { type: 'image/png' });
    const blobUrl = URL.createObjectURL(blob);
    return { id: getUid(), src: blobUrl };
  });
  try {
    const frames = await Promise.all(promises);
    const newFrames = frames.filter((frame) => store.frames.find((f) => f.src !== frame.src));
    if (store.frames.length > 0) store.frames = [...store.frames, ...frames];
    else store.frames = frames;
    store.addImages();
    setInputKey(Date.now());
  } catch (error) {
    console.error('Error processing some frames:', error);
    setInputKey(Date.now());
  }
};
export const handleAddButtonClick = async (
  videoUrl: string,
  supabase: SupabaseClient,
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
) => {
  const videoId = videoUrl.split('/').pop();
  if (!videoId) return;
  const { data, error } = await supabase.storage.from('videos').download(videoId);
  if (error) {
    console.error('Error downloading video:', error);
    return;
  }
  if (!data) return;
  const videoBlob = new Blob([data], { type: 'video/mp4' });
  const file = new File([videoBlob], videoId);
  const event = {
    target: { files: [file] },
    currentTarget: { files: [file] },
    preventDefault: () => {},
    stopPropagation: () => {},
    persist: () => {},
    bubbles: false,
    cancelable: false,
    defaultPrevented: false,
    eventPhase: 0,
    isTrusted: false,
    nativeEvent: new Event('change'),
    timeStamp: Date.now(),
    type: 'change',
  } as unknown as React.ChangeEvent<HTMLInputElement>;
  await handleFileChange(event);
};
