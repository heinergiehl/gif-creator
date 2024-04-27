import { cn } from '@/utils/cn';
import CardSkeleton from './CardSkeleton';
import { useEffect, useRef, useState } from 'react';
interface CarouselSkeletonProps {
  creatingGifFrames: boolean;
  cardWidth: number;
  carouselWidth: number;
}
export default function CarouselSkeleton({
  creatingGifFrames,
  cardWidth,
  carouselWidth,
}: CarouselSkeletonProps) {
  const skeletonCarouselRef = useRef<HTMLDivElement>(null);
  const [cardsFitInCarousel, setCardsFitInCarousel] = useState(0);
  useEffect(() => {
    if (skeletonCarouselRef.current) {
      if (!cardWidth) return;
      setCardsFitInCarousel(Math.floor(carouselWidth / cardWidth));
    }
  }, [skeletonCarouselRef.current, creatingGifFrames]);
  console.log(cardsFitInCarousel, creatingGifFrames);
  return (
    <div
      ref={skeletonCarouselRef}
      className={cn([
        'carousel carousel-center rounded-box bg-neutral  min-h-[120px] w-[60%] min-w-[300px]  justify-center p-4  xl:min-w-[650px] ',
      ])}
    >
      {Array.from({ length: cardsFitInCarousel }).map((_, index) => (
        <div
          key={index}
          className={cn([
            'carousel-item relative    cursor-pointer transition-colors duration-200 ease-in-out ',
          ])}
        >
          <CardSkeleton />
        </div>
      ))}
    </div>
  );
}
