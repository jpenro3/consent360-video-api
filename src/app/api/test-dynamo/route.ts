import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test AWS credential sources
    const awsCredInfo = {
      AWS_ACCESS_KEY_ID: !!process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: !!process.env.AWS_SECRET_ACCESS_KEY,
      AWS_SESSION_TOKEN: !!process.env.AWS_SESSION_TOKEN,
      AWS_REGION: process.env.AWS_REGION,
      AWS_DEFAULT_REGION: process.env.AWS_DEFAULT_REGION,
      AWS_EXECUTION_ENV: process.env.AWS_EXECUTION_ENV,
      AWS_LAMBDA_FUNCTION_NAME: process.env.AWS_LAMBDA_FUNCTION_NAME,
      _HANDLER: process.env._HANDLER,
    };

    // Test 1: Basic DynamoDB client creation with explicit region
    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
    
    const client = new DynamoDBClient({ 
      region: process.env.AWS_REGION || 'us-east-2'
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
      region: process.env.AWS_REGION || 'us-east-2',
      awsCredInfo,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorName: error instanceof Error ? error.constructor.name : 'Unknown',
      awsCredInfo: {
        AWS_ACCESS_KEY_ID: !!process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: !!process.env.AWS_SECRET_ACCESS_KEY,
        AWS_SESSION_TOKEN: !!process.env.AWS_SESSION_TOKEN,
        AWS_REGION: process.env.AWS_REGION,
        AWS_DEFAULT_REGION: process.env.AWS_DEFAULT_REGION,
        AWS_EXECUTION_ENV: process.env.AWS_EXECUTION_ENV,
        AWS_LAMBDA_FUNCTION_NAME: process.env.AWS_LAMBDA_FUNCTION_NAME,
        _HANDLER: process.env._HANDLER,
      },
      timestamp: new Date().toISOString()
    });
  }
}
