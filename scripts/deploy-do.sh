#!/bin/bash

# Ikon Systems Dashboard - Digital Ocean Deployment Script
set -e

echo "🚀 Ikon Systems Dashboard - Digital Ocean Deployment"
echo "===================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DROPLET_IP="${DROPLET_IP:-}"
DROPLET_USER="${DROPLET_USER:-root}"
APP_NAME="ikon-systems-dashboard"
DOMAIN="app.ikonsystemsai.com"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if droplet IP is provided
if [ -z "$DROPLET_IP" ]; then
    print_error "Please set DROPLET_IP environment variable"
    echo "Usage: DROPLET_IP=your.droplet.ip ./scripts/deploy-do.sh"
    exit 1
fi

print_status "Deploying to Digital Ocean droplet: $DROPLET_IP"

# Test connection to droplet
print_status "Testing connection to droplet..."
if ! ssh -o ConnectTimeout=10 -o BatchMode=yes $DROPLET_USER@$DROPLET_IP exit 2>/dev/null; then
    print_error "Cannot connect to droplet. Please check:"
    echo "  1. Droplet IP is correct"
    echo "  2. SSH key is configured"
    echo "  3. Droplet is running"
    exit 1
fi
print_success "Connection to droplet successful"

# Build the application locally
print_status "Building application locally..."
npm run build
print_success "Application built successfully"

# Create deployment directory on droplet
print_status "Setting up deployment directory on droplet..."
ssh $DROPLET_USER@$DROPLET_IP "mkdir -p /opt/$APP_NAME"

# Copy files to droplet
print_status "Copying files to droplet..."
scp -r . $DROPLET_USER@$DROPLET_IP:/opt/$APP_NAME/

# Install Docker and Docker Compose on droplet if not installed
print_status "Setting up Docker on droplet..."
ssh $DROPLET_USER@$DROPLET_IP << 'EOF'
# Update system
apt-get update

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl enable docker
    systemctl start docker
fi

# Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Create necessary directories
mkdir -p /opt/ikon-systems-dashboard/letsencrypt
mkdir -p /opt/ikon-systems-dashboard/backups
chmod 600 /opt/ikon-systems-dashboard/letsencrypt
EOF

# Deploy the application
print_status "Deploying application on droplet..."
ssh $DROPLET_USER@$DROPLET_IP << 'EOF'
cd /opt/ikon-systems-dashboard

# Stop existing containers
docker-compose down || true

# Build and start new containers
docker-compose up -d --build

# Wait for services to be healthy
echo "Waiting for services to start..."
sleep 30

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services are running successfully"
else
    echo "❌ Some services failed to start"
    docker-compose logs
    exit 1
fi
EOF

# Configure DNS (instructions)
print_warning "DNS Configuration Required:"
echo "Please configure your DNS settings:"
echo "  1. Point $DOMAIN to $DROPLET_IP"
echo "  2. Point traefik.ikonsystemsai.com to $DROPLET_IP (optional)"
echo ""

# Test deployment
print_status "Testing deployment..."
sleep 10

# Check if the application is accessible
if curl -s -o /dev/null -w "%{http_code}" http://$DROPLET_IP | grep -q "200\|301\|302"; then
    print_success "Application is accessible at http://$DROPLET_IP"
else
    print_warning "Application may not be fully ready yet. Check logs with:"
    echo "  ssh $DROPLET_USER@$DROPLET_IP 'cd /opt/$APP_NAME && docker-compose logs'"
fi

print_success "Deployment completed!"
echo ""
echo "🌐 Your application will be available at:"
echo "  • https://$DOMAIN (once DNS is configured)"
echo "  • http://$DROPLET_IP (immediate access)"
echo ""
echo "📊 Traefik Dashboard:"
echo "  • https://traefik.ikonsystemsai.com (once DNS is configured)"
echo ""
echo "🔧 Management commands:"
echo "  • View logs: ssh $DROPLET_USER@$DROPLET_IP 'cd /opt/$APP_NAME && docker-compose logs -f'"
echo "  • Restart: ssh $DROPLET_USER@$DROPLET_IP 'cd /opt/$APP_NAME && docker-compose restart'"
echo "  • Update: Re-run this script"
echo ""
echo "🎉 Your Ikon Systems Dashboard is now live on Digital Ocean!"
