import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // AWS Amplify configuration for SSR
  serverExternalPackages: ['@aws-sdk/client-dynamodb'],
  images: {
    unoptimized: true
  }
};

export default nextConfig;
