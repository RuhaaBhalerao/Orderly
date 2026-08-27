#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:5000/api"

echo "================================================"
echo "Phase 6 Workflow Test"
echo "================================================"

# Test 1: Register user
echo -e "\n${GREEN}TEST 1: Register User${NC}"
REGISTER=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Password123!"
  }')

echo $REGISTER | jq .

TOKEN=$(echo $REGISTER | jq -r '.token // empty')
USER_ID=$(echo $REGISTER | jq -r '.user.id // empty')

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Failed to get token${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Registration successful${NC}"
echo "Token: ${TOKEN:0:20}..."
echo "User ID: $USER_ID"

# Test 2: Create a contract
echo -e "\n${GREEN}TEST 2: Create Contract${NC}"
CONTRACT=$(curl -s -X POST $BASE_URL/contracts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Test Contract",
    "vendor": "Test Vendor Inc.",
    "contractType": "MSA",
    "status": "Draft",
    "riskLevel": "Low",
    "effectiveDate": "2026-01-01",
    "expiryDate": "2027-01-01"
  }')

echo $CONTRACT | jq .

CONTRACT_ID=$(echo $CONTRACT | jq -r '.id // empty')

if [ -z "$CONTRACT_ID" ]; then
  echo -e "${RED}❌ Failed to create contract${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Contract created${NC}"
echo "Contract ID: $CONTRACT_ID"

# Test 3: Get Gmail status (should be not connected)
echo -e "\n${GREEN}TEST 3: Check Gmail Status (Before Connection)${NC}"
GMAIL_STATUS=$(curl -s -X GET $BASE_URL/gmail/status \
  -H "Authorization: Bearer $TOKEN")

echo $GMAIL_STATUS | jq .

CONNECTED=$(echo $GMAIL_STATUS | jq -r '.connected // false')
echo -e "${GREEN}✅ Gmail Status: Connected=$CONNECTED${NC}"

# Test 4: Send chat message
echo -e "\n${GREEN}TEST 4: Send Chat Message${NC}"
CHAT=$(curl -s -X POST $BASE_URL/contracts/$CONTRACT_ID/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "userMessage": "What are the key terms of this contract?"
  }')

echo $CHAT | jq .

AI_RESPONSE=$(echo $CHAT | jq -r '.aiResponse // empty')

if [ -z "$AI_RESPONSE" ]; then
  echo -e "${RED}❌ No AI response received${NC}"
else
  echo -e "${GREEN}✅ AI Response received${NC}"
  echo "Response: ${AI_RESPONSE:0:100}..."
fi

# Test 5: Get chat history
echo -e "\n${GREEN}TEST 5: Get Chat History${NC}"
HISTORY=$(curl -s -X GET $BASE_URL/contracts/$CONTRACT_ID/chat \
  -H "Authorization: Bearer $TOKEN")

echo $HISTORY | jq .

HISTORY_COUNT=$(echo $HISTORY | jq 'length // 0')
echo -e "${GREEN}✅ Chat history: $HISTORY_COUNT messages${NC}"

echo -e "\n================================================"
echo -e "${GREEN}Phase 6 Workflow Tests Complete!${NC}"
echo "================================================"
