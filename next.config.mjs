/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: false,
  // Memoises components and hooks at build time, which is why the manual
  // `useMemo` and `useCallback` left in the tree are no longer load bearing. It
  // silently skips anything that breaks the rules of React, so the
  // `react-hooks` warnings are the list of files not getting optimised.
  reactCompiler: true,
  // Dev only. Lets phones and tablets on the LAN load the dev server, which is
  // the only way to exercise the camera hand tracking and iOS audio paths.
  allowedDevOrigins: ['192.168.2.31', '192.168.31.35'],
};

export default nextConfig;
