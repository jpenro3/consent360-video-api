# Amplify Deployment Guide

## Fresh Consent360 Video API - Ready for Production

🎉 **Repository Created:** https://github.com/jpenro3/consent360-video-api

### Quick Amplify Setup (Web Console)

1. **Go to AWS Amplify Console:** https://console.aws.amazon.com/amplify/
2. **Click "New app" → "Host web app"**
3. **Connect GitHub:** Select `jpenro3/consent360-video-api`
4. **Branch:** `main`
5. **App name:** `consent360-video-api`

### Environment Variables to Set:
```
VALID_API_KEYS=sk_test_123456,partner-key-xyz,ak_zgeskc62jci
NEXT_PUBLIC_AWS_REGION=us-east-2
VIDEOS_TABLE_NAME=pipeline-videos
```

### IAM Role Requirements:
- **Service Role:** Use existing `AmplifyServiceRole` 
- **Permissions needed:**
  - `dynamodb:Scan` on `pipeline-videos`
  - `dynamodb:Query` on `pipeline-videos` 
  - `dynamodb:Scan` on `pipeline-api-keys`
  - `dynamodb:Query` on `pipeline-api-keys`
  - `dynamodb:Scan` on `pipeline-api-partners`

### Test Endpoints After Deployment:
```bash
# Test basic connectivity
curl https://your-app.amplifyapp.com/api/test

# Test with API key
curl -H "x-api-key: ak_zgeskc62jci" https://your-app.amplifyapp.com/api/videos/published

# Test partners
curl -H "x-api-key: ak_zgeskc62jci" https://your-app.amplifyapp.com/api/partners
```

### What's Different (Clean & Simple):
✅ Fresh Next.js 15 with no legacy cruft  
✅ Simple DynamoDB client pattern (same as working debug)  
✅ Clean API key validation (DynamoDB + env fallback)  
✅ No overengineered dependencies  
✅ Ready for production  

This should work immediately since it uses the exact pattern that was working!
