/**
 * Offscreen Document - WebSocket Host
 * 
 * This document runs outside the service worker and maintains a persistent
 * WebSocket connection to the OpenClaw relay server. It survives service
 * worker termination/restarts.
 */

const OFFSCREEN_REASON = 'WORKERS';
const WS_URL = 'ws://127.0.0.1:18792/cdp';
const RECONNECT_DELAY = 1000;
const RECONNECT_MAX_DELAY = 30000;

let ws = null;
let reconnectDelay = RECONNECT_DELAY;
let reconnectTimeout = null;
let isConnecting = false;

// Connect to WebSocket
function connect() {
  if (isConnecting || ws?.readyState === WebSocket.OPEN) {
    return;
  }

  isConnecting = true;
  console.log('[Offscreen] Connecting to relay...');

  try {
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('[Offscreen] WebSocket connected');
      reconnectDelay = RECONNECT_DELAY;
      isConnecting = false;
      
      // Notify background that we're connected
      chrome.runtime.sendMessage({ type: 'ws-connected' }).catch(() => {});
    };

    ws.onmessage = (event) => {
      // Forward messages from relay to background
      chrome.runtime.sendMessage({
        type: 'ws-message',
        data: event.data
      }).catch(() => {});
    };

    ws.onclose = () => {
      console.log('[Offscreen] WebSocket closed');
      isConnecting = false;
      ws = null;
      
      // Notify background
      chrome.runtime.sendMessage({ type: 'ws-disconnected' }).catch(() => {});
      
      // Schedule reconnect
      scheduleReconnect();
    };

    ws.onerror = (err) => {
      console.error('[Offscreen] WebSocket error:', err);
      isConnecting = false;
    };

  } catch (err) {
    console.error('[Offscreen] Failed to create WebSocket:', err);
    isConnecting = false;
    scheduleReconnect();
  }
}

function scheduleReconnect() {
  if (reconnectTimeout) return;
  
  console.log(`[Offscreen] Reconnecting in ${reconnectDelay}ms...`);
  reconnectTimeout = setTimeout(() => {
    reconnectTimeout = null;
    connect();
  }, reconnectDelay);
  
  // Exponential backoff
  reconnectDelay = Math.min(reconnectDelay * 2, RECONNECT_MAX_DELAY);
}

function disconnect() {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  if (ws) {
    ws.close();
    ws = null;
  }
}

function send(data) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(data);
    return true;
  }
  return false;
}

// Listen for messages from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ws-send') {
    const sent = send(message.data);
    sendResponse({ sent });
    return true;
  }
  
  if (message.type === 'ws-status') {
    sendResponse({
      connected: ws?.readyState === WebSocket.OPEN,
      connecting: isConnecting
    });
    return true;
  }
  
  if (message.type === 'ws-reconnect') {
    disconnect();
    setTimeout(connect, 100);
    sendResponse({ reconnecting: true });
    return true;
  }
});

// Initial connection
connect();

// Keep alive - Chrome shouldn't terminate offscreen docs with WORKERS reason,
// but let's be extra safe
setInterval(() => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    connect();
  }
}, 5000);
