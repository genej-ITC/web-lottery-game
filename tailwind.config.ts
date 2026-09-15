import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        paper: '#f3f2f2',
        surface: '#eae9e9',
        ink: '#201e1d',
        divider: 'rgba(32, 30, 29, 0.16)',
        process: { yellow: '#edbb00' },

        gray: {
          100: '#f8f4f4',
          200: '#eae7e7',
          300: '#d7d3d3',
          400: '#bab6b6',
          500: '#9b9797',
          600: '#7d7979',
          700: '#605d5d',
          800: '#444141',
          900: '#2d2b2b',
        },

        cyan: {
          100: '#e9f8ff',
          200: '#cbeeff',
          300: '#99e0ff',
          400: '#62c5ee',
          500: '#38a6cf',
          600: '#1186ac',
          700: '#006786',
          800: '#004961',
          900: '#0a303e',
          DEFAULT: '#0088b0',
        },

        magenta: {
          100: '#fff1f4',
          200: '#ffdee6',
          300: '#ffc0d0',
          400: '#ff90b1',
          500: '#ff458e',
          600: '#d82071',
          700: '#aa0b56',
          800: '#790e3d',
          900: '#4b1528',
          DEFAULT: '#d6006c',
        },
      },

      fontFamily: {
        serif: ['var(--font-serif)', 'var(--font-serif-kr)', 'Source Serif 4', 'system-ui', 'serif'],
      },

      fontSize: {
        micro: ['11px', { lineHeight: '1.3', letterSpacing: '0.1em' }],
        meta: ['12px', { lineHeight: '1.4' }],
        ui: ['14px', { lineHeight: '1.2' }],
        body: ['16px', { lineHeight: '1.55' }],
        lead: ['18px', { lineHeight: '1.55' }],
      },

      borderRadius: {
        'ds-sm': '1px',
        ds: '2px',
        'ds-lg': '4px',
      },

      spacing: {
        'ds-1': '5px',
        'ds-2': '10px',
        'ds-3': '15px',
        'ds-4': '20px',
        'ds-6': '30px',
        'ds-8': '40px',
        ball: '46px',
      },

      boxShadow: {
        'ds-sm': '0 1px 2px rgba(45, 43, 43, 0.14)',
        'ds-md': '0 3px 10px rgba(45, 43, 43, 0.16)',
        'ds-lg': '0 12px 32px rgba(45, 43, 43, 0.22)',
      },

      maxWidth: {
        page: '1040px',
        grid: '560px',
        form: '380px',
        table: '720px',
      },

      keyframes: {
        'ball-pop': {
          '0%': { transform: 'scale(0.88)' },
          '100%': { transform: 'scale(1)' },
        },
        'ball-drop': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        tumble: {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'ball-pop': 'ball-pop 180ms ease-out',
        'ball-drop': 'ball-drop 320ms ease-out',
        tumble: 'tumble 600ms ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;
