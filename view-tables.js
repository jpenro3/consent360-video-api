#!/usr/bin/env node

/**
 * Quick script to test DynamoDB tables and view real data
 * Run with: node view-tables.js
 * 
 * Make sure you have AWS credentials configured:
 * aws configure
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const REGION = 'us-east-2';
const VIDEOS_TABLE = 'pipeline-videos';
const PARTNERS_TABLE = 'pipeline-api-partners';

async function main() {
  console.log('🔍 Checking DynamoDB tables...\n');
  
  try {
    const client = new DynamoDBClient({ region: REGION });
    const docClient = DynamoDBDocumentClient.from(client);
    
    // Check videos table
    console.log(`📹 Scanning ${VIDEOS_TABLE} table:`);
    console.log('=' .repeat(50));
    
    const videosResult = await docClient.send(new ScanCommand({
      TableName: VIDEOS_TABLE,
      Limit: 5 // Just show first 5 items
    }));
    
    if (videosResult.Items && videosResult.Items.length > 0) {
      videosResult.Items.forEach((item, index) => {
        console.log(`Video ${index + 1}:`);
        console.log(`  ID: ${item.id}`);
        console.log(`  Title: ${item.title || 'N/A'}`);
        console.log(`  Status: ${item.status || 'N/A'}`);
        console.log(`  Created: ${item.createdAt || 'N/A'}`);
        console.log(`  S3 URL: ${item.videoUrl || 'N/A'}`);
        console.log('');
      });
      console.log(`Total items in ${VIDEOS_TABLE}: ${videosResult.Count}`);
    } else {
      console.log(`❌ No items found in ${VIDEOS_TABLE}`);
    }
    
    console.log('\n' + '=' .repeat(50));
    
    // Check partners table
    console.log(`🤝 Scanning ${PARTNERS_TABLE} table:`);
    console.log('=' .repeat(50));
    
    const partnersResult = await docClient.send(new ScanCommand({
      TableName: PARTNERS_TABLE,
      Limit: 5
    }));
    
    if (partnersResult.Items && partnersResult.Items.length > 0) {
      partnersResult.Items.forEach((item, index) => {
        console.log(`Partner ${index + 1}:`);
        console.log(`  ID: ${item.id}`);
        console.log(`  Name: ${item.name || 'N/A'}`);
        console.log(`  API Key: ${item.apiKey || 'N/A'}`);
        console.log(`  Status: ${item.status || 'N/A'}`);
        console.log(`  Email: ${item.contactEmail || 'N/A'}`);
        console.log('');
      });
      console.log(`Total items in ${PARTNERS_TABLE}: ${partnersResult.Count}`);
    } else {
      console.log(`❌ No items found in ${PARTNERS_TABLE}`);
    }
    
    console.log('\n✅ Scan complete!');
    console.log('\nTo use real data in your app:');
    console.log('1. Make sure AWS Amplify service role has DynamoDB permissions');
    console.log('2. Set PARTNERS_TABLE_NAME=pipeline-partners in Amplify env vars');
    console.log('3. Your API endpoints will automatically use real data!');
    
  } catch (error) {
    console.error('❌ Error accessing DynamoDB:', error.message);
    console.log('\nTroubleshooting:');
    console.log('- Run: aws configure');
    console.log('- Check your AWS credentials and permissions');
    console.log('- Verify tables exist: aws dynamodb list-tables --region us-east-2');
  }
}

main().catch(console.error);
