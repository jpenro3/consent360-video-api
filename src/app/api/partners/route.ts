import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Utility function to check if AWS credentials are available
async function hasAwsCredentials(): Promise<boolean> {
  try {
    // Check for custom Amplify environment variables first
    if (process.env.CONSENT360_ACCESS_KEY_ID && process.env.CONSENT360_SECRET_ACCESS_KEY) {
      return true;
    }
    
    const { fromNodeProviderChain } = await import('@aws-sdk/credential-providers');
    const credentialProvider = fromNodeProviderChain();
    const credentials = await credentialProvider();
    return !!(credentials.accessKeyId && credentials.secretAccessKey);
  } catch {
    return false;
  }
}

// Create DynamoDB client with error handling
async function createDynamoClient() {
  try {
    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient } = await import('@aws-sdk/lib-dynamodb');
    
    const region = process.env.AWS_REGION || 'us-east-2';
    
    // Configure credentials for Amplify environment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clientConfig: any = { region };
    
    if (process.env.CONSENT360_ACCESS_KEY_ID && process.env.CONSENT360_SECRET_ACCESS_KEY) {
      clientConfig.credentials = {
        accessKeyId: process.env.CONSENT360_ACCESS_KEY_ID,
        secretAccessKey: process.env.CONSENT360_SECRET_ACCESS_KEY
      };
      console.log('✅ Using custom Amplify credentials');
    }
    
    const client = new DynamoDBClient(clientConfig);
    const docClient = DynamoDBDocumentClient.from(client);
    
    // Test if credentials work by doing a simple operation
    const { ListTablesCommand } = await import('@aws-sdk/client-dynamodb');
    await client.send(new ListTablesCommand({}));
    
    return docClient;
  } catch (error) {
    console.log('❌ DynamoDB client creation failed:', error);
    return null;
  }
}

// Admin API key validation - only env vars for admin access
async function validateAdminApiKey(apiKey: string): Promise<boolean> {
  if (!apiKey) return false;
  
  // Admin keys are only stored in environment variables for security
  const adminKeys = process.env.ADMIN_API_KEYS?.split(',') || [];
  return adminKeys.includes(apiKey);
}

// Get partners from DynamoDB or return mock data
async function getPartners() {
  try {
    const docClient = await createDynamoClient();
    if (!docClient) {
      console.log('⚠️ Using mock partner data (DynamoDB not available)');
      return getMockPartners();
    }
    
    const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');
    const tableName = process.env.PARTNERS_TABLE_NAME || 'pipeline-partners';
    const result = await docClient.send(new ScanCommand({
      TableName: tableName
    }));
    
    console.log('✅ Partners retrieved from DynamoDB');
    return result.Items || [];
  } catch (error) {
    console.log('⚠️ DynamoDB query failed, using mock data:', error);
    return getMockPartners();
  }
}

function getMockPartners() {
  return [
    {
      id: 'partner-1',
      name: 'Healthcare Partner A',
      apiKey: 'sk_test_123456',
      status: 'active',
      createdAt: '2025-06-13T00:00:00Z',
      contactEmail: 'admin@healthcarea.com',
      type: 'healthcare_provider'
    },
    {
      id: 'partner-2', 
      name: 'Medical Group B',
      apiKey: 'partner-key-xyz',
      status: 'active',
      createdAt: '2025-06-13T01:00:00Z',
      contactEmail: 'contact@medicalgroupb.com',
      type: 'medical_group'
    }
  ];
}

export async function GET(request: NextRequest) {
  try {
    console.log('🤝 Partners API starting...');
    
    // Check if we have AWS credentials
    const hasCredentials = await hasAwsCredentials();
    console.log('🔐 AWS credentials available:', hasCredentials);
    
    // Get API key from header
    const apiKey = request.headers.get('x-api-key');
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Admin API key is required' },
        { status: 401 }
      );
    }
    
    // Validate admin API key
    const isValidAdminKey = await validateAdminApiKey(apiKey);
    if (!isValidAdminKey) {
      return NextResponse.json(
        { error: 'Invalid admin API key' },
        { status: 401 }
      );
    }
    
    // Get partners
    const partners = await getPartners();
    
    return NextResponse.json({
      success: true,
      data: partners,
      meta: {
        count: partners.length,
        credentialsAvailable: hasCredentials,
        usingMockData: !hasCredentials
      }
    });
    
  } catch (error) {
    console.error('❌ Partners API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
