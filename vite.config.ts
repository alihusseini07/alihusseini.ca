import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    // allow public dev tunnels (localtunnel / cloudflare quick tunnel) to
    // reach the dev server when testing on a phone off the LAN
    allowedHosts: ['.loca.lt', '.trycloudflare.com'],
  },
})
