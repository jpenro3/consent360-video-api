import { NextResponse } from 'next/server';
import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';

export async function GET() {
  try {
    // Test if service role can access DynamoDB at all
    const dynamoClient = new DynamoDBClient({ region: 'us-east-2' });
    const command = new ListTablesCommand({});
    
    const result = await dynamoClient.send(command);
    
    return NextResponse.json({
      success: true,
      tables: result.TableNames,
      tableCount: result.TableNames?.length || 0,
      message: "Service role can access DynamoDB",
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorName: error instanceof Error ? error.name : 'Unknown',
      message: "Service role cannot access DynamoDB",
      timestamp: new Date().toISOString()
    });
  }
}
