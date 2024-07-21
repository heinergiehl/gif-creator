import { useStores } from '@/store';
import { useDndContext } from '@dnd-kit/core';
import { useCallback, useEffect, useState } from 'react';
export const useCarouselUtils = (containerWidth: number) => {
  const [shiftDirection, setShiftDirection] = useState<'left' | 'right' | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const store = useStores().editorStore;
  const ctx = useDndContext();
  const active = ctx.active;
  const handleDeleteFrame = useCallback(
    (index: number): void => {
      const frameToDelete = store.frames[index];
      store.elements = store.elements.filter((element) => element.id !== frameToDelete.id);
      store.frames = store.frames.filter((frame) => frame.id !== store.frames[index].id);
      if (index === store.currentKeyFrame || index === store.frames.length - 1) {
        const newSelectedIndex = (index === 0 ? 0 : index - 1) % store.frames.length;
        store.currentKeyFrame = newSelectedIndex;
      }
    },
    [store],
  );
  useEffect(() => {
    const carouselContent = document.getElementById('carousel-container');
    const positionOfActiveDraggable = active?.rect.current.translated;
    if (!positionOfActiveDraggable || !carouselContent) return;
    const carouselContentRect = carouselContent.getBoundingClientRect();
    const carouselContentWidth = carouselContentRect.width;
    const carouselContentLeft = carouselContentRect.left;
    const carouselContentRight = carouselContentRect.right;
    const activeDraggableLeft = positionOfActiveDraggable.left;
    const activeDraggableRight = positionOfActiveDraggable.right;
    const scrollSpeedRight =
      (100 * Math.abs(activeDraggableRight - carouselContentRight)) / carouselContentWidth;
    const scrollSpeedLeft =
      (100 * Math.abs(carouselContentLeft - activeDraggableLeft)) / carouselContentWidth;
    if (activeDraggableRight > carouselContentRight) {
      carouselContent.scrollLeft += scrollSpeedRight;
    } else if (activeDraggableLeft < carouselContentLeft) {
      carouselContent.scrollLeft -= scrollSpeedLeft;
    }
  }, [active?.rect.current.translated, active?.id]);
  const getBasisOfCardItem = useCallback(() => {
    const carouselWidth = containerWidth;
    // Additional logic if needed
  }, [containerWidth]);
  const calculateTransform = useCallback(
    (index: number, hoverIndex: number) => {
      if (store.elements.find((el) => active?.id === el.id)) return 'translateX(0px)';
      if (!store.isDragging || !ctx.over?.id) return 'translateX(0px)';
      const activeRect = active?.rect.current.translated;
      const overRect = ctx.over?.rect.left;
      if (!activeRect || !overRect) return 'translateX(0px)';
      if (activeRect.left === overRect) return 'translateX(0px)';
      const activeDraggable = document.getElementById(active?.id as string);
      if (!activeDraggable) return 'translateX(0px)';
      const carouselContent = document.getElementById('carousel-container');
      if (!carouselContent) return 'translateX(0px)';
      const carouselContentRect = carouselContent.getBoundingClientRect();
      const activeDraggableLeft = activeRect.left;
      const activeDraggableRight = activeRect.right;
      const carouselContentLeft = carouselContentRect.left;
      const carouselContentRight = carouselContentRect.right;
      const activeDraggableIsOnLeftEdge = activeDraggableLeft < carouselContentLeft;
      const activeDraggableIsOnRightEdge = activeDraggableRight > carouselContentRight;
      console.log('calculateTransform!');
      if (activeDraggableIsOnLeftEdge) return 'translateX(100px)';
      else if (shiftDirection === 'right' && index >= hoverIndex) {
        return 'translateX(100%)';
      } else if (shiftDirection === 'left' && index <= hoverIndex) {
        return 'translateX(-100%)';
      } else return 'translateX(0px)';
    },
    [
      store.isDragging,
      ctx.over?.id,
      shiftDirection,
      hoverIndex,
      store.frames.length,
      store.activeDraggable,
    ],
  );
  return {
    handleDeleteFrame,
    getBasisOfCardItem,
    calculateTransform,
    setShiftDirection,
    setHoverIndex,
    hoverIndex,
    active,
    store,
  };
};
