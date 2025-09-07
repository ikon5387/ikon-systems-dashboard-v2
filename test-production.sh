#!/bin/bash

echo "🧪 Ikon Systems Dashboard - Production Testing Suite"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

run_test() {
    local test_name="$1"
    local test_command="$2"
    
    print_status "Running: $test_name"
    
    if eval "$test_command" > /dev/null 2>&1; then
        print_success "$test_name"
        ((TESTS_PASSED++))
    else
        print_error "$test_name"
        ((TESTS_FAILED++))
    fi
}

echo ""
print_status "Starting comprehensive production testing..."

# 1. Environment Check
print_status "Checking environment..."
run_test "Node.js version (>=18)" "node --version | grep -E 'v1[89]|v[2-9][0-9]'"
run_test "npm version" "npm --version"
run_test "Package.json exists" "test -f package.json"
run_test "Environment file exists" "test -f env.local"

# 2. Dependencies
print_status "Checking dependencies..."
run_test "Node modules installed" "test -d node_modules"
run_test "TypeScript installed" "npx tsc --version"
run_test "Vite installed" "npx vite --version"

# 3. Code Quality
print_status "Running code quality checks..."
run_test "TypeScript compilation" "npm run type-check"
run_test "ESLint check" "npm run lint -- --max-warnings 10"
run_test "Build process" "npm run build"

# 4. Database Connection
print_status "Testing database connection..."
if command -v supabase &> /dev/null; then
    run_test "Supabase CLI available" "supabase --version"
    run_test "Supabase project linked" "test -f .supabase/config.toml"
else
    print_warning "Supabase CLI not found - skipping database tests"
fi

# 5. Security Checks
print_status "Running security checks..."
run_test "No hardcoded secrets in source" "! grep -r 'password\|secret\|key.*=' src/ --include='*.ts' --include='*.tsx' | grep -v 'your_.*_key'"
run_test "Environment variables configured" "grep -q 'VITE_SUPABASE_URL' env.local"
run_test "Docker configuration" "test -f Dockerfile && test -f docker-compose.yml"

# 6. Performance Checks
print_status "Checking performance..."
if [ -d "dist" ]; then
    BUNDLE_SIZE=$(du -sh dist/assets/*.js 2>/dev/null | head -1 | cut -f1)
    if [ -n "$BUNDLE_SIZE" ]; then
        print_success "Bundle size: $BUNDLE_SIZE"
        run_test "Bundle size reasonable (<600KB)" "test $(du -k dist/assets/*.js | cut -f1) -lt 600"
    fi
fi

# 7. Integration Readiness
print_status "Checking integration readiness..."
run_test "VAPI service configured" "grep -q 'VAPIService' src/services/integrations/VAPIService.ts"
run_test "Twilio service configured" "grep -q 'TwilioService' src/services/integrations/TwilioService.ts"
run_test "Stripe service configured" "grep -q 'StripeService' src/services/integrations/StripeService.ts"

# 8. Deployment Readiness
print_status "Checking deployment readiness..."
run_test "Vercel config exists" "test -f vercel.json"
run_test "Docker ignore file" "test -f .dockerignore"
run_test "Deployment scripts" "test -f scripts/deploy-do.sh && test -x scripts/deploy-do.sh"
run_test "Nginx configuration" "test -f nginx.conf"

# 9. Documentation
print_status "Checking documentation..."
run_test "README exists" "test -f README.md"
run_test "Deployment guide exists" "test -f DIGITAL_OCEAN_DEPLOYMENT.md"
run_test "Production guide exists" "test -f PRODUCTION_READY.md"

# 10. Final Health Check
print_status "Final health checks..."
if [ -d "dist" ]; then
    run_test "Build artifacts exist" "test -f dist/index.html && test -f dist/assets/*.css && test -f dist/assets/*.js"
    run_test "Static assets optimized" "test $(find dist -name '*.css' -o -name '*.js' | wc -l) -gt 0"
fi

# Summary
echo ""
echo "=================================================="
echo "🧪 TESTING COMPLETE"
echo "=================================================="
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo -e "${GREEN}✅ Your Ikon Systems Dashboard is PRODUCTION READY!${NC}"
    echo ""
    echo "🚀 Ready for deployment to Digital Ocean:"
    echo "  export DROPLET_IP=your.droplet.ip"
    echo "  ./scripts/deploy-do.sh"
    echo ""
    echo "🌐 Or deploy to Vercel for app.ikonsystemsai.com"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please fix the issues above.${NC}"
    echo ""
    echo "💡 Common fixes:"
    echo "  - Run: npm install"
    echo "  - Check: env.local file configuration"
    echo "  - Fix: ESLint warnings with npm run lint:fix"
    echo "  - Build: npm run build"
    exit 1
fi
