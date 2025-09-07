# Ikon Systems Dashboard - Deployment Guide v2.0.0

## 🚀 Ultimate Webapp Upgrade - Production Ready

This guide covers the complete deployment process for the Ikon Systems Dashboard v2.0.0 with all integrations (VAPI, Stripe, Google Calendar, Twilio) and production-ready features.

## 📋 Pre-Deployment Checklist

### ✅ Completed Features
- [x] **Google Calendar Integration** - Appointments page with calendar sync
- [x] **Stripe Integration** - Financials page with payment analytics
- [x] **VAPI Integration** - Voice Agents page with AI agent management
- [x] **Twilio Integration** - Phone Numbers page with SMS capabilities
- [x] **Production Error Handling** - Error boundaries and maintenance mode
- [x] **Environment Configuration** - Comprehensive env setup
- [x] **API Key Management** - Secure key handling with masking
- [x] **Modern UI/UX** - Enhanced components and responsive design

### 🔧 Required Environment Variables

#### Frontend (.env.local)
```bash
# App Configuration
VITE_APP_ENV=production
VITE_APP_DEBUG=false
VITE_APP_ANALYTICS_ID=your-analytics-id
VITE_APP_MAINTENANCE_MODE=false

# Supabase
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# API Keys (Frontend)
VITE_VAPI_API_KEY=your-vapi-api-key
VITE_TWILIO_ACCOUNT_SID=your-twilio-account-sid
VITE_TWILIO_AUTH_TOKEN=your-twilio-auth-token
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
VITE_GOOGLE_CALENDAR_CLIENT_ID=your-google-client-id
VITE_SENTRY_DSN=your-sentry-dsn
```

#### Backend (Environment Variables)
```bash
# Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# VAPI
VAPI_API_KEY=your-vapi-api-key
VAPI_WEBHOOK_URL=https://your-domain.com/api/vapi/webhook

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Google Calendar
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://your-domain.com/auth/google/callback

# Twilio
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
```

## 🐳 Docker Deployment

### 1. Build and Deploy with Docker Compose

```bash
# Build the application
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 2. Using the Deploy Script

```bash
# Make script executable
chmod +x deploy-to-droplet.sh

# Deploy to Digital Ocean droplet
./deploy-to-droplet.sh
```

## 🌐 Digital Ocean Droplet Setup

### 1. Server Requirements
- **OS**: Ubuntu 20.04+ or 22.04 LTS
- **RAM**: 2GB minimum (4GB recommended)
- **Storage**: 25GB minimum
- **CPU**: 1 vCPU minimum

### 2. Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx
sudo apt install nginx -y
```

### 3. SSL Certificate Setup

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 📦 GitHub Release Process

### 1. Create Release Branch

```bash
# Create and switch to release branch
git checkout -b release/v2.0.0

# Add all changes
git add .

# Commit changes
git commit -m "feat: Ultimate Webapp Upgrade v2.0.0

- Add Google Calendar integration to appointments
- Add Stripe analytics to financials
- Add VAPI integration to voice agents
- Add Twilio phone numbers management
- Implement production-ready error handling
- Add comprehensive environment configuration
- Enhance UI/UX with modern components"

# Push to GitHub
git push origin release/v2.0.0
```

### 2. Create Pull Request

1. Go to GitHub repository
2. Create pull request from `release/v2.0.0` to `main`
3. Review and merge the PR

### 3. Create GitHub Release

1. Go to GitHub repository → Releases
2. Click "Create a new release"
3. Tag version: `v2.0.0`
4. Release title: `Ultimate Webapp Upgrade v2.0.0`
5. Description:

```markdown
## 🚀 Ultimate Webapp Upgrade v2.0.0

### ✨ New Features
- **Google Calendar Integration**: Sync appointments with Google Calendar
- **Stripe Analytics**: Comprehensive payment analytics and customer management
- **VAPI Integration**: AI voice agent management and call history
- **Twilio Integration**: Phone number management and SMS capabilities

### 🔧 Improvements
- Production-ready error handling with error boundaries
- Maintenance mode for system updates
- Enhanced environment configuration
- Secure API key management with masking
- Modern UI/UX improvements

### 🛠️ Technical Updates
- Updated to React 18 with latest dependencies
- Enhanced TypeScript configuration
- Improved build optimization
- Better error tracking and monitoring

### 📋 Migration Notes
- Update environment variables (see DEPLOYMENT_GUIDE.md)
- Configure webhook URLs for integrations
- Set up SSL certificates for production
```

## 🔄 Deployment Workflow

### 1. Development to Staging

```bash
# Build for staging
npm run build

# Test locally
npm run preview

# Deploy to staging (if you have staging environment)
docker-compose -f docker-compose.yml up -d
```

### 2. Staging to Production

```bash
# Build production image
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d

# Verify deployment
curl -I https://your-domain.com
```

## 🔍 Post-Deployment Verification

### 1. Health Checks

```bash
# Check application health
curl https://your-domain.com/api/health

# Check database connection
curl https://your-domain.com/api/status

# Check integrations
curl https://your-domain.com/api/integrations/status
```

### 2. Integration Testing

1. **Google Calendar**: Test appointment sync
2. **Stripe**: Test payment processing
3. **VAPI**: Test voice agent creation
4. **Twilio**: Test SMS sending

### 3. Performance Monitoring

```bash
# Check Docker container stats
docker stats

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Check application logs
docker-compose -f docker-compose.prod.yml logs -f
```

## 🚨 Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Check `.env.local` file exists
   - Verify variable names match exactly
   - Restart Docker containers

2. **API Integration Failures**
   - Verify API keys are correct
   - Check webhook URLs are accessible
   - Review integration service logs

3. **SSL Certificate Issues**
   - Renew certificates: `sudo certbot renew`
   - Check Nginx configuration
   - Verify domain DNS settings

4. **Database Connection Issues**
   - Check Supabase connection string
   - Verify database permissions
   - Review migration status

### Support Commands

```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs

# Restart specific service
docker-compose -f docker-compose.prod.yml restart app

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale app=2

# Clean up unused images
docker system prune -a
```

## 📞 Support

For deployment issues or questions:
1. Check the logs first
2. Review this deployment guide
3. Check integration setup guide: `INTEGRATION_SETUP_GUIDE.md`
4. Review production config: `PRODUCTION_CONFIG.md`

---

**Version**: 2.0.0  
**Last Updated**: $(date)  
**Status**: Production Ready ✅
