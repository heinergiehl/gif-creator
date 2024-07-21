'use client';
import getBlobDuration from 'get-blob-duration';
import { useCallback, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import { StoreProvider, useStores } from '@/store';
import Stepper from './Stepper';
import { useReactMediaRecorder } from 'react-media-recorder';
import { cn } from '@/utils/cn';
import { useCanvas } from '../canvas/canvasContext';
import { useInitializeCanvas } from '../canvas/useInitializeCanvas';
import { fabric } from 'fabric';
import { Button } from '@/components/ui/button';
import { Download, Loader2, PlayCircle } from 'lucide-react';
import CustomTextInput from '../ui/CustomTextInput';
import { Label } from '@/components/ui/label';
import { CustomSelect } from '../ui/CustomSelect';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { start } from 'repl';
import { Canvas } from 'fabric/fabric-impl';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CustomTooltip } from '../ui/CustomTooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/utils/supabase/client';
import { CustomProgress } from '@/components/ui/CustomProgress';
const RecordComponent = observer(() => {
  const supabase = useStores().supabase;
  const editorStore = useStores().editorStore;
  const canvas = useCanvas().canvasRef.current;
  useInitializeCanvas();
  const [stoppedRecording, setStoppedRecording] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoDataRef = useRef<Blob | null>(null);
  const [fps, setFps] = useState(24);
  const [resolution, setResolution] = useState({ width: 1920, height: 1080 });
  const [videoDuration, setVideoDuration] = useState(0);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const { startRecording, stopRecording, mediaBlobUrl, previewStream } = useReactMediaRecorder({
    video: true,
    audio: true,
    screen: true,
    onStop: async (blobUrl, blob) => {
      videoDataRef.current = blob;
      videoRef.current!.src = blobUrl;
      videoRef.current!.load();
      // append the video to the DOM to get the duration
      if (!videoRef.current) return;
      setStoppedRecording(true);
      const duration = await getBlobDuration(blob);
      setVideoDuration(duration);
      await getThumbnails(duration).then(async (thumbnails) => {
        console.log('DURATION', duration, videoDuration);
        if (thumbnails && thumbnails.length > 0) {
          setThumbnails(thumbnails);
          setThumbnailUrl(thumbnails[2]);
          await processVideo(duration, thumbnails[2]);
        }
      });
    },
  });
  const ffmpegRef = useRef<FFmpeg>(new FFmpeg());
  const [ready, setReady] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [trimmedVideoUrl, setTrimmedVideoUrl] = useState('');
  const [thumbnailIsProcessing, setThumbnailIsProcessing] = useState(false);
  const loadFFMPEG = async () => {
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on('log', ({ message }) => {
      // console.log(message);
    });
    ffmpeg.on('progress', (e) => {
      const progress = Math.round(e.progress * 100);
      editorStore.progress.conversion = progress;
      editorStore.progress.rendering = progress;
    });
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
    setReady(true);
  };
  useEffect(() => {
    loadFFMPEG();
  }, []);
  useEffect(() => {
    if (previewStream && videoRef.current && !stoppedRecording) {
      videoRef.current.srcObject = previewStream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play();
      };
    }
  }, [previewStream, videoRef.current, stoppedRecording]);
  // once stopped swap scrObject with the recorded video
  useEffect(() => {
    if (stoppedRecording && videoDataRef.current && videoRef.current) {
      const videoElement = videoRef.current;
      videoElement.onloadedmetadata = () => {
        videoElement.play();
      };
    }
  }, [stoppedRecording, videoDataRef.current]);
  const getThumbnails = async (duration: number) => {
    if (duration === 0) {
      console.log('duration is 0 in getThumbnails');
      return;
    }
    if (!ffmpegRef.current.loaded) await ffmpegRef.current.load();
    setThumbnailIsProcessing(true);
    const MAX_NUMBER_OF_IMAGES = 15;
    let offset = duration === MAX_NUMBER_OF_IMAGES ? 1 : duration / MAX_NUMBER_OF_IMAGES;
    let NUMBER_OF_IMAGES = duration < MAX_NUMBER_OF_IMAGES ? duration : 15;
    if (!videoDataRef.current) return;
    let arrayOfImageURIs: string[] = [];
    // Ensure file is written correctly
    try {
      await ffmpegRef.current.writeFile('input.mp4', await fetchFile(videoDataRef.current));
    } catch (e) {
      console.error('Error writing file to FFmpeg FS:', e);
      setThumbnailIsProcessing(false);
      return;
    }
    for (let i = 0; i < NUMBER_OF_IMAGES; i++) {
      console.log('offset', offset, 'i', i);
      try {
        let startTimeInSecs = toTimeString(Math.round(i * offset));
        if (Number(startTimeInSecs) + offset > duration && offset > 1) {
          offset = 0;
        }
        console.log('startTimeInSecs', startTimeInSecs);
        // Use correct path and file naming
        await ffmpegRef.current.exec([
          '-ss',
          startTimeInSecs,
          '-i',
          'input.mp4',
          '-vf',
          'scale=150:-1',
          `img${i}.png`,
        ]);
        const data = await ffmpegRef.current.readFile(`img${i}.png`);
        const blob = new Blob([data], { type: 'image/png' });
        const dataURI = await readFileAsBase64(blob);
        arrayOfImageURIs.push(dataURI);
        // Clean up the generated image file
        ffmpegRef.current.deleteFile(`img${i}.png`);
      } catch (e) {
        console.error('Error generating thumbnails:', e);
      }
    }
    setThumbnailIsProcessing(false);
    console.log('arrayOfImageURIs', arrayOfImageURIs);
    return arrayOfImageURIs;
  };
  const [isTrimming, setIsTrimming] = useState(false);
  const handleTrim = async () => {
    if (isTrimming) return;
    setIsTrimming(true);
    if (!videoDataRef.current || !ready) return;
    const ffmpeg = ffmpegRef.current;
    const duration = videoDuration;
    console.log('duration', duration, 'startTime', startTime, 'endTime', endTime);
    const startTimeInSecs = toTimeString((startTime / 100) * duration, true);
    const endTimeInSecs = toTimeString((endTime / 100) * duration, true);
    console.log(startTimeInSecs, endTimeInSecs);
    await ffmpeg.writeFile('input.mp4', await fetchFile(videoDataRef.current));
    await ffmpeg.exec([
      '-ss',
      startTimeInSecs,
      '-i',
      'input.mp4',
      '-to',
      endTimeInSecs,
      '-c',
      'copy',
      '-preset',
      'ultrafast',
      'output.mp4',
    ]);
    const data = await ffmpeg.readFile('output.mp4');
    const videoBlob = new Blob([data], { type: 'video/mp4' });
    setTrimmedVideoUrl(URL.createObjectURL(videoBlob));
    setIsTrimming(false);
  };
  const uploadThumbnail = async (blob: Blob) => {
    const fileName = `thumbnail_${Date.now()}.png`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('thumbnails')
      .upload(fileName, blob);
    if (uploadError) {
      console.error('Error uploading thumbnail:', uploadError);
      return null;
    }
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('thumbnails')
      .createSignedUrl(fileName, 60 * 606000); // URL valid for 1 hour
    if (signedUrlError) {
      console.error('Error generating signed URL:', signedUrlError);
      return null;
    }
    return signedUrlData.signedUrl;
  };
  const processVideo = async (duration: number, tURL: string) => {
    const videoDuration = duration;
    if (!videoDataRef.current || !ready) {
      console.log('videoDataRef.current no available', videoDataRef.current, 'ready', ready);
      return;
    }
    const ffmpeg = ffmpegRef.current;
    await ffmpeg.writeFile('input.mp4', await fetchFile(videoDataRef.current));
    await ffmpeg.exec([
      '-i',
      'input.mp4',
      '-r',
      fps.toString(),
      '-s',
      `${resolution.width}x${resolution.height}`,
      '-preset',
      'ultrafast',
      'output_processed.mp4',
    ]);
    const data = await ffmpeg.readFile('output_processed.mp4');
    const videoBlob = new Blob([data], { type: 'video/mp4' });
    const videoFileName = `processed_video_${Date.now()}.mp4`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('videos')
      .upload(videoFileName, videoBlob);
    if (uploadError) {
      console.error('Error uploading video:', uploadError);
      return;
    }
    const { data: videoSignedUrlData, error: videoSignedUrlError } = await supabase.storage
      .from('videos')
      .createSignedUrl(videoFileName, 60 * 60000); // URL valid for 1 hour
    if (videoSignedUrlError) {
      console.error('Error generating video signed URL:', videoSignedUrlError);
      return;
    }
    const user = (await supabase.auth.getUser()).data.user;
    const thumbnailBlob = await fetchFile(tURL);
    const thumbnailUrl = await uploadThumbnail(new Blob([thumbnailBlob], { type: 'image/png' }));
    if (!thumbnailUrl) return;
    if (!user) return;
    console.log('videoDUration123', videoDuration);
    const { data: videoData, error: insertError } = await supabase.from('videos').insert([
      {
        user_id: user.id,
        video_url: videoSignedUrlData.signedUrl,
        thumbnail_url: thumbnailUrl,
        duration: videoDuration,
        width: resolution.width,
        height: resolution.height,
      },
    ]);
    if (insertError) {
      console.error('Error inserting video metadata:', insertError);
      return;
    }
    setTrimmedVideoUrl(videoSignedUrlData.signedUrl);
  };
  // once resolution or fps changes, process the video
  useEffect(() => {
    if (stoppedRecording) processVideo(videoDuration);
  }, [fps, resolution.height, resolution.width]);
  const addVideoToCanvas = async () => {
    if (stoppedRecording && canvas) {
      const videoElement = document.createElement('video');
      if (!videoDataRef.current) return;
      videoElement.src = URL.createObjectURL(videoDataRef.current);
      await videoElement.play();
      videoElement.width = resolution.width;
      videoElement.height = resolution.height;
      videoElement.controls = true;
      const aspectRatio = videoElement.videoWidth / videoElement.videoHeight;
      let videoWidth = resolution.width;
      let videoHeight = resolution.height;
      if (resolution.width / resolution.height > aspectRatio) {
        videoWidth = resolution.height * aspectRatio;
      } else {
        videoHeight = resolution.width / aspectRatio;
      }
      canvas.clear();
      const fabricVideo = new fabric.Image(videoElement);
      fabricVideo.width = videoWidth;
      fabricVideo.height = videoHeight;
      fabricVideo.left = canvas.width! / 2;
      fabricVideo.top = canvas.height! / 2;
      fabricVideo.originX = 'center';
      fabricVideo.originY = 'center';
      fabricVideo.centeredScaling = true;
      fabricVideo.scaleX = canvas.width! / videoWidth;
      fabricVideo.scaleY = canvas.height! / videoHeight;
      fabricVideo.setCoords();
      canvas.add(fabricVideo);
      const fabricVid = canvas.getObjects()[0] as fabric.Image;
      canvas.requestRenderAll();
    }
  };
  useEffect(() => {
    if (stoppedRecording && videoDataRef.current && canvas) addVideoToCanvas();
  }, [canvas, stoppedRecording, resolution]);
  const playVideo = () => {
    const fabricVideo = canvas?.getObjects()[0] as fabric.Image;
    if (fabricVideo) {
      const videoElement = fabricVideo.getElement() as HTMLVideoElement;
      if (videoElement.paused) {
        videoElement.play();
      } else {
        videoElement.pause();
      }
    }
  };
  const addCropRectangle = () => {
    if (!canvas) return;
    const rect = new fabric.Rect({
      left: 50,
      top: 50,
      fill: 'rgba(0,0,0,0.5)',
      width: 200,
      height: 200,
      borderColor: 'red',
      cornerColor: 'red',
      hasRotatingPoint: false,
      lockRotation: true,
      cornerSize: 10,
      transparentCorners: false,
      stroke: 'red',
      strokeWidth: 2,
      globalCompositeOperation: 'destination-atop',
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.requestRenderAll();
  };
  const applyCrop = () => {
    if (!canvas) return;
    const cropRect = canvas.getObjects().find((obj) => obj.type === 'rect') as fabric.Rect;
    if (!cropRect) return;
    const videoElement = canvas.getObjects().find((obj) => obj.type === 'image') as fabric.Image;
    if (!videoElement) return;
    const cropCanvas = document.createElement('canvas');
    const cropCtx = cropCanvas.getContext('2d');
    // Calculate the scaling factors between the video and canvas
    const video = videoElement.getElement() as HTMLVideoElement;
    const scaleX = video.videoWidth / canvas.width!;
    const scaleY = video.videoHeight / canvas.height!;
    // Set the cropCanvas dimensions based on the cropRect dimensions
    cropCanvas.width = cropRect.width! * scaleX;
    cropCanvas.height = cropRect.height! * scaleY;
    // Calculate the cropping coordinates on the video
    const cropLeft = cropRect.left! * scaleX;
    const cropTop = cropRect.top! * scaleY;
    const cropWidth = cropRect.width! * scaleX;
    const cropHeight = cropRect.height! * scaleY;
    // Draw the cropped area from the video onto the cropCanvas
    cropCtx?.drawImage(
      video,
      cropLeft,
      cropTop,
      cropWidth,
      cropHeight,
      0,
      0,
      cropCanvas.width,
      cropCanvas.height,
    );
    const croppedImage = new Image();
    croppedImage.src = cropCanvas.toDataURL();
    croppedImage.onload = () => {
      const fabricCroppedImage = new fabric.Image(croppedImage, {
        left: 0,
        top: 0,
        scaleX: canvas.width! / cropRect.width!,
        scaleY: canvas.height! / cropRect.height!,
      });
      // Clear the canvas and add the cropped image
      canvas.clear();
      canvas.add(fabricCroppedImage);
      canvas.requestRenderAll();
    };
  };
  useEffect(() => {
    canvas?.getObjects();
    canvas?.requestRenderAll();
  }, [canvas?.getObjects(), canvas, stoppedRecording]);
  return (
    <div className="container my-[80px] flex h-full flex-col">
      <div className="mx-4 flex flex-col">
        <div className="flex flex-col text-sm">
          {!previewStream && (
            <CustomTooltip
              content={
                <div className="flex flex-col gap-2">
                  <span>Record your screen</span>
                </div>
              }
            >
              <Button onClick={startRecording} className="w-[80px]">
                Choose
              </Button>
            </CustomTooltip>
          )}
          {previewStream && !stoppedRecording && (
            <Button className="btn btn-secondary max-w-[150px]" onClick={stopRecording}>
              Stop Recording
            </Button>
          )}
        </div>
      </div>
      <div className="  inset-0 flex h-full flex-col justify-start">
        <div className="mx-4 flex gap-x-4">
          {/* processing options */}
          <ProcessingOptions
            onFpsChange={setFps}
            onResolutionChange={setResolution}
            fps={fps}
            resolution={resolution}
          />
          <Button
            style={{
              display: stoppedRecording ? 'block' : 'none',
            }}
            className="h-[60px] w-[60px] rounded-full"
            variant={'default'}
            onClick={playVideo}
          >
            <PlayCircle />
          </Button>
          <DisplaySection
            videoRef={videoRef}
            stoppedRecording={stoppedRecording}
            previewStream={previewStream}
          />
          <CropButtonSection applyCrop={applyCrop} addCropRectangle={addCropRectangle} />
        </div>
        <div className="flex flex-col">
          <div className="flex   gap-4">
            <div className="flex"></div>
          </div>
          <div className="flex flex-col">
            {stoppedRecording && (
              <div className="flex flex-col">
                <Label>Trim Video</Label>
                <RangeInput
                  currentTime={
                    canvas?.getObjects()[0]
                      ? ((canvas?.getObjects()[0] as fabric.Image).getElement() as HTMLVideoElement)
                          .currentTime
                      : 0
                  }
                  rStart={startTime}
                  rEnd={endTime}
                  handleUpdaterStart={(e) => setStartTime(Number(e))}
                  handleUpdaterEnd={(e) => setEndTime(Number(e))}
                  loading={thumbnailIsProcessing}
                  videoMeta={videoDuration}
                  thumbNails={thumbnails}
                  control={
                    <div className="u-center">
                      <Button onClick={handleTrim} disabled={isTrimming ? true : false}>
                        {isTrimming ? 'trimming...' : 'trim selected'}
                        <Loader2
                          className="ml-2 h-4 w-4 animate-spin"
                          style={{
                            display: isTrimming ? 'block' : 'none',
                          }}
                        />
                      </Button>
                      <CustomProgress />
                    </div>
                  }
                />
                <DownloadSection trimmedVideoUrl={trimmedVideoUrl} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
interface DisplaySectionProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  stoppedRecording: boolean;
  previewStream: MediaStream | null;
}
const DisplaySection: React.FC<DisplaySectionProps> = ({
  videoRef,
  stoppedRecording,
  previewStream,
}) => {
  return (
    <div className="relative">
      <video
        ref={videoRef}
        controls
        autoPlay
        loop
        style={{
          display: !stoppedRecording && previewStream ? 'block' : 'none',
          width: '640px',
          height: '480px',
          objectFit: 'cover',
          borderRadius: '10px',
          position: 'absolute',
        }}
      />
      <canvas
        id="canvas"
        style={{
          opacity: stoppedRecording ? '100%' : '0',
        }}
        className={cn([
          'absolute inset-0 h-[480px] w-[640px] transform justify-center drop-shadow-lg transition-all duration-300 ease-in-out',
        ])}
      />
    </div>
  );
};
interface DownloadSectionProps {
  trimmedVideoUrl: string;
}
const DownloadSection: React.FC<DownloadSectionProps> = ({ trimmedVideoUrl }) => {
  const downloadTrimmedVideo = () => {
    download(trimmedVideoUrl);
  };
  return (
    <div>
      {trimmedVideoUrl && (
        <div>
          <video controls src={trimmedVideoUrl} className="mt-4" />
          <a href={trimmedVideoUrl} download="trimmed_video.mp4">
            <Button className="btn btn-primary m-2 max-w-[150px]">Download Trimmed Video</Button>
          </a>
        </div>
      )}
    </div>
  );
};
interface CropButtonSectionProps {
  addCropRectangle: () => void;
  applyCrop: () => void;
}
const CropButtonSection: React.FC<CropButtonSectionProps> = ({ addCropRectangle, applyCrop }) => {
  const canvas = useCanvas().canvasRef.current;
  return (
    canvas?.getObjects() &&
    canvas?.getObjects().length > 0 && (
      <div className="flex ">
        <Button className="btn btn-secondary m-2 max-w-[150px]" onClick={addCropRectangle}>
          Add Crop Rectangle
        </Button>
        <Button className="btn btn-secondary m-2 max-w-[150px]" onClick={applyCrop}>
          Apply Crop
        </Button>
      </div>
    )
  );
};
interface ProcessingOptionsProps {
  onFpsChange: (fps: number) => void;
  onResolutionChange: (resolution: { width: number; height: number }) => void;
  fps: number;
  resolution: { width: number; height: number };
}
const ProcessingOptions: React.FC<ProcessingOptionsProps> = ({
  onFpsChange: setFps,
  onResolutionChange: setResolution,
  fps,
  resolution,
}) => {
  const canvas = useCanvas().canvasRef.current;
  return (
    canvas?.getObjects() &&
    canvas?.getObjects().length > 0 && (
      <div className="flex flex-col ">
        <span className="text-sm">Processing Options</span>
        <Separator className="my-2" />
        <div className="flex  flex-col gap-4 md:flex-row">
          <Label className="flex flex-col gap-y-2">
            FPS
            <CustomTextInput
              name="fps"
              inputTooltip="Enter the number of frames per second"
              value={String(fps)}
              onChange={(e) => setFps(Number(e))}
            />
          </Label>
          <Label className="flex flex-col gap-y-2">
            Resolution
            <CustomTextInput
              name="resolution"
              inputTooltip="Enter the resolution of the video in width and height"
              value={String(resolution.width)}
              onChange={(e) => setResolution({ ...resolution, width: Number(e) })}
            />
            <CustomTextInput
              inputTooltip="Enter the resolution of the video in width and height"
              value={String(resolution.height)}
              onChange={(e) => setResolution({ ...resolution, height: Number(e) })}
              name="height"
            />
          </Label>
        </div>
      </div>
    )
  );
};
const toTimeString = (sec: number, showMilliSeconds = true): string => {
  sec = parseFloat(sec.toFixed(3)); // Limit to three decimal places
  let hours: string | number = Math.floor(sec / 3600);
  let minutes: string | number = Math.floor((sec - hours * 3600) / 60);
  let seconds: string | number = Math.floor(sec - hours * 3600 - minutes * 60);
  let millisec = Math.round((sec - Math.floor(sec)) * 1000); // Get milliseconds
  if (hours < 10) hours = '0' + hours;
  if (minutes < 10) minutes = '0' + minutes;
  if (seconds < 10) seconds = '0' + seconds;
  let timeString = `${hours}:${minutes}:${seconds}`;
  if (showMilliSeconds) {
    if (millisec < 10) millisec = '00' + millisec;
    else if (millisec < 100) millisec = '0' + millisec;
    timeString += `.${millisec}`;
  }
  return timeString;
};
const readFileAsBase64 = async (file: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
const download = (url: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', '');
  link.click();
};
interface RangeInputProps {
  thumbNails: string[];
  rEnd: number;
  rStart: number;
  handleUpdaterStart: (e: number) => void;
  handleUpdaterEnd: (e: number) => void;
  loading: boolean;
  control: React.ReactNode;
  videoMeta: number;
  currentTime: number;
}
const RangeInput: React.FC<RangeInputProps> = ({
  thumbNails,
  rEnd,
  rStart,
  handleUpdaterStart,
  handleUpdaterEnd,
  loading,
  control,
  videoMeta,
  currentTime,
}) => {
  const RANGE_MAX = 100;
  const rangeRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<null | 'start' | 'end' | 'range'>(null);
  const [startPos, setStartPos] = useState<number | null>(null);
  const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    type: 'start' | 'end' | 'range',
  ) => {
    e.stopPropagation();
    setDragging(type);
    setStartPos(e.clientX);
  };
  const handleMouseMove = (e: MouseEvent) => {
    if (dragging && startPos !== null && rangeRef.current) {
      const delta = e.clientX - startPos;
      const rangeWidth = rangeRef.current.getBoundingClientRect().width;
      const deltaPercent = (delta / rangeWidth) * 100;
      if (dragging === 'start' && rStart + deltaPercent >= 0 && rStart + deltaPercent <= rEnd) {
        handleUpdaterStart(rStart + deltaPercent);
        setStartPos(e.clientX);
      } else if (
        dragging === 'end' &&
        rEnd + deltaPercent <= RANGE_MAX &&
        rEnd + deltaPercent >= rStart
      ) {
        handleUpdaterEnd(rEnd + deltaPercent);
        setStartPos(e.clientX);
      } else if (
        dragging === 'range' &&
        rStart + deltaPercent >= 0 &&
        rEnd + deltaPercent <= RANGE_MAX
      ) {
        handleUpdaterStart(rStart + deltaPercent);
        handleUpdaterEnd(rEnd + deltaPercent);
        setStartPos(e.clientX);
      }
    }
  };
  const handleMouseUp = () => {
    setDragging(null);
    setStartPos(null);
  };
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, startPos, rStart, rEnd]);
  const handleSeek = () => {
    if (videoMeta) {
      const time = (rStart / RANGE_MAX) * videoMeta;
      console.log('time', time);
      const video = (canvas?.getObjects()[0] as fabric.Image).getElement() as HTMLVideoElement;
      video.currentTime = time;
    }
  };
  if (thumbNails.length === 0 && !loading) {
    return null;
  }
  if (loading) {
    return (
      <center>
        <h2>Processing thumbnails...</h2>
      </center>
    );
  }
  const canvas = useCanvas().canvasRef.current;
  const renderRuler = () => {
    const rulerElements = [];
    const totalTicks = 10; // Number of ticks in the ruler
    for (let i = 0; i <= totalTicks; i++) {
      const leftPosition = (i / totalTicks) * 100;
      const timestamp = toTimeString((i / totalTicks) * videoMeta, false);
      rulerElements.push(
        <div
          key={i}
          style={{ left: `${leftPosition}%` }}
          className="absolute h-full border-l border-gray-300"
        >
          <span
            className="text-xs text-gray-300"
            style={{ position: 'absolute', top: '-150%', transform: 'translateX(-50%)' }}
          >
            {timestamp}
          </span>
        </div>,
      );
    }
    return rulerElements;
  };
  return (
    <>
      <div className="relative mb-6 mt-16 flex w-full  flex-col rounded-md  dark:bg-slate-800">
        <div className="relative  h-4 w-full  bg-gray-700">{renderRuler()}</div>
        <Seeker duration={videoMeta} onSeek={handleSeek} />
        <ScrollArea className=" h-full w-full" ref={rangeRef}>
          <div className="flex h-24 w-full  items-start rounded-md border-2 ">
            {thumbNails.map((imgURL, id) => (
              <img
                src={imgURL}
                alt={`sample_video_thumbnail_${id}`}
                key={id}
                className="h-full w-24 object-cover"
              />
            ))}
          </div>
          <div
            className="absolute -top-5  z-[40] flex h-[130%] cursor-pointer rounded-md bg-red-500 bg-opacity-30"
            style={{
              width: `calc(${rEnd - rStart}% )`,
              left: `${rStart}%`,
            }}
            onMouseDown={(e) => handleMouseDown(e, 'range')}
            data-start={toTimeString((rStart / RANGE_MAX) * videoMeta, false)}
            data-end={toTimeString((rEnd / RANGE_MAX) * videoMeta, false)}
          >
            {/* make sure to have little marks, like a ruler, timestamps             */}
            <CustomTooltip
              content={
                <div className="flex flex-col gap-2">
                  <span>{toTimeString((rStart / RANGE_MAX) * videoMeta, false)}</span>
                </div>
              }
            >
              <span
                className="absolute left-0 top-[50%] -translate-x-1/2 translate-y-[-50%]  transform cursor-ew-resize rounded bg-black p-2 text-xs font-semibold text-white"
                onMouseDown={(e) => handleMouseDown(e, 'start')}
                style={{ height: '24px', width: '10px', backgroundColor: 'blue' }}
              />
            </CustomTooltip>
            <CustomTooltip
              content={
                <div className="flex flex-col gap-2">
                  <span>{toTimeString((rEnd / RANGE_MAX) * videoMeta, false)}</span>
                </div>
              }
            >
              <span
                className="absolute  right-0  top-[50%]   translate-x-1/2 translate-y-[-50%] transform cursor-ew-resize rounded bg-black p-2 text-xs font-semibold text-white"
                onMouseDown={(e) => handleMouseDown(e, 'end')}
                style={{ height: '24px', width: '10px', backgroundColor: 'blue' }}
              />
            </CustomTooltip>
            <div
              className="absolute left-0 right-0 top-full translate-y-2 transform text-xs font-semibold text-white"
              style={{ display: 'flex', justifyContent: 'space-between' }}
            >
              <span>{toTimeString((rStart / RANGE_MAX) * videoMeta, false)}</span>
              <span>{toTimeString((rEnd / RANGE_MAX) * videoMeta, false)}</span>
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
      {control}
    </>
  );
};
interface SeekerProps {
  duration: number;
  onSeek: (time: number) => void;
}
const Seeker: React.FC<SeekerProps> = ({ duration, onSeek }) => {
  const [dragging, setDragging] = useState(false);
  const [startPos, setStartPos] = useState(0);
  const [seekerWidth, setSeekerWidth] = useState(0);
  const seekerRef = useRef<HTMLDivElement>(null);
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setDragging(true);
    setStartPos(e.clientX);
    setSeekerWidth(seekerRef.current?.getBoundingClientRect().width!);
  };
  const canvas = useCanvas().canvasRef.current;
  if (!canvas) return null;
  const fabricObject = canvas.getObjects()[0] as fabric.Image;
  const [currTime, setCurrTime] = useState(
    (fabricObject.getElement() as HTMLVideoElement).currentTime,
  );
  const handleMouseMove = (e: MouseEvent) => {
    if (dragging && startPos !== null && seekerWidth !== null && seekerRef.current) {
      const delta = e.clientX - startPos;
      const deltaPercent = (delta / seekerWidth) * 100;
      const newTime = Math.min(Math.max(currTime + (duration * deltaPercent) / 100, 0), duration);
      onSeek(newTime);
    }
  };
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (seekerRef.current) {
      const rect = seekerRef.current.getBoundingClientRect();
      const clickPosition = e.clientX - rect.left;
      const clickPercent = (clickPosition / rect.width) * 100;
      const newTime = (clickPercent / 100) * duration;
      onSeek(newTime);
      setCurrTime(newTime);
      const video = fabricObject.getElement() as HTMLVideoElement;
      video.currentTime = newTime;
    }
  };
  useEffect(() => {
    const video = fabricObject.getElement() as HTMLVideoElement;
    const interval = setInterval(() => {
      setCurrTime(video.currentTime);
    }, 100);
    return () => clearInterval(interval);
  }, [(fabricObject.getElement() as HTMLVideoElement).duration]);
  // const handleMouseUp = () => {
  //   setDragging(false);
  //   setStartPos(0);
  //   setSeekerWidth(0);
  // };
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [dragging, startPos, seekerWidth, currTime, duration]);
  const CurrentTime = (currTime: number, duration: number) => (
    <div
      className="absolute left-0 top-0 z-0 h-full bg-red-500"
      style={{ width: `${(currTime / duration) * 100}%` }}
    ></div>
  );
  return (
    <div
      ref={seekerRef}
      id="seeker"
      className="d relative z-[100] h-2 w-full  cursor-pointer bg-gray-200"
      onClick={handleClick}
    >
      {CurrentTime(currTime, duration)}
    </div>
  );
};
const RecordComponentWithState = () => {
  return (
    <StoreProvider>
      <RecordComponent />
    </StoreProvider>
  );
};
export default RecordComponentWithState;
