import { TimeFrameView } from '@/components/timeline/TimeFrameView';
import { ScrollBar, ScrollArea } from '@/components/ui/scroll-area';
import { useStores } from '@/store';
import { observer } from 'mobx-react';
import { useEffect, useRef, useState } from 'react';
interface TimelineProps {
  currentFrame: number;
  onSelectFrame: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  totalFrames: number;
  minWidth: number;
  maxWidth: number;
}
const Timeline: React.FC<TimelineProps> = observer(
  ({ currentFrame, onSelectFrame, totalFrames, minWidth = 300, maxWidth = 800 }) => {
    const editorStore = useStores().editorStore;
    const animationStore = useStores().animationStore;
    const editorCarouselStore = useStores().editorCarouselStore;
    const markerWidthPercent = 100 / totalFrames;
    const [tooltipContent, setTooltipContent] = useState('');
    const timelineRef = useRef<HTMLDivElement>(null);
    const [frameNumber, setFrameNumber] = useState(0);
    // mouse position on the timeline
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    // Create markers based on the interval
    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (timelineRef.current) {
        const { left, width } = timelineRef.current.getBoundingClientRect();
        setMousePosition({
          x: event.clientX - left,
          y: event.clientY,
        });
        const mouseXRelativeToTimeline = event.clientX - left; // Mouse X position relative to the timeline start
        const frameNumber = Math.ceil((mouseXRelativeToTimeline / width) * totalFrames);
        setTooltipContent(`Frame: ${frameNumber}`);
        setFrameNumber(frameNumber);
      }
    };
    const store = useStores().editorStore;
    useEffect(() => {
      // update the start and end time of each frame based on store.maxTime and store.frames.length andtimePerFrame
      store.elements.map((element, index) => {
        if (element.isFrame) {
          animationStore.timePerFrameInMs = store.maxTime / store.frames.length;
          element.timeFrame.start = index * animationStore.timePerFrameInMs;
          element.timeFrame.end = (index + 1) * animationStore.timePerFrameInMs;
        }
      });
    }, [store.elements, animationStore.fps, store.maxTime]);
    let currentPositionPercent = 0;
    if (editorStore.frames.length > 0) {
      currentPositionPercent = markerWidthPercent * currentFrame;
    } else {
      currentPositionPercent = 0;
    }
    const tooltip = useRef<HTMLDivElement>(null);
    return (
      <>
        <div
          style={{ maxWidth: `${maxWidth}px`, minWidth: `${minWidth}px` }}
          onMouseMove={handleMouseMove}
          className="relative flex flex-col items-end m-auto"
          onClick={() => {
            editorStore.currentKeyFrame = frameNumber - 1;
            animationStore.addCurrentGifFrameToCanvas();
          }}
        >
          {/* display current time */}
          <div className="flex space-x-4">
            <div className="text-sm font-semibold text-gray-500">
              {editorCarouselStore?.timelineStore &&
                editorCarouselStore?.timelineStore?.formatCurrentTime()}
            </div>
            {/* display of current frame / total frames */}
            <div className="text-sm font-semibold text-gray-500">
              {editorStore.frames.length ? editorStore.currentKeyFrame + 1 : 0} / {totalFrames}
            </div>
          </div>
          <div
            ref={tooltip}
            data-tip={tooltipContent}
            // make sure the tooltips is being displayed, where the mouse is on the x-axis
            style={{ left: `${mousePosition.x}px` }}
            className="tooltip absolute z-[100] h-20 w-20"
          />
          <div
            ref={timelineRef}
            className="relative z-10 flex items-center justify-center w-full h-4 bg-gray-300 "
            onClick={onSelectFrame}
          >
            <div
              className="absolute left-0 z-10 h-2 bg-blue-500 rounded-lg"
              style={{ width: `${currentPositionPercent}%` }}
            ></div>
            <div
              className="absolute z-[30] h-2 w-2 rounded-full bg-red-500"
              style={{ left: `calc(${currentPositionPercent}% - 5px)` }}
            ></div>
          </div>
        </div>
        <ScrollArea
          type="always"
          className=" flex h-[80px] items-center justify-center rounded-md border bg-slate-100
          dark:bg-slate-800
          "
          style={{
            maxWidth: `${maxWidth - 150}px`,
            height: '80px',
            minWidth: `${minWidth - 300}px`,
          }}
        >
          <div
            className="flex flex-col p-4 "
            style={{
              width: `${maxWidth - 150}px`,
              minWidth: `${minWidth - 300}px`,
            }}
          >
            {editorStore.elements.map(
              (obj, index) => !obj.isFrame && <TimeFrameView key={index} element={obj} />,
            )}
          </div>
        </ScrollArea>
      </>
    );
  },
);
export default Timeline;
