# 🚀 S3 + DynamoDB Integration Setup

## 1. AWS Infrastructure Setup

### Create S3 Bucket for Videos
```bash
# Create S3 bucket for video storage
aws s3 mb s3://consent360-videos-bucket --region us-east-2

# Configure bucket for public read access (for video streaming)
aws s3api put-public-access-block \
  --bucket consent360-videos-bucket \
  --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# Add bucket policy for video streaming
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::consent360-videos-bucket/videos/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy --bucket consent360-videos-bucket --policy file://bucket-policy.json

# Enable CORS for video streaming
cat > cors.json << 'EOF'
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

aws s3api put-bucket-cors --bucket consent360-videos-bucket --cors-configuration file://cors.json
```

### Create DynamoDB Tables
```bash
# Create Videos table
aws dynamodb create-table \
  --table-name videos \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=status,AttributeType=S \
    AttributeName=createdAt,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=StatusIndex,KeySchema=[{AttributeName=status,KeyType=HASH},{AttributeName=createdAt,KeyType=RANGE}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
  --provisioned-throughput \
    ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-2

# Create Partners table
aws dynamodb create-table \
  --table-name partners \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=apiKey,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=ApiKeyIndex,KeySchema=[{AttributeName=apiKey,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
  --provisioned-throughput \
    ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-2
```

## 2. Environment Variables for Amplify

Add these to your Amplify app environment variables:

```
AWS_S3_BUCKET_NAME=consent360-videos-bucket
AWS_S3_REGION=us-east-2
VIDEOS_TABLE_NAME=videos
PARTNERS_TABLE_NAME=partners
AWS_REGION=us-east-2
ENABLE_REAL_DATA=true
```

## 3. IAM Permissions

Add these permissions to your Amplify service role:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:BatchGetItem",
        "dynamodb:BatchWriteItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-2:*:table/videos",
        "arn:aws:dynamodb:us-east-2:*:table/videos/index/*",
        "arn:aws:dynamodb:us-east-2:*:table/partners",
        "arn:aws:dynamodb:us-east-2:*:table/partners/index/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::consent360-videos-bucket",
        "arn:aws:s3:::consent360-videos-bucket/*"
      ]
    }
  ]
}
```

## 4. Sample Data

### Sample Videos Data
```bash
# Add sample video records to DynamoDB
aws dynamodb put-item \
  --table-name videos \
  --item '{
    "id": {"S": "video-001"},
    "title": {"S": "Informed Consent Overview"},
    "description": {"S": "Comprehensive overview of informed consent process"},
    "videoUrl": {"S": "https://consent360-videos-bucket.s3.us-east-2.amazonaws.com/videos/consent-overview.mp4"},
    "thumbnailUrl": {"S": "https://consent360-videos-bucket.s3.us-east-2.amazonaws.com/thumbnails/consent-overview.jpg"},
    "duration": {"N": "240"},
    "createdAt": {"S": "2025-06-13T10:00:00Z"},
    "status": {"S": "published"},
    "specialty": {"S": "general"},
    "tags": {"SS": ["consent", "overview", "general"]},
    "fileSize": {"N": "15728640"},
    "format": {"S": "mp4"},
    "resolution": {"S": "1920x1080"}
  }' \
  --region us-east-2

# Add sample partner
aws dynamodb put-item \
  --table-name partners \
  --item '{
    "id": {"S": "partner-001"},
    "name": {"S": "General Hospital"},
    "apiKey": {"S": "sk_test_123456"},
    "status": {"S": "active"},
    "createdAt": {"S": "2025-06-13T09:00:00Z"},
    "contactEmail": {"S": "admin@generalhospital.com"},
    "type": {"S": "hospital"},
    "permissions": {"SS": ["videos:read", "videos:stream"]}
  }' \
  --region us-east-2
```

## 5. Next Steps

1. **Run the infrastructure setup commands**
2. **Upload sample videos to S3** 
3. **Deploy the enhanced API endpoints**
4. **Test real video streaming**

The enhanced system will:
- ✅ Stream videos directly from S3
- ✅ Store metadata in DynamoDB
- ✅ Support video upload and management
- ✅ Provide real-time video analytics
- ✅ Handle multiple video formats
- ✅ Generate thumbnails automatically
