import { NextResponse } from 'next/server';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';

export async function GET() {
  try {
    console.log('🔍 Testing DynamoDB connectivity...');
    
    // Test environment info
    const envInfo = {
      NODE_ENV: process.env.NODE_ENV,
      AWS_REGION: process.env.AWS_REGION || 'not-set',
      NEXT_PUBLIC_AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION || 'not-set',
      AWS_EXECUTION_ENV: process.env.AWS_EXECUTION_ENV || 'not-set',
      VALID_API_KEYS: process.env.VALID_API_KEYS ? 'SET' : 'NOT SET',
    };
    
    // Simple DynamoDB test
    const dynamoClient = new DynamoDBClient({ region: 'us-east-2' });
    
    const command = new ScanCommand({
      TableName: 'pipeline-api-partners',
      Limit: 1,
    });
    
    const result = await dynamoClient.send(command);
    
    return NextResponse.json({
      success: true,
      message: 'DynamoDB connectivity test successful',
      environment: envInfo,
      dynamo: {
        itemCount: result.Items?.length || 0,
        scannedCount: result.ScannedCount || 0,
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error: unknown) {
    console.error('❌ Test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'UnknownError',
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
