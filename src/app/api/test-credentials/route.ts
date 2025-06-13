import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check AWS environment and role information
    const environment = {
      isLambda: !!process.env.AWS_LAMBDA_FUNCTION_NAME,
      region: process.env.AWS_REGION,
      defaultRegion: process.env.AWS_DEFAULT_REGION,
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
      hasSessionToken: !!process.env.AWS_SESSION_TOKEN,
      executionEnv: process.env.AWS_EXECUTION_ENV,
      functionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
      handler: process.env._HANDLER,
      taskRoot: process.env.LAMBDA_TASK_ROOT,
      runtimeDir: process.env.LAMBDA_RUNTIME_DIR,
    };

    // Try to create a DynamoDB client and test basic operations
    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
    
    const testResults = [];
    
    // Test 1: Basic client creation
    try {
      const client = new DynamoDBClient({ 
        region: process.env.AWS_REGION || 'us-east-2'
      });
      testResults.push({ test: 'client_creation', status: 'success' });
      
      // Test 2: List tables (requires credentials)
      const { ListTablesCommand } = await import('@aws-sdk/client-dynamodb');
      const listCommand = new ListTablesCommand({});
      
      // Set a timeout for the request
      const result = await Promise.race([
        client.send(listCommand),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout after 5 seconds')), 5000))
      ]);
      
      testResults.push({ 
        test: 'list_tables', 
        status: 'success', 
        tableCount: (result as { TableNames?: string[] }).TableNames?.length || 0,
        tables: (result as { TableNames?: string[] }).TableNames || []
      });
      
    } catch (err) {
      testResults.push({ 
        test: 'dynamodb_access', 
        status: 'failed', 
        error: err instanceof Error ? err.message : 'Unknown error',
        errorType: err instanceof Error ? err.constructor.name : 'Unknown'
      });
    }
    
    return NextResponse.json({
      success: true,
      environment,
      testResults,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
