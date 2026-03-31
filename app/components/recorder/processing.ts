import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

interface Resolution {
  width: number;
  height: number;
}

interface TrimRecordingOptions {
  ffmpeg: FFmpeg;
  videoBlob: Blob;
  startTimeInSecs: string;
  endTimeInSecs: string;
  resolution: Resolution;
  fps: number;
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface CropRecordingOptions {
  ffmpeg: FFmpeg;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  resolution: Resolution;
}

interface ProcessRecordingOptions {
  ffmpeg: FFmpeg;
  videoBlob: Blob;
  resolution: Resolution;
  fps: number;
}

const INPUT_FILE = 'input.mp4';
const PROCESSED_OUTPUT_FILE = 'output_processed.mp4';
const TRIMMED_OUTPUT_FILE = 'output.mp4';
const CROPPED_OUTPUT_FILE = 'cropped_output.mp4';

async function writeInputVideo(ffmpeg: FFmpeg, videoBlob: Blob) {
  await ffmpeg.writeFile(INPUT_FILE, await fetchFile(videoBlob));
}

function toBlobPart(data: Awaited<ReturnType<FFmpeg['readFile']>>) {
  if (typeof data === 'string') {
    return data;
  }

  return new Uint8Array(data);
}

async function readOutputAsObjectUrl(ffmpeg: FFmpeg, fileName: string) {
  const data = await ffmpeg.readFile(fileName);
  const blob = new Blob([toBlobPart(data)], { type: 'video/mp4' });
  return URL.createObjectURL(blob);
}

export async function generateRecordingThumbnails(
  ffmpeg: FFmpeg,
  videoBlob: Blob,
  duration: number,
  numThumbnails = 10,
) {
  const imageUris: string[] = [];
  const interval = duration / Math.max(1, numThumbnails - 1);

  await writeInputVideo(ffmpeg, videoBlob);

  for (let index = 0; index < numThumbnails; index++) {
    const timestamp = index * interval;
    const thumbnailFileName = `thumb${index}.png`;
    await ffmpeg.exec([
      '-y',
      '-ss',
      `${timestamp}`,
      '-i',
      INPUT_FILE,
      '-frames:v',
      '1',
      '-vf',
      'scale=320:-1',
      thumbnailFileName,
    ]);

    const data = await ffmpeg.readFile(thumbnailFileName);
    const blob = new Blob([toBlobPart(data)], { type: 'image/png' });
    imageUris.push(await readBlobAsDataUrl(blob));
    await ffmpeg.deleteFile(thumbnailFileName);
  }

  return imageUris;
}

export async function processRecordingVideo({
  ffmpeg,
  videoBlob,
  resolution,
  fps,
}: ProcessRecordingOptions) {
  await writeInputVideo(ffmpeg, videoBlob);
  await ffmpeg.exec([
    '-i',
    INPUT_FILE,
    '-r',
    fps.toString(),
    '-vf',
    `scale=${resolution.width}:${resolution.height},setdar=${resolution.width}/${resolution.height}`,
    '-preset',
    'ultrafast',
    '-c:v',
    'h264',
    PROCESSED_OUTPUT_FILE,
  ]);

  return readOutputAsObjectUrl(ffmpeg, PROCESSED_OUTPUT_FILE);
}

export async function trimRecordingVideo({
  ffmpeg,
  videoBlob,
  startTimeInSecs,
  endTimeInSecs,
  resolution,
  fps,
  crop,
}: TrimRecordingOptions) {
  await writeInputVideo(ffmpeg, videoBlob);
  const videoFilter = crop
    ? `crop=${Math.round(crop.width)}:${Math.round(crop.height)}:${Math.round(crop.x)}:${Math.round(crop.y)},scale=${resolution.width}:${resolution.height},fps=${fps},setdar=${resolution.width}/${resolution.height}`
    : `scale=${resolution.width}:${resolution.height},fps=${fps},setdar=${resolution.width}/${resolution.height}`;

  await ffmpeg.exec([
    '-y',
    '-i',
    INPUT_FILE,
    '-ss',
    startTimeInSecs,
    '-to',
    endTimeInSecs,
    '-c:v',
    'h264',
    '-preset',
    'ultrafast',
    '-vf',
    videoFilter,
    '-crf',
    '22',
    TRIMMED_OUTPUT_FILE,
  ]);

  return readOutputAsObjectUrl(ffmpeg, TRIMMED_OUTPUT_FILE);
}

export async function cropRecordingVideo({
  ffmpeg,
  cropX,
  cropY,
  cropWidth,
  cropHeight,
  resolution,
}: CropRecordingOptions) {
  await ffmpeg.exec([
    '-i',
    INPUT_FILE,
    '-vf',
    `crop=${Math.round(cropWidth)}:${Math.round(cropHeight)}:${Math.round(cropX)}:${Math.round(cropY)},scale=${resolution.width}:${resolution.height},setdar=${resolution.width}/${resolution.height}`,
    '-c:v',
    'h264',
    '-preset',
    'ultrafast',
    '-crf',
    '22',
    CROPPED_OUTPUT_FILE,
  ]);

  return readOutputAsObjectUrl(ffmpeg, CROPPED_OUTPUT_FILE);
}

export const toTimeString = (sec: number, showMilliSeconds = true): string => {
  sec = parseFloat(sec.toFixed(3));
  let hours: string | number = Math.floor(sec / 3600);
  let minutes: string | number = Math.floor((sec - hours * 3600) / 60);
  let seconds: string | number = Math.floor(sec - hours * 3600 - minutes * 60);
  const millisec = Math.round((sec - Math.floor(sec)) * 1000);
  if (hours < 10) hours = '0' + hours;
  if (minutes < 10) minutes = '0' + minutes;
  if (seconds < 10) seconds = '0' + seconds;
  let timeString = `${hours}:${minutes}:${seconds}`;
  if (showMilliSeconds) {
    const millisecondsString = millisec.toString().padStart(3, '0');
    timeString += `.${millisecondsString}`;
  }
  return timeString;
};

export async function readBlobAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
