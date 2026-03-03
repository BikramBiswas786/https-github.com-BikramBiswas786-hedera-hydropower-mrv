#!/usr/bin/env pwsh
# HEDERA HYDROPOWER dMRV - COMPLETE TEST SUITE
# Version: 1.0
# Date: March 4, 2026
# Author: Bikram Biswas

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  HEDERA HYDROPOWER dMRV - COMPLETE TEST SUITE        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# API Configuration
$headers = @{
    "x-api-key" = "demokey001"
    "Content-Type" = "application/json"
}
$apiUrl = "http://localhost:3000/api/v1/telemetry"

# Initialize test results
$testResults = @()

#═══════════════════════════════════════════════════════
# TEST 1: Valid APPROVED Telemetry
#═══════════════════════════════════════════════════════
Write-Host "[TEST 1] Valid APPROVED Telemetry" -ForegroundColor Green

$validBody = @{
    plant_id = "PLANT-ALPHA"
    device_id = "TURBINE-TEST-$(Get-Random)"
    readings = @{
        timestamp = [int64](Get-Date).ToUniversalTime().Subtract([datetime]"1970-01-01").TotalMilliseconds
        flowRate = 2.5
        head = 45
        generatedKwh = 900
        pH = 7.2
        turbidity = 10
        temperature = 18
        efficiency = 0.85
    }
} | ConvertTo-Json -Depth 5

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -Headers $headers -Body $validBody
    
    Write-Host "  Status: $($response.status)" -ForegroundColor $(if ($response.status -eq "APPROVED") { "Green" } else { "Yellow" })
    Write-Host "  Trust Score: $($response.trust_score)"
    Write-Host "  Reading ID: $($response.reading_id)"
    Write-Host "  Physics Check: $($response.verification_details.physics_check)"
    Write-Host "  Environmental Check: $($response.verification_details.environmental_check)"
    Write-Host "  Carbon Credits: $($response.carbon_credits.amount_tco2e) tCO2e"
    Write-Host "  Transaction: $($response.hedera.transaction_id)"
    Write-Host "  HashScan: $($response.hedera.hashscan_url)`n" -ForegroundColor Cyan
    
    if ($response.status -eq "APPROVED" -and $response.trust_score -gt 0.9) {
        Write-Host "  ✅ TEST 1 PASSED`n" -ForegroundColor Green
        $testResults += @{ Test = "TEST 1"; Result = "PASSED" }
    } else {
        Write-Host "  ❌ TEST 1 FAILED`n" -ForegroundColor Red
        $testResults += @{ Test = "TEST 1"; Result = "FAILED" }
    }
}
catch {
    Write-Host "  ❌ TEST 1 ERROR: $($_.Exception.Message)`n" -ForegroundColor Red
    $testResults += @{ Test = "TEST 1"; Result = "ERROR" }
}

#═══════════════════════════════════════════════════════
# TEST 2: Fraud Detection - Inflated Power (45000 kWh)
#═══════════════════════════════════════════════════════
Write-Host "[TEST 2] Fraud Detection - Inflated Power (45000 kWh)" -ForegroundColor Yellow

$fraudBody = @{
    plant_id = "PLANT-ALPHA"
    device_id = "TURBINE-FRAUD-$(Get-Random)"
    readings = @{
        timestamp = [int64](Get-Date).ToUniversalTime().Subtract([datetime]"1970-01-01").TotalMilliseconds
        flowRate = 2.5
        head = 45
        generatedKwh = 45000
        efficiency = 0.85
    }
} | ConvertTo-Json -Depth 5

