import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink:    { DEFAULT: '#0A0A0F', 2: '#14141C', 3: '#1E1E2A', 4: '#2A2A38' },
        cream:  { DEFAULT: '#FAFAF8' },
        brand:  { DEFAULT: '#E8372A', 2: '#FF4D3E' },
        gold:   { DEFAULT: '#C9A84C' },
        muted:  { DEFAULT: '#6B6B80' },
      },
      fontFamily: {
        sans:    ['Syne', 'system-ui', 'sans-serif'],
        display: ['Instrument Serif', 'Georgia', 'serif'],
        mono:    ['DM Mono', 'monospace'],
      },
      boxShadow: {
        'glow-red': '0 0 40px rgba(232,55,42,0.3), 0 0 80px rgba(232,55,42,0.1)',
        'card':     '0 1px 0 rgba(255,255,255,0.05), 0 20px 40px rgba(0,0,0,0.4)',
      },
      backgroundImage: {
        'grid': 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '60px 60px',
      },
      animation: {
        'marquee': 'marquee 30s linear infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
    },
  },
  plugins: [],
}
export default config
