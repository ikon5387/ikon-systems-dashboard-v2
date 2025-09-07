# 🚀 Digital Ocean Droplet Deployment Guide

## Prerequisites
- Digital Ocean Droplet running Ubuntu 25.04
- Root access to the droplet
- Domain name pointing to your droplet IP (optional)

## Step-by-Step Deployment

### Step 1: Connect to Your Droplet
```bash
ssh root@161.35.232.165
```

### Step 2: Update System and Install Dependencies
```bash
# Update system
apt update && apt upgrade -y

# Install Docker (if not already installed)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
systemctl enable docker
systemctl start docker

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Git
apt install -y git
```

### Step 3: Clone the Repository
```bash
# Create application directory
mkdir -p /opt/ikon-systems-dashboard
cd /opt/ikon-systems-dashboard

# Clone the repository
git clone https://github.com/ikon5387/ikon-systems-dashboard-v2.git .

# Or if directory already exists, update it
git pull origin main
```

### Step 4: Create Environment File
```bash
# Create .env file
cat > .env << 'EOF'
# Production Environment Variables
NODE_ENV=production

# Supabase Configuration (UPDATE THESE WITH YOUR ACTUAL VALUES)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# App Configuration
VITE_APP_NAME=Ikon Systems Dashboard
VITE_APP_VERSION=1.0.0

# API Configuration
VITE_API_URL=https://api.ikonsystemsai.com

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_VOICE_AGENTS=true
VITE_ENABLE_FINANCIALS=true

# Security
VITE_ENABLE_HTTPS=true
VITE_ENABLE_CORS=true
EOF
```

### Step 5: Build and Deploy
```bash
# Stop any existing containers
docker-compose down --remove-orphans || true

# Build and start the application
docker-compose up --build -d

# Check container status
docker ps

# Check logs
docker logs ikon-systems-app
```

### Step 6: Verify Deployment
```bash
# Check if application is running
curl -f http://localhost:8080/health

# Check container logs
docker logs ikon-systems-app --tail 20

# Check if Traefik is running
docker logs ikon-traefik --tail 10
```

### Step 7: Configure Firewall (if needed)
```bash
# Allow HTTP and HTTPS traffic
ufw allow 80
ufw allow 443
ufw allow 8080
ufw --force enable
```

## Access Your Application

### Local Access
- **HTTP**: http://161.35.232.165
- **HTTPS**: https://161.35.232.165 (if SSL is configured)

### With Custom Domain
- **HTTP**: http://app.ikonsystemsai.com
- **HTTPS**: https://app.ikonsystemsai.com

## Troubleshooting

### Check Container Status
```bash
docker ps -a
```

### View Logs
```bash
# Application logs
docker logs ikon-systems-app

# Traefik logs
docker logs ikon-traefik

# All containers
docker-compose logs
```

### Restart Services
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart ikon-systems-app
```

### Update Application
```bash
cd /opt/ikon-systems-dashboard
git pull origin main
docker-compose up --build -d
```

## Important Notes

1. **Update Environment Variables**: Make sure to update the `.env` file with your actual Supabase credentials
2. **SSL Certificate**: For production, configure SSL certificates with Let's Encrypt
3. **Domain Setup**: Point your domain to the droplet IP address
4. **Backup**: Regularly backup your application data
5. **Monitoring**: Set up monitoring for your application

## Next Steps

1. Update the `.env` file with your Supabase credentials
2. Configure your domain name to point to the droplet
3. Set up SSL certificates for HTTPS
4. Configure monitoring and logging
5. Set up automated backups

## Support

If you encounter any issues:
1. Check the container logs
2. Verify environment variables
3. Ensure all ports are accessible
4. Check firewall settings
