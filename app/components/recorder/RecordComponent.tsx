'use client';
import { useContext, useEffect, useRef, useState } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { fabric } from 'fabric';
import { cn } from '@/utils/cn';
import { observer } from 'mobx-react';
import { StoreProvider, useStores } from '@/store';
import Stepper from './Stepper';
const RecordComponent = observer(() => {
  const screenToVideoStore = useStores().screenToVideoStore;
  console.log(screenToVideoStore);
  const { status, startRecording, stopRecording, mediaBlobUrl, previewStream } =
    useReactMediaRecorder({
      screen: true,
      audio: false,
    });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas>();
  const cropRectRef = useRef<fabric.Rect>();
  const [stoppedRecording, setStoppedRecording] = useState(false);
  const [startedRecording, setStartedRecording] = useState(false);
  const [selectingArea, setSelectingArea] = useState(false);
  const [cropArea, setCropArea] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
        height: 720,
        width: 1280,
        backgroundColor: 'grey',
        preserveObjectStacking: true,
        selectionBorderColor: 'blue',
        selection: true,
      });
    }
  }, []);
  const [newWidth, setNewWidth] = useState(0);
  const [newHeight, setNewHeight] = useState(0);
  useEffect(() => {
    if (previewStream && videoRef.current) {
      videoRef.current.srcObject = previewStream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play();
        setNewWidth(videoRef.current.videoWidth);
        setNewHeight(videoRef.current.videoHeight);
      };
    }
  }, [previewStream]);
  useEffect(() => {
    if (startedRecording) {
      if (videoRef.current) {
        setNewWidth(videoRef.current.videoWidth);
        setNewHeight(videoRef.current.videoHeight);
      }
    }
  }, [startedRecording]);
  const handleCrop = () => {
    if (!fabricCanvasRef.current || !cropRectRef.current) return;
    const cropRect = cropRectRef.current.getBoundingRect();
    const videoElement = new fabric.Image(videoRef.current, {
      left: -cropRect.left,
      top: -cropRect.top,
      originX: 'left',
      originY: 'top',
      objectCaching: false,
      selectable: false,
    });
    fabricCanvasRef.current.clear();
    fabricCanvasRef.current.add(videoElement);
    fabricCanvasRef.current.setWidth(cropRect.width);
    fabricCanvasRef.current.setHeight(cropRect.height);
    fabricCanvasRef.current.renderAll();
  };
  const enableCropMode = (canvas: fabric.Canvas) => {
    if (cropRectRef.current) return;
    cropRectRef.current = new fabric.Rect({
      fill: 'rgba(0,0,0,0.3)',
      originX: 'left',
      originY: 'top',
      stroke: '#ccc',
      opacity: 1,
      width: 200,
      height: 200,
      borderColor: 'red',
      cornerColor: 'green',
      hasRotatingPoint: false,
      selectable: true,
      hasControls: true,
    });
    cropRectRef.current.bringToFront();
    cropRectRef.current.setCoords();
    canvas.add(cropRectRef.current);
    canvas.setActiveObject(cropRectRef.current);
  };
  const handleStopRecording = () => {
    stopRecording();
    setStoppedRecording(true);
    screenToVideoStore.currentStep = 3;
  };
  const handleStartRecording = () => {
    setStartedRecording(true);
    startRecording();
  };
  const handleSelectArea = () => {
    if (fabricCanvasRef.current) {
      enableCropMode(fabricCanvasRef.current);
      setSelectingArea(true);
    }
  };
  const createFinalVideo = () => {
    if (!canvasRef.current) return;
    const stream = canvasRef.current.captureStream();
    const mediaRecorder = new MediaRecorder(stream);
    const chunks: BlobPart[] = [];
    mediaRecorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'edited-video.webm';
      a.click();
      URL.revokeObjectURL(url);
    };
    mediaRecorder.start();
    setTimeout(() => {
      mediaRecorder.stop();
    }, 5000);
  };
  return (
    <div className="container my-[80px] flex h-full">
      <div className="mx-4 flex flex-col">
        <Stepper />
        <div className="flex flex-col text-sm">
          {!startedRecording && (
            <button className="btn btn-primary m-2 max-w-[150px]" onClick={handleStartRecording}>
              Start Recording
            </button>
          )}
          {startedRecording && !stoppedRecording && (
            <button className="btn btn-secondary max-w-[150px]" onClick={handleStopRecording}>
              Stop Recording
            </button>
          )}
          {stoppedRecording && !selectingArea && (
            <button className="btn btn-secondary m-2" onClick={handleSelectArea}>
              Select Area to Crop
            </button>
          )}
          {selectingArea && (
            <button className="btn btn-secondary m-2" onClick={handleCrop}>
              Crop
            </button>
          )}
          {stoppedRecording && (
            <button className="btn btn-secondary m-2" onClick={createFinalVideo}>
              Create Final Video
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-col justify-start">
        <video
          ref={videoRef}
          width={1280}
          height={720}
          controls
          autoPlay
          loop
          style={{ display: stoppedRecording && !selectingArea ? 'block' : 'none' }}
        />
        <div
          className={cn([
            'relative overflow-hidden rounded-lg border border-gray-300',
            !selectingArea && 'hidden',
          ])}
        >
          <canvas ref={canvasRef} width={1280} height={720} />
        </div>
      </div>
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
