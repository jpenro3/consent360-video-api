import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Create S3 client for upload operations
async function createS3Client() {
  try {
    const { S3Client } = await import('@aws-sdk/client-s3');
    const region = process.env.AWS_REGION || 'us-east-2';
    
    const client = new S3Client({ region });
    return client;
  } catch (error) {
    console.log('❌ S3 client creation failed:', error);
    return null;
  }
}

// Generate presigned URL for video upload
async function generateUploadUrl(fileName: string, fileType: string): Promise<{ uploadUrl: string; videoUrl: string } | null> {
  try {
    const s3Client = await createS3Client();
    if (!s3Client) return null;

    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
    const { PutObjectCommand } = await import('@aws-sdk/client-s3');
    
    const bucketName = process.env.S3_BUCKET_NAME || 'consent360-dev';
    const key = `videos/${Date.now()}-${fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: fileType,
      Metadata: {
        'uploaded-by': 'consent360-api',
        'upload-time': new Date().toISOString()
      }
    });

    // Generate upload URL valid for 15 minutes
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    
    // Generate the final video URL
    const videoUrl = `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-2'}.amazonaws.com/${key}`;
    
    return { uploadUrl, videoUrl };
  } catch (error) {
    console.log('❌ Failed to generate upload URL:', error);
    return null;
  }
}

// Add video metadata to DynamoDB
async function createVideoRecord(videoData: {
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  specialty?: string;
  tags?: string[];
  format?: string;
  resolution?: string;
  fileSize?: number;
}) {
  try {
    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient, PutCommand } = await import('@aws-sdk/lib-dynamodb');
    
    const region = process.env.AWS_REGION || 'us-east-2';
    const client = new DynamoDBClient({ region });
    const docClient = DynamoDBDocumentClient.from(client);
    
    const tableName = process.env.VIDEOS_TABLE_NAME || 'videos';
    
    const videoRecord = {
      id: `video-${Date.now()}`,
      title: videoData.title,
      description: videoData.description,
      videoUrl: videoData.videoUrl,
      thumbnailUrl: videoData.thumbnailUrl || '',
      duration: videoData.duration || 0,
      createdAt: new Date().toISOString(),
      status: 'draft', // Start as draft
      specialty: videoData.specialty || 'general',
      tags: videoData.tags || [],
      format: videoData.format || 'mp4',
      resolution: videoData.resolution || '',
      fileSize: videoData.fileSize || 0
    };
    
    await docClient.send(new PutCommand({
      TableName: tableName,
      Item: videoRecord
    }));
    
    return videoRecord;
  } catch (error) {
    console.log('❌ Failed to create video record:', error);
    return null;
  }
}

// Admin API key validation
async function validateAdminApiKey(apiKey: string): Promise<boolean> {
  if (!apiKey) return false;
  
  // Admin keys from environment variables
  const adminKeys = process.env.ADMIN_API_KEYS?.split(',') || [];
  return adminKeys.includes(apiKey);
}

// GET: Get upload URL for new video
export async function GET(request: NextRequest) {
  try {
    console.log('📤 Video upload URL request...');
    
    // Get API key from header
    const apiKey = request.headers.get('x-api-key');
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Admin API key is required' },
        { status: 401 }
      );
    }
    
    // Validate admin API key
    const isValidAdminKey = await validateAdminApiKey(apiKey);
    if (!isValidAdminKey) {
      return NextResponse.json(
        { error: 'Invalid admin API key' },
        { status: 401 }
      );
    }
    
    // Get query parameters
    const url = new URL(request.url);
    const fileName = url.searchParams.get('fileName');
    const fileType = url.searchParams.get('fileType');
    
    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: 'fileName and fileType parameters are required' },
        { status: 400 }
      );
    }
    
    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Allowed: mp4, webm, ogg' },
        { status: 400 }
      );
    }
    
    // Generate upload URL
    const uploadData = await generateUploadUrl(fileName, fileType);
    if (!uploadData) {
      return NextResponse.json(
        { error: 'Failed to generate upload URL' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      uploadUrl: uploadData.uploadUrl,
      videoUrl: uploadData.videoUrl,
      expiresIn: 900, // 15 minutes
      instructions: {
        method: 'PUT',
        headers: {
          'Content-Type': fileType
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Upload URL generation error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST: Create video record after upload
export async function POST(request: NextRequest) {
  try {
    console.log('📝 Creating video record...');
    
    // Get API key from header
    const apiKey = request.headers.get('x-api-key');
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Admin API key is required' },
        { status: 401 }
      );
    }
    
    // Validate admin API key
    const isValidAdminKey = await validateAdminApiKey(apiKey);
    if (!isValidAdminKey) {
      return NextResponse.json(
        { error: 'Invalid admin API key' },
        { status: 401 }
      );
    }
    
    const videoData = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'videoUrl'];
    for (const field of requiredFields) {
      if (!videoData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    // Create video record in DynamoDB
    const videoRecord = await createVideoRecord(videoData);
    if (!videoRecord) {
      return NextResponse.json(
        { error: 'Failed to create video record' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      video: videoRecord,
      message: 'Video record created successfully'
    });
    
  } catch (error) {
    console.error('❌ Video record creation error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
