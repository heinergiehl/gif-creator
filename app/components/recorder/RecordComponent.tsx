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
import { set } from 'lodash';
const RecordComponent = observer(() => {
  const supabase = useStores().supabase;
  const editorStore = useStores().editorStore;
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const [stoppedRecording, setStoppedRecording] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoDataRef = useRef<Blob | null>(null);
  const [fps, setFps] = useState(24);
  const [resolution, setResolution] = useState({ width: 1920, height: 1080 });
  const [videoDuration, setVideoDuration] = useState(0);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  // create canvas if it doesn't exist
  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = new fabric.Canvas('record-canvas', {
        width: 640,
        height: 360,
        backgroundColor: 'black',
        preserveObjectStacking: true,
      });
    }
  }, [canvasRef.current]);
  const { startRecording, stopRecording, mediaBlobUrl, previewStream } = useReactMediaRecorder({
    video: true,
    audio: false,
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
        console.log('DURATION', duration, videoDuration, thumbnails);
        if (thumbnails && thumbnails.length > 0) {
          setThumbnails(thumbnails);
          setThumbnailUrl(thumbnails[0]);
          await processVideo(duration, thumbnails[0]);
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
      videoRef.current.onloadedmetadata = (e) => {
        console.log('video metadata loaded', e);
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
    const MAX_NUMBER_OF_IMAGES = 200;
    let offset = duration === MAX_NUMBER_OF_IMAGES ? 1 : duration / MAX_NUMBER_OF_IMAGES;
    let NUMBER_OF_IMAGES = duration < MAX_NUMBER_OF_IMAGES ? duration : 200;
    if (!videoDataRef.current) return;
    let arrayOfImageURIs: string[] = [];
    // Ensure file is written correctly
    try {
      await ffmpegRef.current.writeFile('input.mp4', await fetchFile(videoDataRef.current));
      console.log('file written to FFmpeg FS');
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
        const rect = canvasRef.current
          ?.getObjects()
          .find((obj) => obj.type === 'rect') as fabric.Rect;
        if (!rect) {
          console.error('No crop rectangle found');
          await ffmpegRef.current.exec(['-ss', startTimeInSecs, '-i', 'input.mp4', `img${i}.png`]);
        } else {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const videoEle = canvas.getObjects().find((obj) => obj.type === 'image') as fabric.Image;
          if (!videoEle) return;
          const video = videoEle.getElement() as HTMLVideoElement;
          const scaleFactorX = video.videoWidth / canvas.width!;
          const scaleFactorY = video.videoHeight / canvas.height!;
          const cropWidth = rect.getScaledWidth() * scaleFactorX;
          const cropHeight = rect.getScaledHeight() * scaleFactorY;
          console.log('Before ffmpeg exec');
          await ffmpegRef.current.exec([
            '-ss',
            startTimeInSecs,
            '-i',
            'input.mp4',
            '-vf',
            `crop=${cropWidth}:${cropHeight}:${rect.left! * scaleFactorX}:${rect.top! * scaleFactorY},fps=${fps}`,
            `img${i}.png`,
          ]);
        }
        console.log('image generated');
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
    if (!videoDataRef.current || !ready) {
      console.log('videoDataRef.current no available', videoDataRef.current, 'ready', ready);
      return;
    }
    const ffmpeg = ffmpegRef.current;
    const duration = videoDuration;
    console.log('duration', duration, 'startTime', startTime, 'endTime', endTime);
    const startTimeInSecs = toTimeString((startTime / 100) * duration, true);
    const endTimeInSecs = toTimeString((endTime / 100) * duration, true);
    console.log(startTimeInSecs, endTimeInSecs);
    const cropRect = canvasRef.current
      ?.getObjects()
      .find((obj) => obj.type === 'rect') as fabric.Rect;
    const videoEle = canvasRef.current
      ?.getObjects()
      .find((obj) => obj.type === 'image') as fabric.Image;
    if (!videoEle) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const video = videoEle.getElement() as HTMLVideoElement;
    const scaleFactorX = video.videoWidth / canvas.width!;
    const scaleFactorY = video.videoHeight / canvas.height!;
    try {
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoDataRef.current));
      if (cropRect) {
        const cropX = cropRect.left! * scaleFactorX;
        const cropY = cropRect.top! * scaleFactorY;
        const cropWidth = cropRect.getScaledWidth() * scaleFactorX;
        const cropHeight = cropRect.getScaledHeight() * scaleFactorY;
        await ffmpeg.exec([
          '-ss',
          startTimeInSecs,
          '-i',
          'input.mp4',
          '-to',
          endTimeInSecs,
          '-c:v',
          'libx264', // Use the proper codec
          '-preset',
          'fast',
          '-vf',
          `crop=${cropWidth}:${cropHeight}:${cropX}:${cropY},
          scale=${resolution.width}:${resolution.height},fps=${fps}
          `,
          '-crf',
          '22',
          // make sure its cropped correctly
          'output.mp4',
        ]);
      } else {
        await ffmpeg.exec([
          '-ss',
          startTimeInSecs,
          '-i',
          'input.mp4',
          '-to',
          endTimeInSecs,
          '-c:v',
          'libx264', // Use the proper codec
          '-preset',
          'fast',
          '-vf',
          `scale=${resolution.width}:${resolution.height},fps=${fps}`,
          '-crf',
          '22',
          'output.mp4',
        ]);
      }
      const data = await ffmpeg.readFile('output.mp4');
      const videoBlob = new Blob([data], { type: 'video/mp4' });
      setTrimmedVideoUrl(URL.createObjectURL(videoBlob));
    } catch (error) {
      console.error('Error trimming video:', error);
    }
    setIsTrimming(false);
  };
  const processVideo = async (duration: number, tURL: string) => {
    if (!videoDataRef.current || !ready) {
      console.log('videoDataRef.current no available', videoDataRef.current, 'ready', ready);
      return;
    }
    const ffmpeg = ffmpegRef.current;
    await ffmpeg.writeFile('input.mp4', await fetchFile(videoDataRef.current));
    const cropRect = canvasRef.current
      ?.getObjects()
      .find((obj) => obj.type === 'rect') as fabric.Rect;
    if (!cropRect) return;
    const videoElement = canvasRef.current
      ?.getObjects()
      .find((obj) => obj.type === 'image') as fabric.Image;
    if (!videoElement) return;
    const video = videoElement.getElement() as HTMLVideoElement;
    const cropWidth = cropRect.getScaledWidth();
    const cropHeight = cropRect.getScaledHeight();
    const cropX = cropRect.left! * (video.videoWidth / videoElement.width!);
    const cropY = cropRect.top! * (video.videoHeight / videoElement.height!);
    try {
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
    } catch (e) {
      console.error('Error processing video:', e);
    }
    const data = await ffmpeg.readFile('output_processed.mp4');
    const videoBlob = new Blob([data], { type: 'video/mp4' });
    const videoFileName = `processed_video_${Date.now()}.mp4`;
    const videoUrl = URL.createObjectURL(videoBlob);
    // const link = document.createElement('a');
    // link.href = videoUrl;
    // link.setAttribute('download', videoFileName); // Make sure the name is valid
    // document.body.appendChild(link); // Append to the body
    // link.click();
    setThumbnailUrl(tURL);
    setThumbnailIsProcessing(false);
  };
  // once resolution or fps changes, process the video
  useEffect(() => {
    if (stoppedRecording) {
      console.log('PROCESSING VIDEO again');
      processVideo(videoDuration, thumbnailUrl);
    }
  }, [fps, resolution.height, resolution.width]);
  const addVideoToCanvas = async () => {
    const canvas = canvasRef.current;
    if (stoppedRecording && canvas) {
      const videoElement = document.createElement('video');
      if (!videoDataRef.current) return;
      videoElement.src = URL.createObjectURL(videoDataRef.current);
      await videoElement.play();
      videoElement.width = videoElement.videoWidth;
      videoElement.height = videoElement.videoHeight;
      videoElement.controls = true;
      // Calculate aspect ratio
      const aspectRatio = videoElement.videoWidth / videoElement.videoHeight;
      let videoWidth = videoElement.videoWidth;
      let videoHeight = videoElement.videoHeight;
      // Adjust dimensions based on the canvas aspect ratio
      const canvasAspectRatio = canvas.width! / canvas.height!;
      if (aspectRatio > canvasAspectRatio) {
        // Wider than the canvas, adjust height
        videoHeight = videoElement.videoWidth / aspectRatio;
      } else {
        // Taller than the canvas, adjust width
        videoWidth = videoElement.videoHeight * aspectRatio;
      }
      // Clear the canvas before adding the video
      canvas.clear();
      // Create fabric.Image from video element
      const fabricVideo = new fabric.Image(videoElement);
      // Calculate scale factor for scaling video to fit the canvas
      const scaleX = canvas.width! / videoWidth;
      const scaleY = canvas.height! / videoHeight;
      // Center the video on the canvas
      fabricVideo.set({
        width: videoWidth,
        height: videoHeight,
        scaleX,
        scaleY,
      });
      fabricVideo.setCoords();
      canvas.add(fabricVideo);
      canvas.requestRenderAll();
    }
  };
  useEffect(() => {
    const canvas = canvasRef.current;
    if (stoppedRecording && videoDataRef.current && canvas) addVideoToCanvas();
  }, [canvasRef, stoppedRecording, resolution]);
  const playVideo = () => {
    const canvas = canvasRef.current;
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
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = new fabric.Rect({
      left: 50,
      top: 50,
      fill: 'rgba(0,0,0,0.5)',
      width: 200,
      height: 200,
      borderColor: 'red',
      cornerColor: 'red',
      cornerSize: 10,
      transparentCorners: false,
      stroke: 'red',
      strokeWidth: 2,
      hasRotatingPoint: false,
    });
    // hide rotate control
    rect.setControlVisible('mtr', false);
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.requestRenderAll();
  };
  const [cropPreview, setCropPreview] = useState('');
  const applyCrop = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cropRect = canvas.getObjects().find((obj) => obj.type === 'rect') as fabric.Rect;
    if (!cropRect) return;
    const videoElement = canvas.getObjects().find((obj) => obj.type === 'image') as fabric.Image;
    if (!videoElement) return;
    const video = videoElement.getElement() as HTMLVideoElement;
    const scaleFactorX = video.videoWidth / canvas.width!;
    const scaleFactorY = video.videoHeight / canvas.height!;
    if (!cropRect.left || !cropRect.top) return;
    const cropX = cropRect.left * scaleFactorX;
    const cropY = cropRect.top * scaleFactorY;
    const cropWidth = cropRect.getScaledWidth() * scaleFactorX;
    const cropHeight = cropRect.getScaledHeight() * scaleFactorY;
    console.log('cropX', cropX, 'cropY', cropY, 'cropWidth', cropWidth, 'cropHeight', cropHeight);
    // also clear the canvas and add the cropped video
    const fabricVideo = new fabric.Image(video);
    setCropPreview(
      fabricVideo.toDataURL({
        format: 'png',
        left: cropX,
        top: cropY,
        width: cropWidth,
        height: cropHeight,
      }),
    );
    try {
      await ffmpegRef.current.exec([
        '-i',
        'input.mp4',
        '-vf',
        `crop=${cropWidth}:${cropHeight}:${cropX}:${cropY},
        scale=${resolution.width}:${resolution.height}
      `,
        '-c:v',
        'libx264',
        '-preset',
        'fast',
        '-crf',
        '22',
        'cropped_output.mp4',
      ]);
      const ffmpeg = ffmpegRef.current;
      const data = await ffmpeg.readFile('cropped_output.mp4');
      const croppedVideoBlob = new Blob([data], { type: 'video/mp4' });
      const croppedVideoUrl = URL.createObjectURL(croppedVideoBlob);
      setTrimmedVideoUrl(croppedVideoUrl);
      await getThumbnails(videoDuration).then(async (thumbnails) => {
        if (thumbnails && thumbnails.length > 0) {
          setThumbnails(thumbnails);
          setThumbnailUrl(thumbnails[2]);
        }
      });
    } catch (error) {
      console.error('Error processing cropped video:', error);
    }
  };
  const processCroppedVideo = async (croppedBlob: Blob) => {
    const ffmpeg = ffmpegRef.current;
    try {
      await ffmpeg.writeFile('cropped_input.mp4', await fetchFile(croppedBlob));
      await ffmpeg.exec([
        '-i',
        'cropped_input.mp4',
        '-c:v',
        'libx264',
        '-preset',
        'fast',
        '-crf',
        '22',
        'cropped_output.mp4',
      ]);
      const data = await ffmpeg.readFile('cropped_output.mp4');
      const croppedVideoBlob = new Blob([data], { type: 'video/mp4' }); // Ensure buffer usage
      const croppedVideoUrl = URL.createObjectURL(croppedVideoBlob);
      // Set the cropped video URL to be downloaded
      setTrimmedVideoUrl(croppedVideoUrl);
      const link = document.createElement('a');
      link.href = croppedVideoUrl;
      link.setAttribute('download', 'cropped_video.mp4');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error processing cropped video:', error);
    }
  };
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas?.getObjects();
    canvas?.requestRenderAll();
  }, [canvasRef.current?.getObjects(), canvasRef, stoppedRecording]);
  const cropPreviewRef = useRef<HTMLVideoElement>(null);
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
            canvas={canvasRef.current!}
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
            cropPreviewVideo={cropPreview}
            canvas={canvasRef.current!}
          />
          <CropButtonSection
            applyCrop={applyCrop}
            addCropRectangle={addCropRectangle}
            canvasRef={canvasRef}
          />
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
                    canvasRef.current?.getObjects()[0]
                      ? (
                          (
                            canvasRef.current?.getObjects()[0] as fabric.Image
                          ).getElement() as HTMLVideoElement
                        ).currentTime
                      : 0
                  }
                  rStart={startTime}
                  rEnd={endTime}
                  handleUpdaterStart={(e) => setStartTime(Number(e))}
                  handleUpdaterEnd={(e) => setEndTime(Number(e))}
                  loading={thumbnailIsProcessing}
                  videoMeta={videoDuration}
                  thumbNails={thumbnails}
                  canvasRef={canvasRef}
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
  cropPreviewVideo: string;
  canvas: fabric.Canvas;
}
const DisplaySection: React.FC<DisplaySectionProps> = ({
  videoRef,
  stoppedRecording,
  previewStream,
  cropPreviewVideo,
  canvas,
}) => {
  const cropRect = canvas?.getObjects().find((obj) => obj.type === 'rect') as fabric.Rect;
  const video = canvas?.getObjects().find((obj) => obj.type === 'image') as fabric.Image;
  const videoElement = video?.getElement() as HTMLVideoElement;
  const cropRectWidth = cropRect?.getScaledWidth();
  const cropRectHeight = cropRect?.getScaledHeight();
  const cropRectLeft = cropRect?.left;
  const cropRectTop = cropRect?.top;
  const cropPreviewRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (cropPreviewRef.current) {
      const ctx = cropPreviewRef.current.getContext('2d');
      if (ctx && cropRect) {
        const videoElement = canvas
          .getObjects()
          .find((obj) => obj.type === 'image') as fabric.Image;
        if (!videoElement) return;
        const video = videoElement.getElement() as HTMLVideoElement;
        const scaleFactorX = video.videoWidth / canvas.width!;
        const scaleFactorY = video.videoHeight / canvas.height!;
        const cropWidth = cropRect.getScaledWidth() * scaleFactorX;
        const cropHeight = cropRect.getScaledHeight() * scaleFactorY;
        ctx.drawImage(
          video,
          cropRectLeft! * scaleFactorX,
          cropRectTop! * scaleFactorY,
          cropWidth,
          cropHeight,
          0,
          0,
          160,
          90,
        );
      }
    }
  }, [cropRectWidth, cropRectHeight, cropRectLeft, cropRectTop]);
  const fabricCanvasRef = useRef<fabric.Canvas>(null);
  useEffect(() => {
    if (!fabricCanvasRef.current) {
      fabricCanvasRef.current = new fabric.Canvas('cropPreviewRef', {
        width: 640,
        height: 360,
        backgroundColor: 'black',
        preserveObjectStacking: true,
      });
    }
  }, [fabricCanvasRef.current]);
  // print the fabric.image based on the dimensions of the cropRect to the canvas with id final-canvas
  const finalCanvasRef = useRef<fabric.Canvas>(null);
  useEffect(() => {
    if (!finalCanvasRef.current) {
      const finalCanvas = new fabric.Canvas('final-canvas', {
        width: 640,
        height: 360,
        backgroundColor: 'black',
        preserveObjectStacking: true,
      });
      finalCanvasRef.current = finalCanvas;
    }
    // now add the cropped version of the image / video in the right dimensions to the final-canvas
    const cropRect = canvas?.getObjects().find((obj) => obj.type === 'rect') as fabric.Rect;
    const video = canvas?.getObjects().find((obj) => obj.type === 'image') as fabric.Image;
    if (!video || !cropRect) return;
    const videoElement = video.getElement() as HTMLVideoElement;
    const scaleFactorX = videoElement.videoWidth / canvas.width!;
    const scaleFactorY = videoElement.videoHeight / canvas.height!;
    const cropWidth = cropRect.getScaledWidth() * scaleFactorX;
    const cropHeight = cropRect.getScaledHeight() * scaleFactorY;
    const cropX = cropRect.left! * scaleFactorX;
    const cropY = cropRect.top! * scaleFactorY;
    const fabricVideo = new fabric.Image(videoElement, {
      width: cropWidth,
      height: cropHeight,
      cropX,
      cropY,
    });
    fabricVideo.setCoords();
    finalCanvasRef.current.clear();
    finalCanvasRef.current.add(fabricVideo);
  }, [cropRect, cropPreviewVideo]);
  return (
    <div className="relative">
      <video
        ref={videoRef}
        controls
        autoPlay
        loop
        width={640}
        height={360}
        style={{
          display: !stoppedRecording && previewStream ? 'block' : 'none',
          objectFit: 'cover',
          borderRadius: '10px',
          position: 'absolute',
          width: `640px`,
          height: `360px`,
        }}
      />
      <canvas
        id="record-canvas"
        style={{
          opacity: stoppedRecording ? '100%' : '0',
        }}
        className={cn([
          'recordComponentCanvas absolute inset-0 transform justify-center drop-shadow-lg transition-all duration-300 ease-in-out',
        ])}
      />
      <canvas id="final-canvas" className=" " />
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
  canvasRef: React.RefObject<fabric.Canvas>;
}
const CropButtonSection: React.FC<CropButtonSectionProps> = ({
  addCropRectangle,
  applyCrop,
  canvasRef,
}) => {
  const canvas = canvasRef.current;
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
  canvas: fabric.Canvas;
}
const ProcessingOptions: React.FC<ProcessingOptionsProps> = observer(
  ({ onFpsChange: setFps, onResolutionChange: setResolution, fps, resolution, canvas }) => {
    return (
      canvas?.getObjects() && (
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
  },
);
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
  canvasRef: React.RefObject<fabric.Canvas>;
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
  canvasRef,
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
        <Seeker duration={videoMeta} onSeek={handleSeek} canvasRef={canvasRef} />
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
  canvasRef: React.RefObject<fabric.Canvas>;
}
const Seeker: React.FC<SeekerProps> = ({ duration, onSeek, canvasRef }) => {
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
  const canvas = canvasRef.current;
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
