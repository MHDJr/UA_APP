/** @type {import('next').NextConfig} */
const nextConfig = {
    // REMOVE output: 'export'
    images: { unoptimized: true },
    eslint: {
        ignoreDuringBuilds: true,
    },
    transpilePackages: ["@supabase/supabase-js"],
};

module.exports = nextConfig;