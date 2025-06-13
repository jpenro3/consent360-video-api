# 🎬 S3 + DynamoDB Video Streaming Setup Guide

## 🚀 **You Now Have Real Video Streaming Capabilities!**

Your consent360-video-api has been enhanced with **full S3 video streaming** and **real DynamoDB integration**. Here's how to enable it:

---

## 📋 **Quick Setup (5 Minutes)**

### 1. **Set Environment Variables in Amplify Console**

Go to your Amplify app → Environment Variables and add:

```
ENABLE_REAL_DATA=true
AWS_S3_BUCKET_NAME=consent360-videos-bucket
VIDEOS_TABLE_NAME=videos
PARTNERS_TABLE_NAME=partners
ADMIN_API_KEYS=admin-key-12345,super-admin-xyz
```

### 2. **Create AWS Infrastructure**

Run these commands in your AWS CLI:

```bash
# Create S3 bucket
aws s3 mb s3://consent360-videos-bucket --region us-east-2

# Create DynamoDB tables
aws dynamodb create-table \
  --table-name videos \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=status,AttributeType=S \
    AttributeName=createdAt,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=StatusIndex,KeySchema=[{AttributeName=status,KeyType=HASH},{AttributeName=createdAt,KeyType=RANGE}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-2

aws dynamodb create-table \
  --table-name partners \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=apiKey,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=ApiKeyIndex,KeySchema=[{AttributeName=apiKey,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-2
```

### 3. **Add IAM Permissions**

Add these to your Amplify service role:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:*",
        "s3:*"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-2:*:table/videos*",
        "arn:aws:dynamodb:us-east-2:*:table/partners*",
        "arn:aws:s3:::consent360-videos-bucket*"
      ]
    }
  ]
}
```

---

## 🎥 **New Features Available**

### **✅ Real Video Streaming**
- Stream videos directly from S3
- Presigned URLs for secure access
- Professional video player with controls
- Thumbnail support and metadata

### **✅ Video Upload Interface**
- Admin interface for uploading videos
- Direct S3 upload with progress tracking
- Automatic metadata management
- Format validation and file size limits

### **✅ Enhanced Video Player**
- Full screen support
- Volume and playback controls
- Keyboard shortcuts (Space, F, Esc)
- Progress tracking and seeking
- Loading states and error handling

### **✅ Smart Data Management**
- Real DynamoDB data when available
- Automatic fallback to mock data
- Clear indicators of data source
- Credential detection and status

---

## 🔧 **How It Works**

### **Current State (Mock Data)**
```
Environment Variables → API Key Validation → Mock Videos
                                          → Sample Streaming URLs
```

### **With Real Data Enabled**
```
Environment Variables → DynamoDB Validation → Real Videos
AWS Credentials      → S3 Presigned URLs   → Live Streaming
S3 Bucket           → Direct Upload        → Metadata Storage
```

---

## 🎯 **Testing Real Integration**

### **1. Upload Test Video**
1. Set `ADMIN_API_KEYS` in Amplify environment
2. Use admin key in Partners tab
3. Click **"📤 Upload Video"** button
4. Upload a test video file
5. Watch it stream in real-time!

### **2. Check API Responses**
```bash
# Test with real data enabled
curl -H "x-api-key: sk_test_123456" \
  "https://main.d2fmfvct94zpmn.amplifyapp.com/api/videos/published"

# Look for these fields in response:
{
  "meta": {
    "usingRealData": true,
    "s3Enabled": true,
    "streamingSupported": true
  }
}
```

---

## 📊 **Current vs Enhanced**

| Feature | Current (Mock) | Enhanced (Real) |
|---------|----------------|-----------------|
| **Data Source** | Static JSON | DynamoDB Tables |
| **Videos** | Sample URLs | S3 Streaming |
| **Upload** | Not Available | Direct S3 Upload |
| **Thumbnails** | Placeholder | Real S3 Images |
| **Metadata** | Basic | Full Video Info |
| **Streaming** | External URLs | Presigned S3 URLs |
| **Management** | View Only | Full CRUD Operations |

---

## 🔒 **Security Features**

- **Presigned URLs**: Temporary, secure video access
- **Admin Keys**: Upload restricted to authorized users
- **CORS Configuration**: Proper browser streaming support
- **Credential Detection**: Smart fallback when AWS unavailable
- **Input Validation**: File type and size restrictions

---

## 🎉 **Result**

After setup, you'll have:

- ✅ **Professional video streaming** from S3
- ✅ **Real-time video upload** interface
- ✅ **Full CRUD operations** on video content
- ✅ **Automatic thumbnails** and metadata
- ✅ **Secure, scalable** video delivery
- ✅ **Production-ready** video platform

**Your API transforms from a demo into a fully functional video management system!** 🚀

---

*Note: The system gracefully falls back to mock data if AWS resources aren't configured, so your current deployment continues working while you set up the real infrastructure.*
