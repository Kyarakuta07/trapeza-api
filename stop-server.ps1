# Simpan sebagai stop-server.ps1
$port = 8080
$process = netstat -ano | findstr ":$port" | ForEach-Object { $_.Split(' ')[-1] } | Select-Object -First 1
if ($process) {
    taskkill /PID $process /F
    Write-Host "Server di port $port berhasil dihentikan (PID: $process)" -ForegroundColor Green
} else {
    Write-Host "Tidak ada server di port $port" -ForegroundColor Yellow
}
