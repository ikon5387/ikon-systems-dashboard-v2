#!/bin/bash

# Ikon Systems Dashboard - Docker Deployment Script
# This script helps you deploy your app using Docker

set -e

echo "🚀 Ikon Systems Dashboard - Docker Deployment"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if Docker is installed
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Check if .env file exists
check_env() {
    print_status "Checking environment configuration..."
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating from env.example..."
        if [ -f "env.example" ]; then
            cp env.example .env
            print_warning "Please edit .env file with your actual values before continuing"
            print_warning "Especially VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
            read -p "Press Enter when you've updated the .env file..."
        else
            print_error "No env.example file found. Please create a .env file manually."
            exit 1
        fi
    fi
    print_success "Environment configuration found"
}

# Build the Docker image
build_image() {
    print_status "Building Docker image..."
    docker build -t ikon-systems-dashboard .
    print_success "Docker image built successfully"
}

# Deploy with simple setup (no SSL)
deploy_simple() {
    print_status "Deploying with simple setup (no SSL)..."
    docker-compose -f docker-compose.simple.yml down
    docker-compose -f docker-compose.simple.yml up -d
    print_success "App deployed successfully!"
    print_status "Your app is available at: http://localhost:3000"
    print_status "Health check: http://localhost:3000/health"
}

# Deploy with production setup (with SSL)
deploy_production() {
    print_status "Deploying with production setup (with SSL)..."
    
    # Create letsencrypt directory
    mkdir -p letsencrypt
    chmod 600 letsencrypt
    
    # Create acme.json if it doesn't exist
    if [ ! -f "letsencrypt/acme.json" ]; then
        touch letsencrypt/acme.json
        chmod 600 letsencrypt/acme.json
    fi
    
    docker-compose -f docker-compose.prod.yml down
    docker-compose -f docker-compose.prod.yml up -d
    
    print_success "Production deployment completed!"
    print_status "Your app will be available at: https://app.ikonsystemsai.com"
    print_status "Traefik dashboard: https://traefik.ikonsystemsai.com"
    print_warning "Make sure your domain points to this server's IP address"
}

# Show logs
show_logs() {
    print_status "Showing application logs..."
    docker-compose logs -f app
}

# Stop the application
stop_app() {
    print_status "Stopping application..."
    docker-compose down
    print_success "Application stopped"
}

# Clean up
cleanup() {
    print_status "Cleaning up Docker resources..."
    docker-compose down
    docker system prune -f
    print_success "Cleanup completed"
}

# Show status
show_status() {
    print_status "Application status:"
    docker-compose ps
}

# Main menu
show_menu() {
    echo ""
    echo "Choose deployment option:"
    echo "1) Simple deployment (localhost:3000, no SSL)"
    echo "2) Production deployment (with SSL, requires domain setup)"
    echo "3) Show logs"
    echo "4) Stop application"
    echo "5) Show status"
    echo "6) Cleanup"
    echo "7) Exit"
    echo ""
}

# Main execution
main() {
    check_docker
    check_env
    
    while true; do
        show_menu
        read -p "Enter your choice (1-7): " choice
        
        case $choice in
            1)
                build_image
                deploy_simple
                ;;
            2)
                build_image
                deploy_production
                ;;
            3)
                show_logs
                ;;
            4)
                stop_app
                ;;
            5)
                show_status
                ;;
            6)
                cleanup
                ;;
            7)
                print_success "Goodbye!"
                exit 0
                ;;
            *)
                print_error "Invalid option. Please choose 1-7."
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
    done
}

# Run main function
main
