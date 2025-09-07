# Deployment Guide

This guide covers deploying the Ikon Systems Dashboard to various platforms.

## 🚀 Quick Deployment Options

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Connect your GitHub repository
   - Select the repository

2. **Configure Environment Variables**
   - Go to Project Settings > Environment Variables
   - Add all variables from your `.env.local` file:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     VITE_VAPI_API_KEY=your_vapi_key
     VITE_TWILIO_ACCOUNT_SID=your_twilio_sid
     VITE_TWILIO_AUTH_TOKEN=your_twilio_token
     VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
     ```

3. **Deploy**
   - Vercel will automatically detect it's a Vite project
   - Build command: `npm run build`
   - Output directory: `dist`
   - Deploy automatically on push to main branch

### Option 2: Netlify

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Connect your GitHub repository

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment Variables**
   - Go to Site Settings > Environment Variables
   - Add all variables from your `.env.local` file

4. **Deploy**
   - Netlify will build and deploy automatically

### Option 3: Railway

1. **Connect Repository**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository

2. **Configure**
   - Railway will auto-detect the project
   - Add environment variables in the dashboard

3. **Deploy**
   - Railway will build and deploy automatically

## 🐳 Docker Deployment

### Build Docker Image

```bash
# Build the image
docker build -t ikon-systems-dashboard .

# Run the container
docker run -p 3000:3000 ikon-systems-dashboard
```

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "preview"]
```

## ☁️ Cloud Platform Deployment

### AWS Amplify

1. **Connect Repository**
   - Go to AWS Amplify Console
   - Connect your repository

2. **Build Settings**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: dist
       files:
         - '**/*'
   ```

3. **Environment Variables**
   - Add all environment variables in the Amplify console

### Google Cloud Run

1. **Build and Deploy**
   ```bash
   # Build the image
   gcloud builds submit --tag gcr.io/PROJECT_ID/ikon-dashboard

   # Deploy to Cloud Run
   gcloud run deploy ikon-dashboard \
     --image gcr.io/PROJECT_ID/ikon-dashboard \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

## 🔧 Environment Configuration

### Production Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Integrations
VITE_VAPI_API_KEY=your_vapi_key
VITE_TWILIO_ACCOUNT_SID=your_twilio_sid
VITE_TWILIO_AUTH_TOKEN=your_twilio_token
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
VITE_GOOGLE_CALENDAR_CLIENT_ID=your_google_client_id

# Optional
VITE_SENTRY_DSN=your_sentry_dsn
```

### Supabase Production Setup

1. **Create Production Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project for production

2. **Run Migrations**
   ```bash
   supabase link --project-ref your-production-ref
   supabase db push
   ```

3. **Configure Authentication**
   - Go to Authentication > Settings
   - Add your production domain to allowed redirect URLs
   - Configure email templates

4. **Set up RLS Policies**
   - RLS policies are automatically created by migrations
   - Verify policies are working correctly

## 🔒 Security Checklist

- [ ] Environment variables are set in production
- [ ] Supabase RLS policies are configured
- [ ] CORS is properly configured
- [ ] HTTPS is enabled
- [ ] API keys are rotated regularly
- [ ] Database backups are enabled
- [ ] Monitoring is set up

## 📊 Monitoring and Analytics

### Vercel Analytics
- Enable Vercel Analytics in project settings
- Track performance and user behavior

### Sentry Error Tracking
1. Create a Sentry project
2. Add `VITE_SENTRY_DSN` to environment variables
3. Errors will be automatically tracked

### Supabase Monitoring
- Use Supabase dashboard for database monitoring
- Set up alerts for performance issues

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Node.js version (requires 18+)
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Environment Variables Not Working**
   - Ensure variables are prefixed with `VITE_`
   - Restart the development server
   - Check for typos in variable names

3. **Supabase Connection Issues**
   - Verify URL and API key are correct
   - Check if RLS policies are blocking access
   - Ensure authentication is properly configured

4. **CORS Errors**
   - Add your domain to Supabase CORS settings
   - Check if API endpoints are properly configured

### Support

For deployment issues:
1. Check the platform's documentation
2. Review error logs in the platform dashboard
3. Contact support with specific error messages 