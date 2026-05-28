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
        red: {
          50:  '#FFF5F5',
          100: '#FED7D7',
          200: '#FEB2B2',
          400: '#FC8181',
          500: '#E53E3E',
          600: '#C53030',
          700: '#9B2C2C',
          800: '#822727',
          900: '#63171B',
        },
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        serif: ['DM Serif Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft:   '0 4px 24px rgba(0,0,0,0.06)',
        card:   '0 8px 32px rgba(0,0,0,0.08)',
        strong: '0 16px 48px rgba(0,0,0,0.12)',
        red:    '0 8px 32px rgba(229,62,62,0.25)',
      },
    },
  },
  plugins: [],
}
export default config
