'use client';
import React from 'react';
import { observer } from 'mobx-react';
import { MdDelete } from 'react-icons/md';
import {
  Animation,
  FadeInAnimation,
  FadeOutAnimation,
  SlideDirection,
  SlideInAnimation,
  SlideOutAnimation,
  SlideTextType,
} from '@/types';
import { useStores } from '@/store';
import { useCanvas } from '@/app/components/canvas/canvasContext';
const ANIMATION_TYPE_TO_LABEL: Record<string, string> = {
  fadeIn: 'Fade In',
  fadeOut: 'Fade Out',
  slideIn: 'Slide In',
  slideOut: 'Slide Out',
  breath: 'Breath',
};
export type AnimationResourceProps = {
  animation: Animation;
};
export const AnimationResource = observer((props: AnimationResourceProps) => {
  const store = useStores().animationStore;
  const removeAnimation = () => {
    store.removeAnimation(props.animation.id);
  };
  return (
    <div className="relative m-[15px] flex min-h-[100px] flex-col items-center overflow-hidden rounded-lg bg-slate-800 p-2">
      <div className="flex w-full flex-row justify-between">
        <div className="w-full py-1 text-left text-base text-white">
          {ANIMATION_TYPE_TO_LABEL[props.animation.type]}
        </div>
        <button
          className="z-10 rounded bg-[rgba(0,0,0,.25)] py-1 text-lg font-bold text-white hover:bg-[#00a0f5]"
          onClick={removeAnimation}
        >
          <MdDelete size="25" />
        </button>
      </div>
      {props.animation.type === 'fadeIn' || props.animation.type === 'fadeOut' ? (
        <FadeAnimation animation={props.animation as FadeInAnimation | FadeOutAnimation} />
      ) : null}
      {props.animation.type === 'slideIn' || props.animation.type === 'slideOut' ? (
        <SlideAnimation animation={props.animation as SlideInAnimation | SlideOutAnimation} />
      ) : null}
    </div>
  );
});
export const FadeAnimation = observer(
  (props: { animation: FadeInAnimation | FadeOutAnimation }) => {
    const store = useStores().animationStore;
    const { canvasRef } = useCanvas();
    return (
      <div className="flex w-full flex-col items-start">
        {/* duration */}
        <div className="my-1 flex flex-row items-center justify-between">
          <div className="text-xs text-white">Duration(s)</div>
          <input
            className="ml-2 w-16 rounded-lg bg-slate-100 px-2 py-1 text-xs text-black"
            type="number"
            value={props.animation.duration / 1000}
            onChange={(e) => {
              const duration = Number(e.target.value) * 1000;
              const isValidDuration = duration > 0;
              let newDuration = isValidDuration ? duration : 0;
              if (newDuration < 10) {
                newDuration = 10;
              }
              store.updateAnimation(props.animation.id, {
                ...props.animation,
                duration: newDuration,
              });
              const canvas = canvasRef.current;
              if (!canvas) return;
              store.refreshAnimations(canvas);
            }}
          />
        </div>
      </div>
    );
  },
);
// Animation has direction 'left', 'right', 'top', 'bottom' in properties
// These properties can be selected by select element
export const SlideAnimation = observer(
  (props: { animation: SlideInAnimation | SlideOutAnimation }) => {
    const store = useStores().animationStore;
    const { canvasRef } = useCanvas();
    return (
      <div className="flex w-full flex-col items-start">
        {/* duration */}
        <div className="my-1 flex flex-row items-center justify-between">
          <div className="text-xs text-white">Duration(s)</div>
          <input
            className="ml-2 w-16 rounded-lg bg-slate-100 px-2 py-1 text-xs text-black"
            type="number"
            value={props.animation.duration / 1000}
            onChange={(e) => {
              const duration = Number(e.target.value) * 1000;
              const isValidDuration = duration > 0;
              let newDuration = isValidDuration ? duration : 0;
              if (newDuration < 10) {
                newDuration = 10;
              }
              store.updateAnimation(props.animation.id, {
                ...props.animation,
                duration: newDuration,
              });
              const canvas = canvasRef.current;
              if (!canvas) return;
              store.refreshAnimations(canvas);
            }}
          />
        </div>
        <div className="my-1 flex flex-row items-center justify-between">
          <div className="text-xs text-white">Direction</div>
          <select
            className="ml-2 w-16 rounded-lg bg-slate-100 px-2 py-1 text-xs text-black"
            value={props.animation.properties.direction}
            onChange={(e) => {
              store.updateAnimation(props.animation.id, {
                ...props.animation,
                properties: {
                  ...props.animation.properties,
                  direction: e.target.value as SlideDirection,
                },
              });
              const canvas = canvasRef.current;
              if (!canvas) return;
              store.refreshAnimations(canvas);
            }}
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
          </select>
        </div>
        <div className="my-1 flex flex-row items-center justify-between">
          <div className="text-xs text-white">Use Mask</div>
          <input
            className="ml-2 w-16 rounded-lg bg-slate-100 px-2 py-1 text-xs text-black"
            type="checkbox"
            checked={props.animation.properties.useClipPath}
            onChange={(e) => {
              store.updateAnimation(props.animation.id, {
                ...props.animation,
                properties: {
                  ...props.animation.properties,
                  useClipPath: e.target.checked,
                },
              });
              const canvas = canvasRef.current;
              if (!canvas) return;
              store.refreshAnimations(canvas);
            }}
          />
        </div>
        <div className="my-1 flex flex-row items-center justify-between">
          <div className="text-xs text-white">Type</div>
          <select
            className="ml-2 w-16 rounded-lg bg-slate-100 px-2 py-1 text-xs text-black"
            value={props.animation.properties.textType}
            onChange={(e) => {
              store.updateAnimation(props.animation.id, {
                ...props.animation,
                properties: {
                  ...props.animation.properties,
                  textType: e.target.value as SlideTextType,
                },
              });
              const canvas = canvasRef.current;
              if (!canvas) return;
              store.refreshAnimations(canvas);
            }}
          >
            <option value="none">None</option>
            <option value="character">Character</option>
          </select>
        </div>
      </div>
    );
  },
);
