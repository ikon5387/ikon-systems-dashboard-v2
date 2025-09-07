# Production Configuration Guide

## Environment Variables

Create a `.env.production` file with the following variables:

```bash
# Application Environment
VITE_APP_ENV=production
VITE_APP_DEBUG=false
VITE_APP_MAINTENANCE_MODE=false
VITE_APP_ANALYTICS_ID=your_analytics_id

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# VAPI Integration
VITE_VAPI_API_KEY=your_vapi_api_key

# Twilio Integration
VITE_TWILIO_ACCOUNT_SID=your_twilio_account_sid
VITE_TWILIO_AUTH_TOKEN=your_twilio_auth_token

# Stripe Integration
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key

# Google Calendar Integration
VITE_GOOGLE_CALENDAR_CLIENT_ID=your_google_calendar_client_id

# Error Tracking
VITE_SENTRY_DSN=your_sentry_dsn
```

## Backend Environment Variables

For the backend, ensure these environment variables are set:

```bash
# Supabase Backend
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# VAPI Backend
VAPI_API_KEY=your_vapi_api_key
VAPI_WEBHOOK_URL=https://your-domain.com/webhooks/vapi

# Stripe Backend
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# Google Calendar Backend
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-domain.com/api/google-calendar/callback

# Twilio Backend
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

## Production Checklist

### Frontend
- [ ] Set `VITE_APP_ENV=production`
- [ ] Set `VITE_APP_DEBUG=false`
- [ ] Configure all integration API keys
- [ ] Set up error tracking (Sentry)
- [ ] Configure analytics
- [ ] Test all integrations in production environment

### Backend
- [ ] Set up production database
- [ ] Configure all service API keys
- [ ] Set up webhook endpoints
- [ ] Configure CORS for production domains
- [ ] Set up logging and monitoring
- [ ] Configure rate limiting
- [ ] Set up SSL certificates

### Security
- [ ] Use production API keys (not test keys)
- [ ] Enable HTTPS
- [ ] Configure proper CORS settings
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Regular security updates

### Performance
- [ ] Enable gzip compression
- [ ] Set up CDN
- [ ] Optimize images
- [ ] Enable caching
- [ ] Monitor performance metrics

### Monitoring
- [ ] Set up error tracking
- [ ] Configure uptime monitoring
- [ ] Set up performance monitoring
- [ ] Configure log aggregation
- [ ] Set up alerts

## Deployment

### Docker Production
```bash
# Build production image
docker build -t ikon-systems-dash:latest .

# Run with production environment
docker run -d \
  --name ikon-systems-dash \
  -p 80:80 \
  -p 443:443 \
  --env-file .env.production \
  ikon-systems-dash:latest
```

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Digital Ocean Droplet
```bash
# Run deployment script
./deploy-to-droplet.sh
```

## Maintenance Mode

To enable maintenance mode, set:
```bash
VITE_APP_MAINTENANCE_MODE=true
```

This will show a maintenance page to all users.

## Health Checks

The application provides health check endpoints:

- Frontend: `/health` (if implemented)
- Backend: `/health` - Returns status of all integrations

## Backup Strategy

1. **Database**: Regular Supabase backups
2. **Files**: Regular file system backups
3. **Configuration**: Version control all config files
4. **Secrets**: Use secure secret management

## Rollback Strategy

1. Keep previous versions tagged in Git
2. Use blue-green deployment
3. Have rollback scripts ready
4. Test rollback procedures regularly
