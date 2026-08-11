import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

// eslint-plugin-react-hooks v7 (via eslint-config-next 16) ships the React
// Compiler rules below as errors. They flag pre-existing patterns in 12 files —
// mostly `setState` in an effect for client-only feature detection — so they are
// warnings here to keep a dependency bump from carrying a behavioural refactor.
const reactCompilerRules = {
  'react-hooks/set-state-in-effect': 'warn',
  'react-hooks/immutability': 'warn',
  'react-hooks/static-components': 'warn',
  'react-hooks/refs': 'warn',
  'react-hooks/use-memo': 'warn',
};

const config = [
  ...nextCoreWebVitals,
  {
    ignores: ['.next/**', 'out/**', 'next-env.d.ts'],
  },
  {
    rules: reactCompilerRules,
  },
];

export default config;