try {
    $fraudResp = Invoke-RestMethod -Uri $apiUrl -Method POST -Headers $headers -Body $fraudBody
    
    Write-Host "  Status: $($fraudResp.status)" -ForegroundColor $(if ($fraudResp.status -eq "FLAGGED") { "Yellow" } else { "Red" })
    Write-Host "  Trust Score: $($fraudResp.trust_score)"
    Write-Host "  Physics Check: $($fraudResp.verification_details.physics_check)"
    Write-Host "  Flags: $($fraudResp.verification_details.flags -join ', ')"
    Write-Host "  Transaction: $($fraudResp.hedera.transaction_id)`n"
    
    if ($fraudResp.status -eq "FLAGGED" -and $fraudResp.trust_score -lt 0.7) {
        Write-Host "  ✅ TEST 2 PASSED - Fraud detected`n" -ForegroundColor Green
        $testResults += @{ Test = "TEST 2"; Result = "PASSED" }
    } else {
        Write-Host "  ❌ TEST 2 FAILED - Fraud not detected`n" -ForegroundColor Red
        $testResults += @{ Test = "TEST 2"; Result = "FAILED" }
    }
}
catch {
    Write-Host "  ❌ TEST 2 ERROR: $($_.Exception.Message)`n" -ForegroundColor Red
    $testResults += @{ Test = "TEST 2"; Result = "ERROR" }
}

#═══════════════════════════════════════════════════════
# TEST 3: Environmental Violation Detection
#═══════════════════════════════════════════════════════
Write-Host "[TEST 3] Environmental Violation Detection" -ForegroundColor Magenta

$envBody = @{
    plant_id = "PLANT-ALPHA"
    device_id = "TURBINE-ENV-$(Get-Random)"
    readings = @{
        timestamp = [int64](Get-Date).ToUniversalTime().Subtract([datetime]"1970-01-01").TotalMilliseconds
        flowRate = 2.5
        head = 45
        generatedKwh = 900
        pH = 4.5
        turbidity = 180
        temperature = 35
        efficiency = 0.85
    }
} | ConvertTo-Json -Depth 5

try {
    $envResp = Invoke-RestMethod -Uri $apiUrl -Method POST -Headers $headers -Body $envBody
    
    Write-Host "  Status: $($envResp.status)" -ForegroundColor $(if ($envResp.status -eq "FLAGGED") { "Yellow" } else { "Red" })
    Write-Host "  Trust Score: $($envResp.trust_score)"
    Write-Host "  Environmental Check: $($envResp.verification_details.environmental_check)"
    Write-Host "  Flags: $($envResp.verification_details.flags -join ', ')`n"
    
    if ($envResp.status -eq "FLAGGED" -and $envResp.verification_details.environmental_check -eq "FAIL") {
        Write-Host "  ✅ TEST 3 PASSED - Environmental violation detected`n" -ForegroundColor Green
        $testResults += @{ Test = "TEST 3"; Result = "PASSED" }
    } else {
        Write-Host "  ❌ TEST 3 FAILED - Environmental violation not detected`n" -ForegroundColor Red
        $testResults += @{ Test = "TEST 3"; Result = "FAILED" }
    }
}
catch {
    Write-Host "  ❌ TEST 3 ERROR: $($_.Exception.Message)`n" -ForegroundColor Red
    $testResults += @{ Test = "TEST 3"; Result = "ERROR" }
}

#═══════════════════════════════════════════════════════
# TEST SUMMARY
#═══════════════════════════════════════════════════════
Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║              TESTING COMPLETE                        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$passedCount = ($testResults | Where-Object { $_.Result -eq "PASSED" }).Count
$totalTests = $testResults.Count

Write-Host "Test Results:" -ForegroundColor Cyan
foreach ($result in $testResults) {
    $color = if ($result.Result -eq "PASSED") { "Green" } elseif ($result.Result -eq "FAILED") { "Red" } else { "Yellow" }
    Write-Host "  $($result.Test): $($result.Result)" -ForegroundColor $color
}

Write-Host "`nSummary: $passedCount/$totalTests tests passed" -ForegroundColor Cyan

if ($passedCount -eq $totalTests) {
    Write-Host "`n🎊🎊🎊 ALL TESTS PASSED - PRODUCTION READY! 🎊🎊🎊`n" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n⚠️ SOME TESTS FAILED - REVIEW RESULTS ABOVE ⚠️`n" -ForegroundColor Yellow
    exit 1
}
