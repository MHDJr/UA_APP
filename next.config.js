/** @type {import('next').NextConfig} */
const isExport = process.env.EXPORT_STATIC === 'true';

const nextConfig = {
    ...(isExport ? { output: 'export' } : {}),
    images: { unoptimized: true },
    eslint: {
        ignoreDuringBuilds: true,
    },
    transpilePackages: ["@supabase/supabase-js"],
};

module.exports = nextConfig;