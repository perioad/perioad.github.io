/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: false,
  // Dev only. Lets phones and tablets on the LAN load the dev server, which is
  // the only way to exercise the camera hand tracking and iOS audio paths.
  allowedDevOrigins: ['192.168.2.*'],
};

export default nextConfig;
