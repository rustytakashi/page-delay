// Get parameters from the URL
const params = new URLSearchParams(window.location.search);
const targetUrl = params.get('url');
const delay = parseInt(params.get('delay')) || 5;
const requireFocus = params.get('requireFocus') === '1';

const countdownEl = document.getElementById('countdown');
const urlEl = document.getElementById('url');

if (targetUrl) {
  urlEl.textContent = targetUrl;

  let seconds = delay;
  let intervalId = null;
  let isPaused = false;

  /**
   * Update the countdown display.
   */
  function updateDisplay() {
    if (isPaused) {
      countdownEl.textContent = seconds + ' (paused)';
    } else {
      countdownEl.textContent = seconds;
    }
  }

  /**
   * Perform a countdown tick.
   */
  function tick() {
    seconds--;
    updateDisplay();

    if (seconds <= 0) {
      clearInterval(intervalId);
      intervalId = null;
      countdownEl.textContent = '...';
      // Tell background script to allow and redirect
      browser.runtime.sendMessage({ type: 'allowUrl', url: targetUrl });
    }
  }

  /**
   * Start or resume the countdown.
   */
  function startCountdown() {
    if (!intervalId && seconds > 0) {
      isPaused = false;
      updateDisplay();
      intervalId = setInterval(tick, 1000);
    }
  }

  /**
   * Pause the countdown.
   */
  function pauseCountdown() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
      isPaused = true;
      updateDisplay();
    }
  }

  // Initial display
  updateDisplay();

  // Handle focus requirement
  if (requireFocus) {
    // Listen for visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        pauseCountdown();
      } else {
        startCountdown();
      }
    });

    // Only start if page is currently visible
    if (!document.hidden) {
      startCountdown();
    } else {
      isPaused = true;
      updateDisplay();
    }
  } else {
    // No focus requirement, start immediately
    startCountdown();
  }
} else {
  countdownEl.textContent = '?';
  urlEl.textContent = 'No URL specified';
}
