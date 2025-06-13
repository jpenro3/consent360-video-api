import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test 1: Basic DynamoDB client creation
    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
    
    const client = new DynamoDBClient({ 
      region: 'us-east-2'
    });
    
    console.log('✅ DynamoDB client created successfully');
    
    // Test 2: Try to list tables (basic permission test)
    const { ListTablesCommand } = await import('@aws-sdk/client-dynamodb');
    
    const listCommand = new ListTablesCommand({});
    const result = await client.send(listCommand);
    
    return NextResponse.json({
      success: true,
      message: 'DynamoDB access working!',
      tables: result.TableNames || [],
      region: 'us-east-2',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorName: error instanceof Error ? error.constructor.name : 'Unknown',
      timestamp: new Date().toISOString()
    });
  }
}
