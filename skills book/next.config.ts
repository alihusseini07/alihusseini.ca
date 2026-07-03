import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Disable React strict mode — double-invocation breaks the canvas game loop in dev
  reactStrictMode: false,
}

export default nextConfig
