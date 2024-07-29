import { useState, useCallback, useEffect, useRef } from 'react';
import { useDndMonitor, useDndContext } from '@dnd-kit/core';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useStores } from '@/store';
import { EditorStore } from '@/store/EditorStore';
import { EditorCarouselStore } from '@/store/EditorCarouselStore';
interface UseDragAndDropAndCarouselReturn {
  currentlySelectedFrame: number;
  setCurrentlySelectedFrame: React.Dispatch<React.SetStateAction<number>>;
  cardWidth: number;
  carouselRef: React.RefObject<HTMLDivElement>;
  calculateTransform: (index: number, hoverIndex: number) => string;
  handleMouseMove: (event: React.MouseEvent) => void;
  hoverIndex: number | null;
  handleSelectFrame: (id: string, multiSelect?: boolean) => void;
  handleDeleteFrame: (index: number) => void;
  active: any;
  updateHoverIndex: (newIndex: number) => void;
  setMousePosition: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
}
const useDragAndDropAndCarousel = (initialCardWidth = 120): UseDragAndDropAndCarouselReturn => {
  const store = useStores().editorStore;
  const editorCarouselStore = useStores().editorCarouselStore;
  const [currentlySelectedFrame, setCurrentlySelectedFrame] = useState<number>(
    store.currentKeyFrame,
  );
  const [cardWidth, setCardWidth] = useState<number>(initialCardWidth);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [shiftDirection, setShiftDirection] = useState<'left' | 'right' | null>(null);
  const ctx = useDndContext();
  const active = ctx.active;
  useEffect(() => {
    gsap.registerPlugin(ScrollToPlugin);
    const updateCardWidth = (): void => {
      const card = carouselRef.current?.querySelector('.carousel-item') as HTMLDivElement | null;
      if (card) {
        setCardWidth(card.getBoundingClientRect().width);
      }
    };
    const observer = new MutationObserver(updateCardWidth);
    if (carouselRef.current) {
      observer.observe(carouselRef.current, { childList: true });
    }
    updateCardWidth(); // Call immediately to set initial width
    return () => observer.disconnect();
  }, [carouselRef, setCardWidth]);
  useEffect(() => {
    const scrollPosition = cardWidth * currentlySelectedFrame;
    if (carouselRef.current) {
      gsap.to(carouselRef.current, {
        scrollTo: { x: scrollPosition },
        duration: 0.1,
        ease: 'sine.inOut',
      });
    }
    console.log('scrolling to', scrollPosition);
  }, [carouselRef, currentlySelectedFrame, cardWidth]);
  useEffect(() => {
    if (store.currentKeyFrame !== currentlySelectedFrame) {
      setCurrentlySelectedFrame(store.currentKeyFrame);
    }
  }, [store.currentKeyFrame, currentlySelectedFrame, setCurrentlySelectedFrame]);
  useDndMonitor({
    onDragOver: (event) => {
      const newIndex = store.frames.findIndex((frame) => frame.id === event.over?.id);
      updateHoverIndex(newIndex);
    },
    onDragEnd: () => {
      store.activeDraggable = null;
      store.isDragging = false;
    },
    onDragMove: (event) => {
      handleAutoScroll(event);
      const carouselContent = document.getElementById('carousel-container');
      if (!carouselContent) return;
      const carouselContentRect = carouselContent.getBoundingClientRect();
      if (!event.active) return;
      if (!event.active.rect.current.translated) return;
      const draggedItemIsOnEdge =
        event.active?.rect.current.translated?.left < carouselContentRect.left ||
        event.active?.rect.current.translated?.right > carouselContentRect.right;
      if (draggedItemIsOnEdge) return;
      const sortableItems = document.querySelectorAll('.selectable');
      if (sortableItems.length === 0) return;
      const activeDraggable = document.getElementById(event.active?.id as string);
      if (!activeDraggable) return;
      const activeDraggableRect = activeDraggable.getBoundingClientRect();
      if (!event.over) return;
      const overElement = Array.from(sortableItems).reduce((prev, curr) => {
        const currRect = curr.getBoundingClientRect();
        const prevRect = prev.getBoundingClientRect();
        const prevDistance = Math.abs(
          activeDraggableRect.left - prevRect.left + prevRect.width / 2,
        );
        const currDistance = Math.abs(
          activeDraggableRect.left - currRect.left + currRect.width / 2,
        );
        return prevDistance > currDistance ? prev : curr;
      });
      const overElementRect = overElement.getBoundingClientRect();
      const overElementLeft = overElementRect.left;
      const overElementRight = overElementRect.right;
      const overElementWidth = overElementRect.width;
      const overElementCenter = overElementLeft + overElementWidth / 2;
      const mousePosition = event.active.rect.current.translated?.left;
      if (!mousePosition) return;
      const mousePositionRelativeToCarousel = mousePosition - carouselContentRect.left;
      const shiftThreshold = overElementWidth / 2;
      if (mousePositionRelativeToCarousel < overElementCenter - shiftThreshold) {
        setShiftDirection('left');
      } else if (mousePositionRelativeToCarousel > overElementCenter + shiftThreshold) {
        setShiftDirection('right');
      } else {
        setShiftDirection(null);
      }
    },
  });
  const updateHoverIndex = useCallback(
    (newIndex: number) => {
      setHoverIndex(newIndex);
    },
    [
      store.isDragging,
      ctx.active,
      store.frames.length,
      store.activeDraggable,
      store.currentKeyFrame,
    ],
  );
  const calculateTransform = useCallback(
    (index: number, hoverIndex: number): string => {
      if (!active?.id) {
        return 'translateX(0px)';
      }
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
      if (activeDraggableIsOnLeftEdge || activeDraggableIsOnRightEdge) return 'translateX(0px)';
      else if (shiftDirection === 'right' && index >= hoverIndex) {
        console.log('shifting right');
        return 'translateX(100%)';
      } else if (shiftDirection === 'left' && index <= hoverIndex) {
        console.log('shifting left');
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
  const handleAutoScroll = useCallback(
    (event) => {
      const carouselContainer = document.getElementById('carousel-container');
      if (!carouselContainer) return;
      const { left, right } = carouselContainer.getBoundingClientRect();
      const buffer = 50; // buffer distance from edge to start scrolling
      const mouseX = event ? event.clientX : mousePosition ? mousePosition.x : 0;
      if (mouseX) {
        if (mouseX < left + buffer) {
          // Scroll left
          carouselContainer.scrollBy({ left: -10, behavior: 'smooth' });
        } else if (mouseX > right - buffer) {
          // Scroll right
          carouselContainer.scrollBy({ left: 10, behavior: 'smooth' });
        }
      }
    },
    [mousePosition],
  );
  useEffect(() => {
    if (active) {
      const interval = setInterval(handleAutoScroll, 100);
      return () => clearInterval(interval);
    }
  }, [active, handleAutoScroll]);
  const handleSelectFrame = (id: string, multiSelect = false) => {
    const selectedFrameIdx = store.frames.findIndex((frame) => frame.id === id);
    if (multiSelect) {
      const currentSelection = store.selectedElements.map((el) => el.id);
      if (currentSelection.includes(id)) {
        store.setSelectedElements(currentSelection.filter((selectedId) => selectedId !== id));
      } else {
        store.setSelectedElements([...currentSelection, id]);
      }
    } else {
      store.setSelectedElements([id]);
    }
    store.currentKeyFrame = selectedFrameIdx;
    console.log('CURRENTKEYFRAME', store.currentKeyFrame);
  };
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
  const handleMouseMove = (event: React.MouseEvent) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  };
  return {
    currentlySelectedFrame,
    setCurrentlySelectedFrame,
    cardWidth,
    carouselRef,
    calculateTransform,
    handleMouseMove,
    hoverIndex,
    handleSelectFrame,
    handleDeleteFrame,
    active,
    updateHoverIndex,
    setMousePosition,
  };
};
export default useDragAndDropAndCarousel;
