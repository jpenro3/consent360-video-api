# 🚨 AWS Credentials Fix - Required for Real Data

## 🎯 **Problem Identified**
Your deployed app shows mock data because the AWS Lambda function cannot access DynamoDB.

**Status Check Results:**
- ❌ `hasAccessKey: false` 
- ❌ `hasSecretKey: false`
- ❌ `dynamodb_access: failed`
- ✅ `credentialsAvailable: false` (correctly falling back to mock data)

## 🔧 **Solution: Fix AWS IAM Permissions**

### Step 1: Find Your Amplify Service Role

1. **Go to AWS IAM Console**: https://console.aws.amazon.com/iam/
2. **Click "Roles"** in the left sidebar
3. **Search for**: `amplify` or `d2fmfvct94zpmn` 
4. **Look for roles like**:
   - `amplifyconsole-backend-role`
   - `amplify-consent360-main-***`
   - Any role with your app ID `d2fmfvct94zpmn`

### Step 2: Add DynamoDB Policy

**Click on the Amplify role → Add permissions → Attach policies**

**Option A: Use AWS Managed Policy (Recommended)**
- Search for: `AmazonDynamoDBFullAccess`
- Attach it to the role

**Option B: Create Custom Policy (More Secure)**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:GetItem",
                "dynamodb:PutItem", 
                "dynamodb:Query",
                "dynamodb:Scan",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem",
                "dynamodb:DescribeTable"
            ],
            "Resource": [
                "arn:aws:dynamodb:us-east-2:*:table/pipeline-*"
            ]
        }
    ]
}
```

### Step 3: Add Missing Environment Variable

**Go to Amplify Console**: https://console.aws.amazon.com/amplify/home#/d2fmfvct94zpmn/settings/variables

**Add this environment variable:**
```
PARTNERS_TABLE_NAME = pipeline-api-partners
```

### Step 4: Redeploy (if needed)

The changes should take effect immediately, but you can trigger a redeploy:
- Go to your Amplify app
- Click "Run build" or make a small commit

## 🧪 **Test the Fix**

After applying the permissions:

```bash
# Test credentials
curl https://main.d2fmfvct94zpmn.amplifyapp.com/api/test-credentials

# Test real video data  
curl -H "x-api-key: sk_test_123456" https://main.d2fmfvct94zpmn.amplifyapp.com/api/videos/published
```

**Success indicators:**
- `"credentialsAvailable": true`
- `"usingMockData": false` 
- Real video titles like "pain-management-genicular-artery-embolization..."

## 🎬 **Expected Result**

Once fixed, your dashboard will show:
- ✅ **40+ real consent videos** from pipeline-videos table
- ✅ **Real S3 streaming URLs** from consent360-dev bucket  
- ✅ **Actual presenter names**: Dr. Crowder, Dr. Gheith, Generic
- ✅ **Multiple languages**: English and Spanish videos
- ✅ **Real thumbnails** and metadata

---

**Note**: The fix only requires AWS IAM permissions - no code changes needed! Your app is already built to handle real data automatically. 🚀
