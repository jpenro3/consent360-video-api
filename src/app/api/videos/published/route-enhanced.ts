import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Utility function to check if AWS credentials are available
async function hasAwsCredentials(): Promise<boolean> {
  try {
    const { fromNodeProviderChain } = await import('@aws-sdk/credential-providers');
    const credentialProvider = fromNodeProviderChain();
    const credentials = await credentialProvider();
    return !!(credentials.accessKeyId && credentials.secretAccessKey);
  } catch {
    return false;
  }
}

// Create DynamoDB client with error handling
async function createDynamoClient() {
  try {
    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient } = await import('@aws-sdk/lib-dynamodb');
    
    const region = process.env.AWS_REGION || 'us-east-2';
    
    const client = new DynamoDBClient({ region });
    const docClient = DynamoDBDocumentClient.from(client);
    
    // Test if credentials work
    const { ListTablesCommand } = await import('@aws-sdk/client-dynamodb');
    await client.send(new ListTablesCommand({}));
    
    return docClient;
  } catch (error) {
    console.log('❌ DynamoDB client creation failed:', error);
    return null;
  }
}

// Create S3 client for generating presigned URLs
async function createS3Client() {
  try {
    const { S3Client } = await import('@aws-sdk/client-s3');
    const region = process.env.AWS_REGION || 'us-east-2';
    
    const client = new S3Client({ region });
    
    // Test S3 access
    const { ListBucketsCommand } = await import('@aws-sdk/client-s3');
    await client.send(new ListBucketsCommand({}));
    
    return client;
  } catch (error) {
    console.log('❌ S3 client creation failed:', error);
    return null;
  }
}

// Generate presigned URL for video streaming
async function generatePresignedUrl(videoKey: string): Promise<string | null> {
  try {
    const s3Client = await createS3Client();
    if (!s3Client) return null;

    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
    const { GetObjectCommand } = await import('@aws-sdk/client-s3');
    
    const bucketName = process.env.AWS_S3_BUCKET_NAME || 'consent360-videos-bucket';
    
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: videoKey,
    });

    // Generate URL valid for 1 hour
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return presignedUrl;
  } catch (error) {
    console.log('❌ Failed to generate presigned URL:', error);
    return null;
  }
}

// API key validation - try DynamoDB first, fallback to env vars
async function validateApiKey(apiKey: string): Promise<boolean> {
  if (!apiKey) return false;
  
  // First, try environment variable validation (fast)
  const validKeys = process.env.VALID_API_KEYS?.split(',') || [];
  if (validKeys.includes(apiKey)) {
    console.log('✅ API key validated via environment variables');
    return true;
  }
  
  // If real data is enabled, try DynamoDB
  if (process.env.ENABLE_REAL_DATA === 'true') {
    try {
      const docClient = await createDynamoClient();
      if (!docClient) {
        console.log('⚠️ DynamoDB not available, using env validation only');
        return false;
      }
      
      const { QueryCommand } = await import('@aws-sdk/lib-dynamodb');
      const tableName = process.env.PARTNERS_TABLE_NAME || 'partners';
      
      const result = await docClient.send(new QueryCommand({
        TableName: tableName,
        IndexName: 'ApiKeyIndex',
        KeyConditionExpression: 'apiKey = :apiKey',
        ExpressionAttributeValues: {
          ':apiKey': apiKey
        }
      }));
      
      const isValid = !!(result.Items && result.Items.length > 0 && result.Items[0].status === 'active');
      console.log(isValid ? '✅ API key validated via DynamoDB' : '❌ Invalid API key in DynamoDB');
      return isValid;
    } catch (error) {
      console.log('⚠️ DynamoDB validation failed, falling back to env vars:', error);
      return false;
    }
  }
  
  return false;
}

