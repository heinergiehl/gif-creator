import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { fetchUserVideos } from '@/utils/supabase/fetchUserVideos';
import { SupabaseClient } from '@supabase/supabase-js';
import { EditorStore } from '@/store/EditorStore';
import { getUid } from '@/utils';
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
  ffmpeg: FFmpeg | null,
  frameRate: number,
  quality: number,
  store: EditorStore,
  setInputKey: React.Dispatch<React.SetStateAction<number>>,
) => {
  if (!ffmpeg?.loaded) return;
  const file = event.target.files?.[0];
  if (!file) return;
  store.setProgressState({
    active: true,
    stage: 'uploading',
    title: 'Preparing your video',
    message: 'Uploading the selected video into the local processing engine…',
    conversion: 5,
    rendering: 0,
  });
  try {
    await ffmpeg.writeFile(file.name, await fetchFile(file));
    store.setProgressState({
      stage: 'extracting',
      title: 'Extracting frames',
      message: 'Converting the video into individual frames. Keep this tab open while processing runs locally.',
      conversion: 20,
    });
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
    store.setProgressState({
      stage: 'importing',
      title: 'Loading frames into the editor',
      message: `Found ${imageFiles.length} frames. Importing them into the timeline now…`,
      conversion: 80,
      rendering: 0,
    });
    await processFrames(ffmpeg, file.name, imageFiles, store, setInputKey);
    store.setProgressState({
      active: false,
      stage: 'ready',
      title: 'Frames ready',
      message: imageFiles.length
        ? `${imageFiles.length} frames are ready to edit.`
        : 'Your frames are ready to edit.',
      conversion: 100,
      rendering: 100,
    });
  } catch (error) {
    console.error('Error converting video into frames:', error);
    store.setProgressState({
      active: false,
      stage: 'error',
      title: 'Video import failed',
      message: 'The video could not be converted into frames. Please try another file or a lower quality setting.',
      conversion: 0,
      rendering: 0,
    });
  }
};

const deleteFileIfPresent = async (ffmpeg: FFmpeg, fileName: string) => {
  try {
    await ffmpeg.deleteFile(fileName);
  } catch {
    console.warn(`Unable to remove temporary file: ${fileName}`);
  }
};

const processFrames = async (
  ffmpeg: FFmpeg,
  sourceFileName: string,
  files: { name: string }[],
  store: EditorStore,
  setInputKey: React.Dispatch<React.SetStateAction<number>>,
) => {
  try {
    const frames = [] as { id: string; src: string }[];
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const data = await ffmpeg.readFile(file.name);
      const blob = new Blob([data], { type: 'image/png' });
      const blobUrl = URL.createObjectURL(blob);
      frames.push({ id: getUid(), src: blobUrl });
      const renderingProgress = files.length ? ((index + 1) / files.length) * 100 : 100;
      store.setProgressState({
        rendering: renderingProgress,
        message: `Imported ${index + 1} of ${files.length} extracted frames into the editor…`,
      });
    }
    if (store.frames.length > 0) store.frames = [...store.frames, ...frames];
    else store.frames = frames;
    store.addImages();
    setInputKey(Date.now());
  } catch (error) {
    console.error('Error processing some frames:', error);
    setInputKey(Date.now());
  } finally {
    await deleteFileIfPresent(ffmpeg, sourceFileName);
    await Promise.all(files.map((file) => deleteFileIfPresent(ffmpeg, file.name)));
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
