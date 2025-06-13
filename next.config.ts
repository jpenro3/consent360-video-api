import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // AWS Amplify configuration for SSR
  serverExternalPackages: ['@aws-sdk/client-dynamodb'],
  images: {
    unoptimized: true
  },
  // CRITICAL: Force environment variables into standalone build
  env: {
    VALID_API_KEYS: process.env.VALID_API_KEYS,
    VIDEOS_TABLE_NAME: process.env.VIDEOS_TABLE_NAME,
    NEXT_PUBLIC_AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION,
    AWS_REGION: process.env.AWS_REGION,
  },
  // Ensure proper SSR with Lambda
  experimental: {
    serverComponentsExternalPackages: ['@aws-sdk/client-dynamodb']
  }
};

export default nextConfig;
