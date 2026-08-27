#!/bin/bash

# ProcureAI Backend API Endpoint Test Script
# Tests core functionality via curl
# Usage: bash test-endpoints.sh

BASE_URL="http://localhost:5000/api"
TIMESTAMP=$(date +%s)
TEST_EMAIL="test-${TIMESTAMP}@example.com"
TOKEN=""
CONTRACT_ID=""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     ProcureAI Backend API Endpoint Test Suite               ║"
echo "║     Make sure backend is running: npm run dev               ║"
echo "╚════════════════════════════════════════════════════════════╝"

# Test 1: Health Check
echo -e "\n📋 Testing Health Check..."
RESPONSE=$(curl -s "$BASE_URL/health")
if echo "$RESPONSE" | grep -q "\"status\":\"ok\""; then
  echo "✅ Health check passed"
else
  echo "❌ Health check failed"
  echo "Response: $RESPONSE"
fi

# Test 2: Register User
echo -e "\n📋 Testing User Registration..."
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"$TEST_EMAIL\",\"password\":\"SecurePassword123!\"}")

if echo "$RESPONSE" | grep -q "\"token\""; then
  TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  echo "✅ Registration passed"
  echo "Token: ${TOKEN:0:20}..."
else
  echo "❌ Registration failed"
  echo "Response: $RESPONSE"
fi

# Test 3: Get Current User (requires token)
if [ -n "$TOKEN" ]; then
  echo -e "\n📋 Testing GET /auth/me..."
  RESPONSE=$(curl -s "$BASE_URL/auth/me" \
    -H "Authorization: Bearer $TOKEN")
  
  if echo "$RESPONSE" | grep -q "\"id\""; then
    echo "✅ GET /me passed"
  else
    echo "❌ GET /me failed"
    echo "Response: $RESPONSE"
  fi
  
  # Test 4: Create Contract
  echo -e "\n📋 Testing Contract Creation..."
  EFFECTIVE_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  EXPIRY_DATE=$(date -u -d "+365 days" +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u -v+365d +"%Y-%m-%dT%H:%M:%SZ")
  
  RESPONSE=$(curl -s -X POST "$BASE_URL/contracts" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"title\":\"Test Contract\",\"vendor\":\"Test Vendor\",\"status\":\"Draft\",\"riskLevel\":\"Low\",\"contractType\":\"MSA\",\"effectiveDate\":\"$EFFECTIVE_DATE\",\"expiryDate\":\"$EXPIRY_DATE\",\"summary\":\"Test\"}")
  
  if echo "$RESPONSE" | grep -q "\"id\""; then
    CONTRACT_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    echo "✅ Contract creation passed"
    echo "Contract ID: $CONTRACT_ID"
  else
    echo "❌ Contract creation failed"
    echo "Response: $RESPONSE"
  fi
  
  # Test 5: Get Contracts
  echo -e "\n📋 Testing GET /contracts..."
  RESPONSE=$(curl -s "$BASE_URL/contracts" \
    -H "Authorization: Bearer $TOKEN")
  
  if echo "$RESPONSE" | grep -q "\["; then
    echo "✅ GET /contracts passed"
  else
    echo "❌ GET /contracts failed"
    echo "Response: $RESPONSE"
  fi
  
  # Test 6: Unauthorized Access
  echo -e "\n📋 Testing Authorization Protection..."
  RESPONSE=$(curl -s "$BASE_URL/contracts")
  
  if echo "$RESPONSE" | grep -q "\"error\""; then
    echo "✅ Authorization protection passed"
  else
    echo "❌ Authorization protection failed"
    echo "Response: $RESPONSE"
  fi
fi

# Test 7: Invalid Login
echo -e "\n📋 Testing Invalid Credentials..."
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"nonexistent@example.com\",\"password\":\"WrongPassword\"}")

if echo "$RESPONSE" | grep -q "401\|Invalid"; then
  echo "✅ Invalid credentials handling passed"
else
  echo "❌ Invalid credentials handling failed"
  echo "Response: $RESPONSE"
fi

echo -e "\n╔════════════════════════════════════════════════════════════╗"
echo "║                   Tests Complete                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
