import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';

export const dynamic = 'force-dynamic';

// Simple API key validation (same pattern as videos endpoint)
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
      return true;
    }
    
    // Fallback to environment variable
    const validKeys = process.env.VALID_API_KEYS?.split(',') || [];
    return validKeys.includes(apiKey);
    
  } catch (error) {
    console.error('❌ Error validating API key:', error);
    const validKeys = process.env.VALID_API_KEYS?.split(',') || [];
    return validKeys.includes(apiKey);
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🤝 Partners API starting...');
    
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
    
    // Simple DynamoDB client
    const dynamoClient = new DynamoDBClient({ region: 'us-east-2' });
    
    const command = new ScanCommand({
      TableName: 'pipeline-api-partners'
    });
    
    const result = await dynamoClient.send(command);
    
    console.log(`✅ Found ${result.Items?.length || 0} partners`);
    
    // Transform DynamoDB items to simple objects
    const partners = (result.Items || []).map(item => ({
      id: item.id?.S || '',
      name: item.name?.S || '',
      email: item.email?.S || '',
      description: item.description?.S || '',
      isActive: item.isActive?.BOOL || false,
      createdAt: item.createdAt?.S || '',
      updatedAt: item.updatedAt?.S || ''
    }));

    return NextResponse.json({
      success: true,
      partners
    });
    
  } catch (error: unknown) {
    console.error('❌ Error fetching partners:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
