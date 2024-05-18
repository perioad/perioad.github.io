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
    },
  },
  darkMode: 'selector',
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [],
};
export default config;
