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
      },
    },
  },
  darkMode: 'selector',
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [extractColorsToVariables],
};
export default config;

function extractColorsToVariables({ addBase, theme }) {
  const newColors = theme('colors');
  const cssVariables = Object.keys(newColors).reduce((variables, color) => {
    if (typeof newColors[color] === 'object') {
      Object.keys(newColors[color]).forEach((shade) => {
        variables[`--color-${color}-${shade}`] = newColors[color][shade];
      });
    } else {
      variables[`--color-${color}`] = newColors[color];
    }
    return variables;
  }, {});

  addBase({
    ':root': cssVariables,
  });
}
