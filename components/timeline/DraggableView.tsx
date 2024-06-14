import { useStores } from '@/store';
import React, { MouseEventHandler, useEffect, useRef } from 'react';
import { observer } from 'mobx-react';
const DragableView = observer(function DragableView(props: {
  children?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  value: number;
  total: number;
  onChange: (value: number) => void;
}) {
  const ref = useRef<{
    div: HTMLDivElement | null;
    isDragging: boolean;
    initialMouseX: number;
    initialLeft: number;
  }>({
    div: null,
    isDragging: false,
    initialMouseX: 0,
    initialLeft: 0,
  });
  const { current: data } = ref;
  function calculateNewValue(mouseX: number): number {
    if (!data.div || !data.div.parentElement) return 0;
    const deltaX = mouseX - data.initialMouseX;
    const parentWidth = data.div.parentElement.clientWidth;
    const newLeft = data.initialLeft + deltaX;
    const maxLeft = parentWidth - data.div.clientWidth;
    const boundedLeft = Math.max(0, Math.min(maxLeft, newLeft));
    return (boundedLeft / parentWidth) * props.total;
  }
  const handleMouseDown: MouseEventHandler<HTMLDivElement> = (event) => {
    if (!data.div || props.disabled) return;
    data.isDragging = true;
    data.initialMouseX = event.clientX;
    data.initialLeft = data.div.offsetLeft;
    document.body.style.userSelect = 'none';
  };
  const handleMouseMove = (event: MouseEvent) => {
    if (!data.div || !data.isDragging) return;
    const newValue = calculateNewValue(event.clientX);
    data.div.style.left = `${(newValue / props.total) * 100}%`;
    event.preventDefault();
  };
  const handleMouseUp = (event: MouseEvent) => {
    if (!data.div || !data.isDragging) return;
    data.isDragging = false;
    props.onChange(calculateNewValue(event.clientX));
    document.body.style.userSelect = 'auto';
    event.preventDefault();
  };
  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseUp, handleMouseMove]);
  return (
    <div
      ref={(r) => {
        data.div = r;
      }}
      className={`h-100 absolute ${props.className}`}
      style={{
        left: (Math.max(0, Math.min(props.total, props.value)) / props.total) * 100 + '%',
        top: 0,
        bottom: 0,
        ...props.style,
      }}
      onMouseDown={handleMouseDown}
    >
      {props.children}
    </div>
  );
});
export default DragableView;
