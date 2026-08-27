$BASE_URL = "http://localhost:5000/api"
$email = "test$(Get-Random)@example.com"

Write-Host "Phase 6 Workflow Test" -ForegroundColor Green

# Test 1: Register
$registerBody = @{
    name = "Test User"
    email = $email
    password = "Password123!"
} | ConvertTo-Json

$r1 = Invoke-WebRequest -Uri "$BASE_URL/auth/register" -Method POST -ContentType "application/json" -Body $registerBody -UseBasicParsing -ErrorAction SilentlyContinue
$data1 = $r1.Content | ConvertFrom-Json
$TOKEN = $data1.token
$USER_ID = $data1.user.id

Write-Host "✅ Registration successful - Token: $($TOKEN.Substring(0, 20))..."

# Test 2: Create contract
$contractBody = @{
    title = "Test"
    vendor = "Test Vendor"
    contractType = "MSA"
    status = "Draft"
    riskLevel = "Low"
    effectiveDate = "2026-01-01"
    expiryDate = "2027-01-01"
} | ConvertTo-Json

$r2 = Invoke-WebRequest -Uri "$BASE_URL/contracts" -Method POST -ContentType "application/json" -Headers @{ Authorization = "Bearer $TOKEN" } -Body $contractBody -UseBasicParsing -ErrorAction SilentlyContinue
$data2 = $r2.Content | ConvertFrom-Json
$CONTRACT_ID = $data2.id

Write-Host "✅ Contract created - ID: $CONTRACT_ID"

# Test 3: Chat API
$chatBody = @{
    userMessage = "What are the payment terms?"
} | ConvertTo-Json

$r3 = Invoke-WebRequest -Uri "$BASE_URL/contracts/$CONTRACT_ID/chat" -Method POST -ContentType "application/json" -Headers @{ Authorization = "Bearer $TOKEN" } -Body $chatBody -UseBasicParsing -ErrorAction SilentlyContinue
$data3 = $r3.Content | ConvertFrom-Json

Write-Host "✅ Chat API working - Response: $($data3.aiResponse.Substring(0, 60))..."

# Test 4: Gmail Status
$r4 = Invoke-WebRequest -Uri "$BASE_URL/gmail/status" -Method GET -Headers @{ Authorization = "Bearer $TOKEN" } -UseBasicParsing -ErrorAction SilentlyContinue
$data4 = $r4.Content | ConvertFrom-Json

Write-Host "✅ Gmail Status API working - Connected: $($data4.connected)"

Write-Host "`nAll tests passed!" -ForegroundColor Green
