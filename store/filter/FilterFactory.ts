import { fabric } from 'fabric';
import { FilterType } from '../EditorStore';
import { FilterInputOptions } from '../FilterStore';
export class FabricFilterFactory {
  static createFilter(filterType: FilterType, options: FilterInputOptions) {
    switch (filterType) {
      case 'Grayscale':
        return new fabric.Image.filters.Grayscale(options as any);
      case 'Invert':
        return new fabric.Image.filters.Invert(options as any);
      case 'RemoveColor':
        const removeColor = new fabric.Image.filters.RemoveColor();
        return removeColor;
      case 'Brightness':
        return new fabric.Image.filters.Brightness(options as any);
      case 'Contrast':
        return new fabric.Image.filters.Contrast(options as any);
      case 'Pixelate':
        return new fabric.Image.filters.Pixelate(options as any);
      case 'Blur':
        return new fabric.Image.filters.Blur(options as any);
      case 'Vibrance':
        return new fabric.Image.filters.Vibrance(options as any);
      case 'Noise':
        return new fabric.Image.filters.Noise(options as any);
      case 'Saturation':
        return new fabric.Image.filters.Saturation(options as any);
      default:
        console.error('Filter type not supported:', filterType);
        return null;
    }
  }
}
