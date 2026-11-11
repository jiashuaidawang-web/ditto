import { createSSRApp } from 'vue'
import App from './App.vue'
import '@fontsource/noto-sans-sc/latin-400.css'
import '@fontsource/noto-sans-sc/latin-500.css'
import '@fontsource/noto-sans-sc/latin-700.css'
import '@fontsource/noto-sans-sc/chinese-simplified-400.css'
import '@fontsource/noto-sans-sc/chinese-simplified-500.css'
import '@fontsource/noto-sans-sc/chinese-simplified-700.css'
import './styles/tokens.css'

export function createApp() {
  const app = createSSRApp(App)
  return { app }
}
