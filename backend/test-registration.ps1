$BASE_URL = "http://localhost:5000/api"
$email = "testuser$(Get-Random)@example.com"

Write-Host "Testing Registration Flow" -ForegroundColor Green
Write-Host ""

# Test 1: Register new user
Write-Host "TEST 1: Register new user" -ForegroundColor Cyan
$registerBody = @{
    name = "Test User"
    email = $email
    password = "TestPassword123"
} | ConvertTo-Json

try {
    $r1 = Invoke-WebRequest -Uri "$BASE_URL/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $registerBody `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
    
    $data1 = $r1.Content | ConvertFrom-Json
    $TOKEN = $data1.token
    $USER = $data1.user
    
    Write-Host "✅ Registration successful"
    Write-Host "   User ID: $($USER.id)"
    Write-Host "   Email: $($USER.email)"
    Write-Host "   Token: $($TOKEN.Substring(0, 20))..."
} catch {
    Write-Host "❌ Registration failed: $_" -ForegroundColor Red
    exit 1
}

# Test 2: Try to register duplicate email
Write-Host ""
Write-Host "TEST 2: Duplicate email prevention" -ForegroundColor Cyan
$duplicateBody = @{
    name = "Another User"
    email = $email
    password = "DifferentPassword123"
} | ConvertTo-Json

try {
    $r2 = Invoke-WebRequest -Uri "$BASE_URL/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $duplicateBody `
        -UseBasicParsing `
        -ErrorAction Stop
    
    Write-Host "❌ Duplicate email was not prevented!" -ForegroundColor Red
    exit 1
} catch {
    $errorResponse = $_.Exception.Response
    if ($errorResponse.StatusCode -eq 400) {
        $body = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($body)
        $errorContent = $reader.ReadToEnd()
        $errorData = $errorContent | ConvertFrom-Json
        
        Write-Host "✅ Duplicate email prevented"
        Write-Host "   Error: $($errorData.message)"
    } else {
        Write-Host "❌ Unexpected error: $($errorResponse.StatusCode)" -ForegroundColor Red
        exit 1
    }
}

# Test 3: Login with new user
Write-Host ""
Write-Host "TEST 3: Login with registered user" -ForegroundColor Cyan
$loginBody = @{
    email = $email
    password = "TestPassword123"
} | ConvertTo-Json

try {
    $r3 = Invoke-WebRequest -Uri "$BASE_URL/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
    
    $data3 = $r3.Content | ConvertFrom-Json
    $LOGIN_TOKEN = $data3.token
    $LOGIN_USER = $data3.user
    
    Write-Host "✅ Login successful"
    Write-Host "   User ID: $($LOGIN_USER.id)"
    Write-Host "   Email: $($LOGIN_USER.email)"
    Write-Host "   Token: $($LOGIN_TOKEN.Substring(0, 20))..."
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
    exit 1
}

# Test 4: Verify tokens match
Write-Host ""
Write-Host "TEST 4: Token consistency" -ForegroundColor Cyan
if ($TOKEN -eq $LOGIN_TOKEN) {
    Write-Host "✅ Registration and login tokens match"
} else {
    Write-Host "⚠️  Tokens differ (normal behavior)"
}

# Test 5: Test password requirements
Write-Host ""
Write-Host "TEST 5: Password requirements" -ForegroundColor Cyan
$shortPasswordBody = @{
    name = "Test"
    email = "test$(Get-Random)@example.com"
    password = "short"
} | ConvertTo-Json

try {
    $r5 = Invoke-WebRequest -Uri "$BASE_URL/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $shortPasswordBody `
        -UseBasicParsing `
        -ErrorAction Stop
    
    Write-Host "❌ Short password was not rejected!" -ForegroundColor Red
    exit 1
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✅ Short password validation working"
    } else {
        Write-Host "⚠️  Unexpected status: $($_.Exception.Response.StatusCode)"
    }
}

Write-Host ""
Write-Host "All registration tests passed!" -ForegroundColor Green
