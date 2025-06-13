import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Debug endpoint to inspect actual table data
export async function GET(request: NextRequest) {
  try {
    // Admin API key required for debug access
    const apiKey = request.headers.get('x-api-key');
    const adminKeys = process.env.ADMIN_API_KEYS?.split(',') || [];
    
    if (!apiKey || !adminKeys.includes(apiKey)) {
      return NextResponse.json(
        { error: 'Admin API key required' },
        { status: 401 }
      );
    }

    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient, ScanCommand } = await import('@aws-sdk/lib-dynamodb');
    
    const region = process.env.AWS_REGION || 'us-east-2';
    const client = new DynamoDBClient({ region });
    const docClient = DynamoDBDocumentClient.from(client);
    
    const videosTable = process.env.VIDEOS_TABLE_NAME || 'pipeline-videos';
    const partnersTable = process.env.PARTNERS_TABLE_NAME || 'pipeline-partners';
    
    // Get sample data from both tables
    const [videosResult, partnersResult] = await Promise.all([
      docClient.send(new ScanCommand({
        TableName: videosTable,
        Limit: 3
      })),
      docClient.send(new ScanCommand({
        TableName: partnersTable,
        Limit: 3
      }))
    ]);
    
    return NextResponse.json({
      success: true,
      tables: {
        videos: {
          tableName: videosTable,
          count: videosResult.Count,
          sampleItems: videosResult.Items || [],
          structure: videosResult.Items?.[0] ? Object.keys(videosResult.Items[0]) : []
        },
        partners: {
          tableName: partnersTable,
          count: partnersResult.Count,
          sampleItems: partnersResult.Items || [],
          structure: partnersResult.Items?.[0] ? Object.keys(partnersResult.Items[0]) : []
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Table inspection error:', error);
    return NextResponse.json({
      error: 'Failed to inspect tables',
      details: error instanceof Error ? error.message : 'Unknown error',
      tables: {
        videos: { tableName: process.env.VIDEOS_TABLE_NAME || 'pipeline-videos', accessible: false },
        partners: { tableName: process.env.PARTNERS_TABLE_NAME || 'pipeline-partners', accessible: false }
      }
    }, { status: 500 });
  }
}
