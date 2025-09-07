# 🌊 Digital Ocean Deployment Guide

## 🚀 Deploy Ikon Systems Dashboard to Digital Ocean

### Prerequisites

1. **Digital Ocean Droplet** (Ubuntu 20.04+ recommended)
2. **Domain Name** pointed to your droplet IP
3. **SSH access** to your droplet
4. **Local environment** with the project files

### Quick Deployment

#### Step 1: Prepare Your Droplet

```bash
# Connect to your droplet
ssh root@YOUR_DROPLET_IP

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
```

#### Step 2: Deploy from Your Local Machine

```bash
# Set your droplet IP
export DROPLET_IP=YOUR_DROPLET_IP

# Run the deployment script
./scripts/deploy-do.sh
```

#### Step 3: Configure DNS

Point your domain to your droplet IP:
- **A Record**: `app.ikonsystemsai.com` → `YOUR_DROPLET_IP`
- **A Record**: `traefik.ikonsystemsai.com` → `YOUR_DROPLET_IP` (optional)

#### Step 4: Access Your Application

- **Main App**: https://app.ikonsystemsai.com
- **Traefik Dashboard**: https://traefik.ikonsystemsai.com (optional)

## 🔧 Manual Deployment Steps

### 1. Copy Files to Droplet

```bash
# Create directory on droplet
ssh root@YOUR_DROPLET_IP "mkdir -p /opt/ikon-systems-dashboard"

# Copy project files
scp -r . root@YOUR_DROPLET_IP:/opt/ikon-systems-dashboard/
```

### 2. Deploy with Docker Compose

```bash
# SSH into droplet
ssh root@YOUR_DROPLET_IP

# Navigate to project directory
cd /opt/ikon-systems-dashboard

# Create necessary directories
mkdir -p letsencrypt backups
chmod 600 letsencrypt

# Start services
docker-compose up -d --build

# Check status
docker-compose ps
```

### 3. Monitor Deployment

```bash
# View logs
docker-compose logs -f

# Check specific service
docker-compose logs app
docker-compose logs traefik

# Restart services if needed
docker-compose restart
```

## 🏗️ Architecture

### Services

1. **App Container** (`ikon-systems-app`)
   - Nginx serving React build
   - Port: 8080 (internal)
   - Health checks enabled

2. **Traefik Proxy** (`ikon-traefik`)
   - Automatic SSL with Let's Encrypt
   - HTTP to HTTPS redirect
   - Dashboard available

3. **Backup Service** (optional)
   - Daily database backups
   - Automatic cleanup

### Network

- **Internal Network**: `ikon-network`
- **External Ports**: 80 (HTTP), 443 (HTTPS), 8080 (Traefik Dashboard)

## 🔒 SSL/TLS Configuration

### Automatic SSL with Let's Encrypt

The deployment automatically configures SSL certificates using Let's Encrypt through Traefik.

**Requirements:**
- Domain must point to your droplet IP
- Ports 80 and 443 must be open
- Valid email in docker-compose.yml

### Manual SSL Setup (if needed)

```bash
# Check certificate status
docker-compose exec traefik cat /letsencrypt/acme.json

# Force certificate renewal
docker-compose restart traefik
```

## 🔄 Maintenance

### Update Application

```bash
# From your local machine
./scripts/deploy-do.sh
```

### Database Backup

```bash
# SSH into droplet
ssh root@YOUR_DROPLET_IP

# Run backup manually
cd /opt/ikon-systems-dashboard
docker-compose exec backup /backup.sh

# Enable automatic backups
docker-compose --profile backup up -d
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f traefik

# Last 100 lines
docker-compose logs --tail=100
```

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart app
docker-compose restart traefik

# Rebuild and restart
docker-compose up -d --build
```

## 🔍 Troubleshooting

### Common Issues

#### 1. SSL Certificate Issues
```bash
# Check Traefik logs
docker-compose logs traefik

# Verify domain points to droplet
dig app.ikonsystemsai.com

# Restart Traefik
docker-compose restart traefik
```

#### 2. Application Not Loading
```bash
# Check app container
docker-compose logs app

# Verify container is running
docker-compose ps

# Test internal connectivity
docker-compose exec traefik wget -qO- http://app:8080/health
```

#### 3. Database Connection Issues
```bash
# Check environment variables
docker-compose config

# Test Supabase connection
curl -I https://drmloijaajtzkvdclwmf.supabase.co
```

### Performance Optimization

#### 1. Enable Gzip Compression
Already configured in nginx.conf

#### 2. Enable Caching
```bash
# Add to nginx configuration
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

#### 3. Monitor Resources
```bash
# Check container resources
docker stats

# Check disk usage
df -h
docker system df
```

## 🔐 Security

### Firewall Configuration

```bash
# Install UFW
apt install ufw

# Allow SSH
ufw allow ssh

# Allow HTTP/HTTPS
ufw allow 80
ufw allow 443

# Allow Traefik dashboard (optional)
ufw allow 8080

# Enable firewall
ufw enable
```

### Security Headers

Already configured in nginx.conf:
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy

### Regular Updates

```bash
# Update system packages
apt update && apt upgrade -y

# Update Docker images
docker-compose pull
docker-compose up -d --build
```

## 📊 Monitoring

### Health Checks

```bash
# Application health
curl -f http://YOUR_DROPLET_IP:8080/health

# Container health
docker-compose ps
```

### Log Rotation

```bash
# Configure Docker log rotation
cat > /etc/docker/daemon.json << EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

# Restart Docker
systemctl restart docker
```

## 🆘 Support

### Useful Commands

```bash
# Complete reset (be careful!)
docker-compose down -v
docker system prune -a
./scripts/deploy-do.sh

# Backup before reset
docker-compose exec backup /backup.sh

# View system resources
htop
df -h
free -h
```

### Getting Help

1. Check logs: `docker-compose logs -f`
2. Verify DNS: `dig app.ikonsystemsai.com`
3. Test connectivity: `curl -I http://YOUR_DROPLET_IP`
4. Check firewall: `ufw status`

## 🎉 Success!

Your Ikon Systems Dashboard should now be running at:
- **https://app.ikonsystemsai.com**

With features:
- ✅ Automatic SSL certificates
- ✅ HTTP to HTTPS redirect
- ✅ Container health monitoring
- ✅ Automatic restarts
- ✅ Security headers
- ✅ Gzip compression
- ✅ Database backups (optional)

**Your professional CRM system is now live on Digital Ocean!** 🚀
