# COMPLETE Documentation Consolidation Script
# Based on comprehensive audit: 93 files -> 35 core docs
# Date: February 22, 2026

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "  COMPLETE DOCUMENTATION CONSOLIDATION" -ForegroundColor Cyan
Write-Host "  Target: 93 -> 35 core files" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

$totalArchived = 0
$totalMoved = 0
$totalDeleted = 0

# Ensure archive exists
New-Item -ItemType Directory -Force -Path "docs\archived" | Out-Null
New-Item -ItemType Directory -Force -Path "evidence" | Out-Null

# ROOT LEVEL - Status files to archive
Write-Host "[1/8] Archiving root-level status files..." -ForegroundColor Yellow
$rootStatusFiles = @(
    "DEPLOYMENT-COMPLETE.md",
    "DEPLOYMENT_SUMMARY.md",
    "EXECUTE-NOW.md",
    "FINAL-STATUS.md",
    "QUICK-REFERENCE.md",
    "VERCEL-FIX.md"
)

foreach ($file in $rootStatusFiles) {
    if (Test-Path $file) {
        git mv $file "docs\archived\" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  $file" -ForegroundColor DarkGray
            $totalArchived++
        }
    }
}
Write-Host "Archived $totalArchived root status files" -ForegroundColor Green
Write-Host ""

# ROOT LEVEL - Duplicate roadmaps
Write-Host "[2/8] Archiving duplicate roadmaps..." -ForegroundColor Yellow
$roadmapFiles = @(
    "ML_ROADMAP.md",
    "README-SETUP.md"
)

foreach ($file in $roadmapFiles) {
    if (Test-Path $file) {
        git mv $file "docs\archived\" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  $file" -ForegroundColor DarkGray
            $totalArchived++
        }
    }
}
Write-Host "Archived roadmap duplicates" -ForegroundColor Green
Write-Host ""

# ROOT LEVEL - Integration files
Write-Host "[3/8] Archiving integration duplicates..." -ForegroundColor Yellow
$integrationFiles = @(
    "INTEGRATION_CHECKLIST.md"
)

foreach ($file in $integrationFiles) {
    if (Test-Path $file) {
        git mv $file "docs\archived\" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  $file" -ForegroundColor DarkGray
            $totalArchived++
        }
    }
}
Write-Host "Archived integration duplicates" -ForegroundColor Green
Write-Host ""

# ROOT LEVEL - Verification files
Write-Host "[4/8] Archiving verification duplicates..." -ForegroundColor Yellow
$verifyFiles = @(
    "VERIFY.md"
)

foreach ($file in $verifyFiles) {
    if (Test-Path $file) {
        git mv $file "docs\archived\" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  $file" -ForegroundColor DarkGray
            $totalArchived++
        }
    }
}
Write-Host "Archived verification duplicates" -ForegroundColor Green
Write-Host ""

# DOCS - AI slop with vague titles
Write-Host "[5/8] Archiving docs with AI slop patterns..." -ForegroundColor Yellow
$aiSlopFiles = @(
    "docs\Hedera Hydropower MRV - API Documentation.md",
    "docs\Hedera Hydropower MRV - Complete Production-Ready System.md",
    "docs\COMPREHENSIVE AUDIT REPORT.md",
    "docs\COMPLETE-COMMANDS.md"
)

foreach ($file in $aiSlopFiles) {
    if (Test-Path $file) {
        git mv $file "docs\archived\" 2>$null
        if ($LASTEXITCODE -eq 0) {
            $filename = Split-Path $file -Leaf
            Write-Host "  $filename" -ForegroundColor DarkGray
            $totalArchived++
        }
    }
}
Write-Host "Archived AI slop files" -ForegroundColor Green
Write-Host ""

# DOCS - Duplicate pilot deployment guides
Write-Host "[6/8] Archiving duplicate pilot guides..." -ForegroundColor Yellow
$pilotFiles = @(
    "docs\PILOT-DEPLOYMENT-IMPLEMENTATION-GUIDE.md",
    "docs\Pilot Deployment Plan_ Hedera Hydropower MRV.md"
)

foreach ($file in $pilotFiles) {
    if (Test-Path $file) {
        git mv $file "docs\archived\" 2>$null
        if ($LASTEXITCODE -eq 0) {
            $filename = Split-Path $file -Leaf
            Write-Host "  $filename" -ForegroundColor DarkGray
            $totalArchived++
        }
    }
}
Write-Host "Archived duplicate pilot guides" -ForegroundColor Green
Write-Host ""

# DOCS - Duplicate Verra guide
Write-Host "[7/8] Archiving duplicate Verra guide..." -ForegroundColor Yellow
$verraFiles = @(
    "docs\Verra Submission Preparation Guide.md"
)

foreach ($file in $verraFiles) {
    if (Test-Path $file) {
        git mv $file "docs\archived\" 2>$null
        if ($LASTEXITCODE -eq 0) {
            $filename = Split-Path $file -Leaf
            Write-Host "  $filename" -ForegroundColor DarkGray
            $totalArchived++
        }
    }
}
Write-Host "Archived Verra duplicate" -ForegroundColor Green
Write-Host ""

# DOCS - Move evidence files
Write-Host "[8/8] Moving evidence files..." -ForegroundColor Yellow
$evidenceFiles = @(
    "docs\Monitoring-Report-Testnet-Scenario1.md",
    "docs\txids.csv"
)

foreach ($file in $evidenceFiles) {
    if (Test-Path $file) {
        git mv $file "evidence\" 2>$null
        if ($LASTEXITCODE -eq 0) {
            $filename = Split-Path $file -Leaf
            Write-Host "  $filename" -ForegroundColor DarkGray
            $totalMoved++
        }
    }
}
Write-Host "Moved evidence files" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "  CONSOLIDATION PHASE 2 COMPLETE" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Results:" -ForegroundColor White
Write-Host "  Root status files: 6 archived" -ForegroundColor White
Write-Host "  Roadmap duplicates: 2 archived" -ForegroundColor White
Write-Host "  Integration duplicates: 1 archived" -ForegroundColor White
Write-Host "  Verification duplicates: 1 archived" -ForegroundColor White
Write-Host "  AI slop files: 4 archived" -ForegroundColor White
Write-Host "  Pilot duplicates: 2 archived" -ForegroundColor White
Write-Host "  Verra duplicate: 1 archived" -ForegroundColor White
Write-Host "  Evidence files: 2 moved" -ForegroundColor White
Write-Host "  " -ForegroundColor White
Write-Host "  Total archived: ~$totalArchived files" -ForegroundColor Yellow
Write-Host "  Total moved: ~$totalMoved files" -ForegroundColor Yellow
Write-Host "  Combined with Phase 1: ~$(14 + $totalArchived + $totalMoved) files cleaned" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor White
Write-Host "  1. Review: git status" -ForegroundColor DarkGray
Write-Host "  2. Commit: git add . && git commit -m 'Phase 2 consolidation'" -ForegroundColor DarkGray
Write-Host "  3. Push: git push origin main" -ForegroundColor DarkGray
Write-Host ""
