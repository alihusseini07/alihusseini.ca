import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      colors: {
        'accent-purple': '#bf5af2',
        'accent-magenta': '#ff2d78',
        'accent-dim': '#7b2fbe',
        'text-primary': '#f0e6ff',
        'text-secondary': '#9b7ec8',
        'bg-base': '#0d0010',
        'bg-elevated': '#130018',
        'bg-floating': '#1a0022',
      },
    },
  },
  plugins: [],
}

export default config
