interface Window {
  gtag: (...args: any[]) => void
  dataLayer: Record<string, any>
}
declare module "fabric" {
  export interface IObjectOptions {
    id?: string
  }
}
