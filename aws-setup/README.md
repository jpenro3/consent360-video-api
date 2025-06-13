# AWS Setup Guide for Amplify + DynamoDB

## Problem
AWS Amplify SSR functions (Lambda) don't automatically get DynamoDB access permissions, even when a service role is configured for the Amplify app.

## Solution Options

### Option 1: Configure Lambda Execution Role (Recommended)

1. **Create an IAM Role for Lambda Execution:**
   ```bash
   # Create the role
   aws iam create-role \
     --role-name AmplifyLambdaExecutionRole \
     --assume-role-policy-document '{
       "Version": "2012-10-17",
       "Statement": [
         {
           "Effect": "Allow",
           "Principal": {
             "Service": "lambda.amazonaws.com"
           },
           "Action": "sts:AssumeRole"
         }
       ]
     }'
   
   # Attach basic Lambda execution policy
   aws iam attach-role-policy \
     --role-name AmplifyLambdaExecutionRole \
     --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
   
   # Create and attach DynamoDB policy
   aws iam put-role-policy \
     --role-name AmplifyLambdaExecutionRole \
     --policy-name DynamoDBAccess \
     --policy-document file://aws-setup/lambda-dynamodb-policy.json
   ```

2. **Configure Amplify to use this role:**
   - Go to AWS Amplify Console
   - Select your app → Build settings → Environment variables
   - Add: `AMPLIFY_LAMBDA_EXECUTION_ROLE_ARN` = `arn:aws:iam::YOUR_ACCOUNT:role/AmplifyLambdaExecutionRole`

### Option 2: Use AWS Credentials in Environment Variables

Add these environment variables in Amplify Console:
- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key  
- `AWS_REGION`: us-east-2 (or your preferred region)

**Note:** This is less secure but simpler for development.

### Option 3: Use Amplify Backend (Full Setup)

1. **Initialize Amplify Backend:**
   ```bash
   npm install -g @aws-amplify/cli
   amplify init
   amplify add storage
   amplify push
   ```

## Current Status
- ✅ Environment variables are working in Lambda
- ❌ AWS credentials/permissions are not available
- ✅ All code is deployed and functional except DynamoDB access

## Next Steps
1. Try Option 1 (IAM Role) first
2. If that doesn't work, use Option 2 (Environment Variables) temporarily
3. For production, implement Option 3 (Full Amplify Backend)
