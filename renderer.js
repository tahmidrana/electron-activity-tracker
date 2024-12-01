const { ipcRenderer } = require('electron');

document.getElementById('get-active-window').addEventListener('click', () => {
  ipcRenderer.send('get-active-window');
});

document.getElementById('run-shell').addEventListener('click', () => {
  ipcRenderer.send('run-script', 'shell');
});

document.getElementById('run-powershell').addEventListener('click', () => {
  ipcRenderer.send('run-script', 'powershell');
});

// Update the UI with the active window or script output
ipcRenderer.on('active-window-response', (event, message) => {
  document.getElementById('output').textContent = `Active Window: \n${message}`;
});

ipcRenderer.on('script-output', (event, message) => {
  document.getElementById('output').textContent = `Script Output: \n${message}`;
});
