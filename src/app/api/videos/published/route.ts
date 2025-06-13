import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Utility function to check if AWS credentials are available
async function hasAwsCredentials(): Promise<boolean> {
  try {
    // Check for custom Amplify environment variables first
    if (process.env.CONSENT360_ACCESS_KEY_ID && process.env.CONSENT360_SECRET_ACCESS_KEY) {
      return true;
    }
    
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
    
    // Configure credentials for Amplify environment
    const clientConfig: any = { region };
    
    if (process.env.CONSENT360_ACCESS_KEY_ID && process.env.CONSENT360_SECRET_ACCESS_KEY) {
      clientConfig.credentials = {
        accessKeyId: process.env.CONSENT360_ACCESS_KEY_ID,
        secretAccessKey: process.env.CONSENT360_SECRET_ACCESS_KEY
      };
      console.log('✅ Using custom Amplify credentials');
    }
    
    const client = new DynamoDBClient(clientConfig);
    const docClient = DynamoDBDocumentClient.from(client);
    
    // Test if credentials work by doing a simple operation
    const { ListTablesCommand } = await import('@aws-sdk/client-dynamodb');
    await client.send(new ListTablesCommand({}));
    
    return docClient;
  } catch (error) {
    console.log('❌ DynamoDB client creation failed:', error);
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
  
  // If env vars don't work, try DynamoDB
  try {
    const docClient = await createDynamoClient();
    if (!docClient) {
      console.log('⚠️ DynamoDB not available, using env validation only');
      return false;
    }
    
    const { GetCommand } = await import('@aws-sdk/lib-dynamodb');
    const tableName = process.env.PARTNERS_TABLE_NAME || 'pipeline-partners';
    const result = await docClient.send(new GetCommand({
      TableName: tableName,
      Key: { apiKey }
    }));
    
    const isValid = !!(result.Item && result.Item.status === 'active');
    console.log(isValid ? '✅ API key validated via DynamoDB' : '❌ Invalid API key in DynamoDB');
    return isValid;
  } catch (error) {
    console.log('⚠️ DynamoDB validation failed, falling back to env vars:', error);
    return false;
  }
}

// Get videos from DynamoDB or return mock data
async function getVideos() {
  try {
    const docClient = await createDynamoClient();
    if (!docClient) {
      console.log('⚠️ Using mock video data (DynamoDB not available)');
      return getMockVideos();
    }
    
    const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');
    const tableName = process.env.VIDEOS_TABLE_NAME || 'pipeline-videos';
    const result = await docClient.send(new ScanCommand({
      TableName: tableName,
      FilterExpression: '#metadata.#status = :status',
      ExpressionAttributeNames: {
        '#metadata': 'metadata',
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': 'published'
      }
    }));
    
    console.log('✅ Videos retrieved from DynamoDB');
    
    // Transform the real data to match our frontend interface
    const transformedVideos = (result.Items || []).map(item => {
      const bucketName = process.env.S3_BUCKET_NAME || 'consent360-dev';
      const region = process.env.AWS_REGION || 'us-east-2';
      
      // Generate S3 URLs for the video and thumbnail
      const videoUrl = item.url 
        ? `https://${bucketName}.s3.${region}.amazonaws.com/uploads/videos/consent/${item.filename}`
        : null;
      
      const thumbnailUrl = item.metadata?.thumbnailUrl || 
        (item.filename ? `https://${bucketName}.s3.${region}.amazonaws.com/uploads/videos/consent/${item.filename.replace('.mp4', '.jpg')}` : null);
      
      return {
        id: item.id || 'unknown',
        title: item.title || item.filename || 'Untitled Video',
        description: item.description || `${item.presenter || 'Unknown'} - ${item.type || 'Video'}`,
        videoUrl: videoUrl || '',
        thumbnailUrl: thumbnailUrl || '',
        duration: parseInt(item.metadata?.duration) || 0,
        createdAt: item.createdAt || new Date().toISOString(),
        status: item.metadata?.status || 'published',
        specialty: item.specialty || 'general',
        tags: [item.type || 'consent', item.metadata?.language || 'en']
      };
    });
    
    return transformedVideos;
  } catch (error) {
    console.log('⚠️ DynamoDB query failed, using mock data:', error);
    return getMockVideos();
  }
}

function getMockVideos() {
  return [
    {
      id: 'video-1',
      title: 'Sample Consent Video',
      description: 'Mock video for testing - DynamoDB not available',
      videoUrl: 'https://example.com/video1.mp4',
      thumbnailUrl: 'https://example.com/thumb1.jpg',
      duration: 120,
      createdAt: '2025-06-13T00:00:00Z',
      status: 'published',
      specialty: 'general',
      tags: ['consent', 'general']
    },
    {
      id: 'video-2',
      title: 'Surgical Consent Process',
      description: 'Mock surgical consent video - DynamoDB not available',
      videoUrl: 'https://example.com/video2.mp4',
      thumbnailUrl: 'https://example.com/thumb2.jpg',
      duration: 180,
      createdAt: '2025-06-13T01:00:00Z',
      status: 'published',
      specialty: 'surgery',
      tags: ['consent', 'surgery']
    }
  ];
}

export async function GET(request: NextRequest) {
  try {
    console.log('🎥 Videos API starting...');
    
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
        usingMockData: !hasCredentials
      }
    });
    
  } catch (error) {
    console.error('❌ Videos API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
