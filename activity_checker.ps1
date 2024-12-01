# Log file path
$logFile = "$env:USERPROFILE\Desktop\active_window_log.txt"

# Initialize log file with header
"Timestamp, Active Window" | Out-File -Append -FilePath $logFile

while ($true) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

    # Use Get-Process and COMObject to find the active window
    $shell = New-Object -ComObject "Shell.Application"
    $activeWindow = $shell.Windows() | Where-Object { $_.HWND -eq (Get-Process | Where-Object { $_.MainWindowHandle -eq [Console]::OpenStandardOutput().Handle }).Id }

    if ($activeWindow) {
        "$timestamp, $($activeWindow.LocationName)" | Out-File -Append -FilePath $logFile
    }

    Start-Sleep -Seconds 5
}
