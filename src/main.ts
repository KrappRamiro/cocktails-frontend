/**
 * Entry point de la aplicación Vue.
 * Registra router, Pinia, y monta la app.
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Self-hosted fonts (fontsource) — Cormorant Garamond (display) + IBM Plex Sans (body)
import '@fontsource/cormorant-garamond/400.css'
import '@fontsource/cormorant-garamond/500.css'
import '@fontsource/cormorant-garamond/700.css'
import '@fontsource/ibm-plex-sans/400.css'
import '@fontsource/ibm-plex-sans/500.css'
import '@fontsource/ibm-plex-sans/600.css'

import './main.css'
import { applyInitialTheme } from './utils/applyInitialTheme'

// Write theme class on <html> before mount to prevent FOUC
applyInitialTheme()

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
