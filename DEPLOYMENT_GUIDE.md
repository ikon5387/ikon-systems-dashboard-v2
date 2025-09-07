# Deployment Guide - Ikon Systems Dashboard

## 🚀 Quick Deployment to app.ikonsystemsai.com

### Prerequisites
- Domain: `ikonsystemsai.com`
- Subdomain: `app.ikonsystemsai.com`
- Vercel account (recommended)
- Supabase project (already configured)

## Option 1: Vercel Deployment (Recommended)

### Step 1: Connect Repository to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 2: Configure Environment Variables in Vercel

Add these environment variables in Vercel dashboard:

```env
VITE_SUPABASE_URL=https://drmloijaajtzkvdclwmf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRybWxvaWphYWp0emt2ZGNsd21mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MjgzMjMsImV4cCI6MjA3MjEwNDMyM30.axIWyuz9yvSaQgW-l-iMjwSAsNKcllyLSlv3Aj4zatY
NODE_ENV=production
```

Optional integrations (add when ready):
```env
VITE_VAPI_API_KEY=your_actual_vapi_key
VITE_TWILIO_ACCOUNT_SID=your_actual_twilio_sid
VITE_TWILIO_AUTH_TOKEN=your_actual_twilio_token
VITE_STRIPE_PUBLISHABLE_KEY=your_actual_stripe_key
VITE_GOOGLE_CALENDAR_CLIENT_ID=your_actual_google_client_id
VITE_SENTRY_DSN=your_actual_sentry_dsn
```

### Step 3: Configure Custom Domain

1. In Vercel dashboard, go to your project
2. Go to **Settings** → **Domains**
3. Add custom domain: `app.ikonsystemsai.com`
4. Vercel will provide DNS records to configure

### Step 4: Configure DNS Records

Add these DNS records to your domain registrar:

```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
```

### Step 5: Update Supabase Authentication URLs

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Update:
   - **Site URL**: `https://app.ikonsystemsai.com`
   - **Redirect URLs**: Add `https://app.ikonsystemsai.com/auth/callback`

### Step 6: Enable Google OAuth (Optional)

1. Go to **Authentication** → **Providers** → **Google**
2. Enable Google provider
3. Add your Google OAuth credentials
4. Add authorized redirect URIs in Google Console:
   - `https://drmloijaajtzkvdclwmf.supabase.co/auth/v1/callback`

## Option 2: Docker Deployment

### Build and Run with Docker

```bash
# Build the image
docker build -t ikon-systems-dashboard .

# Run the container
docker run -p 3000:80 ikon-systems-dashboard
```

### Using Docker Compose

```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

## Option 3: Manual Server Deployment

### Prerequisites
- Node.js 18+
- Nginx
- PM2 (for process management)

### Steps

1. **Clone and build**:
```bash
git clone <your-repo>
cd ikonsystemsdash
npm install
npm run build
```

2. **Configure Nginx**:
```nginx
server {
    listen 80;
    server_name app.ikonsystemsai.com;
    
    location / {
        root /path/to/ikonsystemsdash/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

3. **SSL with Let's Encrypt**:
```bash
sudo certbot --nginx -d app.ikonsystemsai.com
```

## 🔧 Post-Deployment Configuration

### 1. Test Authentication
- Visit `https://app.ikonsystemsai.com`
- Try logging in with email/password
- Test Google OAuth if enabled

### 2. Database Seeding (Optional)
Add sample data to test the application:

```sql
-- Insert a test user (run in Supabase SQL editor)
INSERT INTO users (email, role) VALUES ('admin@ikonsystemsai.com', 'admin');

-- Insert sample clients
INSERT INTO clients (name, email, phone, address, status, notes) VALUES 
('John Doe', 'john@example.com', '(555) 123-4567', '123 Main St, Los Angeles, CA', 'lead', 'Kitchen remodel inquiry'),
('Jane Smith', 'jane@example.com', '(555) 987-6543', '456 Oak Ave, San Francisco, CA', 'active', 'Bathroom renovation project');
```

### 3. Configure Integrations

#### VAPI (Voice Agents)
1. Sign up at [vapi.ai](https://vapi.ai)
2. Get your API key
3. Update environment variable: `VITE_VAPI_API_KEY`

#### Twilio (SMS)
1. Sign up at [twilio.com](https://twilio.com)
2. Get Account SID and Auth Token
3. Update environment variables:
   - `VITE_TWILIO_ACCOUNT_SID`
   - `VITE_TWILIO_AUTH_TOKEN`

#### Stripe (Payments)
1. Sign up at [stripe.com](https://stripe.com)
2. Get publishable key
3. Update environment variable: `VITE_STRIPE_PUBLISHABLE_KEY`

#### Google Calendar
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project and enable Calendar API
3. Create OAuth 2.0 credentials
4. Update environment variable: `VITE_GOOGLE_CALENDAR_CLIENT_ID`

## 🔒 Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Supabase RLS policies active
- [ ] CORS configured properly
- [ ] Security headers implemented
- [ ] Regular backups scheduled
- [ ] Error tracking configured (Sentry)

## 📊 Monitoring

### Vercel Analytics
- Enable in Vercel dashboard
- Monitor performance and usage

### Supabase Monitoring
- Monitor database performance
- Set up alerts for high usage
- Review authentication logs

### Error Tracking
Add Sentry DSN to track errors in production:
```env
VITE_SENTRY_DSN=your_sentry_dsn
```

## 🔄 CI/CD Pipeline

The app is configured for automatic deployment:
- Push to `main` branch triggers deployment
- Build and tests run automatically
- Zero-downtime deployment

## 📱 Mobile Optimization

The app is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile phones
- Progressive Web App (PWA) ready

## 🆘 Troubleshooting

### Common Issues

1. **Build fails**: Check Node.js version (requires 18+)
2. **Auth not working**: Verify Supabase URLs in dashboard
3. **CORS errors**: Check domain configuration in Supabase
4. **Environment variables**: Ensure all required vars are set

### Support
- Check logs in Vercel dashboard
- Review Supabase logs
- Contact: support@ikonsystemsai.com

## 🎉 Success!

Your Ikon Systems Dashboard should now be live at:
**https://app.ikonsystemsai.com**

Test all functionality and start managing your business efficiently!
