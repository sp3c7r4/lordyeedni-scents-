/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Placeholder photography. Swap for your own CDN / S3 host when the real
    // product shots land, then delete this block if images become local.
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
  },
};

export default nextConfig;
