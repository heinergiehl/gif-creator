import { CustomTooltip } from '@/app/components/ui/CustomTooltip';
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
    const timelineStore = useStores().timelineStore;
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
        if (frameNumber) {
          setTooltipContent(`Frame: ${frameNumber}`);
          setFrameNumber(frameNumber);
        }
      }
    };
    const store = useStores().editorStore;
    useEffect(() => {
      // update the start and end time of each frame based on store.maxTime and store.frames.length andtimePerFrame
      store.elements.map((element, index) => {
        if (element.isFrame) {
          store.updateMaxTime();
          animationStore.timePerFrameInMs = store.maxTime / store.frames.length;
          element.timeFrame.start = index * animationStore.timePerFrameInMs;
          element.timeFrame.end = (index + 1) * animationStore.timePerFrameInMs;
        }
      });
    }, [store.elements, animationStore.fps, store.maxTime, store.frames]);
    let currentPositionPercent = 0;
    if (editorStore.frames.length > 0) {
      currentPositionPercent = markerWidthPercent * currentFrame;
    } else {
      currentPositionPercent = 0;
    }
    const tooltip = useRef<HTMLDivElement>(null);
    const width = `${maxWidth - 100}px`;
    return (
      <>
        <div
          id="timeline"
          style={{ width }}
          onMouseMove={handleMouseMove}
          className="relative flex h-full flex-col items-end justify-center"
          onClick={() => {
            editorStore.currentKeyFrame = frameNumber - 1;
          }}
        >
          {/* display current time */}
          <div className="mr-20 flex space-x-4">
            <div className="text-sm font-semibold text-gray-500">
              {timelineStore && timelineStore?.formatCurrentTime()}
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
            className="relative z-10 flex h-4 w-full items-center justify-center bg-gray-300 "
            onClick={onSelectFrame}
          >
            <div
              className="absolute left-0 z-10 h-2 rounded-lg bg-blue-500"
              style={{ width: `${currentPositionPercent}%` }}
            ></div>
            <div
              className="absolute z-[30] h-2 w-2 rounded-full bg-red-500"
              style={{ left: `calc(${currentPositionPercent}% - 5px)` }}
            ></div>
          </div>
        </div>
        {editorStore.elements.find((el) => el.isFrame === false) && (
          <ScrollArea
            type="always"
            className="flex h-[100px] items-center justify-center overflow-visible rounded-none border bg-slate-100
          dark:bg-slate-900
          "
            style={{
              minWidth: width,
              width,
              height: '100px',
            }}
          >
            <div
              className="flex h-full w-full flex-col overflow-visible py-2"
              style={{
                minWidth: width,
                width,
              }}
            >
              {editorStore.elements.map(
                (obj, index) =>
                  !obj.isFrame && (
                    <CustomTooltip content={obj.name} key={index}>
                      <TimeFrameView element={obj} />
                    </CustomTooltip>
                  ),
              )}
            </div>
          </ScrollArea>
        )}
      </>
    );
  },
);
export default Timeline;
