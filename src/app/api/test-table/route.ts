import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test multiple DynamoDB initialization approaches
    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
    
    // Approach 1: Explicit region and default credential chain
    const client1 = new DynamoDBClient({ 
      region: 'us-east-2',
      // Force it to use the default credential provider chain
      credentials: undefined
    });
    
    console.log('Testing DynamoDB with explicit region...');
    
    // Try a simple DescribeTable command instead of ListTables
    const { DescribeTableCommand } = await import('@aws-sdk/client-dynamodb');
    
    const command = new DescribeTableCommand({
      TableName: 'pipeline-videos'
    });
    
    const result = await client1.send(command);
    
    return NextResponse.json({
      success: true,
      message: 'DynamoDB access working with DescribeTable!',
      tableName: result.Table?.TableName,
      tableStatus: result.Table?.TableStatus,
      region: 'us-east-2',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorName: error instanceof Error ? error.constructor.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
}
