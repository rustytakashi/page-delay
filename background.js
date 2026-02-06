/**
 * @typedef {Object} DomainGroup
 * @property {number} delay - Delay in seconds for this group
 * @property {string[]} domains - List of domains in this group
 */

/**
 * @typedef {Object} Settings
 * @property {DomainGroup[]} groups - Array of domain groups with their delays
 */

/**
 * Store URLs that have been cleared by the countdown.
 * Maps URL -> timestamp when it was allowed (for expiration).
 * @type {Map<string, number>}
 */
const allowedUrls = new Map();

/**
 * How long an allowed URL stays valid (in milliseconds).
 * @constant {number}
 */
const ALLOWED_URL_TTL = 5000;

/**
 * The countdown page URL.
 * @constant {string}
 */
const countdownPage = browser.runtime.getURL('countdown.html');

/**
 * Current settings loaded from storage.
 * @type {Settings}
 */
let settings = {
  groups: []
};

/**
 * Track if settings have been loaded from storage.
 * @type {boolean}
 */
let settingsLoaded = false;

/**
 * Load settings from browser storage.
 * @returns {Promise<void>}
 */
function loadSettings() {
  return browser.storage.local.get(['groups']).then((result) => {
    settings.groups = result.groups || [];
    settingsLoaded = true;
  });
}

// Initial load
loadSettings();

// Listen for settings changes
browser.storage.onChanged.addListener((changes) => {
  if (changes.groups) {
    settings.groups = changes.groups.newValue || [];
  }
});

/**
 * Get the delay for a URL if it matches any configured domain group.
 * @param {string} url - The URL to check
 * @returns {number|null} The delay in seconds, or null if URL should not be delayed
 */
function getDelayForUrl(url) {
  // If settings haven't loaded yet, don't delay
  if (!settingsLoaded) {
    return null;
  }

  // If no groups configured, don't delay
  if (!settings.groups || settings.groups.length === 0) {
    return null;
  }

  try {
    const hostname = new URL(url).hostname.toLowerCase();

    // Check each group for a matching domain
    for (const group of settings.groups) {
      if (!group.domains || group.domains.length === 0) {
        continue;
      }

      const matches = group.domains.some(domain => {
        // Match exact domain or subdomain
        return hostname === domain || hostname.endsWith('.' + domain);
      });

      if (matches) {
        return group.delay || 5;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Check if a URL is in the allowed list and not expired.
 * @param {string} url - The URL to check
 * @returns {boolean} True if URL is allowed
 */
function isUrlAllowed(url) {
  const timestamp = allowedUrls.get(url);
  if (!timestamp) {
    return false;
  }

  // Check if the allowed entry has expired
  if (Date.now() - timestamp > ALLOWED_URL_TTL) {
    allowedUrls.delete(url);
    return false;
  }

  return true;
}

// Intercept all main document requests
browser.webRequest.onBeforeRequest.addListener(
  /**
   * Handle web request before it is sent.
   * @param {Object} details - Request details from the browser
   * @returns {Object} Response object with cancel or redirectUrl
   */
  function(details) {
    // Only handle main frame requests (actual page loads, not resources)
    if (details.type === "main_frame") {
      const url = details.url;

      // Don't intercept the countdown page itself
      if (url.startsWith(countdownPage)) {
        return { cancel: false };
      }

      // Don't intercept browser internal pages
      if (url.startsWith('about:') || url.startsWith('moz-extension:')) {
        return { cancel: false };
      }

      // Check if this URL has been cleared by countdown
      // Don't delete immediately - let it expire naturally to handle multiple requests
      if (isUrlAllowed(url)) {
        return { cancel: false };
      }

      // Check if this URL matches any domain group and get its delay
      const delay = getDelayForUrl(url);
      if (delay === null) {
        return { cancel: false };
      }

      // Redirect to countdown page with delay parameter
      const redirectUrl = countdownPage +
        '?url=' + encodeURIComponent(url) +
        '&delay=' + delay;
      return { redirectUrl: redirectUrl };
    }

    // Don't block other requests
    return { cancel: false };
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);

// Listen for messages from the countdown page
browser.runtime.onMessage.addListener(
  /**
   * Handle messages from content scripts or extension pages.
   * @param {Object} message - The message object
   * @param {Object} sender - Information about the message sender
   * @param {Function} sendResponse - Function to send a response
   * @returns {boolean} True to keep the message channel open
   */
  (message, sender, sendResponse) => {
    if (message.type === 'allowUrl') {
      const url = message.url;
      // Store URL with timestamp for TTL-based expiration
      allowedUrls.set(url, Date.now());

      // Redirect the tab from background script
      if (sender.tab && sender.tab.id) {
        browser.tabs.update(sender.tab.id, { url: url });
      }

      sendResponse({ success: true });
    }
    return true; // Keep message channel open
  }
);
