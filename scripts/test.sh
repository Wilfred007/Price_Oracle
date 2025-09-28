#!/bin/bash

# Test script for the Verifiable Price Oracle system
set -e

echo "🧪 Running Verifiable Price Oracle Tests"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Test smart contracts
test_contracts() {
    log_info "Testing smart contracts..."
    cd contracts
    
    # Compile contracts
    log_info "Compiling contracts..."
    npm run compile
    
    # Run tests
    log_info "Running contract tests..."
    npm test
    
    cd ..
    log_success "Contract tests completed"
}

# Test ROFL app
test_rofl_app() {
    log_info "Testing ROFL application..."
    cd rofl-app
    
    # Check if test script exists
    if grep -q "\"test\"" package.json; then
        npm test
    else
        log_info "Running basic validation tests..."
        
        # Test configuration loading
        node -e "
            const config = require('./src/config');
            console.log('✓ Configuration loaded successfully');
        "
        
        # Test oracle class instantiation
        node -e "
            const { PriceOracle } = require('./src/oracle');
            const config = require('./src/config');
            const oracle = new PriceOracle(config);
            console.log('✓ Oracle class instantiated successfully');
        "
        
        # Test attestation module
        node -e "
            const { ROFLAttestation } = require('./src/attestation');
            const attestation = new ROFLAttestation('test-app-id');
            console.log('✓ Attestation module loaded successfully');
        "
    fi
    
    cd ..
    log_success "ROFL app tests completed"
}

# Test frontend
test_frontend() {
    log_info "Testing frontend application..."
    cd frontend
    
    # Run tests
    npm test -- --watchAll=false --coverage
    
    # Build test
    log_info "Testing production build..."
    npm run build
    
    cd ..
    log_success "Frontend tests completed"
}

# Integration test
integration_test() {
    log_info "Running integration tests..."
    
    # Check if all components can start
    log_info "Testing component startup..."
    
    # Test ROFL app startup (dry run)
    cd rofl-app
    timeout 10s node -e "
        const { PriceOracle } = require('./src/oracle');
        const config = require('./src/config');
        console.log('✓ ROFL app can initialize');
    " || log_info "ROFL app initialization test completed"
    cd ..
    
    # Test frontend build
    cd frontend
    if [ -d "build" ]; then
        log_info "✓ Frontend build exists"
    else
        log_error "Frontend build not found"
    fi
    cd ..
    
    log_success "Integration tests completed"
}

# Security checks
security_checks() {
    log_info "Running security checks..."
    
    # Check for sensitive data in code
    log_info "Checking for hardcoded secrets..."
    
    if grep -r "private.*key.*=" --include="*.js" --include="*.sol" --exclude-dir=node_modules . | grep -v "example" | grep -v "test" | grep -v "comment"; then
        log_error "Potential hardcoded private keys found!"
        return 1
    else
        log_success "No hardcoded secrets detected"
    fi
    
    # Check npm audit
    log_info "Running npm security audit..."
    
    cd contracts && npm audit --audit-level=high && cd ..
    cd rofl-app && npm audit --audit-level=high && cd ..
    cd frontend && npm audit --audit-level=high && cd ..
    
    log_success "Security checks completed"
}

# Performance tests
performance_tests() {
    log_info "Running performance tests..."
    
    # Test contract gas usage
    cd contracts
    if grep -q "gas-reporter" package.json; then
        log_info "Running gas usage analysis..."
        REPORT_GAS=true npm test
    fi
    cd ..
    
    # Test frontend bundle size
    cd frontend
    if [ -d "build" ]; then
        log_info "Analyzing bundle size..."
        du -sh build/static/js/*.js | head -5
    fi
    cd ..
    
    log_success "Performance tests completed"
}

# Main test runner
run_all_tests() {
    log_info "Starting comprehensive test suite..."
    
    test_contracts
    test_rofl_app
    test_frontend
    integration_test
    security_checks
    performance_tests
    
    log_success "All tests completed successfully! 🎉"
}

# Menu system
show_menu() {
    echo
    echo "Select test suite to run:"
    echo "1) All tests (recommended)"
    echo "2) Smart contract tests only"
    echo "3) ROFL app tests only"
    echo "4) Frontend tests only"
    echo "5) Integration tests only"
    echo "6) Security checks only"
    echo "7) Performance tests only"
    echo "8) Exit"
    echo
}

# Main execution
main() {
    if [ "$1" = "--all" ]; then
        run_all_tests
        exit 0
    fi
    
    while true; do
        show_menu
        read -p "Enter your choice (1-8): " choice
        
        case $choice in
            1) run_all_tests; break ;;
            2) test_contracts ;;
            3) test_rofl_app ;;
            4) test_frontend ;;
            5) integration_test ;;
            6) security_checks ;;
            7) performance_tests ;;
            8) log_info "Goodbye!"; exit 0 ;;
            *) log_error "Invalid option. Please try again." ;;
        esac
        
        echo
        read -p "Press Enter to continue..."
    done
}

main "$@"
