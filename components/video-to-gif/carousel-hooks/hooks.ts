import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { EditorStore } from '@/store/EditorStore';
import { useStores } from '@/store';
import { EditorCarouselStore } from '@/store/EditorCarouselStore';
interface CarouselRefs {
  carouselRef: React.RefObject<HTMLDivElement>;
}
interface UseCarouselStateReturn {
  currentlySelectedFrame: number;
  setCurrentlySelectedFrame: React.Dispatch<React.SetStateAction<number>>;
  cardWidth: number;
  setCardWidth: React.Dispatch<React.SetStateAction<number>>;
  carouselRef: React.RefObject<HTMLDivElement>;
  cardsFitInCarousel: number;
  store: EditorStore;
  editorCarouselStore: EditorCarouselStore;
}
export const useCarouselState = (initialCardWidth = 120): UseCarouselStateReturn => {
  const store = useStores().editorStore;
  const editorCarouselStore = useStores().editorCarouselStore;
  const [currentlySelectedFrame, setCurrentlySelectedFrame] = useState<number>(
    store.currentKeyFrame,
  );
  const [cardWidth, setCardWidth] = useState<number>(initialCardWidth);
  const carouselRef = useRef<HTMLDivElement>(null);
  const cardsFitInCarousel = Math.floor((window.innerWidth * 0.6) / cardWidth);
  return {
    currentlySelectedFrame,
    cardsFitInCarousel,
    setCurrentlySelectedFrame,
    cardWidth,
    setCardWidth,
    carouselRef,
    store,
    editorCarouselStore,
  };
};
interface CarouselRefs {
  carouselRef: React.RefObject<HTMLDivElement>;
}
interface UseCarouselEffectsParams {
  refs: CarouselRefs;
  cardWidth: number;
  setCardWidth: React.Dispatch<React.SetStateAction<number>>;
  currentlySelectedFrame: number;
  store: EditorStore;
}
export const useCarouselEffects = ({
  refs,
  cardWidth,
  setCardWidth,
  currentlySelectedFrame,
}: UseCarouselEffectsParams): void => {
  const { carouselRef } = refs;
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
  }, [carouselRef, setCardWidth]); // Make sure to include all dependencies
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
};
interface UseFrameSelectionParams {
  setCurrentlySelectedFrame: React.Dispatch<React.SetStateAction<number>>;
  currentlySelectedFrame: number;
}
export const useFrameSelection = ({
  setCurrentlySelectedFrame,
  currentlySelectedFrame,
}: UseFrameSelectionParams): [number, React.Dispatch<React.SetStateAction<number>>] => {
  const store = useStores().editorStore;
  useEffect(() => {
    if (store.currentKeyFrame !== currentlySelectedFrame) {
      setCurrentlySelectedFrame(store.currentKeyFrame);
    }
  }, [store.currentKeyFrame, currentlySelectedFrame, setCurrentlySelectedFrame]);
  return [currentlySelectedFrame, setCurrentlySelectedFrame];
};
