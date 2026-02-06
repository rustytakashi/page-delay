// Store URLs that have been cleared by the countdown
const allowedUrls = new Set();

// Get the countdown page URL
const countdownPage = browser.runtime.getURL('countdown.html');

// Intercept all main document requests
browser.webRequest.onBeforeRequest.addListener(
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
      if (allowedUrls.has(url)) {
        allowedUrls.delete(url);
        return { cancel: false };
      }

      // Redirect to countdown page
      const redirectUrl = countdownPage + '?url=' + encodeURIComponent(url);
      return { redirectUrl: redirectUrl };
    }

    // Don't block other requests
    return { cancel: false };
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);

// Listen for messages from the countdown page
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'allowUrl') {
    allowedUrls.add(message.url);
    sendResponse({ success: true });
  }
});
