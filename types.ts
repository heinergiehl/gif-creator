export type Frame = {
  id: string;
  src: string;
};
export type Position = {
  top: number | undefined;
  left: number | undefined;
};
export type EditorElementBase<T extends string, P> = {
  readonly index?: number;
  readonly id: string;
  name: string;
  readonly type: T;
  isFrame?: boolean;
  placement: Placement;
  timeFrame: TimeFrame;
  shadow?: fabric.IShadowOptions;
  properties: P;
  order: number;
  copied?: boolean;
  dataUrl?: string;
  opacity?: number;
  visible?: boolean;
};
export type ImageEditorElement = EditorElementBase<
  'image',
  {
    src: string;
    elementId: string;
  }
>;
export type AudioEditorElement = EditorElementBase<'audio', { src: string; elementId: string }>;
export type TextEditorElement = EditorElementBase<
  'text',
  {
    text: string;
    fontSize: number;
    fontWeight: fabric.TextOptions['fontWeight'];
    fontFamily: string;
    fill: string;
    textBackground: string;
    fontStyle: fabric.TextOptions['fontStyle'];
    textAlign: fabric.TextOptions['textAlign'];
    underline: boolean;
    linethrough: boolean;
    overline: boolean;
  }
>;
export type VideoEditorElement = EditorElementBase<'video', { src: string; elementId: string }>;
export type EditorElement =
  | ImageEditorElement
  | AudioEditorElement
  | TextEditorElement
  | VideoEditorElement;
export type Placement = {
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  zIndex?: number;
};
export type TimeFrame = {
  start: number;
  end: number;
};
export type EffectBase<T extends string> = {
  type: T;
};
export type BlackAndWhiteEffect =
  | EffectBase<'none'>
  | EffectBase<'blackAndWhite'>
  | EffectBase<'sepia'>
  | EffectBase<'invert'>
  | EffectBase<'saturate'>;
export type Effect = BlackAndWhiteEffect;
export type EffecType = Effect['type'];
export type AnimationBase<T, P = {}> = {
  id: string;
  targetId: string;
  duration: number;
  type: T;
  properties: P;
};
export type FadeInAnimation = AnimationBase<'fadeIn'>;
export type FadeOutAnimation = AnimationBase<'fadeOut'>;
export type BreatheAnimation = AnimationBase<'breathe'>;
export type SlideDirection = 'left' | 'right' | 'top' | 'bottom';
export type SlideTextType = 'none' | 'character';
export type SlideInAnimation = AnimationBase<
  'slideIn',
  {
    direction: SlideDirection;
    useClipPath: boolean;
    textType: SlideTextType;
  }
>;
export type SlideOutAnimation = AnimationBase<
  'slideOut',
  {
    direction: SlideDirection;
    useClipPath: boolean;
    textType: SlideTextType;
  }
>;
export type Animation =
  | FadeInAnimation
  | FadeOutAnimation
  | SlideInAnimation
  | SlideOutAnimation
  | BreatheAnimation;
export type MenuOption =
  | ''
  | 'Video'
  | 'Audio'
  | 'Text'
  | 'Image'
  | 'Export'
  | 'Animation'
  | 'Effect'
  | 'Fill'
  | 'Video'
  | 'Image'
  | 'Smilies'
  | 'Gif';
