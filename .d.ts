interface Window {
  gtag: (...args: any[]) => void
  dataLayer: Record<string, any>
}
declare module "fabric/fabric-impl" {
  export interface IObjectOptions {
    id?: string
  }
}
