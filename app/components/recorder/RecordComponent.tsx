'use client';
import getBlobDuration from 'get-blob-duration';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import { StoreProvider, useStores } from '@/store';
import { fabric } from 'fabric';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Settings2,
  Crop,
  Check,
  StopCircle,
  Download,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/utils/cn';
import { ffmpegStore } from '@/store/FFmpegStore';
import {
  cropRecordingVideo,
  generateRecordingThumbnails,
  processRecordingVideo,
  toTimeString,
  trimRecordingVideo,
} from './processing';
import { RecorderIntro } from './RecorderIntro';
import { RecorderPreviewPanel } from './RecorderPreviewPanel';
import { RecorderResultCard } from './RecorderResultCard';
import { RecorderTrimRange } from './RecorderTrimRange';
import { useScreenRecorder } from './useScreenRecorder';

const aspectRatios = [
  { value: '16:9', label: '16:9 Widescreen' },
  { value: '4:3', label: '4:3 Classic' },
  { value: '1:1', label: '1:1 Square' },
  { value: '9:16', label: '9:16 Portrait' },
  { value: '3:4', label: '3:4 Tall' },
];
const RecordComponent = observer(() => {
  const editorStore = useStores().editorStore;
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoDataRef = useRef<Blob | null>(null);
  const [fps, setFps] = useState(24);
  const [resolution, setResolution] = useState({ width: 1920, height: 1080 });
  const [videoDuration, setVideoDuration] = useState(0);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [canvasReady, setCanvasReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [hasCropRect, setHasCropRect] = useState(false);
  const finalCanvasRef = useRef<fabric.Canvas | null>(null);

  // ── Custom screen-recorder hook (replaces react-media-recorder) ──
  const handleRecordingStop = useCallback(
    async (_blobUrl: string, blob: Blob) => {
      videoDataRef.current = blob;
      if (videoRef.current) {
        videoRef.current.src = _blobUrl;
        videoRef.current.load();
      }
      const duration = await getBlobDuration(blob);
      setVideoDuration(duration);
      setThumbnailIsProcessing(true);
      editorStore.setProgressState({
        active: true,
        stage: 'generating-thumbnails',
        title: 'Preparing recording preview',
        message: 'Generating thumbnails and loading your recording into the editor…',
        conversion: 15,
        rendering: 0,
      });
      const thumbnailResults = await getThumbnails(duration);
      if (thumbnailResults && thumbnailResults.length > 0) {
        setThumbnails(thumbnailResults);
        setThumbnailUrl(thumbnailResults[0]);
        await processVideo(thumbnailResults[0]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const { startRecording, stopRecording, previewStream, status, error } =
    useScreenRecorder({ onStop: handleRecordingStop });

  const stoppedRecording = status === 'stopped';

  // Create canvases once the recording has stopped and the DOM elements exist
  useEffect(() => {
    if (!stoppedRecording) return;
    if (!canvasRef.current) {
      canvasRef.current = new fabric.Canvas('record-canvas', {
        width: 640,
        height: 360,
        backgroundColor: 'gray',
        preserveObjectStacking: true,
      });
    }
    if (!finalCanvasRef.current) {
      finalCanvasRef.current = new fabric.Canvas('final-canvas', {
        width: 640,
        height: 360,
        backgroundColor: 'gray',
        preserveObjectStacking: true,
      });
    }
  }, [stoppedRecording]);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(100);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [trimmedVideoUrl, setTrimmedVideoUrl] = useState('');
  const [thumbnailIsProcessing, setThumbnailIsProcessing] = useState(false);
  const ffmpeg = ffmpegStore.ffmpeg;
  const isEngineReady = Boolean(ffmpeg?.loaded) && !ffmpegStore.loading;
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
    try {
      if (!videoDataRef.current || !ffmpeg) {
        console.error('No video data or FFmpeg instance available.');
        return;
      }
      return await generateRecordingThumbnails(ffmpeg, videoDataRef.current, duration, 10);
    } catch (error) {
      console.error('Error generating thumbnails:', error);
    }
  };
  const [isTrimming, setIsTrimming] = useState(false);
  const handleTrim = async () => {
    if (isTrimming) return;
    setIsTrimming(true);
    editorStore.setProgressState({
      active: true,
      stage: 'processing-video',
      title: 'Processing recording',
      message: 'Trimming and resizing your screen recording…',
      conversion: 15,
      rendering: 0,
    });
    const duration = videoDuration;
    const startTimeInSecs = toTimeString((startTime / 100) * duration, true);
    const endTimeInSecs = toTimeString((endTime / 100) * duration, true);
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
        return;
      }
      const trimUrl = await trimRecordingVideo({
        ffmpeg,
        videoBlob: videoDataRef.current,
        startTimeInSecs,
        endTimeInSecs,
        resolution,
        fps,
        crop: cropRect
          ? {
              x: Math.round(cropRect.left! * scaleFactorX),
              y: Math.round(cropRect.top! * scaleFactorY),
              width: Math.round(cropRect.getScaledWidth() * scaleFactorX),
              height: Math.round(cropRect.getScaledHeight() * scaleFactorY),
            }
          : undefined,
      });
      setTrimmedVideoUrl(trimUrl);
      editorStore.setProgressState({
        active: false,
        stage: 'ready',
        title: 'Recording ready',
        message: 'Your processed MP4 is ready. Download it or move into the GIF editor next.',
        conversion: 100,
        rendering: 100,
      });
    } catch (error) {
      console.error('Error trimming video:', error);
      editorStore.setProgressState({
        active: false,
        stage: 'error',
        title: 'Processing failed',
        message: 'The recording could not be processed. Try a shorter clip or lower resolution.',
        conversion: 0,
        rendering: 0,
      });
    }
    setIsTrimming(false);
  };
  const processVideo = async (thumbnail: string) => {
    if (!videoDataRef.current || !isEngineReady || !ffmpeg) {
      setThumbnailIsProcessing(false);
      return;
    }
    try {
      const processedVideoUrl = await processRecordingVideo({
        ffmpeg,
        videoBlob: videoDataRef.current,
        resolution,
        fps,
      });
      URL.revokeObjectURL(processedVideoUrl);
    } catch (e) {
      console.error('Error processing video:', e);
    }
    setThumbnailUrl(thumbnail);
    setThumbnailIsProcessing(false);
    editorStore.setProgressState({
      active: false,
      stage: 'ready',
      title: 'Recording preview ready',
      message: 'Your recording is ready to trim, crop, and export.',
      conversion: 100,
      rendering: 100,
    });
  };
  // once resolution or fps changes, process the video
  useEffect(() => {
    if (stoppedRecording) {
      processVideo(thumbnailUrl);
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
      setCanvasReady(true);
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
        setIsPlaying(true);
      } else {
        videoElement.pause();
        finalVideoElement.pause();
        setIsPlaying(false);
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
    setHasCropRect(true);
  };

  const removeCropRectangle = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getObjects().find((obj) => obj.type === 'rect');
    if (rect) {
      canvas.remove(rect);
      canvas.requestRenderAll();
    }
    setHasCropRect(false);
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
    if (cropRect.left == null || cropRect.top == null) return;

    // Canvas-space coordinates (for the fabric.toDataURL preview)
    const canvasCropX = cropRect.left;
    const canvasCropY = cropRect.top;
    const canvasCropWidth = cropRect.getScaledWidth();
    const canvasCropHeight = cropRect.getScaledHeight();

    // Video-space coordinates (for FFmpeg — must be integers)
    const cropX = Math.round(canvasCropX * scaleFactorX);
    const cropY = Math.round(canvasCropY * scaleFactorY);
    const cropWidth = Math.round(canvasCropWidth * scaleFactorX);
    const cropHeight = Math.round(canvasCropHeight * scaleFactorY);
    // Generate a crop preview snapshot (canvas-space coords for fabric)
    // also clear the canvas and add the cropped video
    const fabricVideo = new fabric.Image(video);
    setCropPreview(
      fabricVideo.toDataURL({
        format: 'png',
        left: canvasCropX,
        top: canvasCropY,
        width: canvasCropWidth,
        height: canvasCropHeight,
      }),
    );
    try {
      if (!ffmpeg) {
        console.error('FFmpeg not loaded');
        return;
      }
      editorStore.setProgressState({
        active: true,
        stage: 'cropping-video',
        title: 'Applying crop',
        message: 'Cropping the recording preview and rebuilding the processed video…',
        conversion: 20,
        rendering: 0,
      });
      const croppedVideoUrl = await cropRecordingVideo({
        ffmpeg,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        resolution,
      });
      setTrimmedVideoUrl(croppedVideoUrl);
      await getThumbnails(videoDuration).then(async (arrayOfImageURIs) => {
        if (arrayOfImageURIs && arrayOfImageURIs.length > 0) {
          setThumbnails(arrayOfImageURIs);
          setThumbnailUrl(arrayOfImageURIs[2]);
        }
      });
      editorStore.setProgressState({
        active: false,
        stage: 'ready',
        title: 'Crop applied',
        message: 'The cropped MP4 is ready. Review it below or continue into GIF conversion.',
        conversion: 100,
        rendering: 100,
      });
    } catch (error) {
      console.error('Error processing cropped video:', error);
      editorStore.setProgressState({
        active: false,
        stage: 'error',
        title: 'Crop failed',
        message: 'The crop could not be applied. Try adjusting the crop area and processing again.',
        conversion: 0,
        rendering: 0,
      });
    }
  };

  const renderBothCanvases = () => {
    if (canvasRef.current) {
      canvasRef.current.renderAll();
    }
    if (finalCanvasRef.current) {
      finalCanvasRef.current.renderAll();
    }
  };

  // Track currentTime from canvas video for transport display
  useEffect(() => {
    if (!stoppedRecording || !canvasReady || !canvasRef.current) return;
    const vid = canvasRef.current
      .getObjects()
      .find((o) => o.type === 'image') as fabric.Image | undefined;
    if (!vid) return;
    const el = vid.getElement() as HTMLVideoElement;
    const interval = setInterval(() => {
      setCurrentTime(el.currentTime || 0);
    }, 100);
    return () => clearInterval(interval);
  }, [stoppedRecording, canvasReady]);
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
  }, [aspectRatio, canvasReady]);
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-[#0d0d14]">
      {/* ═══════════════════ TOOLBAR ═══════════════════════ */}
      <div className="flex h-11 shrink-0 items-center border-b border-white/[0.06] bg-[#141420] px-3">
        {/* Left — App title */}
        <div className="flex items-center gap-2 pr-3">
          <div className="h-2 w-2 rounded-full bg-red-500" />
          <span className="text-xs font-semibold tracking-wide text-slate-300">
            Screen Editor
          </span>
        </div>
        <div className="h-4 w-px bg-white/[0.06]" />

        {/* ── Recording state ───────────────────────────── */}
        {previewStream && !stoppedRecording && (
          <>
            <div className="flex items-center gap-2 pl-3">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              <span className="text-xs font-medium text-red-400">REC</span>
            </div>
            <div className="flex-1" />
            <Button
              size="sm"
              variant="destructive"
              onClick={stopRecording}
              className="h-7 gap-1.5 text-xs"
            >
              <StopCircle className="h-3.5 w-3.5" />
              Stop Recording
            </Button>
          </>
        )}

        {/* ── Editing state ─────────────────────────────── */}
        {stoppedRecording && !trimmedVideoUrl && (
          <>
            <div className="flex items-center gap-1 pl-3">
              {/* Crop toggle */}
              <button
                onClick={
                  hasCropRect ? removeCropRectangle : addCropRectangle
                }
                disabled={!canvasReady}
                className={cn(
                  'flex h-7 items-center gap-1.5 rounded px-2.5 text-xs transition-colors disabled:opacity-40',
                  hasCropRect
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'text-slate-400 hover:bg-white/[0.06] hover:text-white',
                )}
              >
                <Crop className="h-3.5 w-3.5" />
                Crop
              </button>

              {hasCropRect && (
                <button
                  onClick={applyCrop}
                  className="flex h-7 items-center gap-1.5 rounded bg-emerald-500/20 px-2.5 text-xs text-emerald-400 transition-colors hover:bg-emerald-500/30"
                >
                  <Check className="h-3.5 w-3.5" />
                  Apply
                </button>
              )}

              <div className="mx-1.5 h-4 w-px bg-white/[0.06]" />

              {/* Aspect ratio */}
              <Select
                onValueChange={setAspectRatio}
                defaultValue={aspectRatio}
              >
                <SelectTrigger className="h-7 w-[130px] border-white/[0.06] bg-transparent text-xs text-slate-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {aspectRatios.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="mx-1.5 h-4 w-px bg-white/[0.06]" />

              {/* Export settings popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex h-7 items-center gap-1.5 rounded px-2.5 text-xs text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white">
                    <Settings2 className="h-3.5 w-3.5" />
                    {resolution.width}×{resolution.height} · {fps}fps
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 border-white/10 bg-[#1a1a2e] p-4">
                  <div className="space-y-3">
                    <div className="text-xs font-medium text-slate-300">
                      Export Settings
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-[10px] uppercase tracking-wider text-slate-500">
                          Width
                        </Label>
                        <Input
                          type="number"
                          min={100}
                          value={resolution.width}
                          onChange={(e) =>
                            setResolution({
                              ...resolution,
                              width: Number(e.target.value),
                            })
                          }
                          className="h-7 border-white/10 bg-white/[0.03] text-xs text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase tracking-wider text-slate-500">
                          Height
                        </Label>
                        <Input
                          type="number"
                          min={100}
                          value={resolution.height}
                          onChange={(e) =>
                            setResolution({
                              ...resolution,
                              height: Number(e.target.value),
                            })
                          }
                          className="h-7 border-white/10 bg-white/[0.03] text-xs text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase tracking-wider text-slate-500">
                        Frame Rate (FPS)
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        max={60}
                        value={fps}
                        onChange={(e) => setFps(Number(e.target.value))}
                        className="h-7 border-white/10 bg-white/[0.03] text-xs text-white"
                      />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1" />

            {/* Export button */}
            <Button
              size="sm"
              onClick={handleTrim}
              disabled={isTrimming || !canvasReady}
              className="h-7 gap-1.5 bg-blue-600 text-xs hover:bg-blue-500"
            >
              {isTrimming ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Processing…
                </>
              ) : (
                'Export'
              )}
            </Button>
          </>
        )}

        {/* ── Result state ──────────────────────────────── */}
        {trimmedVideoUrl && (
          <>
            <div className="flex items-center gap-2 pl-3">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">
                Export complete
              </span>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setTrimmedVideoUrl('')}
                className="h-7 rounded px-2.5 text-xs text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                ← Back to Editor
              </button>
              <a href={trimmedVideoUrl} download="recording.mp4">
                <Button
                  size="sm"
                  className="h-7 gap-1.5 bg-emerald-600 text-xs hover:bg-emerald-500"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
              </a>
              <Link href="/video-to-gif#video-to-gif-tool">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1.5 border-white/10 text-xs text-slate-300"
                >
                  GIF Editor
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </>
        )}

        {/* Idle state — nothing extra in toolbar */}
      </div>

      {/* ═══════════════════ VIEWPORT ══════════════════════ */}
      <div className="relative flex-1 overflow-hidden">
        {/* Idle — launch screen */}
        {!previewStream && !stoppedRecording && (
          <RecorderIntro
            isEngineReady={isEngineReady}
            startRecording={startRecording}
          />
        )}

        {/* Recording + Editing — preview panel */}
        {previewStream && !trimmedVideoUrl && (
          <RecorderPreviewPanel
            videoRef={videoRef}
            stoppedRecording={stoppedRecording}
            previewStream={previewStream}
            cropPreviewVideo={cropPreview}
            canvas={canvasRef.current!}
            finalCanvas={finalCanvasRef.current!}
            canvasReady={canvasReady}
            isPlaying={isPlaying}
            currentTime={currentTime}
            videoDuration={videoDuration}
            onPlayVideo={playVideo}
          />
        )}

        {/* Result — video player */}
        {trimmedVideoUrl && (
          <RecorderResultCard trimmedVideoUrl={trimmedVideoUrl} />
        )}

        {/* Processing progress overlay */}
        {isTrimming && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-[#141420]">
            <div
              className="h-full bg-blue-500/80 transition-all"
              style={{ width: '60%', animation: 'pulse 2s infinite' }}
            />
          </div>
        )}
      </div>

      {/* ═══════════════════ TIMELINE ══════════════════════ */}
      {stoppedRecording && thumbnails.length > 0 && !trimmedVideoUrl && (
        <div className="h-36 shrink-0 border-t border-white/[0.06] bg-[#0a0a12]">
          <RecorderTrimRange
            rangeStart={startTime}
            rangeEnd={endTime}
            onRangeStartChange={(value) => setStartTime(Number(value))}
            onRangeEndChange={(value) => setEndTime(Number(value))}
            loading={thumbnailIsProcessing}
            videoDuration={videoDuration}
            thumbnails={thumbnails}
            canvasRef={canvasRef}
          />
        </div>
      )}
    </div>
  );
});

const RecordComponentWithState = () => {
  return (
    <StoreProvider>
      <RecordComponent />
    </StoreProvider>
  );
};
export default RecordComponentWithState;
