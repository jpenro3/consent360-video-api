import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Simple API key validation using ONLY environment variables
async function validateApiKey(apiKey: string): Promise<boolean> {
  if (!apiKey) return false;
  
  // Use environment variables only (no DynamoDB)
  const validKeys = process.env.VALID_API_KEYS?.split(',') || [];
  return validKeys.includes(apiKey);
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
    
    // Validate API key using environment variables only
    const isValidKey = await validateApiKey(apiKey);
    if (!isValidKey) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }
    
    console.log('✅ API key validated');
    
    // Return mock data for now (bypass DynamoDB completely)
    const mockVideos = [
      {
        id: 'video-1',
        title: 'Sample Consent Video',
        description: 'Mock video for testing',
        videoUrl: 'https://example.com/video1.mp4',
        thumbnailUrl: 'https://example.com/thumb1.jpg',
        duration: 120,
        createdAt: '2025-06-13T00:00:00Z',
        status: 'published',
        specialty: 'general',
        videoType: 'consent',
        language: 'en',
        presenter: 'Dr. Smith'
      },
      {
        id: 'video-2',
        title: 'Another Test Video',
        description: 'Another mock video',
        videoUrl: 'https://example.com/video2.mp4',
        thumbnailUrl: 'https://example.com/thumb2.jpg',
        duration: 180,
        createdAt: '2025-06-13T00:00:00Z',
        status: 'published',
        specialty: 'cardiology',
        videoType: 'procedure',
        language: 'en',
        presenter: 'Dr. Johnson'
      }
    ];
    
    console.log(`📤 Returning ${mockVideos.length} mock videos`);
    
    return NextResponse.json({
      videos: mockVideos,
      pagination: {
        total: mockVideos.length,
        limit: 50,
        offset: 0,
        hasNext: false
      }
    });
    
  } catch (error) {
    console.error('❌ Error in videos API:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
