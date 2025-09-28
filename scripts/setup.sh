#!/bin/bash

# Verifiable Price Oracle Setup Script
# This script automates the initial setup and deployment process

set -e

echo "🔮 Verifiable Price Oracle Setup"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed. Please install npm and try again."
        exit 1
    fi
    
    # Check Docker (optional)
    if command -v docker &> /dev/null; then
        log_success "Docker found: $(docker --version)"
    else
        log_warning "Docker not found. Docker deployment will not be available."
    fi
    
    log_success "Prerequisites check completed"
}

# Setup environment files
setup_env_files() {
    log_info "Setting up environment files..."
    
    # Contracts .env
    if [ ! -f "contracts/.env" ]; then
        cp contracts/.env.example contracts/.env
        log_warning "Created contracts/.env from example. Please edit with your private key."
    fi
    
    # ROFL app .env
    if [ ! -f "rofl-app/.env" ]; then
        cp rofl-app/.env.example rofl-app/.env
        log_warning "Created rofl-app/.env from example. Please edit with your configuration."
    fi
    
    # Frontend .env
    if [ ! -f "frontend/.env" ]; then
        cp frontend/.env.example frontend/.env
        log_warning "Created frontend/.env from example. Please edit with contract address after deployment."
    fi
    
    log_success "Environment files setup completed"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    
    # Install contract dependencies
    log_info "Installing contract dependencies..."
    cd contracts
    npm install
    cd ..
    
    # Install ROFL app dependencies
    log_info "Installing ROFL app dependencies..."
    cd rofl-app
    npm install
    cd ..
    
    # Install frontend dependencies
    log_info "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    log_success "Dependencies installation completed"
}

# Deploy smart contract
deploy_contract() {
    log_info "Deploying smart contract..."
    
    cd contracts
    
    # Check if private key is set
    if ! grep -q "PRIVATE_KEY=0x" .env 2>/dev/null; then
        log_error "Please set your PRIVATE_KEY in contracts/.env before deploying"
        cd ..
        return 1
    fi
    
    # Compile contracts
    log_info "Compiling contracts..."
    npm run compile
    
    # Deploy to testnet
    log_info "Deploying to Sapphire Testnet..."
    npm run deploy:testnet
    
    cd ..
    log_success "Contract deployment completed"
}

# Run tests
run_tests() {
    log_info "Running tests..."
    
    # Test contracts
    log_info "Testing smart contracts..."
    cd contracts
    npm test
    cd ..
    
    # Test ROFL app (if test script exists)
    if [ -f "rofl-app/package.json" ] && grep -q "\"test\"" rofl-app/package.json; then
        log_info "Testing ROFL app..."
        cd rofl-app
        npm test
        cd ..
    fi
    
    # Test frontend
    log_info "Testing frontend..."
    cd frontend
    npm test -- --watchAll=false
    cd ..
    
    log_success "Tests completed"
}

# Start development environment
start_dev() {
    log_info "Starting development environment..."
    
    # Create tmux session for multiple services
    if command -v tmux &> /dev/null; then
        log_info "Starting services in tmux session 'oracle-dev'..."
        
        # Create new session
        tmux new-session -d -s oracle-dev
        
        # ROFL app window
        tmux rename-window -t oracle-dev:0 'rofl-app'
        tmux send-keys -t oracle-dev:0 'cd rofl-app && npm start' C-m
        
        # Frontend window
        tmux new-window -t oracle-dev -n 'frontend'
        tmux send-keys -t oracle-dev:1 'cd frontend && npm start' C-m
        
        # Logs window
        tmux new-window -t oracle-dev -n 'logs'
        tmux send-keys -t oracle-dev:2 'echo "Development environment started. Use Ctrl+B then number keys to switch windows."' C-m
        
        log_success "Development environment started in tmux session 'oracle-dev'"
        log_info "Attach to session with: tmux attach-session -t oracle-dev"
        log_info "Detach with: Ctrl+B then D"
        
    else
        log_warning "tmux not found. Starting services manually..."
        log_info "Start ROFL app: cd rofl-app && npm start"
        log_info "Start frontend: cd frontend && npm start"
    fi
}

# Docker setup
setup_docker() {
    log_info "Setting up Docker environment..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker to use this option."
        return 1
    fi
    
    # Build images
    log_info "Building Docker images..."
    docker-compose build
    
    # Start services
    log_info "Starting services with Docker Compose..."
    docker-compose up -d
    
    log_success "Docker environment setup completed"
    log_info "Services are running at:"
    log_info "- Frontend: http://localhost:3000"
    log_info "- ROFL App Health: http://localhost:3001/health"
}

# Main menu
show_menu() {
    echo
    echo "Select an option:"
    echo "1) Full setup (recommended for first time)"
    echo "2) Install dependencies only"
    echo "3) Deploy smart contract"
    echo "4) Run tests"
    echo "5) Start development environment"
    echo "6) Setup Docker environment"
    echo "7) Exit"
    echo
}

# Main execution
main() {
    echo
    log_info "Welcome to the Verifiable Price Oracle setup!"
    echo
    
    # Always check prerequisites
    check_prerequisites
    
    while true; do
        show_menu
        read -p "Enter your choice (1-7): " choice
        
        case $choice in
            1)
                log_info "Starting full setup..."
                setup_env_files
                install_dependencies
                log_warning "Please configure your .env files before proceeding with deployment."
                read -p "Press Enter after configuring .env files to continue with deployment..."
                deploy_contract
                run_tests
                start_dev
                break
                ;;
            2)
                setup_env_files
                install_dependencies
                ;;
            3)
                deploy_contract
                ;;
            4)
                run_tests
                ;;
            5)
                start_dev
                ;;
            6)
                setup_docker
                ;;
            7)
                log_info "Goodbye!"
                exit 0
                ;;
            *)
                log_error "Invalid option. Please try again."
                ;;
        esac
        
        echo
        read -p "Press Enter to continue..."
    done
}

# Run main function
main "$@"
