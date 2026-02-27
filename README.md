# Page Load Delay

Add friction to distracting websites with customizable countdown delays. Create groups of domains with different wait times to reduce impulsive browsing and stay focused.

## How It Works

When you navigate to a configured domain, the extension intercepts the request and displays a visual countdown. Once the timer reaches zero, the page loads automatically. This added friction gives you a moment to reconsider whether you really need to visit that site.

## Key Features

- **Multiple Domain Groups** - Create separate groups of websites, each with its own delay duration. For example, set a 30-second delay for social media and a 10-second delay for video sites.

- **Flexible Delays** - Configure delays from 1 to 300 seconds per group.

- **Subdomain Matching** - Adding `twitter.com` automatically covers `www.twitter.com`, `mobile.twitter.com`, and all other subdomains.

- **Clean Countdown UI** - A minimal, dark-themed countdown page displays the remaining time and target URL.

- **No Delay by Default** - Pages not in any configured group load instantly with no interruption.

- **Privacy Focused** - All settings are stored locally. No data is collected or transmitted.

## Privacy & Permissions

This extension requires "Access your data for all websites" permission. This sounds broad, but here's why it's necessary and what the extension actually does:

**Why the permission is needed:**
- The extension must intercept page requests to show the countdown
- Since you can configure ANY domain in your groups, broad access is required
- Firefox's `webRequestBlocking` API requires this permission to pause/redirect requests

**What the extension actually does:**
- Checks if the URL matches your configured domains
- Redirects matching requests to the countdown page
- That's it — no data is read, collected, stored, or transmitted

The extension is fully open source. You can review the code to verify these claims.

## Example Setup

| Group | Delay | Domains |
|-------|-------|---------|
| Group 1 | 30s | twitter.com, reddit.com, instagram.com |
| Group 2 | 60s | youtube.com, tiktok.com |
| Group 3 | 10s | news.ycombinator.com |

Perfect for productivity, digital wellbeing, and breaking doomscrolling habits.

## Installation

### From Firefox Add-ons (recommended)

*(Coming soon)*

### Manual Installation (for development/testing)

1. Clone or download this repository
2. Open Firefox and navigate to `about:debugging`
3. Click **"This Firefox"** in the left sidebar
4. Click **"Load Temporary Add-on..."**
5. Navigate to the extension folder and select `manifest.json`

The extension is now installed temporarily (until Firefox restarts).

## Configuration

1. Click the extension icon in the toolbar, or go to `about:addons`
2. Find "Page Load Delay" and click **Preferences** / **Options**
3. Click **"+ Add Group"** to create a new domain group
4. Set the delay duration (in seconds)
5. Enter domains to delay (one per line, without `http://` or `www.`)
6. Click **Save Settings**

## Development

### Project Structure

```
page-delay/
├── manifest.json      # Extension manifest
├── background.js      # Request interception logic
├── countdown.html     # Countdown page UI
├── countdown.js       # Countdown timer logic
├── settings.html      # Settings page UI
├── settings.js        # Settings page logic
├── icons/             # Extension icons
│   ├── icon-48.png
│   ├── icon-96.png
│   └── icon-128.png
├── Makefile           # Build automation
└── README.md
```

### Building

```bash
make build    # Creates page-delay.zip for distribution
make clean    # Removes the zip file
```

### Testing Changes

1. Make your code changes
2. Go to `about:debugging` > **This Firefox**
3. Find the extension and click **Reload**
4. Test the changes

## License

MIT
