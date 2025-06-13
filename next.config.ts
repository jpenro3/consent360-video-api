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
    PARTNERS_TABLE_NAME: process.env.PARTNERS_TABLE_NAME,
    ENABLE_REAL_DATA: process.env.ENABLE_REAL_DATA,
    AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
    NEXT_PUBLIC_AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION,
    AWS_REGION: process.env.AWS_REGION,
  },
  // Ensure proper SSR with Lambda
  // Note: serverComponentsExternalPackages moved to root level serverExternalPackages
};

export default nextConfig;
