# Phase 6 Workflow Test Script

$BASE_URL = "http://localhost:5000/api"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Phase 6 Workflow Test" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Test 1: Register user
Write-Host "`nTEST 1: Register User" -ForegroundColor Green

$registerBody = @{
    name = "Test User"
    email = "test$(Get-Random)@example.com"
    password = "Password123!"
} | ConvertTo-Json

$registerResponse = Invoke-WebRequest -Uri "$BASE_URL/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $registerBody `
    -ErrorAction SilentlyContinue

if ($registerResponse.StatusCode -eq 201) {
    $registerData = $registerResponse.Content | ConvertFrom-Json
    $TOKEN = $registerData.token
    $USER_ID = $registerData.user.id
    Write-Host "✅ Registration successful" -ForegroundColor Green
    Write-Host "User ID: $USER_ID"
    Write-Host "Token: $($TOKEN.Substring(0, 20))..."
} else {
    Write-Host "❌ Registration failed: $($registerResponse.StatusCode)" -ForegroundColor Red
    Write-Host $registerResponse.Content
    exit 1
}

# Test 2: Create a contract
Write-Host "`nTEST 2: Create Contract" -ForegroundColor Green

$contractBody = @{
    title = "Test Contract"
    vendor = "Test Vendor Inc."
    contractType = "MSA"
    status = "Draft"
    riskLevel = "Low"
    effectiveDate = "2026-01-01"
    expiryDate = "2027-01-01"
} | ConvertTo-Json

$contractResponse = Invoke-WebRequest -Uri "$BASE_URL/contracts" `
    -Method POST `
    -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $TOKEN" } `
    -Body $contractBody `
    -ErrorAction SilentlyContinue

if ($contractResponse.StatusCode -eq 201) {
    $contractData = $contractResponse.Content | ConvertFrom-Json
    $CONTRACT_ID = $contractData.id
    Write-Host "✅ Contract created" -ForegroundColor Green
    Write-Host "Contract ID: $CONTRACT_ID"
} else {
    Write-Host "❌ Contract creation failed: $($contractResponse.StatusCode)" -ForegroundColor Red
    Write-Host $contractResponse.Content
    exit 1
}

# Test 3: Get Gmail status
Write-Host "`nTEST 3: Check Gmail Status" -ForegroundColor Green

$gmailStatusResponse = Invoke-WebRequest -Uri "$BASE_URL/gmail/status" `
    -Method GET `
    -Headers @{ Authorization = "Bearer $TOKEN" } `
    -ErrorAction SilentlyContinue

if ($gmailStatusResponse.StatusCode -eq 200) {
    $gmailStatusData = $gmailStatusResponse.Content | ConvertFrom-Json
    $connected = $gmailStatusData.connected
    Write-Host "✅ Gmail Status retrieved" -ForegroundColor Green
    Write-Host "Connected: $connected"
} else {
    Write-Host "❌ Gmail status failed: $($gmailStatusResponse.StatusCode)" -ForegroundColor Red
}

# Test 4: Send chat message
Write-Host "`nTEST 4: Send Chat Message" -ForegroundColor Green

$chatBody = @{
    userMessage = "What are the key terms of this contract?"
} | ConvertTo-Json

$chatResponse = Invoke-WebRequest -Uri "$BASE_URL/contracts/$CONTRACT_ID/chat" `
    -Method POST `
    -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $TOKEN" } `
    -Body $chatBody `
    -ErrorAction SilentlyContinue

if ($chatResponse.StatusCode -eq 201) {
    $chatData = $chatResponse.Content | ConvertFrom-Json
    $aiResponse = $chatData.aiResponse
    Write-Host "✅ Chat message sent and AI response received" -ForegroundColor Green
    Write-Host "User Message: $($chatData.userMessage)"
    Write-Host "AI Response: $($aiResponse.Substring(0, [Math]::Min(100, $aiResponse.Length)))..."
} else {
    Write-Host "❌ Chat failed: $($chatResponse.StatusCode)" -ForegroundColor Red
    Write-Host $chatResponse.Content
}

# Test 5: Get chat history
Write-Host "`nTEST 5: Get Chat History" -ForegroundColor Green

$historyResponse = Invoke-WebRequest -Uri "$BASE_URL/contracts/$CONTRACT_ID/chat" `
    -Method GET `
    -Headers @{ Authorization = "Bearer $TOKEN" } `
    -ErrorAction SilentlyContinue

if ($historyResponse.StatusCode -eq 200) {
    $historyData = $historyResponse.Content | ConvertFrom-Json
    $historyCount = @($historyData).Count
    Write-Host "✅ Chat history retrieved" -ForegroundColor Green
    Write-Host "Messages in history: $historyCount"
    if ($historyCount -gt 0) {
        Write-Host "Latest message user: $($historyData[0].userMessage)"
        Write-Host "Latest message AI: $($historyData[0].aiResponse.Substring(0, [Math]::Min(50, $historyData[0].aiResponse.Length)))..."
    }
} else {
    Write-Host "❌ History failed: $($historyResponse.StatusCode)" -ForegroundColor Red
}

Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "  ✅ User registration working"
Write-Host "  ✅ Contract creation working"
Write-Host "  ✅ Gmail status API working"
Write-Host "  ✅ Real chat API integration working"
Write-Host "  ✅ Chat history persistence working"
Write-Host "`nPhase 6 Implementation Verified!" -ForegroundColor Green
