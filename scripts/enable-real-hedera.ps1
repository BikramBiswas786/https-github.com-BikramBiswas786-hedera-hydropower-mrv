# Enable Real Hedera Minting
# This script configures your .env for real on-chain token minting

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  ENABLE REAL HEDERA MINTING" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

Write-Host "This will enable REAL Hedera token minting:" -ForegroundColor Yellow
Write-Host "  • Real HTS tokens on testnet" -ForegroundColor Yellow
Write-Host "  • Real transaction IDs" -ForegroundColor Yellow
Write-Host "  • Real gas fees (paid in HBAR)" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Continue? (y/n)"

if ($confirm -ne 'y') {
    Write-Host "Cancelled." -ForegroundColor Red
    exit
}

Write-Host "`nChecking .env file..." -ForegroundColor Cyan

if (!(Test-Path .env)) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    exit 1
}

# Read current .env
$env_content = Get-Content .env -Raw

# Add carbon credit config if not exists
if ($env_content -notmatch 'CARBON_TOKEN_ID') {
    Write-Host "Adding CARBON_TOKEN_ID..." -ForegroundColor Yellow
    Add-Content .env "`nCARBON_TOKEN_ID=0.0.7964264"
}

if ($env_content -notmatch 'TREASURY_PRIVATE_KEY') {
    Write-Host "Adding TREASURY_PRIVATE_KEY..." -ForegroundColor Yellow
    Add-Content .env "TREASURY_PRIVATE_KEY=3030020100300706052b8104000a04220420398637ba54e6311afdc8a2f1a2f1838834dc30ce2d1fec22cb2cddd6ca28fbde"
}

if ($env_content -notmatch 'USE_REAL_HEDERA') {
    Write-Host "Enabling USE_REAL_HEDERA..." -ForegroundColor Yellow
    Add-Content .env "USE_REAL_HEDERA=true"
}

Write-Host "`n✅ Configuration updated!" -ForegroundColor Green
Write-Host "`nYour .env now includes:" -ForegroundColor Cyan
Write-Host "  CARBON_TOKEN_ID=0.0.7964264" -ForegroundColor White
Write-Host "  TREASURY_PRIVATE_KEY=..." -ForegroundColor White
Write-Host "  USE_REAL_HEDERA=true" -ForegroundColor White

Write-Host "`n⚠️  IMPORTANT:" -ForegroundColor Yellow
Write-Host "  • Restart your server: npm start" -ForegroundColor Yellow
Write-Host "  • Each mint will cost ~0.001 HBAR (testnet)" -ForegroundColor Yellow
Write-Host "  • Tokens will appear on HashScan" -ForegroundColor Yellow

Write-Host "`n🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Restart server: npm start" -ForegroundColor White
Write-Host "  2. Run demo: node scripts\carbon-credit-demo-approved.js" -ForegroundColor White
Write-Host "  3. Check HashScan: https://hashscan.io/testnet/token/0.0.7964264" -ForegroundColor White

Write-Host "`n============================================`n" -ForegroundColor Cyan