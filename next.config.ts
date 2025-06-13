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
    ADMIN_API_KEYS: process.env.ADMIN_API_KEYS,
    ENABLE_REAL_DATA: process.env.ENABLE_REAL_DATA,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    NEXT_PUBLIC_AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION,
    AWS_REGION: process.env.AWS_REGION,
    AWS_PROFILE: process.env.AWS_PROFILE,
  },
  // Ensure proper SSR with Lambda
  // Note: serverComponentsExternalPackages moved to root level serverExternalPackages
};

export default nextConfig;
