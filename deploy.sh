#!/bin/bash

# Ikon Systems Dashboard Deployment Script
# This script handles the complete deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="ikon-systems-dashboard"
DOCKER_COMPOSE_FILE="docker-compose.simple.yml"
PROD_COMPOSE_FILE="docker-compose.prod.yml"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    log_info "Checking Docker status..."
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    log_success "Docker is running"
}

# Check if required files exist
check_files() {
    log_info "Checking required files..."
    local required_files=(
        "Dockerfile"
        "docker-compose.simple.yml"
        "nginx.conf"
        ".env"
    )
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            log_error "Required file $file not found"
            exit 1
        fi
    done
    log_success "All required files found"
}

# Build the application
build_app() {
    log_info "Building the application..."
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm ci --silent --no-audit --no-fund
    
    # Run type checking
    log_info "Running TypeScript type checking..."
    npm run type-check
    
    # Build the application
    log_info "Building for production..."
    npm run build
    
    log_success "Application built successfully"
}

# Build Docker image
build_docker() {
    log_info "Building Docker image..."
    
    # Stop existing containers
    log_info "Stopping existing containers..."
    docker-compose -f $DOCKER_COMPOSE_FILE down --remove-orphans || true
    
    # Build new image
    log_info "Building Docker image..."
    docker-compose -f $DOCKER_COMPOSE_FILE build --no-cache
    
    log_success "Docker image built successfully"
}

# Deploy the application
deploy() {
    log_info "Deploying the application..."
    
    # Start the application
    docker-compose -f $DOCKER_COMPOSE_FILE up -d
    
    # Wait for health check
    log_info "Waiting for application to be healthy..."
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f http://localhost:3000/health > /dev/null 2>&1; then
            log_success "Application is healthy and running"
            break
        fi
        
        if [[ $attempt -eq $max_attempts ]]; then
            log_error "Application failed to become healthy after $max_attempts attempts"
            log_info "Checking container logs..."
            docker-compose -f $DOCKER_COMPOSE_FILE logs app
            exit 1
        fi
        
        log_info "Attempt $attempt/$max_attempts - waiting for application..."
        sleep 2
        ((attempt++))
    done
}

# Deploy to production
deploy_production() {
    log_info "Deploying to production..."
    
    # Check if production compose file exists
    if [[ ! -f "$PROD_COMPOSE_FILE" ]]; then
        log_error "Production compose file $PROD_COMPOSE_FILE not found"
        exit 1
    fi
    
    # Deploy with production configuration
    docker-compose -f $PROD_COMPOSE_FILE up -d
    
    log_success "Production deployment completed"
    log_info "Application is available at: https://app.ikonsystemsai.com"
}

# Show application status
show_status() {
    log_info "Application Status:"
    echo ""
    
    # Docker containers
    log_info "Docker Containers:"
    docker-compose -f $DOCKER_COMPOSE_FILE ps
    
    echo ""
    
    # Application health
    log_info "Application Health:"
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        log_success "Application is healthy"
    else
        log_error "Application is not responding"
    fi
    
    echo ""
    
    # Resource usage
    log_info "Resource Usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
}

# Clean up
cleanup() {
    log_info "Cleaning up..."
    
    # Stop and remove containers
    docker-compose -f $DOCKER_COMPOSE_FILE down --remove-orphans
    
    # Remove unused images
    docker image prune -f
    
    log_success "Cleanup completed"
}

# Show logs
show_logs() {
    log_info "Showing application logs..."
    docker-compose -f $DOCKER_COMPOSE_FILE logs -f app
}

# Main function
main() {
    case "${1:-deploy}" in
        "build")
            check_docker
            check_files
            build_app
            build_docker
            ;;
        "deploy")
            check_docker
            check_files
            build_app
            build_docker
            deploy
            show_status
            ;;
        "production")
            check_docker
            check_files
            build_app
            build_docker
            deploy_production
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs
            ;;
        "cleanup")
            cleanup
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  build      - Build the application and Docker image"
            echo "  deploy     - Build and deploy the application (default)"
            echo "  production - Deploy to production with SSL"
            echo "  status     - Show application status"
            echo "  logs       - Show application logs"
            echo "  cleanup    - Clean up containers and images"
            echo "  help       - Show this help message"
            ;;
        *)
            log_error "Unknown command: $1"
            echo "Use '$0 help' for available commands"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"