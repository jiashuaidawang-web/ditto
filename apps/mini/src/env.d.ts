/// <reference types="@dcloudio/types" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'qrcode' {
  interface QRCodeStatic {
    toDataURL(text: string, options?: Record<string, unknown>): Promise<string>
  }
  const QRCode: QRCodeStatic
  export default QRCode
}

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}
