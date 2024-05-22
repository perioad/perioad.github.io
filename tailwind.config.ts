import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/sections/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        glass: '0 0 30px 5px rgba(0, 0, 0, 1)',
        ['player-button']: 'inset 0 0 5px rgba(0, 0, 0, 1)',
      },
      animation: {
        appear: 'appear 0.5s ease-in-out',
        ['spin-border']: 'spinBorder 5s linear infinite',
      },
      keyframes: {
        appear: {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
        spinBorder: {
          '0%': {
            transform: 'translate(-50%, 0) rotate(0deg)',
          },
          '100%': {
            transform: 'translate(-50%, 0) rotate(360deg)',
          },
        },
      },
    },
  },
  darkMode: 'selector',
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [],
};
export default config;
