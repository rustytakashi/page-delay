// Get parameters from the URL
const params = new URLSearchParams(window.location.search);
const targetUrl = params.get('url');
const delay = parseInt(params.get('delay')) || 5;

const countdownEl = document.getElementById('countdown');
const urlEl = document.getElementById('url');

if (targetUrl) {
  urlEl.textContent = targetUrl;

  let seconds = delay;
  countdownEl.textContent = seconds;

  const interval = setInterval(() => {
    seconds--;
    countdownEl.textContent = seconds;

    if (seconds <= 0) {
      clearInterval(interval);
      countdownEl.textContent = '...';
      // Tell background script to allow and redirect
      browser.runtime.sendMessage({ type: 'allowUrl', url: targetUrl });
    }
  }, 1000);
} else {
  countdownEl.textContent = '?';
  urlEl.textContent = 'No URL specified';
}
