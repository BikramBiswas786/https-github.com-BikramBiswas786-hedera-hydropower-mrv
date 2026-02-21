# Kill process using port 3000
# Run this if you get "address already in use" error

Write-Host "Checking for processes using port 3000..." -ForegroundColor Cyan

try {
    $conn = Get-NetTCPConnection -LocalPort 3000 -ErrorAction Stop
    $processId = $conn.OwningProcess
    $process = Get-Process -Id $processId
    
    Write-Host "Found process: $($process.ProcessName) (PID: $processId)" -ForegroundColor Yellow
    Write-Host "Killing process..." -ForegroundColor Red
    
    Stop-Process -Id $processId -Force
    Start-Sleep -Seconds 1
    
    Write-Host "✅ Process killed. Port 3000 is now free." -ForegroundColor Green
} catch {
    Write-Host "✅ Port 3000 is already free." -ForegroundColor Green
}

Write-Host "`nYou can now start the server:" -ForegroundColor Cyan
Write-Host "  npm start" -ForegroundColor White