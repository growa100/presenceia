import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Brand fonts read from disk by the PDF report (lib/report-pdf.tsx).
  outputFileTracingIncludes: {
    '/api/**': ['./assets/fonts/**/*'],
  },
};

export default nextConfig;
