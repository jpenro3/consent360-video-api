import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';

export const dynamic = 'force-dynamic';

// Simple API key validation - check DynamoDB first, fallback to env vars
async function validateApiKey(apiKey: string): Promise<boolean> {
  if (!apiKey) return false;
  
  try {
    const dynamoClient = new DynamoDBClient({ region: 'us-east-2' });
    
    const command = new ScanCommand({
      TableName: 'pipeline-api-keys',
      FilterExpression: 'keyValue = :key AND #status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':key': { S: apiKey },
        ':status': { S: 'active' }
      },
      Limit: 1
    });
    
    const result = await dynamoClient.send(command);
    if (result.Items && result.Items.length > 0) {
      console.log('✅ API key found in DynamoDB');
      return true;
    }
    
    // Fallback to environment variable
    const validKeys = process.env.VALID_API_KEYS?.split(',') || [];
    const isValid = validKeys.includes(apiKey);
    
    if (isValid) {
      console.log('✅ API key found in environment variable');
    } else {
      console.log('❌ API key not found');
    }
    
    return isValid;
    
  } catch (error) {
    console.error('❌ Error validating API key:', error);
    
    // Fallback to environment variable if DynamoDB fails
    const validKeys = process.env.VALID_API_KEYS?.split(',') || [];
    return validKeys.includes(apiKey);
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🎥 Videos API starting...');
    
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
    
    console.log('✅ API key validated');
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    
    console.log(`Fetching videos (limit: ${limit}, offset: ${offset})`);
    
    // Simple DynamoDB client
    const dynamoClient = new DynamoDBClient({ region: 'us-east-2' });
    
    // Scan videos table for published videos
    const command = new ScanCommand({
      TableName: 'pipeline-videos',
      FilterExpression: '#status = :published',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':published': { S: 'published' }
      },
      Limit: Math.min(limit + offset, 100) // Cap at 100 for performance
    });
    
    const result = await dynamoClient.send(command);
    
    if (!result.Items) {
      return NextResponse.json({
        videos: [],
        pagination: { total: 0, limit, offset, hasNext: false }
      });
    }
    
    console.log(`✅ Found ${result.Items.length} videos from DynamoDB`);
    
    // Convert DynamoDB items to simple objects
    const allVideos = result.Items.map(item => ({
      id: item.id?.S || '',
      title: item.title?.S || '',
      description: item.description?.S || '',
      videoUrl: item.videoUrl?.S || item.video_url?.S || item.url?.S || '',
      thumbnailUrl: item.thumbnailUrl?.S || item.thumbnail_url?.S || '',
      duration: parseInt(item.duration?.N || '0', 10),
      createdAt: item.createdAt?.S || item.created_at?.S || '',
      status: item.status?.S || '',
      specialty: item.specialty?.S || item.specialtyId?.S || '',
      videoType: item.videoType?.S || item.type?.S || 'consent',
      language: item.language?.S || 'en',
      presenter: item.presenter?.S || 'Generic'
    }));
    
    // Apply pagination
    const videos = allVideos.slice(offset, offset + limit);
    
    console.log(`📤 Returning ${videos.length} videos`);
    
    return NextResponse.json({
      videos,
      pagination: {
        total: allVideos.length,
        limit,
        offset,
        hasNext: offset + limit < allVideos.length
      }
    });
    
  } catch (error: unknown) {
    console.error('❌ Error fetching videos:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
