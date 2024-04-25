import { fabric } from 'fabric';
interface Window {
  gtag: (...args: any[]) => void;
  dataLayer: Record<string, any>;
}
// declare module 'fabric' {
//   namespace fabric {
//     interface Image {
//       id?: string;
//       customProperty?: any;
//     }
//     interface IImageOptions {
//       id?: string;
//       customProperty?: any;
//     }
//     interface Object {
//       id?: string;
//       customProperty?: any;
//     }
//     interface IObjectOptions {
//       id?: string;
//       customProperty?: any;
//     }
//   }
// }
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
    class CustomImage extends Image {
      id?: string;
      customProperty?: any;
    }
    interface ICustomImageOptions {
      id?: string;
      customProperty?: any;
    }
    interface Object {
      id?: string;
      customProperty?: any;
    }
    interface IObjectOptions {
      id?: string;
      customProperty?: any;
    }
  }
}
