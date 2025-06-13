import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get ALL environment variables to see what's actually available
    const allEnvVars = process.env;
    
    // Filter for AWS/Amplify/API related vars
    const relevantVars: Record<string, string> = {};
    Object.keys(allEnvVars).forEach(key => {
      if (
        key.includes('AWS') || 
        key.includes('AMPLIFY') || 
        key.includes('VALID') || 
        key.includes('VIDEO') || 
        key.includes('NEXT') ||
        key.includes('API')
      ) {
        relevantVars[key] = allEnvVars[key] || 'undefined';
      }
    });

    return NextResponse.json({
      success: true,
      specificVars: {
        VALID_API_KEYS: process.env.VALID_API_KEYS || 'NOT-SET',
        VIDEOS_TABLE_NAME: process.env.VIDEOS_TABLE_NAME || 'NOT-SET',
        AWS_REGION: process.env.AWS_REGION || 'not-set',
        NEXT_PUBLIC_AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION || 'not-set',
      },
      allRelevantVars: relevantVars,
      totalEnvCount: Object.keys(allEnvVars).length,
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
