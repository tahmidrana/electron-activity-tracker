const { app, BrowserWindow, ipcMain } = require('electron');
const { exec } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // For accessing ipcRenderer
    }
  });

  mainWindow.loadFile('index.html');
});

ipcMain.on('get-active-window', (event) => {
  const platform = os.platform();

  if (platform === 'linux') {
    checkLinuxEnvironment(event);
  } else if (platform === 'win32') {
    getActiveWindowWindows(event);
  } else {
    event.reply('active-window-response', 'Unsupported platform.');
  }
});

// Function to check Linux environment (X11 or Wayland)
function checkLinuxEnvironment(event) {
  // Check if running on X11 (xdotool) or Wayland (swaymsg)
  exec('echo $XDG_SESSION_TYPE', (error, stdout) => {
    if (error) {
      event.reply('active-window-response', `Error detecting session type: ${error.message}`);
      return;
    }

    const sessionType = stdout.trim();
    if (sessionType === 'x11') {
      exec('xdotool getwindowfocus getwindowname', (err, stdout) => {
        if (err) {
          event.reply('active-window-response', `Error: ${err.message}`);
        } else {
          event.reply('active-window-response', `Active Window (X11): ${stdout.trim()}`);
        }
      });
    } else if (sessionType === 'wayland') {
      exec('swaymsg -t get_tree | jq -r ".. | select(.type?) | select(.focused==true).name"', (err, stdout) => {
        if (err) {
          event.reply('active-window-response', `Error: ${err.message}`);
        } else {
          event.reply('active-window-response', `Active Window (Wayland): ${stdout.trim()}`);
        }
      });
    } else {
      event.reply('active-window-response', 'Unknown Linux session type');
    }
  });
}

// Windows-specific logic to get active window
function getActiveWindowWindows(event) {
  exec('powershell -Command "(Get-Process | Where-Object { $_.MainWindowTitle -ne \"\" }).MainWindowTitle"', (err, stdout) => {
    if (err) {
      event.reply('active-window-response', `Error: ${err.message}`);
    } else {
      event.reply('active-window-response', `Active Window (Windows): ${stdout.trim()}`);
    }
  });
}

// Run Shell/PowerShell script and log output
ipcMain.on('run-script', (event, scriptType) => {
  let scriptCommand;
  let scriptFile;

  // For Linux (Shell script) and Windows (PowerShell script)
  if (process.platform === 'linux' && scriptType === 'shell') {
    scriptFile = path.join(__dirname, 'activity-checker.sh');
    scriptCommand = `bash ${scriptFile}`;
  } else if (process.platform === 'win32' && scriptType === 'powershell') {
    scriptFile = path.join(__dirname, 'activity_checker.ps1');
    scriptCommand = `powershell.exe -ExecutionPolicy Bypass -File ${scriptFile}`;
  } else {
    event.reply('script-output', 'Unsupported platform or script type');
    return;
  }

  exec(scriptCommand, (error, stdout, stderr) => {
    if (error) {
      event.reply('script-output', `Error: ${error.message}`);
    } else if (stderr) {
      event.reply('script-output', `Stderr: ${stderr}`);
    } else {
      event.reply('script-output', `Script Output: ${stdout}`);
    }
  });
});