// Get videos from DynamoDB or return mock data
async function getVideos() {
  // Check if real data is enabled
  if (process.env.ENABLE_REAL_DATA === 'true') {
    try {
      const docClient = await createDynamoClient();
      if (!docClient) {
        console.log('⚠️ Using mock video data (DynamoDB not available)');
        return getMockVideos();
      }
      
      const { QueryCommand } = await import('@aws-sdk/lib-dynamodb');
      const tableName = process.env.VIDEOS_TABLE_NAME || 'videos';
      
      const result = await docClient.send(new QueryCommand({
        TableName: tableName,
        IndexName: 'StatusIndex',
        KeyConditionExpression: '#status = :status',
        ExpressionAttributeNames: {
          '#status': 'status'
        },
        ExpressionAttributeValues: {
          ':status': 'published'
        },
        ScanIndexForward: false // Most recent first
      }));
      
      console.log('✅ Videos retrieved from DynamoDB');
      
      // Process videos and generate presigned URLs for streaming
      const videos = result.Items || [];
      const processedVideos = await Promise.all(videos.map(async (video) => {
        // Extract S3 key from full URL
        const videoKey = video.videoUrl?.split('/').pop();
        const thumbnailKey = video.thumbnailUrl?.split('/').pop();
        
        // Generate presigned URLs if S3 keys exist
        let streamingUrl = video.videoUrl;
        let thumbnailUrl = video.thumbnailUrl;
        
        if (videoKey && video.videoUrl?.includes('s3')) {
          const presignedUrl = await generatePresignedUrl(`videos/${videoKey}`);
          if (presignedUrl) streamingUrl = presignedUrl;
        }
        
        if (thumbnailKey && video.thumbnailUrl?.includes('s3')) {
          const presignedThumb = await generatePresignedUrl(`thumbnails/${thumbnailKey}`);
          if (presignedThumb) thumbnailUrl = presignedThumb;
        }
        
        return {
          ...video,
          videoUrl: streamingUrl,
          thumbnailUrl: thumbnailUrl,
          // Convert DynamoDB number types
          duration: typeof video.duration === 'object' ? parseInt(video.duration.N || '0') : video.duration,
          fileSize: typeof video.fileSize === 'object' ? parseInt(video.fileSize.N || '0') : video.fileSize,
          // Convert DynamoDB string set types
          tags: Array.isArray(video.tags) ? video.tags : (video.tags?.SS || [])
        };
      }));
      
      return processedVideos;
    } catch (error) {
      console.log('⚠️ DynamoDB query failed, using mock data:', error);
      return getMockVideos();
    }
  } else {
    console.log('⚠️ Using mock video data (ENABLE_REAL_DATA not set)');
    return getMockVideos();
  }
}

function getMockVideos() {
  return [
    {
      id: 'video-1',
      title: 'Sample Consent Video',
      description: 'Mock video for testing - DynamoDB not available',
      videoUrl: 'https://sample-videos.vercel.app/mp4/SampleVideo_720x480_1mb.mp4',
      thumbnailUrl: 'https://via.placeholder.com/480x360/4F46E5/FFFFFF?text=Sample+Video',
      duration: 120,
      createdAt: '2025-06-13T00:00:00Z',
      status: 'published',
      specialty: 'general',
      tags: ['consent', 'general'],
      fileSize: 1048576,
      format: 'mp4',
      resolution: '720x480'
    },
    {
      id: 'video-2',
      title: 'Surgical Consent Process',
      description: 'Mock surgical consent video - DynamoDB not available',
      videoUrl: 'https://sample-videos.vercel.app/mp4/SampleVideo_640x360_1mb.mp4',
      thumbnailUrl: 'https://via.placeholder.com/640x360/7C3AED/FFFFFF?text=Surgery+Video',
      duration: 180,
      createdAt: '2025-06-13T01:00:00Z',
      status: 'published',
      specialty: 'surgery',
      tags: ['consent', 'surgery'],
      fileSize: 1048576,
      format: 'mp4',
      resolution: '640x360'
    }
  ];
}

export async function GET(request: NextRequest) {
  try {
    console.log('🎥 Enhanced Videos API starting...');
    
    // Check if we have AWS credentials
    const hasCredentials = await hasAwsCredentials();
    console.log('🔐 AWS credentials available:', hasCredentials);
    
    // Get API key from header
    const apiKey = request.headers.get('x-api-key');
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 401 }
      );
    }
    
    // Validate API key
    const isValidKey = await validateApiKey(apiKey);
    if (!isValidKey) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }
    
    // Get videos
    const videos = await getVideos();
    
    return NextResponse.json({
      success: true,
      data: videos,
      meta: {
        count: videos.length,
        credentialsAvailable: hasCredentials,
        usingRealData: process.env.ENABLE_REAL_DATA === 'true' && hasCredentials,
        s3Enabled: !!process.env.AWS_S3_BUCKET_NAME,
        streamingSupported: true
      }
    });
    
  } catch (error) {
    console.error('❌ Enhanced Videos API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
