/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export', // This tells Next.js to generate the 'out' folder
    images: { unoptimized: true }, // GitHub Pages doesn't support the Next.js Image Optimization API
    eslint: {
        ignoreDuringBuilds: true,
    },
    transpilePackages: ["@supabase/supabase-js"],
};

module.exports = nextConfig;