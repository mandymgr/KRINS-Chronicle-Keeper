#!/bin/bash

# Comprehensive Test Suite for Intelligent Autocomplete API
# Tests all features including semantic search, caching, trending suggestions
# Part of Krin's revolutionary AI team coordination system

BASE_URL="http://localhost:3003"
PASSED=0
FAILED=0
TOTAL=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_pattern="$3"
    
    TOTAL=$((TOTAL + 1))
    echo -n "Testing $test_name... "
    
    # Run the test command and capture output
    response=$(eval "$test_command" 2>/dev/null)
    exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        # Check if response contains expected pattern
        if echo "$response" | grep -q "$expected_pattern"; then
            echo -e "${GREEN}✅ PASSED${NC}"
            PASSED=$((PASSED + 1))
        else
            echo -e "${RED}❌ FAILED${NC} - Expected pattern not found: $expected_pattern"
            echo "   Response: $(echo "$response" | head -c 100)..."
            FAILED=$((FAILED + 1))
        fi
    else
        echo -e "${RED}❌ FAILED${NC} - Command failed with exit code $exit_code"
        FAILED=$((FAILED + 1))
    fi
}

# Function to test cache functionality
test_cache() {
    echo -n "Testing Cache Functionality... "
    
    # Make first request (should be cache miss)
    query="cachetest$(date +%s)"
    response1=$(curl -s "$BASE_URL/api/search/autocomplete/intelligent?q=$query&limit=3")
    cache_hit1=$(echo "$response1" | jq -r '.cache_hit' 2>/dev/null)
    
    # Make second identical request (should be cache hit)
    response2=$(curl -s "$BASE_URL/api/search/autocomplete/intelligent?q=$query&limit=3")
    cache_hit2=$(echo "$response2" | jq -r '.cache_hit' 2>/dev/null)
    
    if [ "$cache_hit1" = "false" ] && [ "$cache_hit2" = "true" ]; then
        echo -e "${GREEN}✅ PASSED${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ FAILED${NC} - Cache not working properly (first: $cache_hit1, second: $cache_hit2)"
        FAILED=$((FAILED + 1))
    fi
    
    TOTAL=$((TOTAL + 1))
}

# Function to test performance
test_performance() {
    echo -n "Testing Performance... "
    
    start_time=$(date +%s%N)
    response=$(curl -s "$BASE_URL/api/search/autocomplete/intelligent?q=performance&include_semantic=true&include_trending=true&limit=10")
    end_time=$(date +%s%N)
    
    # Calculate response time in milliseconds
    response_time=$(( (end_time - start_time) / 1000000 ))
    
    if [ $response_time -lt 2000 ]; then
        echo -e "${GREEN}✅ PASSED${NC} (${response_time}ms)"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ FAILED${NC} - Too slow: ${response_time}ms"
        FAILED=$((FAILED + 1))
    fi
    
    TOTAL=$((TOTAL + 1))
}

echo -e "${BLUE}🚀 Starting Intelligent Autocomplete Test Suite${NC}"
echo "============================================================"

# Test 1: Basic Health Check
run_test "Health Check" \
    "curl -s $BASE_URL/health" \
    '"success":true'

# Test 2: Endpoint Accessibility
run_test "Endpoint Accessibility" \
    "curl -s $BASE_URL/api/search/autocomplete/intelligent?q=test" \
    '"success":true'

# Test 3: Direct Text Matching
run_test "Direct Text Matching" \
    "curl -s $BASE_URL/api/search/autocomplete/intelligent?q=todo" \
    '"match_type":"direct_match"'

# Test 4: Semantic Search
run_test "Semantic Search Features" \
    "curl -s $BASE_URL/api/search/autocomplete/intelligent?q=architecture&include_semantic=true" \
    '"semantic_enabled":true'

# Test 5: Trending Suggestions
run_test "Trending Suggestions" \
    "curl -s $BASE_URL/api/search/autocomplete/intelligent?q=nonexistentquery&include_trending=true" \
    '"trending_enabled":true'

# Test 6: Empty Query (should return trending)
run_test "Empty Query Handling" \
    "curl -s '$BASE_URL/api/search/autocomplete/intelligent?q='" \
    '"suggestion_type":"trending"'

# Test 7: Content Type Filtering
run_test "Content Type Filtering" \
    "curl -s $BASE_URL/api/search/autocomplete/intelligent?q=test&content_type=adrs" \
    '"success":true'

# Test 8: Analytics Endpoint
run_test "Analytics Endpoint" \
    "curl -s $BASE_URL/api/search/autocomplete/analytics" \
    '"cache_stats"'

# Test 9: Health Check Endpoint
run_test "Autocomplete Health Check" \
    "curl -s $BASE_URL/api/search/autocomplete/health" \
    '"initialized"'

# Test 10: Parameter Validation
run_test "Parameter Validation" \
    "curl -s $BASE_URL/api/search/autocomplete/intelligent?q=test&limit=-1" \
    '"success":true'

# Test 11: Error Handling
run_test "Error Handling" \
    "curl -s '$BASE_URL/api/search/autocomplete/intelligent?q=test&include_semantic=invalid'" \
    '"success":true'

# Test 12: Multiple Features Combined
run_test "Multiple Features Combined" \
    "curl -s '$BASE_URL/api/search/autocomplete/intelligent?q=arch&include_semantic=true&include_trending=true&include_history=true'" \
    '"suggestion_sources"'

# Special Tests
test_cache
test_performance

# Results Summary
echo ""
echo "============================================================"
echo -e "${BLUE}📊 Test Suite Results:${NC}"
echo -e "   Total Tests: $TOTAL"
echo -e "   ${GREEN}✅ Passed: $PASSED${NC}"
echo -e "   ${RED}❌ Failed: $FAILED${NC}"

success_rate=$(( PASSED * 100 / TOTAL ))
echo -e "   📈 Success Rate: ${success_rate}%"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎯 All tests passed! Intelligent Autocomplete is working perfectly! 🚀${NC}"
    exit 0
else
    echo -e "\n${RED}💥 Some tests failed. Please check the implementation.${NC}"
    exit 1
fi