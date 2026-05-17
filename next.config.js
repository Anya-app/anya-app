/** @type {import('next').NextConfig} */
const nextConfig = {
  // i18n handled via [locale] route segment — no next-intl plugin needed
  experimental: {
    // serverComponentsExternalPackages: [],
  },
};

// Only wrap with next-pwa in production to avoid SW conflicts in dev
try {
  const withPWA = require("next-pwa")({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    register: true,
    skipWaiting: true,
  });
  module.exports = withPWA(nextConfig);
} catch {
  // next-pwa not installed yet — fall back to plain config
  module.exports = nextConfig;
}
