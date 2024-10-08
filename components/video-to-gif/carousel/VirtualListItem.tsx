import React from 'react';
import { ListChildComponentProps } from 'react-window';
import Droppable from './Droppable';
import SortableItem from './SortableItem';
import { useStores } from '@/store';
const VirtualizedListItem = ({ index, style, data }: ListChildComponentProps) => {
  const {
    frames,
    handleSelectFrame,
    handleDeleteFrame,
    calculateTransform,
    hoverIndex,
    pasteIndicatorPosition,
    handleMouseEnter,
    handleMouseLeave,
    getBasisOfCardItem,
    store,
  } = data;
  const frame = frames[index];
  return (
    <Droppable
      id={frame.id}
      key={index}
      className="selectable relative mx-2 h-[60px] rounded-md border-2 transition-all duration-300 md:h-[70px]"
      style={{
        ...style,
        transform: calculateTransform(index, hoverIndex),
        transition: 'transform 0.2s',
      }}
    >
      <div>
        {pasteIndicatorPosition === index && (
          <div
            className="absolute inset-y-0 left-0 w-1 bg-blue-500"
            style={{ height: '100%', zIndex: 10 }}
          />
        )}
        <SortableItem
          basisOfCardItem={getBasisOfCardItem()}
          id={frame.id}
          src={frame.src}
          index={index}
          onFrameSelect={handleSelectFrame}
          onFrameDelete={handleDeleteFrame}
          isSelected={store.selectedElements.map((el) => el.id).includes(frame.id)}
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
        />
      </div>
    </Droppable>
  );
};
export default VirtualizedListItem;
