// Get the target URL from the query parameter
const params = new URLSearchParams(window.location.search);
const targetUrl = params.get('url');

const countdownEl = document.getElementById('countdown');
const urlEl = document.getElementById('url');

if (targetUrl) {
  urlEl.textContent = targetUrl;

  let seconds = 5;
  countdownEl.textContent = seconds;

  const interval = setInterval(() => {
    seconds--;
    countdownEl.textContent = seconds;

    if (seconds <= 0) {
      clearInterval(interval);
      // Tell background script to allow this URL, then redirect
      browser.runtime.sendMessage({ type: 'allowUrl', url: targetUrl }).then(() => {
        window.location.href = targetUrl;
      });
    }
  }, 1000);
} else {
  countdownEl.textContent = '?';
  urlEl.textContent = 'No URL specified';
}
