document.addEventListener('DOMContentLoaded', async () => {
  const statusEl = document.getElementById('status');
  
  // Query current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab?.id) {
    statusEl.textContent = 'No active tab';
    return;
  }
  
  // Check if debugger is attached by trying to send a command
  try {
    await chrome.debugger.sendCommand({ tabId: tab.id }, 'Runtime.enable');
    statusEl.textContent = 'Connected';
    statusEl.className = 'status connected';
  } catch (err) {
    statusEl.textContent = 'Disconnected';
    statusEl.className = 'status disconnected';
  }
});
