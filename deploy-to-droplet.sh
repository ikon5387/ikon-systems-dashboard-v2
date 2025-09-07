#!/bin/bash

# Deploy Ikon Systems Dashboard to Digital Ocean Droplet
# Usage: ./deploy-to-droplet.sh

set -e

# Configuration
DROPLET_IP="161.35.232.165"
DROPLET_USER="root"
APP_DIR="/opt/ikon-systems-dashboard"
REPO_URL="https://github.com/ikon5387/ikon-systems-dashboard-v2.git"

echo "🚀 Starting deployment to Digital Ocean Droplet..."

# Step 1: Connect to droplet and prepare environment
echo "📋 Step 1: Preparing droplet environment..."
ssh $DROPLET_USER@$DROPLET_IP << 'EOF'
    # Update system
    apt update && apt upgrade -y
    
    # Install Docker if not already installed
    if ! command -v docker &> /dev/null; then
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        systemctl enable docker
        systemctl start docker
    fi
    
    # Install Docker Compose if not already installed
    if ! command -v docker-compose &> /dev/null; then
        curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    fi
    
    # Install Git if not already installed
    if ! command -v git &> /dev/null; then
        apt install -y git
    fi
    
    echo "✅ Droplet environment prepared"
EOF

# Step 2: Clone or update repository on droplet
echo "📋 Step 2: Setting up application on droplet..."
ssh $DROPLET_USER@$DROPLET_IP << EOF
    # Create application directory
    mkdir -p $APP_DIR
    cd $APP_DIR
    
    # Clone or update repository
    if [ -d ".git" ]; then
        echo "Updating existing repository..."
        git pull origin main
    else
        echo "Cloning repository..."
        git clone $REPO_URL .
    fi
    
    echo "✅ Application code updated"
EOF

# Step 3: Create environment file on droplet
echo "📋 Step 3: Setting up environment variables..."
ssh $DROPLET_USER@$DROPLET_IP << 'EOF'
    cd /opt/ikon-systems-dashboard
    
    # Create .env file with production settings
    cat > .env << 'ENVEOF'
# Production Environment Variables
NODE_ENV=production

# Supabase Configuration
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
ENVEOF
    
    echo "✅ Environment file created"
    echo "⚠️  Please update the .env file with your actual Supabase credentials"
EOF

# Step 4: Build and deploy with Docker
echo "📋 Step 4: Building and deploying application..."
ssh $DROPLET_USER@$DROPLET_IP << 'EOF'
    cd /opt/ikon-systems-dashboard
    
    # Stop existing containers
    docker-compose down --remove-orphans || true
    
    # Build and start containers
    docker-compose up --build -d
    
    echo "✅ Application deployed successfully"
EOF

# Step 5: Verify deployment
echo "📋 Step 5: Verifying deployment..."
ssh $DROPLET_USER@$DROPLET_IP << 'EOF'
    # Check container status
    echo "Container Status:"
    docker ps
    
    # Check application health
    echo "Application Health:"
    curl -f http://localhost:8080/health || echo "Health check failed"
    
    # Check logs
    echo "Recent logs:"
    docker logs ikon-systems-app --tail 10
EOF

echo "🎉 Deployment completed successfully!"
echo "📱 Your application should be available at: http://$DROPLET_IP"
echo "🔧 To configure SSL and custom domain, update the Traefik configuration"
echo "📝 Don't forget to update the .env file with your actual Supabase credentials"
