# Page Load Delay - Development Notes

## Project Overview

Firefox browser extension (Manifest V2) that adds customizable countdown delays before loading specified websites. Helps reduce impulsive browsing.

## Key Files

| File | Purpose |
|------|---------|
| `manifest.json` | Extension config, permissions, icons |
| `background.js` | Request interception, redirect logic |
| `countdown.html/js` | Countdown timer UI |
| `settings.html/js` | Settings page with domain groups |
| `icons/` | Extension icons (48, 96, 128px) |

## Architecture

1. User configures **domain groups** (each group has a delay + list of domains)
2. `background.js` intercepts `main_frame` requests via `webRequest.onBeforeRequest`
3. Matching URLs redirect to `countdown.html?url=X&delay=Y`
4. After countdown, `countdown.js` sends `allowUrl` message to background
5. Background adds URL to allowed list (TTL-based) and navigates tab

## Data Structure

```javascript
// Stored in browser.storage.local
{
  groups: [
    { delay: 30, domains: ["twitter.com", "reddit.com"] },
    { delay: 10, domains: ["youtube.com"] }
  ]
}
```

## Build Commands

```bash
make build    # Creates page-delay.zip
make clean    # Removes zip
```

## Testing

1. Go to `about:debugging` > This Firefox
2. Load Temporary Add-on > select `manifest.json`
3. Click Reload after changes

## Code Style

- Use JSDoc for all functions
- Use DOM methods instead of innerHTML (AMO security requirement)
- Firefox uses `browser.*` APIs (not `chrome.*`)

## AMO Submission Notes

- Extension ID: `{42a40283-85d0-4020-8499-17a095a37194}`
- Requires `<all_urls>` permission for webRequestBlocking
- `data_collection_permissions` must be specified in manifest
- No `tabs` permission needed (just host permissions)

## Icon Generation

From 128x128 source:
```bash
sips -z 96 96 icons/icon-128.png --out icons/icon-96.png
sips -z 48 48 icons/icon-128.png --out icons/icon-48.png
```
