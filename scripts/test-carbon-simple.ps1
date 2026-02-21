# Simple Carbon Credit Test (No Dependencies)
# Run this while your server is running on port 3000

Write-Host "`n=============================================" -ForegroundColor Cyan
Write-Host "  CARBON CREDIT QUICK TEST" -ForegroundColor Cyan
Write-Host "=============================================`n" -ForegroundColor Cyan

$BASE = "http://localhost:3000"

# Test 1: Get market prices
Write-Host "TEST 1: Market Prices" -ForegroundColor Yellow
try {
    $prices = Invoke-RestMethod -Uri "$BASE/api/v1/carbon-credits/marketplace/prices" -Method GET
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "Average Price: `$$($prices.average.price_per_tco2e)/tCO2e" -ForegroundColor Cyan
    Write-Host "Average Price: ₹$($prices.average.price_inr_per_tco2e)/tCO2e`n" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed: Server not running on port 3000" -ForegroundColor Red
    Write-Host "Start server: npm start`n" -ForegroundColor Yellow
    exit 1
}

# Test 2: Calculate credits
Write-Host "TEST 2: Calculate Carbon Credits" -ForegroundColor Yellow
$calc = @{
    attestation = @{
        verificationStatus = "APPROVED"
        trustScore = 0.96
        calculations = @{ ER_tCO2 = 150.5 }
        verificationMethod = "AI_AUTO_APPROVED"
        timestamp = (Get-Date).ToUniversalTime().ToString("o")
    }
} | ConvertTo-Json -Depth 10

try {
    $result = Invoke-RestMethod -Uri "$BASE/api/v1/carbon-credits/calculate" `
        -Method POST `
        -Body $calc `
        -ContentType "application/json"
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "Eligible: $($result.eligible)" -ForegroundColor Cyan
    Write-Host "Credits: $($result.adjusted_credits_tco2e) tCO2e" -ForegroundColor Cyan
    Write-Host "Quality: $($result.quality_multiplier)x`n" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)`n" -ForegroundColor Red
}

# Test 3: Mint tokens
Write-Host "TEST 3: Mint Hedera Tokens" -ForegroundColor Yellow
$mint = @{
    tenantId = "TENANT-001"
    quantity = 150.5
    metadata = @{
        plant_id = "PLANT-001"
        device_id = "TURBINE-1"
        trust_score = 0.96
    }
} | ConvertTo-Json -Depth 10

try {
    $mintResult = Invoke-RestMethod -Uri "$BASE/api/v1/carbon-credits/mint" `
        -Method POST `
        -Body $mint `
        -ContentType "application/json"
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "Credit ID: $($mintResult.credit_id)" -ForegroundColor Cyan
    Write-Host "Tokens: $($mintResult.token_amount)" -ForegroundColor Cyan
    Write-Host "Status: $($mintResult.status)`n" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)`n" -ForegroundColor Red
}

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  TESTS COMPLETE ✅" -ForegroundColor Cyan
Write-Host "=============================================`n" -ForegroundColor Cyan
