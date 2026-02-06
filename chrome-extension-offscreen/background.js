/**
 * Service Worker - Background Script
 * 
 * Handles debugger API (must stay in service worker) and routes
 * CDP commands through the offscreen document for WebSocket communication.
 */

const OFFSCREEN_URL = chrome.runtime.getURL('offscreen.html');
const OFFSCREEN_REASON = 'WORKERS';

// State
let offscreenPort = null;
let pendingMessages = [];
let isOffscreenCreating = false;
let tabId = null;
let targetId = null;
let isConnected = false;

// Ensure offscreen document exists
async function ensureOffscreen() {
  if (offscreenPort) return;
  if (isOffscreenCreating) {
    // Wait for creation
    await new Promise(resolve => setTimeout(resolve, 100));
    return ensureOffscreen();
  }

  // Check if already exists
  const existing = await chrome.offscreen.hasDocument?.().catch(() => false);
  if (existing) {
    connectToOffscreen();
    return;
  }

  isOffscreenCreating = true;
  try {
    await chrome.offscreen.createDocument({
      url: OFFSCREEN_URL,
      reasons: [OFFSCREEN_REASON],
      justification: 'Maintain WebSocket connection to OpenClaw relay'
    });
    connectToOffscreen();
  } catch (err) {
    console.error('[Background] Failed to create offscreen:', err);
  } finally {
    isOffscreenCreating = false;
  }
}

function connectToOffscreen() {
  // Listen for messages from offscreen
  chrome.runtime.onMessage.addListener(handleOffscreenMessage);
}

function handleOffscreenMessage(message, sender, sendResponse) {
  if (sender.url !== OFFSCREEN_URL) return;

  switch (message.type) {
    case 'ws-connected':
      console.log('[Background] WebSocket connected');
      isConnected = true;
      updateBadge();
      // Flush pending messages
      flushPendingMessages();
      break;

    case 'ws-disconnected':
      console.log('[Background] WebSocket disconnected');
      isConnected = false;
      updateBadge();
      break;

    case 'ws-message':
      // Message from relay - forward to debugger
      handleRelayMessage(message.data);
      break;
  }
}

function flushPendingMessages() {
  while (pendingMessages.length > 0) {
    const msg = pendingMessages.shift();
    sendToRelay(msg);
  }
}

function sendToRelay(data) {
  chrome.runtime.sendMessage({
    type: 'ws-send',
    data: data
  }).catch(() => {
    // Offscreen not ready, queue message
    pendingMessages.push(data);
  });
}

async function handleRelayMessage(data) {
  try {
    const msg = JSON.parse(data);
    
    // Handle CDP commands from relay
    if (msg.method && tabId) {
      try {
        const result = await chrome.debugger.sendCommand(
          { tabId },
          msg.method,
          msg.params
        );
        
        // Send response back
        if (msg.id) {
          sendToRelay(JSON.stringify({
            id: msg.id,
            result: result
          }));
        }
      } catch (err) {
        // Send error back
        if (msg.id) {
          sendToRelay(JSON.stringify({
            id: msg.id,
            error: {
              message: err.message,
              code: err.code
            }
          }));
        }
      }
    }
  } catch (err) {
    console.error('[Background] Failed to handle relay message:', err);
  }
}

// Debugger event handling
chrome.debugger.onEvent.addListener((source, method, params) => {
  // Forward debugger events to relay
  sendToRelay(JSON.stringify({
    method: method,
    params: params,
    source: source
  }));
});

chrome.debugger.onDetach.addListener((source, reason) => {
  console.log('[Background] Debugger detached:', reason);
  tabId = null;
  targetId = null;
  updateBadge();
});

// Badge management
function updateBadge() {
  const text = isConnected && tabId ? 'ON' : '';
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color: '#00AA00' });
}

// Attach to tab
async function attachToTab(id) {
  try {
    // Detach if already attached
    if (tabId) {
      await chrome.debugger.detach({ tabId }).catch(() => {});
    }

    await chrome.debugger.attach({ tabId: id }, '1.3');
    tabId = id;
    targetId = String(id);
    
    // Enable required domains
    await chrome.debugger.sendCommand({ tabId: id }, 'Runtime.enable');
    await chrome.debugger.sendCommand({ tabId: id }, 'Page.enable');
    await chrome.debugger.sendCommand({ tabId: id }, 'DOM.enable');
    
    updateBadge();
    
    // Send target info to relay
    const tab = await chrome.tabs.get(id);
    sendToRelay(JSON.stringify({
      type: 'target-created',
      targetId: targetId,
      url: tab.url,
      title: tab.title,
      wsUrl: `ws://127.0.0.1:18792/cdp`
    }));
    
    return true;
  } catch (err) {
    console.error('[Background] Failed to attach:', err);
    return false;
  }
}

// Action click - toggle attach
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  await ensureOffscreen();

  if (tabId === tab.id) {
    // Detach
    await chrome.debugger.detach({ tabId: tab.id }).catch(() => {});
    tabId = null;
    targetId = null;
  } else {
    // Attach
    await attachToTab(tab.id);
  }
  
  updateBadge();
});

// Alarm to keep offscreen alive and check connection
chrome.alarms.create('keepalive', { periodInMinutes: 0.5 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'keepalive') {
    await ensureOffscreen();
    
    // Check WebSocket status
    chrome.runtime.sendMessage({
      type: 'ws-status'
    }).then(response => {
      if (!response?.connected && !response?.connecting) {
        // Trigger reconnect
        chrome.runtime.sendMessage({ type: 'ws-reconnect' });
      }
    }).catch(() => {
      // Offscreen gone, recreate
      offscreenPort = null;
      ensureOffscreen();
    });
  }
});

// Initialize on startup
chrome.runtime.onStartup.addListener(() => {
  ensureOffscreen();
});

chrome.runtime.onInstalled.addListener(() => {
  ensureOffscreen();
});

// Initial setup
ensureOffscreen();
