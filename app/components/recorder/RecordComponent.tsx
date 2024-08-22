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
import { ffmpegStore } from '@/store/FFmpegStore';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
    if (!canvasRef.current && stoppedRecording) {
      canvasRef.current = new fabric.Canvas('record-canvas', {
        width: 640,
        height: 360,
        backgroundColor: 'gray',
        preserveObjectStacking: true,
      });
    }
  }, [canvasRef.current, stoppedRecording]);
  const finalCanvasRef = useRef<fabric.Canvas | null>(null);
  useEffect(() => {
    if (!finalCanvasRef.current && stoppedRecording) {
      const finalCanvas = new fabric.Canvas('final-canvas', {
        width: 640,
        height: 360,
        backgroundColor: 'gray',
        preserveObjectStacking: true,
      });
      finalCanvasRef.current = finalCanvas;
    }
  }, [finalCanvasRef.current, stoppedRecording]);
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
      await getThumbnails(duration).then(async (res) => {
        if (thumbnails && thumbnails.length > 0) {
          setThumbnails(thumbnails);
          setThumbnailUrl(thumbnails[0]);
          await processVideo(duration, thumbnails[0]);
        }
      });
    },
  });
  const [ready, setReady] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [trimmedVideoUrl, setTrimmedVideoUrl] = useState('');
  const [thumbnailIsProcessing, setThumbnailIsProcessing] = useState(false);
  // const loadFFMPEG = async () => {
  //   const ffmpeg = ffmpeg;
  //   ffmpeg.on('log', ({ message }) => {
  //     // console.log(message);
  //   });
  //   ffmpeg.on('progress', (e) => {
  //     const progress = Math.round(e.progress / 1000);
  //     editorStore.progress.conversion = progress;
  //     editorStore.progress.rendering = progress;
  //   });
  //   await ffmpeg.load({
  //     coreURL: await toBlobURL(
  //       'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
  //       'text/javascript',
  //     ),
  //     wasmURL: await toBlobURL(
  //       'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm',
  //       'application/wasm',
  //     ),
  //   });
  //   setReady(true);
  // };
  // useEffect(() => {
  //   loadFFMPEG();
  // }, []);
  const ffmpeg = ffmpegStore.ffmpeg;
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
  const MAX_THUMBNAILS = 5;
  const getThumbnails = async (duration: number) => {
    const ffmpeg = ffmpegStore.ffmpeg; // Assuming ffmpeg is already initialized
    const arrayOfImageURIs: string[] = [];
    const numThumbnails = 10; // Set how many thumbnails you want
    const interval = duration / (numThumbnails - 1); // Evenly spaced timestamps across duration
    try {
      if (!videoDataRef.current || !ffmpeg) {
        console.error('No video data or FFmpeg instance available.');
        return;
      }
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoDataRef.current));
      for (let i = 0; i < numThumbnails; i++) {
        const timestamp = i * interval;
        // Generate the thumbnail for this specific timestamp
        await ffmpeg.exec([
          '-y',
          '-ss', // Seek to the specific timestamp
          `${timestamp}`, // Timestamp to seek to
          '-i',
          'input.mp4',
          '-frames:v',
          '1', // Extract 1 frame
          '-vf',
          `scale=320:-1`, // Scale the thumbnail size (optional)
          `thumb${i}.png`, // Output thumbnail file name
        ]);
        // Read the thumbnail back and convert it to a data URL
        const data = await ffmpeg.readFile(`thumb${i}.png`);
        const blob = new Blob([data], { type: 'image/png' });
        const dataURI = await readFileAsBase64(blob);
        arrayOfImageURIs.push(dataURI);
        // Clean up
        await ffmpeg.deleteFile(`thumb${i}.png`);
      }
      return arrayOfImageURIs;
    } catch (error) {
      console.error('Error generating thumbnails:', error);
    }
  };
  const [isTrimming, setIsTrimming] = useState(false);
  const handleTrim = async () => {
    if (isTrimming) return;
    setIsTrimming(true);
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
      if (!ffmpeg) {
        console.error('FFmpeg not loaded');
        setIsTrimming(false);
        return;
      }
      if (!videoDataRef.current) {
        console.error('Video data not available');
        setIsTrimming(false);
      }
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoDataRef.current!));
      if (cropRect) {
        const cropX = cropRect.left! * scaleFactorX;
        const cropY = cropRect.top! * scaleFactorY;
        const cropWidth = cropRect.getScaledWidth() * scaleFactorX;
        const cropHeight = cropRect.getScaledHeight() * scaleFactorY;
        console.log('handleTrim', startTimeInSecs, endTimeInSecs);
        await ffmpeg.exec([
          '-y',
          '-i',
          'input.mp4',
          '-ss',
          startTimeInSecs,
          '-to',
          endTimeInSecs,
          '-c:v',
          'h264', // Use the proper codec
          '-preset',
          'ultrafast',
          '-vf',
          `crop=${cropWidth}:${cropHeight}:${cropX}:${cropY},
          scale=${resolution.width}:${resolution.height},fps=${fps},setdar=${resolution.width}/${resolution.height}
          `,
          '-crf',
          '22',
          // make sure its cropped correctly
          'output.mp4',
        ]);
      } else {
        console.log('handleTrim', startTimeInSecs, endTimeInSecs);
        await ffmpeg.exec([
          '-y',
          '-i',
          'input.mp4',
          '-ss',
          startTimeInSecs,
          '-to',
          endTimeInSecs,
          '-c:v',
          'h264', // Use the proper codec
          '-preset',
          'ultrafast',
          '-vf',
          `scale=${resolution.width}:${resolution.height},fps=${fps},setdar=${resolution.width}/${resolution.height}`,
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
    if (!ffmpeg) {
      console.error('FFmpeg not loaded');
      return;
    }
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
    try {
      await ffmpeg.exec([
        '-i',
        'input.mp4',
        '-r',
        fps.toString(),
        '-s',
        `${resolution.width}x${resolution.height},
          setdar=${resolution.width}/${resolution.height}
        `,
        '-preset',
        'ultrafast',
        '-c:v',
        'h264',
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
      const videoWidth = videoElement.videoWidth;
      const videoHeight = videoElement.videoHeight;
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
        lockMovementX: true,
        lockMovementY: true,
      });
      fabricVideo.setCoords();
      canvas.add(fabricVideo);
      canvas.requestRenderAll();
      const cropRect = canvas.getObjects().find((obj) => obj.type === 'rect') as fabric.Rect;
      if (!cropRect) {
        finalCanvasRef.current?.clear();
        finalCanvasRef.current?.add(fabricVideo);
        finalCanvasRef.current?.requestRenderAll();
      }
    }
  };
  useEffect(() => {
    const canvas = canvasRef.current;
    if (stoppedRecording && videoDataRef.current && canvas) addVideoToCanvas();
  }, [canvasRef, stoppedRecording, resolution]);
  const playVideo = () => {
    const canvas = canvasRef.current;
    const fabricVideo = canvas?.getObjects()[0] as fabric.Image;
    const finalFabricVideo = finalCanvasRef.current?.getObjects()[0] as fabric.Image;
    if (fabricVideo && finalFabricVideo) {
      const videoElement = fabricVideo.getElement() as HTMLVideoElement;
      const finalVideoElement = finalFabricVideo.getElement() as HTMLVideoElement;
      if (videoElement.paused) {
        videoElement.play();
        finalVideoElement.play();
        console.log('PLAYYVIDEO!');
      } else {
        videoElement.pause();
        finalVideoElement.pause();
      }
    }
    renderLoop();
  };
  const renderLoop = () => {
    const canvas = canvasRef.current;
    const finalCanvas = finalCanvasRef.current;
    if (videoRef.current && !videoRef.current.paused) {
      canvas?.requestRenderAll();
      finalCanvas?.requestRenderAll();
      requestAnimationFrame(renderLoop);
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
    const cropX = cropRect.left;
    const cropY = cropRect.top;
    const cropWidth = cropRect.getScaledWidth();
    const cropHeight = cropRect.getScaledHeight();
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
      if (!ffmpeg) {
        console.error('FFmpeg not loaded');
        return;
      }
      await ffmpeg.exec([
        '-i',
        'input.mp4',
        '-vf',
        `crop=${cropWidth}:${cropHeight}:${cropX}:${cropY},
        scale=${resolution.width}:${resolution.height},
        setdar=${resolution.width}/${resolution.height}
      `,
        '-c:v',
        'h264',
        '-preset',
        'ultrafast',
        '-crf',
        '22',
        'cropped_output.mp4',
      ]);
      const data = await ffmpeg.readFile('cropped_output.mp4');
      const croppedVideoBlob = new Blob([data], { type: 'video/mp4' });
      const croppedVideoUrl = URL.createObjectURL(croppedVideoBlob);
      setTrimmedVideoUrl(croppedVideoUrl);
      await getThumbnails(videoDuration).then(async (arrayOfImageURIs) => {
        if (arrayOfImageURIs && arrayOfImageURIs.length > 0) {
          setThumbnails(arrayOfImageURIs);
          setThumbnailUrl(arrayOfImageURIs[2]);
        }
      });
    } catch (error) {
      console.error('Error processing cropped video:', error);
    }
  };
  // const processCroppedVideo = async (croppedBlob: Blob) => {
  //   try {
  //     await ffmpeg.writeFile('cropped_input.mp4', await fetchFile(croppedBlob));
  //     await ffmpeg.exec([
  //       '-i',
  //       'cropped_input.mp4',
  //       '-c:v',
  //       'h264',
  //       '-preset',
  //       'ultrafast',
  //       '-crf',
  //       '22',
  //       'cropped_output.mp4',
  //     ]);
  //     const data = await ffmpeg.readFile('cropped_output.mp4');
  //     const croppedVideoBlob = new Blob([data], { type: 'video/mp4' }); // Ensure buffer usage
  //     const croppedVideoUrl = URL.createObjectURL(croppedVideoBlob);
  //     // Set the cropped video URL to be downloaded
  //     setTrimmedVideoUrl(croppedVideoUrl);
  //     const link = document.createElement('a');
  //     link.href = croppedVideoUrl;
  //     link.setAttribute('download', 'cropped_video.mp4');
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //   } catch (error) {
  //     console.error('Error processing cropped video:', error);
  //   }
  // };
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas?.getObjects();
    canvas?.requestRenderAll();
  }, [canvasRef.current?.getObjects(), canvasRef, stoppedRecording]);
  const renderBothCanvases = () => {
    if (canvasRef.current) {
      canvasRef.current.renderAll();
    }
    if (finalCanvasRef.current) {
      finalCanvasRef.current.renderAll();
    }
  };
  const updatePreview = () => {
    if (videoRef.current && videoDuration) {
      const time = (startTime / 100) * videoDuration;
      const canvasVideo = canvasRef.current
        ?.getObjects()
        .find((obj) => obj.type === 'image') as fabric.Image;
      const videoElement = canvasVideo.getElement() as HTMLVideoElement;
      videoElement.currentTime = time;
      const finalCanvas = finalCanvasRef.current;
      const finalVideo = finalCanvas
        ?.getObjects()
        .find((obj) => obj.type === 'image') as fabric.Image;
      const finalVideoElement = finalVideo?.getElement() as HTMLVideoElement;
      finalVideoElement.currentTime = time;
      // Play both videos
      videoElement.play();
      finalVideoElement.play();
    }
    renderBothCanvases();
  };
  useEffect(() => {
    updatePreview();
  }, [startTime, endTime]);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  useEffect(() => {
    const canvas = canvasRef.current;
    const finalCanvas = finalCanvasRef.current;
    if (!canvas || !finalCanvas) return;
    // set the aspect ratio of the canvas, aspect ration is like "1:1", "16:9", "4:3"
    // calculate the ratio by  calculating like 1:1, 16:9
    const aspectRatioArr = aspectRatio.split(':');
    const aspectRatioNumber = Number(aspectRatioArr[0]) / Number(aspectRatioArr[1]);
    const width = 320;
    const widthAspectRatioed = width * aspectRatioNumber;
    canvas.setWidth(widthAspectRatioed);
    canvas.setHeight(width);
    const canvasObjects = canvas.getObjects().filter((obj) => obj.type === 'image');
    if (canvasObjects.length === 0) return;
    const scaleX = widthAspectRatioed / canvasObjects[0].width!;
    const scaleY = width / canvasObjects[0].height!;
    canvasObjects[0].scaleX = scaleX || 1;
    canvasObjects[0].scaleY = scaleY || 1;
    canvasObjects[0].setCoords();
    const finalCanvasObjects = finalCanvas.getObjects().filter((obj) => obj.type === 'image');
    finalCanvas.setWidth(widthAspectRatioed);
    finalCanvas.setHeight(width);
    if (finalCanvasObjects.length === 0) return;
    const scaleXFinal = widthAspectRatioed / finalCanvasObjects[0].width! || 1;
    const scaleYFinal = width / finalCanvasObjects[0].height! || 1;
    finalCanvasObjects[0].scaleX = scaleXFinal || 1;
    finalCanvasObjects[0].scaleY = scaleYFinal || 1;
    finalCanvasObjects[0].setCoords();
    renderBothCanvases();
    // adjust the video from videoRef to the new aspect ratio as well
  }, [aspectRatio, canvasRef.current?.getObjects()]);
  return (
    <div className=" my-[80px] flex h-full flex-col">
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
      {previewStream && (
        <div className="  container flex  h-full w-full flex-col items-start justify-start gap-y-4">
          <Card className=" flex h-full items-center justify-center">
            <CardContent className="flex flex-col p-6">
              <div className="my-auto flex  h-full">
                <DisplaySection
                  videoRef={videoRef}
                  stoppedRecording={stoppedRecording}
                  previewStream={previewStream}
                  cropPreviewVideo={cropPreview}
                  canvas={canvasRef.current!}
                  startTime={startTime}
                  finalCanvasRef={finalCanvasRef.current!}
                />
                {stoppedRecording && (
                  <div className="flex w-full flex-col">
                    <div className="flex items-center justify-start gap-4">
                      <Select
                        onValueChange={(value) => {
                          setAspectRatio(value as string);
                        }}
                        defaultValue={aspectRatio}
                      >
                        <SelectTrigger className="active:ring-none max-w-[250px] focus:ring-0 focus:ring-offset-0 active:border-none">
                          Resize
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="16:9">16:9</SelectItem>
                          <SelectItem value="4:3">4:3</SelectItem>
                          <SelectItem value="1:1">1:1</SelectItem>
                          <SelectItem value="9:16">9:16</SelectItem>
                          <SelectItem value="3:4">3:4</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        style={{
                          display: stoppedRecording ? 'block' : 'none',
                        }}
                        className="m-4 h-[60px] w-[60px] rounded-full"
                        variant={'default'}
                        onClick={playVideo}
                      >
                        <PlayCircle />
                      </Button>
                    </div>
                    <CropButtonSection
                      applyCrop={applyCrop}
                      addCropRectangle={addCropRectangle}
                      canvasRef={canvasRef}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="flex flex-col">
            {stoppedRecording && thumbnails.length > 0 && (
              <div className="flex  flex-col items-center justify-center gap-y-16">
                <Card>
                  <CardHeader>
                    <CardTitle>Trim Video</CardTitle>
                    <CardDescription>Choose Start and End point</CardDescription>
                  </CardHeader>
                  <CardContent>
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
                      control={<></>}
                    />
                  </CardContent>
                </Card>
                <div className="flex w-full">
                  <div className="flex flex-col">
                    <ProcessingOptions
                      onFpsChange={setFps}
                      onResolutionChange={setResolution}
                      fps={fps}
                      resolution={resolution}
                      canvas={canvasRef.current!}
                      handleTrim={handleTrim}
                      isTrimming={isTrimming}
                    />
                  </div>
                  <DownloadSection trimmedVideoUrl={trimmedVideoUrl} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});
interface DisplaySectionProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  stoppedRecording: boolean;
  previewStream: MediaStream | null;
  cropPreviewVideo: string;
  canvas: fabric.Canvas;
  startTime: number;
  finalCanvasRef: fabric.Canvas;
}
const DisplaySection: React.FC<DisplaySectionProps> = ({
  videoRef,
  stoppedRecording,
  previewStream,
  cropPreviewVideo,
  canvas,
  startTime,
  finalCanvasRef,
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
        backgroundColor: 'gray',
        preserveObjectStacking: true,
      });
    }
  }, [fabricCanvasRef.current]);
  // print the fabric.image based on the dimensions of the cropRect to the canvas with id final-canvas
  useEffect(() => {
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
      selectable: false,
    });
    if (!finalCanvasRef) return;
    finalCanvasRef.clear();
    fabricVideo.scaleToHeight(finalCanvasRef.height!);
    fabricVideo.scaleToWidth(finalCanvasRef.width!);
    fabricVideo.setCoords();
    finalCanvasRef.add(fabricVideo);
  }, [cropRect, cropPreviewVideo]);
  return (
    <div className="flex h-full  w-full flex-wrap items-center justify-center  gap-4">
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
          width: `640px`,
          height: `320px`,
        }}
      />
      {fabricCanvasRef && fabricCanvasRef.current?.getObjects() && (
        <div className="flex flex-wrap items-center justify-center">
          <Card className="flex flex-col gap-4">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>Preview the recorded video</CardDescription>
            </CardHeader>
            <CardContent>
              <canvas
                id="record-canvas"
                style={{
                  opacity: stoppedRecording ? '100%' : '0',
                }}
                className={cn([
                  'recordComponentCanvas  inset-0 transform justify-center drop-shadow-lg transition-all duration-300 ease-in-out',
                ])}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Cropped Preview</CardTitle>
              <CardDescription>Preview the cropped video</CardDescription>
            </CardHeader>
            <CardContent>
              <canvas id="final-canvas" className=" " />
            </CardContent>
          </Card>
        </div>
      )}
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
    <div className="mx-4 ">
      {trimmedVideoUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Final Result</CardTitle>
            <CardDescription>Download the trimmed video</CardDescription>
          </CardHeader>
          <CardContent>
            <video
              controls
              src={trimmedVideoUrl}
              className="h-[320px] w-[640px]"
              width={640}
              height={360}
            />
            <Separator className="my-2" />
            <a href={trimmedVideoUrl} download="trimmed_video.mp4">
              <Button className="m-2 bg-green-700 hover:bg-green-500 ">
                Download Trimmed Video
              </Button>
            </a>
          </CardContent>
        </Card>
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
      <div className="flex  w-full flex-wrap gap-4">
        <Button
          className=" "
          onClick={addCropRectangle}
          disabled={canvas.getObjects().find((obj) => obj.type === 'rect') ? true : false}
        >
          Add Crop Rectangle
        </Button>
        <Button className="" onClick={applyCrop}>
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
  handleTrim: () => void;
  isTrimming: boolean;
}
const ProcessingOptions: React.FC<ProcessingOptionsProps> = observer(
  ({
    onFpsChange: setFps,
    onResolutionChange: setResolution,
    fps,
    resolution,
    canvas,
    isTrimming,
    handleTrim,
  }) => {
    const store = useStores().editorStore;
    return (
      canvas?.getObjects() && (
        <Card className="flex flex-col ">
          <CardHeader>
            <CardTitle>Processing Options</CardTitle>
            <CardDescription>Set the resolution and FPS of the video</CardDescription>
          </CardHeader>
          <CardContent>
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
            <Separator className="my-2" />
            <div className="">
              <Button onClick={handleTrim} disabled={isTrimming ? true : false}>
                {isTrimming ? 'Processing..' : 'Process Video'}
                <Loader2
                  className="ml-2 h-4 w-4 animate-spin"
                  style={{
                    display: isTrimming ? 'block' : 'none',
                  }}
                />
              </Button>
              {store.progress.conversion > 0 && <CustomProgress />}
            </div>
          </CardContent>
        </Card>
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
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const sliderContainerRef = useRef<HTMLDivElement>(null);
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
      const video = (canvas?.getObjects()[0] as fabric.Image)?.getElement() as HTMLVideoElement;
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
    // use videoduration to calculate the timestamps
    return Array.from({ length: 10 }, (_, i) => {
      const timestamp = toTimeString((i / 10) * videoMeta, false);
      const leftPosition = (i / 10) * 100;
      return (
        <div
          key={i}
          style={{
            left: `${leftPosition}%`,
          }}
          className="absolute h-full  border-l border-gray-300"
        >
          <span
            className="text-xs text-slate-600 dark:text-slate-100"
            style={{ position: 'absolute', top: '-150%', transform: 'translateX(0%)' }}
          >
            {timestamp}
          </span>
        </div>
      );
    });
  };
  return (
    <>
      <div
        ref={sliderContainerRef}
        className="relative  mb-6 flex h-[120px]  max-w-[1200px]  flex-col rounded-md dark:bg-slate-800"
      >
        <Seeker duration={videoMeta} onSeek={handleSeek} canvasRef={canvasRef} />
        <div className=" flex  w-full  flex-col items-stretch justify-stretch" ref={rangeRef}>
          <div className="relative  h-4 w-full  overflow-visible bg-gray-700">{renderRuler()}</div>
          <div
            className="my-auto flex  h-full  items-start rounded-md border-2 "
            ref={thumbnailContainerRef}
          >
            {thumbNails.map((imgURL, id) => (
              <img
                src={imgURL}
                alt={`sample_video_thumbnail_${id}`}
                key={id}
                className={cn([`h-full w-[10%]`])}
              />
            ))}
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
                className="absolute left-0 right-0 top-full translate-y-2 transform text-xs font-semibold text-slate-500 dark:text-slate-100"
                style={{ display: 'flex', justifyContent: 'space-between' }}
              >
                <span>{toTimeString((rStart / RANGE_MAX) * videoMeta, false)}</span>
                <span>{toTimeString((rEnd / RANGE_MAX) * videoMeta, false)}</span>
              </div>
            </div>
          </div>
        </div>
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
  const [seekerWidth, setSeekerWidth] = useState(0);
  const seekerRef = useRef<HTMLDivElement>(null);
  const canvas = canvasRef.current;
  if (!canvas) return null;
  const videoElement = (canvas.getObjects()[0] as fabric.Image).getElement() as HTMLVideoElement;
  const [currTime, setCurrTime] = useState(videoElement?.currentTime || 0);
  // Start dragging the seeker
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setDragging(true);
    setSeekerWidth(seekerRef.current?.getBoundingClientRect().width || 0);
  };
  // Handle dragging to seek
  const handleMouseMove = (e: MouseEvent) => {
    if (dragging && seekerWidth && seekerRef.current) {
      const delta = e.clientX - seekerRef.current.getBoundingClientRect().left;
      const newTime = Math.min(Math.max((delta / seekerWidth) * duration, 0), duration);
      onSeek(newTime);
      setCurrTime(newTime);
    }
  };
  // Stop dragging
  const handleMouseUp = () => {
    setDragging(false);
  };
  // Update current time regularly
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrTime(videoElement?.currentTime || 0);
    }, 100);
    return () => clearInterval(interval);
  }, [videoElement]);
  // Handle mouse events
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, seekerWidth, duration]);
  return (
    <div
      ref={seekerRef}
      className="relative z-10 h-2  cursor-pointer bg-gray-200"
      onMouseDown={handleMouseDown}
    >
      <div
        className="absolute left-0 top-0 h-full bg-red-500"
        style={{ width: `${(currTime / duration) * 100}%` }}
      />
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
