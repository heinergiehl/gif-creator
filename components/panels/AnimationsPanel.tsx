'use client';
import React from 'react';
import { observer } from 'mobx-react';
import { AnimationResource } from '../entity/AnimationResource';
import { getUid } from '@/utils';
import { useStores } from '@/store';
import { useCanvas } from '@/app/components/canvas/canvasContext';
import { Animation } from '@/types';
export const AnimationsPanel = observer(() => {
  const store = useStores().animationStore;
  const { canvasRef } = useCanvas();
  const selectedElements = store?.editorStore?.selectedElements || [];
  const selectedElementAnimations = store.animations.filter((animation) =>
    selectedElements.some((el) => el.id === animation.targetId),
  );
  const hasFadeInAnimation = selectedElementAnimations.some(
    (animation) => animation.type === 'fadeIn',
  );
  const hasFadeOutAnimation = selectedElementAnimations.some(
    (animation) => animation.type === 'fadeOut',
  );
  const hasSlideInAnimation = selectedElementAnimations.some(
    (animation) => animation.type === 'slideIn',
  );
  const hasSlideOutAnimation = selectedElementAnimations.some(
    (animation) => animation.type === 'slideOut',
  );
  const hasConstantAnimation = selectedElementAnimations.some(
    (animation) => animation.type === 'breathe',
  );
  const addAnimationToStore = (animation: Animation) => {
    store.addAnimation(animation);
    if (canvasRef.current) {
      selectedElements.forEach((el) => {
        const anim = { ...animation, targetId: el.id };
        if (!canvasRef.current) return;
        store.applyAnimation(anim, canvasRef.current);
      });
    }
  };
  return (
    <>
      <div className="px-[16px] pb-[8px] pt-[16px] text-sm font-semibold">Animations</div>
      {selectedElements.length > 0 && !hasFadeInAnimation ? (
        <div
          className="cursor-pointer px-[16px] py-[8px] text-sm font-semibold hover:bg-slate-700 hover:text-white"
          onClick={() => {
            addAnimationToStore({
              id: getUid(),
              type: 'fadeIn',
              targetId: selectedElements[0].id,
              duration: 1000,
              properties: {},
            });
          }}
        >
          Add Fade In
        </div>
      ) : null}
      {selectedElements.length > 0 && !hasFadeOutAnimation ? (
        <div
          className="cursor-pointer px-[16px] py-[8px] text-sm font-semibold hover:bg-slate-700 hover:text-white"
          onClick={() => {
            addAnimationToStore({
              id: getUid(),
              type: 'fadeOut',
              targetId: selectedElements[0].id,
              duration: 1000,
              properties: {},
            });
          }}
        >
          Add Fade Out
        </div>
      ) : null}
      {selectedElements.length > 0 && !hasSlideInAnimation ? (
        <div
          className="cursor-pointer px-[16px] py-[8px] text-sm font-semibold hover:bg-slate-700 hover:text-white"
          onClick={() => {
            addAnimationToStore({
              id: getUid(),
              type: 'slideIn',
              targetId: selectedElements[0].id,
              duration: 1000,
              properties: {
                direction: 'left',
                useClipPath: false,
                textType: 'none',
              },
            });
          }}
        >
          Add Slide In
        </div>
      ) : null}
      {selectedElements.length > 0 && !hasSlideOutAnimation ? (
        <div
          className="cursor-pointer px-[16px] py-[8px] text-sm font-semibold hover:bg-slate-700 hover:text-white"
          onClick={() => {
            addAnimationToStore({
              id: getUid(),
              type: 'slideOut',
              targetId: selectedElements[0].id,
              duration: 1000,
              properties: {
                direction: 'right',
                useClipPath: false,
                textType: 'none',
              },
            });
          }}
        >
          Add Slide Out
        </div>
      ) : null}
      {selectedElements.length > 0 && !hasConstantAnimation ? (
        <div
          className="cursor-pointer px-[16px] py-[8px] text-sm font-semibold hover:bg-slate-700 hover:text-white"
          onClick={() => {
            addAnimationToStore({
              id: getUid(),
              type: 'breathe',
              targetId: selectedElements[0].id,
              duration: 1000,
              properties: {},
            });
          }}
        >
          Add Breathing
        </div>
      ) : null}
      {selectedElementAnimations.map((animation) => {
        return <AnimationResource key={animation.id} animation={animation} />;
      })}
    </>
  );
});
