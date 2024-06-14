import { EditorElement, EffecType, ImageEditorElement, TextEditorElement } from '@/types';
import { fabric } from 'fabric';
import { getUid } from './index';
import { isString } from 'lodash';
import { FaB } from 'react-icons/fa6';
import { FilterInputOptions, FilterType } from '@/store/EditorStore';
// https://jsfiddle.net/i_prikot/pw7yhaLf/
export const CoverImage = fabric.util.createClass(fabric.Image, {
  type: 'coverImage',
  customFilter: 'none',
  disableCrop: false,
  cropWidth: 0,
  cropHeight: 0,
  initialize(element: HTMLImageElement | HTMLVideoElement, options: any) {
    options = options || {};
    options = Object.assign(
      {
        cropHeight: this.height,
        cropWidth: this.width,
      },
      options,
    );
    this.callSuper('initialize', element, options);
  },
  getCrop(image: { width: number; height: number }, size: { width: number; height: number }) {
    const width = size.width;
    const height = size.height;
    const aspectRatio = width / height;
    let newWidth;
    let newHeight;
    const imageRatio = image.width / image.height;
    if (aspectRatio >= imageRatio) {
      newWidth = image.width;
      newHeight = image.width / aspectRatio;
    } else {
      newWidth = image.height * aspectRatio;
      newHeight = image.height;
    }
    const x = (image.width - newWidth) / 2;
    const y = (image.height - newHeight) / 2;
    return {
      cropX: x,
      cropY: y,
      cropWidth: newWidth,
      cropHeight: newHeight,
    };
  },
  _render(ctx: CanvasRenderingContext2D) {
    if (this.disableCrop) {
      this.callSuper('_render', ctx);
      return;
    }
    const width = this.width;
    const height = this.height;
    const crop = this.getCrop(this.getOriginalSize(), {
      width: this.getScaledWidth(),
      height: this.getScaledHeight(),
    });
    const { cropX, cropY, cropWidth, cropHeight } = crop;
    ctx.save();
    const customFilter: EffecType = this.customFilter;
    ctx.filter = getFilterFromEffectType(customFilter);
    ctx.drawImage(
      this._element,
      Math.max(cropX, 0),
      Math.max(cropY, 0),
      Math.max(1, cropWidth),
      Math.max(1, cropHeight),
      -width / 2,
      -height / 2,
      Math.max(0, width),
      Math.max(0, height),
    );
    ctx.filter = 'none';
    ctx.restore();
  },
});
export const CoverVideo = fabric.util.createClass(fabric.Image, {
  type: 'coverVideo',
  customFilter: 'none',
  disableCrop: false,
  cropWidth: 0,
  cropHeight: 0,
  initialize(element: HTMLVideoElement, options: any) {
    options = options || {};
    options = Object.assign(
      {
        cropHeight: this.height,
        cropWidth: this.width,
      },
      options,
    );
    this.callSuper('initialize', element, options);
  },
  getCrop(image: { width: number; height: number }, size: { width: number; height: number }) {
    const width = size.width;
    const height = size.height;
    const aspectRatio = width / height;
    let newWidth;
    let newHeight;
    const imageRatio = image.width / image.height;
    if (aspectRatio >= imageRatio) {
      newWidth = image.width;
      newHeight = image.width / aspectRatio;
    } else {
      newWidth = image.height * aspectRatio;
      newHeight = image.height;
    }
    const x = (image.width - newWidth) / 2;
    const y = (image.height - newHeight) / 2;
    return {
      cropX: x,
      cropY: y,
      cropWidth: newWidth,
      cropHeight: newHeight,
    };
  },
  _render(ctx: CanvasRenderingContext2D) {
    if (this.disableCrop) {
      this.callSuper('_render', ctx);
      return;
    }
    const width = this.width;
    const height = this.height;
    const crop = this.getCrop(this.getOriginalSize(), {
      width: this.getScaledWidth(),
      height: this.getScaledHeight(),
    });
    const { cropX, cropY, cropWidth, cropHeight } = crop;
    const video = this._element as HTMLVideoElement;
    const videoScaledX = video.width / video.videoWidth;
    const videoScaledY = video.height / video.videoHeight;
    ctx.save();
    const customFilter: EffecType = this.customFilter;
    ctx.filter = getFilterFromEffectType(customFilter);
    ctx.drawImage(
      this._element,
      Math.max(cropX, 0) / videoScaledX,
      Math.max(cropY, 0) / videoScaledY,
      Math.max(1, cropWidth) / videoScaledX,
      Math.max(1, cropHeight) / videoScaledY,
      -width / 2,
      -height / 2,
      Math.max(0, width),
      Math.max(0, height),
    );
    ctx.filter = 'none';
    ctx.restore();
  },
});
function getFilterFromEffectType(effectType: EffecType) {
  switch (effectType) {
    case 'blackAndWhite':
      return 'grayscale(100%)';
    case 'sepia':
      return 'sepia(100%)';
    case 'invert':
      return 'invert(100%)';
    case 'saturate':
      return 'saturate(100%)';
    default:
      return 'none';
  }
}
declare module 'fabric' {
  namespace fabric {
    class CoverVideo extends Image {
      type: 'coverVideo';
      disableCrop: boolean;
      cropWidth: number;
      cropHeight: number;
    }
    class CoverImage extends Image {
      type: 'coverImage';
      disableCrop: boolean;
      cropWidth: number;
      cropHeight: number;
    }
    interface CustomProperty {
      id: string;
      [key: string]: any;
    }
    interface IObjectOptions {
      id?: string;
      customProperty?: CustomProperty;
    }
    interface Object {
      id?: string;
      zIndex: number;
      customProperty?: CustomProperty;
    }
    interface Textbox {
      id?: string;
      zIndex: number;
      customProperty?: CustomProperty;
    }
    // make sure typescript knows about RemoeColor filter
    // Image.filters: fabric.IAllFilters
    // export namespace Image {
    //   export namespace customFilters {
    //     interface IRemoveColor extends IBaseFilter {
    //       color: string;
    //       distance: number;
    //     }
    //     interface IExtendedAllFilters {
    //       RemoveColor: IRemoveColor | undefined;
    //     }
    //     export class RemoveColor extends fabric.Image.filters.BaseFilter implements IRemoveColor {
    //       type: 'RemoveColor';
    //       color: string;
    //       distance: number;
    //       constructor(options: { color: string; distance: number });
    //     }
    //     export class Image {
    //       filters: IExtendedAllFilters | undefined;
    //     }
    //   }
    // }
  }
}
// declare global {
//   namespace fabric {
//     export interface IBaseFilter {
//       type: string;
//     }
//     export namespace Image {
//       interface IRemoveColor extends IBaseFilter {
//         color: string;
//         distance: number;
//       }
//       export interface IAllFilters {
//         RemoveColor: IRemoveColor;
//       }
//       export class RemoveColor extends fabric.Image.filters.BaseFilter implements IRemoveColor {
//         type: 'RemoveColor';
//         color: string;
//         distance: number;
//         constructor(options: { color: string; distance: number });
//       }
//       export class Image {
//         filters: IAllFilters | undefined;
//       }
//     }
//   }
// }
fabric.CoverImage = CoverImage;
fabric.CoverVideo = CoverVideo;
export class FabricUitls {
  static getClipMaskRect(editorElement: EditorElement, extraOffset: number) {
    const extraOffsetX = extraOffset / editorElement.placement.scaleX;
    const extraOffsetY = extraOffsetX / editorElement.placement.scaleY;
    const clipRectangle = new fabric.Rect({
      left: editorElement.placement.x - extraOffsetX,
      top: editorElement.placement.y - extraOffsetY,
      width: editorElement.placement.width + extraOffsetX * 2,
      height: editorElement.placement.height + extraOffsetY * 2,
      scaleX: editorElement.placement.scaleX,
      scaleY: editorElement.placement.scaleY,
      absolutePositioned: true,
      fill: 'transparent',
      stroke: 'transparent',
      opacity: 0.5,
      strokeWidth: 0,
    });
    return clipRectangle;
  }
}
export class FabricObjectFactory {
  static canvas: fabric.Canvas | null = null;
  static setCanvas(canvas: fabric.Canvas) {
    FabricObjectFactory.canvas = canvas;
  }
  static createFabricImageFromBlob(ele: ImageEditorElement): Promise<fabric.Image | undefined> {
    return new Promise((resolve, reject) => {
      const id = ele.properties.elementId;
      const src = ele.properties.src;
      const placement = ele.placement;
      const existingObject = FabricObjectFactory.canvas?.getObjects().find((obj) => obj.id === id);
      if (existingObject && FabricObjectFactory.isFabricImage(existingObject)) {
        const updatedImage = FabricObjectFactory.updateFabricImage(ele, existingObject);
        return resolve(updatedImage);
      } else {
        fabric.Image.fromURL(
          src,
          (img) => {
            if (!FabricObjectFactory.canvas) return reject('No Canvas');
            const { x, y, width, height, scaleX, scaleY, rotation, zIndex } = placement;
            const shadowOptions = ele.shadow as fabric.IShadowOptions;
            const filters = ele.filters?.map((filter) => {
              return createFilter(filter.type || filter.filterType, filter);
            });
            if (FabricObjectFactory.canvas)
              img.set({
                filters: [...(filters || [])],
                id,
                left: x,
                top: y,
                width: width || img.width,
                height: height || img.height,
                scaleX: scaleX
                  ? scaleX
                  : (FabricObjectFactory.canvas?.width ?? 1) / (img.width ?? 1),
                scaleY: scaleY
                  ? scaleY
                  : (FabricObjectFactory.canvas?.height ?? 1) / (img.height ?? 1),
                angle: rotation || 0,
                opacity: ele.opacity || 1,
                zIndex: zIndex || 0,
                originX: 'left',
                originY: 'top',
                selectable: true,
                hoverCursor: 'pointer',
                borderColor: 'none',
                crossOrigin: 'anonymous',
                shadow: new fabric.Shadow(shadowOptions),
                stateProperties: fabric.Image.prototype.stateProperties?.concat(['id', 'zIndex']),
                statefullCache: true,
              });
            img.setCoords();
            img.applyFilters();
            FabricObjectFactory.canvas?.requestRenderAll();
            resolve(img);
          },
          { crossOrigin: 'anonymous' },
        );
      }
    });
  }
  static updateFabricImage(options: Partial<ImageEditorElement>, image: fabric.Image) {
    if (!image) return;
    const { x, y, width, height, scaleX, scaleY, rotation, zIndex } = options.placement || {};
    // check if element has shadow property with type of fabric.IShadowOptions
    let shadow: fabric.IShadowOptions | undefined;
    if (
      options.shadow &&
      typeof options.shadow === 'object' &&
      Object.keys(options.shadow).length > 0
    ) {
      shadow = options.shadow;
    }
    image.set({
      id: image.id,
      crossOrigin: 'anonymous',
      opacity: options.opacity,
      zIndex,
      left: x,
      top: y,
      width,
      height,
      scaleX,
      scaleY,
      originX: 'left',
      originY: 'top',
      angle: rotation,
      shadow: new fabric.Shadow({
        ...(image.shadow as fabric.IShadowOptions),
        ...shadow,
      }),
    });
    image.setCoords();
    image.applyFilters();
    FabricObjectFactory.canvas?.requestRenderAll();
    return image;
  }
  static createFabricText(editorElement: TextEditorElement): Promise<fabric.Text> {
    return new Promise((resolve, reject) => {
      const { placement, properties, id, shadow, dataUrl, opacity } = editorElement;
      const { x, y, width, height, scaleX, scaleY, rotation, zIndex } = placement;
      const {
        fontSize,
        fontFamily,
        fill,
        textAlign,
        fontWeight,
        fontStyle,
        text,
        underline,
        overline,
        linethrough,
      } = properties;
      const existingFabricText = FabricObjectFactory.canvas
        ?.getObjects()
        .find((obj) => obj.id === id);
      if (existingFabricText && FabricObjectFactory.isFabricText(existingFabricText)) {
        const updatedText = FabricObjectFactory.updateFabricText(editorElement, existingFabricText);
        if (updatedText === undefined) {
          return reject(new Error('Failed to update text'));
        }
        resolve(updatedText);
      } else {
        const textObject = new fabric.Textbox(text, {
          zIndex: zIndex || 0,
          opacity: opacity || 1,
          id,
          left: x || 0,
          top: y || 0,
          width: width || 200,
          height: height || 200,
          scaleX: scaleX || 1,
          scaleY: scaleY || 1,
          angle: rotation || 0,
          fontSize,
          fontFamily,
          fill: FabricObjectFactory.parseFill(fill),
          textAlign,
          fontWeight,
          fontStyle,
          selectable: true,
          underline,
          overline,
          linethrough,
          hoverCursor: 'pointer',
          editable: true,
          shadow: new fabric.Shadow({
            ...(shadow as fabric.IShadowOptions),
          }),
        });
        textObject.setCoords();
        // this.canvas?.add(textObject);
        resolve(textObject);
      }
    });
  }
  static parseFill = (
    fill: string | fabric.Pattern | fabric.IGradientOptions | undefined,
  ): string | fabric.Gradient | fabric.Pattern => {
    switch (true) {
      case fill === undefined:
        return 'black';
      case isString(fill):
        if (!fill.includes('gradient') && !fill.includes('pattern')) {
          return fill;
        }
        if (fill.includes('gradient')) {
          const gradient = parseGradient(fill);
          return new fabric.Gradient({
            ...gradient,
          });
        }
        return fill;
      case isFabricGradientOptions(fill):
        return new fabric.Gradient({
          ...fill,
        });
      case isFabricPatternOptions(fill):
        return new fabric.Pattern({
          source: fill.source,
          repeat: fill.repeat,
        });
      default:
        return fill;
    }
  };
  static updateFabricText(options: Partial<TextEditorElement>, text: fabric.Text) {
    if (!text) return;
    const { x, y, width, height, scaleX, scaleY, rotation } = options.placement || {};
    let shadow: fabric.IShadowOptions | undefined;
    if (
      options.shadow &&
      typeof options.shadow === 'object' &&
      Object.keys(options.shadow).length > 0
    ) {
      shadow = options.shadow;
    }
    const {
      text: textContent,
      fontSize,
      fontFamily,
      fill,
      textAlign,
      fontWeight,
      fontStyle,
      underline,
      overline,
      linethrough,
    } = options.properties || {};
    text.set({
      zIndex: options.placement?.zIndex,
      id: text.id,
      left: x,
      top: y,
      width,
      height,
      scaleX,
      scaleY,
      angle: rotation,
      text: textContent,
      fontSize,
      fontFamily,
      fill: this.parseFill(fill),
      textAlign,
      fontWeight,
      fontStyle,
      underline,
      overline,
      linethrough,
      shadow: new fabric.Shadow({
        ...(text.shadow as fabric.IShadowOptions),
        ...shadow,
      }),
    });
    text.setCoords();
    return text;
  }
  static manageFabricObject(editorElement: EditorElement): Promise<fabric.Object | undefined> {
    if (FabricObjectFactory.isImageEditorElement(editorElement)) {
      return FabricObjectFactory.createFabricImageFromBlob(editorElement);
    } else if (FabricObjectFactory.isTextEditorElement(editorElement)) {
      return FabricObjectFactory.createFabricText(editorElement);
    }
    return Promise.resolve(undefined);
  }
  static isFabricGradientOptions(
    obj: fabric.IGradientOptions | fabric.IPatternOptions,
  ): obj is fabric.IGradientOptions {
    return 'colorStops' in obj;
  }
  isFabricPatternOptions = (value: any): value is fabric.Pattern => {
    // Add appropriate checks for Pattern properties
    return value && typeof value === 'object' && 'source' in value;
  };
  static isImageEditorElement(editorElement: EditorElement): editorElement is ImageEditorElement {
    return editorElement.type === 'image';
  }
  static isTextEditorElement(editorElement: EditorElement): editorElement is TextEditorElement {
    return editorElement.type === 'text';
  }
  static isFabricImage(obj: fabric.Object): obj is fabric.Image {
    return obj instanceof fabric.Image;
  }
  static isFabricText(obj: fabric.Object): obj is fabric.Text {
    return obj instanceof fabric.Text;
  }
}
export function parseGradient(gradient: string): {
  type: 'linear' | 'radial';
  coords: { x1: number; y1: number; x2: number; y2: number };
  colorStops: fabric.Gradient['colorStops'];
} {
  const typeMatch = gradient.match(/(linear-gradient|radial-gradient)/);
  const type = typeMatch && typeMatch[0] === 'radial-gradient' ? 'radial' : 'linear';
  const directionMatch = gradient.match(/to [\w\s]+,/);
  const direction = directionMatch ? directionMatch[0].replace(',', '').trim() : 'to bottom';
  const colorStopRegex = /rgba?\([^)]+\)|#[0-9a-f]{3,6}|[a-z]+/gi;
  const colorsPart = gradient.replace(/(linear-gradient|radial-gradient|to [\w\s]+,)/gi, '').trim();
  const colors = colorsPart.match(colorStopRegex) || [];
  const colorStops = colors.map((color, index) => ({
    offset: index / (colors.length - 1),
    color,
  }));
  const coords = { x1: 0, y1: 0, x2: 0, y2: 0 };
  // Convert direction to coordinates
  switch (direction) {
    case 'to top':
      coords.x1 = 0;
      coords.y1 = 1;
      coords.x2 = 0;
      coords.y2 = 0;
      break;
    case 'to bottom':
      coords.x1 = 0;
      coords.y1 = 0;
      coords.x2 = 0;
      coords.y2 = 1;
      break;
    case 'to left':
      coords.x1 = 1;
      coords.y1 = 0;
      coords.x2 = 0;
      coords.y2 = 0;
      break;
    case 'to right':
      coords.x1 = 0;
      coords.y1 = 0;
      coords.x2 = 1;
      coords.y2 = 0;
      break;
    case 'to top left':
      coords.x1 = 1;
      coords.y1 = 1;
      coords.x2 = 0;
      coords.y2 = 0;
      break;
    case 'to top right':
      coords.x1 = 0;
      coords.y1 = 1;
      coords.x2 = 1;
      coords.y2 = 0;
      break;
    case 'to bottom left':
      coords.x1 = 1;
      coords.y1 = 0;
      coords.x2 = 0;
      coords.y2 = 1;
      break;
    case 'to bottom right':
      coords.x1 = 0;
      coords.y1 = 0;
      coords.x2 = 1;
      coords.y2 = 1;
      break;
    default:
      coords.x1 = 0;
      coords.y1 = 0;
      coords.x2 = 0;
      coords.y2 = 1;
      break;
  }
  return { type, coords, colorStops };
}
const isFabricGradientOptions = (value: any): value is fabric.IGradientOptions => {
  return value && typeof value === 'object' && 'colorStops' in value;
};
const isFabricPatternOptions = (value: any): value is fabric.Pattern => {
  return value && typeof value === 'object' && 'source' in value;
};
export function gradientObjectToString(gradient: fabric.IGradientOptions): string {
  const directionMap: { [key: string]: string } = {
    '0,0,0,1': 'to bottom',
    '0,1,0,0': 'to top',
    '1,0,0,0': 'to left',
    '0,0,1,0': 'to right',
    '1,1,0,0': 'to top left',
    '0,1,1,0': 'to top right',
    '1,0,0,1': 'to bottom left',
    '0,0,1,1': 'to bottom right',
  };
  if (!gradient?.coords || !gradient.colorStops || !gradient.type) {
    console.log('Invalid gradient object in gradientObjectToString:', gradient);
    return '';
  }
  const coordsKey = `${gradient.coords.x1},${gradient.coords.y1},${gradient.coords.x2},${gradient.coords.y2}`;
  const direction = directionMap[coordsKey] || 'to bottom';
  const colorStops = gradient.colorStops.map((stop) => stop.color).join(', ');
  return `${gradient.type}-gradient(${direction}, ${colorStops})`;
}
export function shadowOptionsToString(shadow: fabric.IShadowOptions): string {
  const { color, blur, offsetX, offsetY } = shadow;
  return `${offsetX}px ${offsetY}px ${blur}px ${color}`;
}
export function stringToShadowOptions(shadow: string): fabric.IShadowOptions {
  const [offsetX, offsetY, blur, color] = shadow.split(' ');
  return {
    offsetX: parseInt(offsetX),
    offsetY: parseInt(offsetY),
    blur: parseInt(blur),
    color,
  };
}
export function isImageEditorElement(
  editorElement: EditorElement,
): editorElement is ImageEditorElement {
  return editorElement.type === 'image';
}
export function isTextEditorElement(
  editorElement: EditorElement,
): editorElement is TextEditorElement {
  return editorElement.type === 'text';
}
export function isFabricImage(obj: fabric.Object): obj is fabric.Image {
  return obj instanceof fabric.Image;
}
export function isFabricText(obj: fabric.Object): obj is fabric.Text {
  return obj instanceof fabric.Text;
}
export const createFilter = (filterType: FilterType, options: FilterInputOptions) => {
  switch (filterType) {
    case FilterType.Grayscale:
      return new fabric.Image.filters.Grayscale(options as any);
    case FilterType.Invert:
      return new fabric.Image.filters.Invert(options as any);
    case FilterType.RemoveColor:
      return new fabric.Image.filters.RemoveColor(options as any);
    case FilterType.Sepia:
      return new fabric.Image.filters.Sepia(options as any);
    case FilterType.Brightness:
      console.log('Creating Brightness filter with options:', options);
      return new fabric.Image.filters.Brightness(options as any);
    case FilterType.Contrast:
      return new fabric.Image.filters.Contrast(options as any);
    case FilterType.Pixelate:
      return new fabric.Image.filters.Pixelate(options as any);
    case FilterType.Blur:
      return new fabric.Image.filters.Blur(options as any);
    case FilterType.Vibrance:
      return new fabric.Image.filters.Vibrance(options as any);
    case FilterType.Noise:
      return new fabric.Image.filters.Noise(options as any);
    case FilterType.Saturation:
      return new fabric.Image.filters.Saturation(options as any);
    default:
      console.error('Filter type not supported:', filterType);
      return null;
  }
};
