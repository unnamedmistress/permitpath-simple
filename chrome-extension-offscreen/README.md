# OpenClaw Browser Relay - Offscreen Document Fix

This Chrome extension uses an offscreen document to maintain a persistent WebSocket connection, bypassing the MV3 service worker 30-second timeout.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Chrome Extension                         │
├─────────────────────────────────────────────────────────────┤
│  Service Worker (background.js)                            │
│  ├── chrome.debugger API (attach/detach/sendCommand)       │
│  ├── Routes CDP commands ↔ Offscreen                       │
│  └── Recreated on demand (can die/restart)                 │
│                                                             │
│  Offscreen Document (offscreen.html/js)                    │
│  ├── WebSocket connection to relay (ws://127.0.0.1:18792)  │
│  ├── Survives service worker restarts                      │
│  └── Uses WORKERS reason (persists indefinitely)           │
└─────────────────────────────────────────────────────────────┘
```

## Files

- `manifest.json` - Extension manifest with offscreen permission
- `background.js` - Service worker, handles debugger API
- `offscreen.html` - Offscreen document container
- `offscreen.js` - WebSocket host, runs in offscreen doc
- `popup.html/js` - Extension popup UI

## Installation

1. Open Chrome → `chrome://extensions`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select this directory (`chrome-extension-offscreen`)
5. Pin the extension to toolbar

## Usage

1. Navigate to the page you want to control
2. Click the OpenClaw extension icon (badge shows "ON")
3. The relay maintains connection even when service worker restarts

## How It Works

### Problem
MV3 service workers are killed after 30 seconds of inactivity. The `chrome.alarms` keepalive has a 1-minute minimum, leaving a death window.

### Solution
Move the WebSocket from the service worker to an offscreen document:
- Offscreen docs with `WORKERS` reason persist indefinitely
- Service worker can die and restart freely
- WebSocket connection survives across service worker lifecycles
- Debugger API stays in service worker (required by Chrome)

### Message Flow

```
OpenClaw Tool → Relay Server → WebSocket → Offscreen Doc
                                               ↓
CDP Command ← chrome.runtime.sendMessage ← Offscreen Doc
    ↓
Service Worker → chrome.debugger → Chrome DevTools Protocol
    ↓
Response → WebSocket → Relay Server → OpenClaw Tool
```

## Testing

1. Load extension in Chrome
2. Open a test page
3. Click extension icon to attach
4. Wait 60+ seconds (service worker will be killed)
5. Try browser automation - it still works!

## License

Same as OpenClaw project
