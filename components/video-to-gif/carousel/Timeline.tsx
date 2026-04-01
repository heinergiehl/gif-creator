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
        const mouseXRelativeToTimeline = event.clientX - left;
        const frameNumber = Math.ceil((mouseXRelativeToTimeline / width) * totalFrames);
        if (frameNumber) {
          setTooltipContent(`Frame: ${frameNumber}`);
          setFrameNumber(frameNumber);
        }
      }
    };
    useEffect(() => {
      editorStore.syncFramesTimeline();
    }, [animationStore.timePerFrameInMs, editorStore, editorStore.frames.length]);
    let currentPositionPercent = 0;
    if (editorStore.frames.length > 0) {
      currentPositionPercent = markerWidthPercent * currentFrame;
    } else {
      currentPositionPercent = 0;
    }
    const tooltip = useRef<HTMLDivElement>(null);
    const width = `${maxWidth - 100}px`;
    const hasNonFrameElements = editorStore.elements.some((el) => !el.isFrame);
    return (
      <div className="flex w-full flex-col">
        {/* ── Scrubber ── */}
        <div
          id="timeline"
          style={{ width: '100%' }}
          onMouseMove={handleMouseMove}
          className="relative flex flex-col items-stretch justify-center"
          onClick={() => {
            editorStore.setCurrentKeyFrame(frameNumber - 1);
          }}
        >
          {/* time + frame counter */}
          <div className="flex items-center justify-end gap-3 px-2 py-0.5">
            <span className="text-[11px] tabular-nums text-slate-500 dark:text-slate-400">
              {timelineStore && timelineStore?.formatCurrentTime()}
            </span>
            <span className="text-[11px] tabular-nums text-slate-500 dark:text-slate-400">
              {editorStore.frames.length ? editorStore.currentKeyFrame + 1 : 0} / {totalFrames}
            </span>
          </div>
          <div
            ref={tooltip}
            data-tip={tooltipContent}
            style={{ left: `${mousePosition.x}px` }}
            className="tooltip absolute z-[100] h-20 w-20"
          />
          <div
            ref={timelineRef}
            className="relative z-10 flex h-2.5 w-full cursor-pointer items-center rounded-full bg-slate-200 dark:bg-slate-700"
            onClick={onSelectFrame}
          >
            <div
              className="absolute left-0 z-10 h-full rounded-full bg-indigo-500 transition-[width] duration-75"
              style={{ width: `${currentPositionPercent}%` }}
            />
            <div
              className="absolute z-30 h-3.5 w-3.5 rounded-full border-2 border-white bg-indigo-500 shadow-sm transition-[left] duration-75 dark:border-slate-800"
              style={{ left: `calc(${currentPositionPercent}% - 7px)` }}
            />
          </div>
        </div>

        {/* ── Object tracks ── */}
        {hasNonFrameElements && (
          <ScrollArea
            type="always"
            className="mt-1 rounded-md border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
            style={{ width: '100%', maxHeight: '120px' }}
          >
            <div className="flex flex-col gap-0.5 p-1">
              {editorStore.elements.map(
                (obj, index) =>
                  !obj.isFrame && (
                    <TimeFrameView element={obj} key={obj.id || index} />
                  ),
              )}
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        )}
      </div>
    );
  },
);
export default Timeline;
